const { sendInProgressGameUpdate, sendInProgressModChatUpdate } = require('../util.js');
const _ = require('lodash');
const { startElection } = require('./election.js');
const { shuffleProclamations } = require('./common.js');
const GameSummaryBuilder = require('../../../models/game-summary/GameSummaryBuilder');
const Account = require('../../../models/account.js');

/**
 * @param {object} game - game to act on.
 */
const beginGame = game => {
	const { experiencedMode } = game.general;

	game.general.timeStarted = Date.now();
	game.general.type = Math.floor((game.publicPlayersState.length - 5) / 2);

	const { customGameSettings } = game;
	if (!customGameSettings.enabled) {
		// Standard game, this object needs populating.
		customGameSettings.voldemortZone = 3;
		customGameSettings.vetoZone = 5;
		customGameSettings.trackState = { lib: 0, fas: 0 };
		customGameSettings.deckState = { lib: 6, fas: 11 };
		if (game.general.type == 0) {
			// 5-6 players
			customGameSettings.deathEaterCount = 1;
			customGameSettings.hitKnowsFas = true;
			customGameSettings.powers = [null, null, 'deckpeek', 'bullet', 'bullet'];
			if (game.general.rebalance6p && game.publicPlayersState.length == 6) customGameSettings.trackState.fas = 1;
		} else if (game.general.type == 1) {
			// 7-8 players
			customGameSettings.deathEaterCount = 2;
			customGameSettings.hitKnowsFas = false;
			customGameSettings.powers = [null, 'investigate', 'election', 'bullet', 'bullet'];
			if (game.general.rebalance7p && game.publicPlayersState.length == 7) customGameSettings.deckState.fas = 10;
		} else {
			// 9-10 players
			customGameSettings.deathEaterCount = 3;
			customGameSettings.hitKnowsFas = false;
			customGameSettings.powers = ['investigate', 'investigate', 'election', 'bullet', 'bullet'];
			if (game.general.rebalance9p2f && game.publicPlayersState.length == 9) customGameSettings.deckState.fas = 10;
		}
	}
	shuffleProclamations(game, true);

	const roles = [
		{
			cardName: 'voldemort',
			icon: 0,
			team: 'death-eater'
		}
	]
		.concat(
			_.shuffle(
				// With custom games, up to 8 libs can be in a game, but there are only 6 cards. Two are re-used in this case.
				_.range(0, 8)
					.map(el => ({
						cardName: 'order',
						icon: el % 6,
						team: 'order'
					}))
					.slice(0, game.publicPlayersState.length - customGameSettings.deathEaterCount - 1)
			)
		)
		.concat(
			_.shuffle(
				_.range(0, 3)
					.map(el => ({
						cardName: 'death-eater',
						icon: el,
						team: 'death-eater'
					}))
					.slice(0, customGameSettings.deathEaterCount)
			)
		);

	game.general.status = 'Dealing roles..';

	game.publicPlayersState.forEach(player => {
		player.cardStatus.cardDisplayed = true;
	});

	game.private.seatedPlayers.forEach((player, i) => {
		const index = Math.floor(Math.random() * roles.length);

		player.role = roles[index];

		roles.splice(index, 1);
		player.playersState = _.range(0, game.publicPlayersState.length).map(play => ({}));

		player.playersState.forEach((play, index) => {
			play.notificationStatus = play.nameStatus = '';

			play.cardStatus = i === index ? { cardBack: player.role } : {};
		});

		if (!game.general.disableGamechat) {
			player.gameChats.push({
				timestamp: new Date(),
				gameChat: true,
				chat: [
					{
						text: 'The game begins and you receive the '
					},
					{
						text: player.role.cardName === 'voldemort' ? 'voldemort' : player.role.cardName,
						type: player.role.cardName
					},
					{
						text: ' role and take seat '
					},
					{
						text: `#${i + 1}.`,
						type: 'player'
					}
				]
			});
		} else {
			player.gameChats.push({
				gameChat: true,
				timestamp: new Date(),
				chat: [
					{
						text: 'The game begins.'
					}
				]
			});
		}

		const modOnlyChat = {
			timestamp: new Date(),
			gameChat: true,
			chat: [
				{
					text: `${player.userName} {${i + 1}}`,
					type: 'player'
				},
				{
					text: ' is assigned the '
				},
				{
					text: player.role.cardName === 'voldemort' ? 'voldemort' : player.role.cardName,
					type: player.role.cardName
				},
				{
					text: ' role.'
				}
			]
		};
		game.private.hiddenInfoChat.push(modOnlyChat);
		sendInProgressModChatUpdate(game, modOnlyChat);
	});

	const libPlayers = game.private.seatedPlayers.filter(player => player.role.team === 'order');
	const fasPlayers = game.private.seatedPlayers.filter(player => player.role.team !== 'order');
	const lib = libPlayers.map(player => player.userName);
	const fas = fasPlayers.map(player => player.userName);
	const libElo = { overall: 1600, season: 1600 };
	const fasElo = { overall: 1600, season: 1600 };
	Account.find({
		username: { $in: game.private.seatedPlayers.map(player => player.userName) }
	}).then(accounts => {
		libElo.overall =
			lib.reduce(
				(prev, curr) =>
					(accounts.find(account => account.username === curr).eloOverall ? accounts.find(account => account.username === curr).eloOverall : 1600) + prev,
				0
			) / lib.length;
		libElo.season =
			lib.reduce(
				(prev, curr) =>
					(accounts.find(account => account.username === curr).eloSeason ? accounts.find(account => account.username === curr).eloSeason : 1600) + prev,
				0
			) / lib.length;
		fasElo.overall =
			fas.reduce(
				(prev, curr) =>
					(accounts.find(account => account.username === curr).eloOverall ? accounts.find(account => account.username === curr).eloOverall : 1600) + prev,
				0
			) / fas.length;
		fasElo.season =
			fas.reduce(
				(prev, curr) =>
					(accounts.find(account => account.username === curr).eloSeason ? accounts.find(account => account.username === curr).eloSeason : 1600) + prev,
				0
			) / fas.length;
	});

	game.private.summary = new GameSummaryBuilder(
		game.general.uid,
		new Date(),
		{
			rebalance6p: game.general.rebalance6p && game.private.seatedPlayers.length === 6,
			rebalance7p: game.general.rebalance7p && game.private.seatedPlayers.length === 7,
			rebalance9p: false,
			rerebalance9p: game.general.rerebalance9p && game.private.seatedPlayers.length === 9,
			casualGame: Boolean(game.general.casualGame)
		},
		game.customGameSettings,
		game.private.seatedPlayers.map(p => ({
			username: p.userName,
			role: p.role.cardName,
			icon: p.role.icon
		})),
		libElo,
		fasElo
	);

	game.private.unSeatedGameChats = [
		{
			gameChat: true,
			timestamp: new Date(),
			chat: [
				{
					text: 'The game begins.'
				}
			]
		}
	];

	sendInProgressGameUpdate(game);
	const voldemortPlayer = game.private.seatedPlayers.find(player => player.role.cardName === 'voldemort');

	if (!voldemortPlayer) {
		return;
	}

	setTimeout(
		() => {
			game.private.seatedPlayers.forEach((player, i) => {
				const { seatedPlayers } = game.private;
				const { cardName } = player.role;

				if (cardName === 'death-eater') {
					player.playersState[i].nameStatus = 'death-eater';

					if (customGameSettings.deathEaterCount == 2) {
						const otherDeathEater = seatedPlayers.find(play => play.role.cardName === 'death-eater' && play.userName !== player.userName);
						const otherDeathEaterIndex = seatedPlayers.indexOf(otherDeathEater);

						if (!otherDeathEater) {
							return;
						}

						if (!game.general.disableGamechat) {
							player.gameChats.push({
								timestamp: new Date(),
								gameChat: true,
								chat: [
									{
										text: 'You see that the other '
									},
									{
										text: 'death eater',
										type: 'death-eater'
									},
									{
										text: ' in this game is '
									},
									{
										text: game.general.blindMode ? `{${otherDeathEaterIndex + 1}}` : `${otherDeathEater.userName} {${otherDeathEaterIndex + 1}}`,
										type: 'player'
									},
									{
										text: '.'
									}
								]
							});
						}
						player.playersState[otherDeathEaterIndex].nameStatus = 'death-eater';
						player.playersState[otherDeathEaterIndex].notificationStatus = 'death-eater';
					} else if (customGameSettings.deathEaterCount == 3) {
						const otherDeathEaters = seatedPlayers.filter(play => play.role.cardName === 'death-eater' && play.userName !== player.userName);

						if (!game.general.disableGamechat) {
							player.gameChats.push({
								timestamp: new Date(),
								gameChat: true,
								chat: [
									{
										text: 'You see that the other '
									},
									{
										text: 'death eaters',
										type: 'death-eater'
									},
									{
										text: ' in this game are '
									},
									{
										text: game.general.blindMode
											? `{${seatedPlayers.indexOf(otherDeathEaters[0]) + 1}}`
											: `${otherDeathEaters[0].userName} {${seatedPlayers.indexOf(otherDeathEaters[0]) + 1}}`,
										type: 'player'
									},
									{
										text: ' and '
									},
									{
										text: game.general.blindMode
											? `{${seatedPlayers.indexOf(otherDeathEaters[1]) + 1}}`
											: `${otherDeathEaters[1].userName} {${seatedPlayers.indexOf(otherDeathEaters[1]) + 1}}`,
										type: 'player'
									},
									{
										text: '.'
									}
								]
							});
						}
						otherDeathEaters.forEach(deathEaterPlayer => {
							player.playersState[seatedPlayers.indexOf(deathEaterPlayer)].nameStatus = 'death-eater';
						});
						otherDeathEaters.forEach(deathEaterPlayer => {
							player.playersState[seatedPlayers.indexOf(deathEaterPlayer)].notificationStatus = 'death-eater';
						});
					}

					const chat = {
						timestamp: new Date(),
						gameChat: true,
						chat: [
							{
								text: 'You see that '
							},
							{
								text: 'voldemort',
								type: 'voldemort'
							},
							{
								text: ' in this game is '
							},
							{
								text: game.general.blindMode
									? `{${seatedPlayers.indexOf(voldemortPlayer) + 1}}`
									: `${voldemortPlayer.userName} {${seatedPlayers.indexOf(voldemortPlayer) + 1}}`,
								type: 'player'
							}
						]
					};

					if (!game.general.disableGamechat) {
						if (customGameSettings.hitKnowsFas) {
							chat.chat.push(
								{ text: '. They also see that you are a ' },
								{
									text: 'death eater',
									type: 'death-eater'
								},
								{ text: '.' }
							);
						} else {
							chat.chat.push(
								{ text: '. They do not know you are a ' },
								{
									text: 'death eater',
									type: 'death-eater'
								},
								{ text: '.' }
							);
						}
						player.gameChats.push(chat);
					}

					player.playersState[seatedPlayers.indexOf(voldemortPlayer)].notificationStatus = 'voldemort';
					player.playersState[seatedPlayers.indexOf(voldemortPlayer)].nameStatus = 'voldemort';
				} else if (cardName === 'voldemort') {
					player.playersState[seatedPlayers.indexOf(player)].nameStatus = 'voldemort';

					if (customGameSettings.hitKnowsFas) {
						if (customGameSettings.deathEaterCount == 1) {
							const otherDeathEater = seatedPlayers.find(player => player.role.cardName === 'death-eater');

							if (!game.general.disableGamechat) {
								player.gameChats.push({
									timestamp: new Date(),
									gameChat: true,
									chat: [
										{
											text: 'You see that the other '
										},
										{
											text: 'death eater',
											type: 'death-eater'
										},
										{
											text: ' in this game is '
										},
										{
											text: game.general.blindMode
												? `{${seatedPlayers.indexOf(otherDeathEater) + 1}}`
												: `${otherDeathEater.userName} {${seatedPlayers.indexOf(otherDeathEater) + 1}}`,
											type: 'player'
										},
										{
											text: '.  They know who you are.'
										}
									]
								});
							}
							player.playersState[seatedPlayers.indexOf(otherDeathEater)].nameStatus = 'death-eater';
							player.playersState[seatedPlayers.indexOf(otherDeathEater)].notificationStatus = 'death-eater';
						} else {
							const otherDeathEaters = seatedPlayers.filter(play => play.role.cardName === 'death-eater' && play.userName !== player.userName);

							if (!game.general.disableGamechat) {
								player.gameChats.push({
									timestamp: new Date(),
									gameChat: true,
									chat: [
										{
											text: 'You see that the other '
										},
										{
											text: 'death eaters',
											type: 'death-eater'
										},
										{
											text: ' in this game are '
										},
										{
											text: game.general.blindMode
												? `{${seatedPlayers.indexOf(otherDeathEaters[0]) + 1}}`
												: `${otherDeathEaters[0].userName} {${seatedPlayers.indexOf(otherDeathEaters[0]) + 1}}`,
											type: 'player'
										},
										{
											text: customGameSettings.deathEaterCount == 3 ? ', ' : ''
										},
										{
											text:
												customGameSettings.deathEaterCount == 3
													? game.general.blindMode
														? `{${seatedPlayers.indexOf(otherDeathEaters[2]) + 1}}`
														: `${otherDeathEaters[2].userName} {${seatedPlayers.indexOf(otherDeathEaters[2]) + 1}}`
													: '',
											type: 'player'
										},
										{
											text: customGameSettings.deathEaterCount == 3 ? ', and' : ' and '
										},
										{
											text: game.general.blindMode
												? `{${seatedPlayers.indexOf(otherDeathEaters[1]) + 1}}`
												: `${otherDeathEaters[1].userName} {${seatedPlayers.indexOf(otherDeathEaters[1]) + 1}}`,
											type: 'player'
										},
										{
											text: '.'
										}
									]
								});
							}
							otherDeathEaters.forEach(deathEaterPlayer => {
								player.playersState[seatedPlayers.indexOf(deathEaterPlayer)].nameStatus = 'death-eater';
								player.playersState[seatedPlayers.indexOf(deathEaterPlayer)].notificationStatus = 'death-eater';
							});
						}
					} else {
						if (!game.general.disableGamechat) {
							player.gameChats.push({
								timestamp: new Date(),
								gameChat: true,
								chat: [
									{
										text: `There ${customGameSettings.deathEaterCount == 1 ? 'is' : 'are'} `
									},
									{
										text:
											customGameSettings.deathEaterCount == 1 ? '1 death eater' : customGameSettings.deathEaterCount == 2 ? '2 death eaters' : '3 death eaters',
										type: 'death-eater'
									},
									{
										text: ', they know who you are.'
									}
								]
							});
						}
					}
				} else if (!game.general.disableGamechat) {
					player.playersState[seatedPlayers.indexOf(player)].nameStatus = 'order';
				}

				player.playersState[i].cardStatus.isFlipped = true;
			});
			sendInProgressGameUpdate(game);
		},
		process.env.NODE_ENV === 'development' ? 100 : experiencedMode ? 200 : 2000
	);

	setTimeout(
		() => {
			game.private.seatedPlayers.forEach((player, i) => {
				if (!player.playersState) {
					return;
				}
				player.playersState[i].cardStatus.isFlipped = false;
				player.playersState.forEach(play => {
					play.notificationStatus = '';
				});
			});
			sendInProgressGameUpdate(game, true);
		},
		process.env.NODE_ENV === 'development' ? 100 : 5000
	);

	setTimeout(
		() => {
			game.publicPlayersState.forEach(player => {
				player.cardStatus.cardDisplayed = false;
			});
			sendInProgressGameUpdate(game, true);
		},
		process.env.NODE_ENV === 'development' ? 100 : experiencedMode ? 5200 : 7000
	);

	setTimeout(
		() => {
			game.private.seatedPlayers.forEach(player => {
				player.playersState.forEach(state => {
					state.cardStatus = {};
				});
			});
			game.gameState.ministerIndex = -1;
			startElection(game);
		},
		process.env.NODE_ENV === 'development' ? 100 : experiencedMode ? 5400 : 9000
	);

	for (let affectedPlayerNumber = 0; affectedPlayerNumber < game.publicPlayersState.length; affectedPlayerNumber++) {
		const affectedSocketId = Object.keys(io.sockets.sockets).find(
			socketId =>
				io.sockets.sockets[socketId].handshake.session.passport &&
				io.sockets.sockets[socketId].handshake.session.passport.user === game.publicPlayersState[affectedPlayerNumber].userName
		);
		if (!io.sockets.sockets[affectedSocketId]) {
			continue;
		}
		if (process.env.NODE_ENV !== 'development') {
			io.sockets.sockets[affectedSocketId].emit('pingPlayer', 'Secret Voldemort IO: The game has started!');
		}
	}
};

