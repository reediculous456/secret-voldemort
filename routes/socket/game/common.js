const { sendInProgressGameUpdate } = require('../util');
const { sendGameList } = require('../user-requests');
const { selectHeadmaster } = require('./election-util');
const _ = require('lodash');

/**
 * @param {object} game - game to act on.
 * @param {boolean} isStart - true if this is the initial shuffle.
 */
const shuffleProclamations = (module.exports.shuffleProclamations = (game, isStart) => {
	if (!game) {
		return;
	}

	if (isStart) {
		game.trackState.enactedProclamations = [];
		if (game.customGameSettings.trackState.lib > 0) {
			game.trackState.orderProclamationCount = game.customGameSettings.trackState.lib;
			_.range(0, game.customGameSettings.trackState.lib).forEach(num => {
				game.trackState.enactedProclamations.push({
					cardBack: 'order',
					isFlipped: true,
					position: `order${num + 1}`
				});
			});
		}
		if (game.customGameSettings.trackState.fas > 0) {
			game.trackState.deathEaterProclamationCount = game.customGameSettings.trackState.fas;
			_.range(0, game.customGameSettings.trackState.fas).forEach(num => {
				game.trackState.enactedProclamations.push({
					cardBack: 'death eater',
					isFlipped: true,
					position: `death eater${num + 1}`
				});
			});
		}
	}

	const libCount = game.customGameSettings.deckState.lib - game.trackState.orderProclamationCount;
	const fasCount = game.customGameSettings.deckState.fas - game.trackState.deathEaterProclamationCount;
	game.private.proclamations = _.shuffle(
		_.range(0, libCount)
			.map(num => 'order')
			.concat(_.range(0, fasCount).map(num => 'death eater'))
	);

	game.gameState.undrawnProclamationCount = game.private.proclamations.length;

	if (!game.general.disableGamechat) {
		const chat = {
			timestamp: new Date(),
			gameChat: true,
			chat: [
				{
					text: 'Deck shuffled: '
				},
				{
					text: `${libCount} order`,
					type: 'order'
				},
				{
					text: ' and '
				},
				{
					text: `${fasCount} death eater`,
					type: 'death eater'
				},
				{
					text: ' proclamations.'
				}
			]
		};
		game.private.seatedPlayers.forEach(player => {
			player.gameChats.push(chat);
		});
		game.private.unSeatedGameChats.push(chat);
	}

	const modOnlyChat = {
		timestamp: new Date(),
		gameChat: true,
		chat: [{ text: 'The deck has been shuffled: ' }]
	};
	game.private.proclamations.forEach(proclamation => {
		modOnlyChat.chat.push({
			text: proclamation === 'order' ? 'B' : 'R',
			type: proclamation
		});
	});
	game.private.hiddenInfoChat.push(modOnlyChat);
});

/**
 * @param {object} game - game to act on.
 * @param {number} specialElectionMinisterIndex - number of index of the special election player (optional)
 */
module.exports.startElection = (game, specialElectionMinisterIndex) => {
	const { experiencedMode } = game.general;

	if (game.trackState.deathEaterProclamationCount >= game.customGameSettings.vetoZone) {
		game.gameState.isVetoEnabled = true;
	}

	if (game.gameState.undrawnProclamationCount < 3) {
		shuffleProclamations(game);
	}

	/**
	 * @return {number} index of the minister
	 */
	game.gameState.ministerIndex = (() => {
		const { ministerIndex, specialElectionFormerMinisterIndex } = game.gameState;

		/**
		 * @param {number} index - index of the current minister
		 * @return {number} index of the next minister
		 */
		const nextMinisterIndex = index => {
			const nextIndex = index + 1 === game.general.playerCount ? 0 : index + 1;

			if (game.publicPlayersState[nextIndex].isDead) {
				return nextMinisterIndex(nextIndex);
			} else {
				return nextIndex;
			}
		};

		if (Number.isInteger(specialElectionMinisterIndex)) {
			return specialElectionMinisterIndex;
		} else if (Number.isInteger(specialElectionFormerMinisterIndex)) {
			game.gameState.specialElectionFormerMinisterIndex = null;
			return nextMinisterIndex(specialElectionFormerMinisterIndex);
		} else {
			return nextMinisterIndex(ministerIndex);
		}
	})();

	game.private.summary = game.private.summary.nextTurn().updateLog({ ministerId: game.gameState.ministerIndex });

	const { seatedPlayers } = game.private; // eslint-disable-line one-var
	const { ministerIndex, previousElectedGovernment } = game.gameState;
	const pendingMinisterPlayer = seatedPlayers[ministerIndex];

	game.general.electionCount++;
	sendGameList();
	game.general.status = `Election #${game.general.electionCount}: minister to select headmaster.`;
	if (!experiencedMode && !game.general.disableGamechat) {
		pendingMinisterPlayer.gameChats.push({
			gameChat: true,
			timestamp: new Date(),
			chat: [
				{
					text: 'You are minister of magic and must select a headmaster.'
				}
			]
		});
	}

	pendingMinisterPlayer.playersState
		.filter(
			(player, index) =>
				seatedPlayers[index] &&
				!seatedPlayers[index].isDead &&
				index !== ministerIndex &&
				(game.general.livingPlayerCount > 5 ? !previousElectedGovernment.includes(index) : previousElectedGovernment[1] !== index)
		)
		.forEach(player => {
			player.notificationStatus = 'notification';
		});

	game.publicPlayersState.forEach(player => {
		player.cardStatus.cardDisplayed = false;
		player.governmentStatus = '';
	});

	game.publicPlayersState[ministerIndex].governmentStatus = 'isPendingMinister';
	game.publicPlayersState[ministerIndex].isLoader = true;
	game.gameState.phase = 'selectingHeadmaster';

	if (game.general.timedMode) {
		if (game.private.timerId) {
			clearTimeout(game.private.timerId);
			game.private.timerId = null;
		}
		game.gameState.timedModeEnabled = true;
		game.private.timerId = setTimeout(
			() => {
				if (game.gameState.timedModeEnabled) {
					const headmasterIndex = _.shuffle(game.gameState.clickActionInfo[1])[0];

					selectHeadmaster(null, { user: pendingMinisterPlayer.userName }, game, { headmasterIndex });
				}
			},
			process.env.DEVTIMEDDELAY ? process.env.DEVTIMEDDELAY : game.general.timedMode * 1000
		);
	}

	game.gameState.clickActionInfo =
		game.general.livingPlayerCount > 5
			? [
					pendingMinisterPlayer.userName,
					seatedPlayers
						.filter((player, index) => !player.isDead && index !== ministerIndex && !previousElectedGovernment.includes(index))
						.map(el => seatedPlayers.indexOf(el))
			  ]
			: [
					pendingMinisterPlayer.userName,
					seatedPlayers
						.filter((player, index) => !player.isDead && index !== ministerIndex && previousElectedGovernment[1] !== index)
						.map(el => seatedPlayers.indexOf(el))
			  ];

	sendInProgressGameUpdate(game);
};
