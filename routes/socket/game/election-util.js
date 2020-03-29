const { sendInProgressGameUpdate } = require('../util');

/**
 * @param {object} socket - socket reference.
 * @param {object} passport - socket authentication.
 * @param {object} game - verifyed target game.
 * @param {object} data - from socket emit.
 * @param {bool} force - whether or not this action was forced.
 */
module.exports.selectHeadmaster = (socket, passport, game, data, force = false) => {
	if ((game.general.isTourny && game.general.tournyInfo.isCancelled) || data.headmasterIndex >= game.general.playerCount || data.headmasterIndex < 0) {
		return;
	}

	if (game.gameState.isGameFrozen && !force) {
		if (socket) {
			socket.emit('sendAlert', 'An AEM member has prevented this game from proceeding. Please wait.');
		}
		return;
	}

	const { headmasterIndex } = data;
	const { ministerIndex } = game.gameState;
	const { experiencedMode } = game.general;
	const seatedPlayers = game.private.seatedPlayers.filter(player => !player.isDead);
	const ministerPlayer = game.private.seatedPlayers[ministerIndex];
	const headmasterPlayer = game.private.seatedPlayers[headmasterIndex];

	// Make sure the pick is valid
	if (
		game.publicPlayersState[headmasterIndex].isDead ||
		headmasterIndex === ministerIndex ||
		headmasterIndex === game.gameState.previousElectedGovernment[1] ||
		(headmasterIndex === game.gameState.previousElectedGovernment[0] && game.general.livingPlayerCount > 5)
	) {
		return;
	}

	if (!ministerPlayer || ministerPlayer.userName !== passport.user) {
		return;
	}

	if (game.general.timedMode && game.private.timerId) {
		clearTimeout(game.private.timerId);
		game.private.timerId = null;
		game.gameState.timedModeEnabled = false;
	}

	if (!game.private.lock.selectHeadmaster && !Number.isInteger(game.gameState.pendingHeadmasterIndex) && game.gameState.phase !== 'voting') {
		game.private.lock.selectHeadmaster = true;
		game.publicPlayersState[ministerIndex].isLoader = false;

		game.private.summary = game.private.summary.updateLog({
			headmasterId: headmasterIndex
		});

		ministerPlayer.playersState.forEach(player => {
			player.notificationStatus = '';
		});

		game.publicPlayersState[headmasterIndex].governmentStatus = 'isPendingHeadmaster';
		game.gameState.pendingHeadmasterIndex = headmasterIndex;
		game.general.status = `Vote on election #${game.general.electionCount} now.`;

		game.publicPlayersState
			.filter(player => !player.isDead)
			.forEach(player => {
				player.isLoader = true;
				player.cardStatus = {
					cardDisplayed: true,
					isFlipped: false,
					cardFront: 'ballot',
					cardBack: {}
				};
			});

		sendInProgressGameUpdate(game, true);

		seatedPlayers.forEach(player => {
			if (!game.general.disableGamechat) {
				player.gameChats.push({
					gameChat: true,
					timestamp: new Date(),
					chat: [
						{
							text: 'You must vote for the election of minister of magic '
						},
						{
							text: game.general.blindMode ? `{${ministerIndex + 1}}` : `${ministerPlayer.userName} {${ministerIndex + 1}}`,
							type: 'player'
						},
						{
							text: ' and headmaster '
						},
						{
							text: game.general.blindMode ? `{${headmasterIndex + 1}}` : `${headmasterPlayer.userName} {${headmasterIndex + 1}}`,
							type: 'player'
						},
						{
							text: '.'
						}
					]
				});
			}

			player.cardFlingerState = [
				{
					position: 'middle-left',
					notificationStatus: '',
					action: 'active',
					cardStatus: {
						isFlipped: false,
						cardFront: 'ballot',
						cardBack: 'lumos'
					}
				},
				{
					position: 'middle-right',
					action: 'active',
					notificationStatus: '',
					cardStatus: {
						isFlipped: false,
						cardFront: 'ballot',
						cardBack: 'nox'
					}
				}
			];
		});

		const unseatedChat = {
			gameChat: true,
			timestamp: new Date(),
			chat: [
				{
					text: 'Minister of Magic '
				},
				{
					text: game.general.blindMode ? `{${ministerIndex + 1}}` : `${ministerPlayer.userName} {${ministerIndex + 1}}`,
					type: 'player'
				},
				{
					text: ' nominates '
				},
				{
					text: game.general.blindMode ? `{${headmasterIndex + 1}}` : `${headmasterPlayer.userName} {${headmasterIndex + 1}}`,
					type: 'player'
				},
				{
					text: ' as Hogwarts Headmaster.'
				}
			]
		};

		game.private.unSeatedGameChats.push(unseatedChat);

		setTimeout(
			() => {
				sendInProgressGameUpdate(game);
			},
			process.env.NODE_ENV === 'development' ? 100 : experiencedMode ? 500 : 1000
		);

		game.gameState.phase = 'voting';

		setTimeout(
			() => {
				seatedPlayers.forEach(player => {
					if (player.cardFlingerState && player.cardFlingerState.length) {
						player.cardFlingerState[0].cardStatus.isFlipped = player.cardFlingerState[1].cardStatus.isFlipped = true;
						player.cardFlingerState[0].notificationStatus = player.cardFlingerState[1].notificationStatus = 'notification';
						player.voteStatus = {
							hasVoted: false
						};
					}
				});

				if (game.general.timedMode) {
					if (game.private.timerId) {
						clearTimeout(game.private.timerId);
						game.private.timerId = null;
					}
					game.gameState.timedModeEnabled = true;
					game.private.timerId = setTimeout(
						() => {
							const neededPlayers = (() => {
								switch (game.general.playerCount) {
									case 5:
										return 4;
									case 6:
										return 5;
									case 7:
										return 5;
									case 8:
										return 6;
									case 9:
										return 6;
									case 10:
										return 7;
								}
							})();
							const activePlayerCount = game.publicPlayersState.filter(player => !player.leftGame || player.isDead).length;
							if (activePlayerCount < neededPlayers) {
								if (!game.general.disableGamechat) {
									seatedPlayers.forEach(player => {
										player.gameChats.push({
											gameChat: true,
											timestamp: new Date(),
											chat: [
												{
													text: 'Not enough players are present, votes will not be auto-picked.'
												}
											]
										});
									});
									sendInProgressGameUpdate(game);
								}
								return;
							}

							if (game.gameState.timedModeEnabled) {
								const unvotedPlayerNames = game.private.seatedPlayers
									.filter(player => !player.voteStatus.hasVoted && !player.isDead)
									.map(player => player.userName);

								game.gameState.timedModeEnabled = false;
								const { selectVoting } = require('./election');
								unvotedPlayerNames.forEach(userName => {
									selectVoting({ user: userName }, game, { vote: Boolean(Math.random() > 0.5) }, socket);
								});
							}
						},
						process.env.DEVTIMEDDELAY ? process.env.DEVTIMEDDELAY : game.general.timedMode * 1000
					);
				}
				sendInProgressGameUpdate(game);
			},
			process.env.NODE_ENV === 'development' ? 100 : experiencedMode ? 500 : 1500
		);
	}
};