/**
 * @param {object} game - game to act on.
 */
module.exports = game => {
	game.gameState.isTracksFlipped = true;
	let startGamePause = process.env.NODE_ENV === 'development' ? 1 : 5;

	const countDown = setInterval(() => {
		if (!startGamePause) {
			clearInterval(countDown);
			beginGame(game);
		} else {
			game.general.status = `Game starts in ${startGamePause} second${startGamePause === 1 ? '' : 's'}.`;
			sendInProgressGameUpdate(game, true);
			startGamePause--;
		}
	}, 1000);

	game.private.hiddenInfoChat = [];
	game.private.hiddenInfoSubscriptions = [];
	game.private.hiddenInfoShouldNotify = true;

	game.general.playerCount = game.publicPlayersState.length;
	game.general.livingPlayerCount = game.publicPlayersState.length;
	game.general.type = game.general.playerCount < 7 ? 0 : game.general.playerCount < 9 ? 1 : 2; // different death eater tracks
	game.publicPlayersState = _.shuffle(game.publicPlayersState);
	game.private.seatedPlayers = _.cloneDeep(game.publicPlayersState);
	game.private.seatedPlayers.forEach(player => {
		player.gameChats = [];
		player.wasInvestigated = false;
	});
	game.gameState.audioCue = '';
	game.private.proclamations = [];
};
