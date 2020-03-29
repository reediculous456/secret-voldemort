const { sendInProgressGameUpdate, sendInProgressModChatUpdate } = require('../util.js');
const { startElection, shuffleProclamations } = require('./common.js');
const { sendGameList } = require('../user-requests');
const { completeGame } = require('./end-game.js');

/**
 * @param {object} game - game to act on.
 */
module.exports.proclamationPeek = game => {
	const { seatedPlayers } = game.private;
	const { ministerIndex } = game.gameState;
	const minister = seatedPlayers[ministerIndex];

	if (!game.private.lock.proclamationPeek && !(game.general.isTourny && game.general.tournyInfo.isCancelled)) {
		game.private.lock.proclamationPeek = true;

		if (game.gameState.undrawnProclamationCount < 3) {
			shuffleProclamations(game);
		}

		game.general.status = 'Minister of Magic to peek at proclamations.';
		game.publicPlayersState[ministerIndex].isLoader = true;
		minister.playersState[ministerIndex].proclamationNotification = true;
		sendInProgressGameUpdate(game, true);
	}
};

/**
 * @param {object} passport - socket authentication.
 * @param {object} game - target game.
 * @param {object} socket - socket
 */
module.exports.selectProclamations = (passport, game, socket) => {
	const { ministerIndex } = game.gameState;
	const { experiencedMode } = game.general;
	const { seatedPlayers } = game.private;
	const minister = seatedPlayers[ministerIndex];

	if (game.gameState.isGameFrozen) {
		return;
	}

	if (game.general.isRemade) {
		return;
	}

	if (!minister || minister.userName !== passport.user) {
		return;
	}

	if (game.general.timedMode && game.private.timerId) {
		clearTimeout(game.private.timerId);
		game.private.timerId = null;
		game.gameState.timedModeEnabled = false;
	}

	if (!game.private.lock.selectProclamations && !(game.general.isTourny && game.general.tournyInfo.isCancelled)) {
		game.private.lock.selectProclamations = true;
		game.publicPlayersState[ministerIndex].isLoader = false;

		if (game.private.proclamations.length < 3) {
			shuffleProclamations(game);
		}

		game.private.summary = game.private.summary.updateLog({
			proclamationPeek: game.private.proclamations.slice(0, 3).reduce(
				(peek, proclamation) => {
					if (proclamation === 'death eater') {
						return Object.assign({}, peek, { reds: peek.reds + 1 });
					} else {
						return Object.assign({}, peek, { blues: peek.blues + 1 });
					}
				},
				{ reds: 0, blues: 0 }
			)
		});

		minister.cardFlingerState = [
			{
				position: 'middle-far-left',
				action: 'active',
				cardStatus: {
					isFlipped: false,
					cardFront: 'proclamation',
					cardBack: `${game.private.proclamations[0]}p`
				}
			},
			{
				position: 'middle-center',
				action: 'active',
				cardStatus: {
					isFlipped: false,
					cardFront: 'proclamation',
					cardBack: `${game.private.proclamations[1]}p`
				}
			},
			{
				position: 'middle-far-right',
				action: 'active',
				cardStatus: {
					isFlipped: false,
					cardFront: 'proclamation',
					cardBack: `${game.private.proclamations[2]}p`
				}
			}
		];

		game.gameState.audioCue = 'proclamationPeek';
		minister.playersState[ministerIndex].proclamationNotification = false;
		sendInProgressGameUpdate(game, true);

		setTimeout(
			() => {
				minister.cardFlingerState[0].cardStatus.isFlipped = minister.cardFlingerState[1].cardStatus.isFlipped = minister.cardFlingerState[2].cardStatus.isFlipped = true;
				sendInProgressGameUpdate(game, true);
			},
			process.env.NODE_ENV === 'development' ? 100 : experiencedMode ? 500 : 2000
		);

		setTimeout(
			() => {
				minister.cardFlingerState[0].cardStatus.isFlipped = minister.cardFlingerState[1].cardStatus.isFlipped = minister.cardFlingerState[2].cardStatus.isFlipped = false;
				minister.cardFlingerState[0].action = minister.cardFlingerState[1].action = minister.cardFlingerState[2].action = '';
				sendInProgressGameUpdate(game, true);
				game.gameState.audioCue = '';
			},
			process.env.NODE_ENV === 'development' ? 100 : experiencedMode ? 3500 : 6000
		);

		setTimeout(
			() => {
				minister.cardFlingerState = [];

				const modOnlyChat = {
					timestamp: new Date(),
					gameChat: true,
					chat: [
						{
							text: 'Minister of Magic '
						},
						{
							text: `${seatedPlayers[ministerIndex].userName} {${ministerIndex + 1}}`,
							type: 'player'
						},
						{
							text: ' peeks and sees '
						},
						{
							text: game.private.proclamations[0] === 'order' ? 'B' : 'R',
							type: game.private.proclamations[0]
						},
						{
							text: game.private.proclamations[1] === 'order' ? 'B' : 'R',
							type: game.private.proclamations[1]
						},
						{
							text: game.private.proclamations[2] === 'order' ? 'B' : 'R',
							type: game.private.proclamations[2]
						},
						{
							text: '.'
						}
					]
				};
				game.private.hiddenInfoChat.push(modOnlyChat);
				sendInProgressModChatUpdate(game, modOnlyChat);

				if (!game.general.disableGamechat) {
					minister.gameChats.push({
						gameChat: true,
						timestamp: new Date(),
						chat: [
							{ text: 'You peek at the top 3 proclamations and see that they are a ' },
							{
								text: game.private.proclamations[0],
								type: game.private.proclamations[0]
							},
							{ text: ', a ' },
							{
								text: game.private.proclamations[1],
								type: game.private.proclamations[1]
							},
							{ text: ', and a ' },
							{
								text: game.private.proclamations[2],
								type: game.private.proclamations[2]
							},
							{ text: ' proclamation.' }
						]
					});
				}

				sendInProgressGameUpdate(game);
				game.trackState.electionTrackerCount = 0;
				minister.playersState[ministerIndex].claim = 'didProclamationPeek';
				startElection(game);
			},
			process.env.NODE_ENV === 'development' ? 100 : experiencedMode ? 4500 : 7000
		);
	}
};

/**
 * @param {object} game - game to act on.
 */
module.exports.proclamationPeekAndDrop = game => {
	const { seatedPlayers } = game.private;
	const { ministerIndex } = game.gameState;
	const minister = seatedPlayers[ministerIndex];

	if (!game.private.lock.proclamationPeekAndDrop && !(game.general.isTourny && game.general.tournyInfo.isCancelled)) {
		game.private.lock.proclamationPeekAndDrop = true;

		if (game.gameState.undrawnProclamationCount < 3) {
			shuffleProclamations(game);
		}

		game.general.status = 'Minister of Magic to peek at one proclamation.';
		game.publicPlayersState[ministerIndex].isLoader = true;
		minister.playersState[ministerIndex].proclamationNotification = true;
		sendInProgressGameUpdate(game, true);
	}
};

/**
 * @param {object} passport - socket authentication.
 * @param {object} game - target game.
 */
module.exports.selectOneProclamation = (passport, game) => {
	const { ministerIndex } = game.gameState;
	const { experiencedMode } = game.general;
	const { seatedPlayers } = game.private;
	const minister = seatedPlayers[ministerIndex];

	if (game.gameState.isGameFrozen) {
		if (socket) {
			socket.emit('sendAlert', 'An AEM member has prevented this game from proceeding. Please wait.');
		}
		return;
	}

	if (game.general.isRemade) {
		if (socket) {
			socket.emit('sendAlert', 'This game has been remade and is now no longer playable.');
		}
		return;
	}

	if (!minister || minister.userName !== passport.user) {
		return;
	}

	if (game.general.timedMode && game.private.timerId) {
		clearTimeout(game.private.timerId);
		game.private.timerId = null;
		game.gameState.timedModeEnabled = false;
	}

	if (!game.private.lock.selectOneProclamation && !(game.general.isTourny && game.general.tournyInfo.isCancelled)) {
		game.private.lock.selectOneProclamation = true;
		game.publicPlayersState[ministerIndex].isLoader = false;

		if (game.private.proclamations.length < 3) {
			shuffleProclamations(game);
		}

		game.private.summary = game.private.summary.updateLog({
			proclamationPeek: game.private.proclamations.slice(0, 1).reduce(
				(peek, proclamation) => {
					if (proclamation === 'death eater') {
						return Object.assign({}, peek, { reds: peek.reds + 1 });
					} else {
						return Object.assign({}, peek, { blues: peek.blues + 1 });
					}
				},
				{ reds: 0, blues: 0 }
			)
		});

		const proclamation = game.private.proclamations[0];
		minister.cardFlingerState = [
			{
				position: 'middle-center',
				action: 'active',
				cardStatus: {
					isFlipped: false,
					cardFront: 'proclamation',
					cardBack: `${proclamation}p`
				}
			}
		];

		game.gameState.audioCue = 'proclamationPeek';
		minister.playersState[ministerIndex].proclamationNotification = false;
		sendInProgressGameUpdate(game, true);

		setTimeout(
			() => {
				minister.cardFlingerState[0].cardStatus.isFlipped = true;
				sendInProgressGameUpdate(game, true);
			},
			process.env.NODE_ENV === 'development' ? 100 : experiencedMode ? 500 : 2000
		);

		setTimeout(
			() => {
				minister.cardFlingerState[0].cardStatus.isFlipped = false;
				minister.cardFlingerState[0].action = '';
				sendInProgressGameUpdate(game, true);
				game.gameState.audioCue = '';
			},
			process.env.NODE_ENV === 'development' ? 100 : experiencedMode ? 3500 : 6000
		);

		setTimeout(
			() => {
				minister.cardFlingerState = [];

				const modOnlyChat = {
					timestamp: new Date(),
					gameChat: true,
					chat: [
						{
							text: 'Minister of Magic '
						},
						{
							text: `${seatedPlayers[ministerIndex].userName} {${ministerIndex + 1}}`,
							type: 'player'
						},
						{
							text: ' peeks and sees '
						},
						{
							text: game.private.proclamations[0] === 'order' ? 'B' : 'R',
							type: game.private.proclamations[0]
						},
						{
							text: '.'
						}
					]
				};
				game.private.hiddenInfoChat.push(modOnlyChat);
				sendInProgressModChatUpdate(game, modOnlyChat);

				if (!game.general.disableGamechat) {
					minister.gameChats.push({
						gameChat: true,
						timestamp: new Date(),
						chat: [
							{ text: 'You peek at the top proclamation and see that it is a ' },
							{
								text: proclamation,
								type: proclamation
							},
							{ text: ' proclamation.' }
						]
					});
				}

				sendInProgressGameUpdate(game);
				game.trackState.electionTrackerCount = 0;
				minister.playersState[ministerIndex].claim = 'didSingleProclamationPeek';
				setTimeout(
					() => {
						const chat = {
							gameChat: true,
							timestamp: new Date(),
							chat: [
								{
									text:
										'You must vote whether or not to discard this proclamation.  Select Ja to discard the peeked proclamation or select Nein to put it back on the deck.'
								}
							]
						};

						game.publicPlayersState[ministerIndex].isLoader = true;

						minister.cardFlingerState = [
							{
								position: 'middle-left',
								notificationStatus: '',
								action: 'active',
								cardStatus: {
									isFlipped: false,
									cardFront: 'ballot',
									cardBack: 'ja'
								}
							},
							{
								position: 'middle-right',
								action: 'active',
								notificationStatus: '',
								cardStatus: {
									isFlipped: false,
									cardFront: 'ballot',
									cardBack: 'nein'
								}
							}
						];

						if (!game.general.disableGamechat) {
							minister.gameChats.push(chat);
						}

						sendInProgressGameUpdate(game);

						setTimeout(
							() => {
								minister.cardFlingerState[0].cardStatus.isFlipped = minister.cardFlingerState[1].cardStatus.isFlipped = true;
								minister.cardFlingerState[0].notificationStatus = minister.cardFlingerState[1].notificationStatus = 'notification';
								game.gameState.phase = 'ministerVoteOnBurn';

								if (game.general.timedMode) {
									if (game.private.timerId) {
										clearTimeout(game.private.timerId);
										game.private.timerId = null;
									}
									game.gameState.timedModeEnabled = true;
									game.private.timerId = setTimeout(
										() => {
											if (game.gameState.timedModeEnabled) {
												game.gameState.timedModeEnabled = false;
												selectBurnCard({ user: minister.userName }, game, { vote: Boolean(Math.floor(Math.random() * 2)) });
											}
										},
										process.env.DEVTIMEDDELAY ? process.env.DEVTIMEDDELAY : game.general.timedMode * 1000
									);
								}

								sendInProgressGameUpdate(game);
							},
							process.env.NODE_ENV === 'development' ? 100 : experiencedMode ? 500 : 1000
						);
					},
					process.env.NODE_ENV === 'development' ? 100 : experiencedMode ? 1000 : 2000
				);
			},
			process.env.NODE_ENV === 'development' ? 100 : experiencedMode ? 4500 : 7000
		);
	}
};

/**
 * @param {object} passport - socket authentication.
 * @param {object} game - target game.
 * @param {object} data from socket emit
 * @param {object} socket - socket
 */
module.exports.selectBurnCard = (passport, game, data, socket) => {
	if (game.general.timedMode && game.private.timerId) {
		clearTimeout(game.private.timerId);
		game.private.timerId = null;
	}

	if (game.gameState.isGameFrozen) {
		if (socket) {
			socket.emit('sendAlert', 'An AEM member has prevented this game from proceeding. Please wait.');
		}
		return;
	}

	if (game.general.isRemade) {
		if (socket) {
			socket.emit('sendAlert', 'This game has been remade and is now no longer playable.');
		}
		return;
	}

	const { experiencedMode } = game.general;
	const { ministerIndex } = game.gameState;
	const { seatedPlayers } = game.private;
	const minister = seatedPlayers[ministerIndex];
	const publicMinister = game.publicPlayersState[game.gameState.ministerIndex];

	if (!minister || minister.userName !== passport.user) {
		return;
	}

	if (!game.private.lock.selectBurnCard && !(game.general.isTourny && game.general.tournyInfo.isCancelled)) {
		game.private.lock.selectBurnCard = true;

		game.private.summary = game.private.summary.updateLog({
			ministerVeto: data.vote
		});
		game.publicPlayersState[ministerIndex].isLoader = false;
		minister.cardFlingerState[0].action = minister.cardFlingerState[1].action = '';
		minister.cardFlingerState[0].cardStatus.isFlipped = minister.cardFlingerState[1].cardStatus.isFlipped = false;

		if (data.vote) {
			minister.cardFlingerState[0].notificationStatus = 'selected';
			minister.cardFlingerState[1].notificationStatus = '';
		} else {
			minister.cardFlingerState[0].notificationStatus = '';
			minister.cardFlingerState[1].notificationStatus = 'selected';
		}

		publicMinister.cardStatus = {
			cardDisplayed: true,
			cardFront: 'ballot',
			cardBack: {
				cardName: data.vote ? 'ja' : 'nein'
			}
		};

		sendInProgressGameUpdate(game);

		setTimeout(
			() => {
				const chat = {
					timestamp: new Date(),
					gameChat: true,
					chat: [
						{ text: 'Minister ' },
						{
							text: game.general.blindMode
								? `{${game.private.seatedPlayers.indexOf(minister) + 1}}`
								: `${passport.user} {${game.private.seatedPlayers.indexOf(minister) + 1}}`,
							type: 'player'
						},
						{
							text: data.vote ? ' has chosen to discard the top card.' : ' has chosen to keep the top card.'
						}
					]
				};

				if (!game.general.disableGamechat) {
					game.private.seatedPlayers.forEach(player => {
						player.gameChats.push(chat);
					});
					game.private.unSeatedGameChats.push(chat);
				}

				publicMinister.cardStatus.isFlipped = true;

				minister.cardFlingerState = [];
				if (data.vote) {
					game.private.proclamations.shift();
					game.gameState.undrawnProclamationCount--;
					if (game.gameState.undrawnProclamationCount < 3) {
						shuffleProclamations(game);
					}
				}
				sendInProgressGameUpdate(game);

				setTimeout(
					() => {
						startElection(game);
					},
					process.env.NODE_ENV === 'development' ? 100 : experiencedMode ? 1000 : 3000
				);
			},
			process.env.NODE_ENV === 'development' ? 100 : experiencedMode ? 1000 : 3000
		);
	}
};

/**
 * @param {object} game - game to act on.
 */
module.exports.investigateLoyalty = game => {
	const { seatedPlayers } = game.private;
	const { ministerIndex } = game.gameState;
	const minister = seatedPlayers[ministerIndex];

	minister.playersState.forEach((player, i) => {
		if (!seatedPlayers[i]) {
			console.error(`PLAYERSTATE CONTAINS NULL!\n${JSON.stringify(minister.playersState)}\n${JSON.stringify(game)}`);
		}
	});
	const hasTarget =
		minister.playersState.filter((player, i) => i !== ministerIndex && !seatedPlayers[i].isDead && !seatedPlayers[i].wasInvestigated).length > 0;
	if (!hasTarget) {
		const t = new Date();

		t.setMilliseconds(t.getMilliseconds + 1);

		const chat = {
			timestamp: t,
			gameChat: true,
			chat: [
				{ text: 'Minister of Magic ' },
				{
					text: game.general.blindMode ? `{${ministerIndex + 1}}` : `${minister.userName} {${ministerIndex + 1}}`,
					type: 'player'
				},
				{ text: '  has no valid investigation target.' }
			]
		};

		seatedPlayers.forEach((player, i) => {
			player.gameChats.push(chat);
		});

		game.private.unSeatedGameChats.push(chat);
		startElection(game);
		return;
	}

	if (!game.private.lock.investigateLoyalty && !(game.general.isTourny && game.general.tournyInfo.isCancelled)) {
		game.private.lock.investigateLoyalty = true;

		game.general.status = 'Waiting for Minister of Magic to investigate.';
		minister.playersState
			.filter((player, i) => i !== ministerIndex && !seatedPlayers[i].isDead && !seatedPlayers[i].wasInvestigated)
			.forEach(player => {
				player.notificationStatus = 'notification';
			});
		game.publicPlayersState[ministerIndex].isLoader = true;
		game.gameState.clickActionInfo = [
			minister.userName,
			seatedPlayers
				.filter((player, i) => i !== ministerIndex && !seatedPlayers[i].isDead && !seatedPlayers[i].wasInvestigated)
				.map(player => seatedPlayers.indexOf(player))
		];
		game.gameState.phase = 'selectPartyMembershipInvestigate';
		sendInProgressGameUpdate(game, true);
	}
};

/**
 * @param {object} passport - socket authentication.
 * @param {object} game - target game.
 * @param {object} data from socket emit
 * @param {object} socket - socket
 */
module.exports.selectPartyMembershipInvestigate = (passport, game, data, socket) => {
	if (game.general.timedMode && game.private.timerId) {
		clearTimeout(game.private.timerId);
		game.private.timerId = null;
		game.gameState.timedModeEnabled = false;
	}

	if (game.gameState.isGameFrozen) {
		if (socket) {
			socket.emit('sendAlert', 'An AEM member has prevented this game from proceeding. Please wait.');
		}
		return;
	}

	if (game.general.isRemade) {
		if (socket) {
			socket.emit('sendAlert', 'This game has been remade and is now no longer playable.');
		}
		return;
	}

	const { playerIndex } = data;
	const { experiencedMode } = game.general;
	const { ministerIndex } = game.gameState;
	const { seatedPlayers } = game.private;
	const minister = seatedPlayers[ministerIndex];
	const playersTeam = game.private.seatedPlayers[playerIndex].role.team;

	if (playerIndex === ministerIndex) {
		return;
	}

	if (!minister || minister.userName !== passport.user) {
		return;
	}

	if (!game.private.lock.selectPartyMembershipInvestigate && !(game.general.isTourny && game.general.tournyInfo.isCancelled)) {
		game.private.lock.selectPartyMembershipInvestigate = true;

		if (!seatedPlayers[playerIndex].isDead && !seatedPlayers[playerIndex].wasInvestigated) {
			game.gameState.audioCue = 'selectedInvestigate';
			seatedPlayers[playerIndex].wasInvestigated = true;

			minister.playersState.forEach(player => {
				player.notificationStatus = '';
			});

			game.private.summary = game.private.summary.updateLog({
				investigationId: playerIndex
			});

			game.publicPlayersState[ministerIndex].isLoader = false;
			game.publicPlayersState[playerIndex].cardStatus = {
				cardDisplayed: true,
				cardFront: 'partymembership',
				cardBack: {}
			};

			sendInProgressGameUpdate(game, true);

			setTimeout(
				() => {
					const chat = {
						timestamp: new Date(),
						gameChat: true
					};

					minister.playersState[playerIndex].cardStatus = {
						isFlipped: true,
						cardBack: {
							cardName: `membership-${playersTeam}`
						}
					};

					if (!game.general.disableGamechat) {
						seatedPlayers
							.filter(player => player.userName !== minister.userName)
							.forEach(player => {
								chat.chat = [
									{ text: 'Minister of Magic ' },
									{
										text: game.general.blindMode ? `{${ministerIndex + 1}}` : `${minister.userName} {${ministerIndex + 1}}`,
										type: 'player'
									},
									{ text: ' investigates the party membership of ' },
									{
										text: game.general.blindMode ? `{${playerIndex + 1}}` : `${seatedPlayers[playerIndex].userName} {${playerIndex + 1}}`,
										type: 'player'
									},
									{ text: '.' }
								];

								player.gameChats.push(chat);
							});

						game.private.unSeatedGameChats.push(chat);

						minister.gameChats.push({
							timestamp: new Date(),
							gameChat: true,
							chat: [
								{ text: 'You investigate the party membership of ' },
								{
									text: game.general.blindMode ? `{${playerIndex + 1}}` : `${seatedPlayers[playerIndex].userName} {${playerIndex + 1}}`,
									type: 'player'
								},
								{ text: ' and determine that they are on the ' },
								{
									text: playersTeam,
									type: playersTeam
								},
								{ text: ' team.' }
							]
						});
					}

					const modOnlyChat = {
						timestamp: new Date(),
						gameChat: true,
						chat: [
							{
								text: 'Minister of Magic '
							},
							{
								text: `${seatedPlayers[ministerIndex].userName} {${ministerIndex + 1}}`,
								type: 'player'
							},
							{
								text: ' sees a '
							},
							{
								text: playersTeam,
								type: playersTeam
							},
							{
								text: ' loyalty card.'
							}
						]
					};
					game.private.hiddenInfoChat.push(modOnlyChat);
					sendInProgressModChatUpdate(game, modOnlyChat);

					if (
						!game.general.disableGamechat &&
						!(game.private.seatedPlayers[playerIndex].role.cardName === 'voldemort' && minister.role.team === 'death eater')
					) {
						minister.playersState[playerIndex].nameStatus = playersTeam;
					}
					game.private.invIndex = playerIndex;
					sendInProgressGameUpdate(game);
				},
				process.env.NODE_ENV === 'development' ? 100 : experiencedMode ? 200 : 2000
			);

			setTimeout(
				() => {
					game.gameState.audioCue = '';
					minister.playersState[playerIndex].cardStatus.isFlipped = false;
					sendInProgressGameUpdate(game, true);
				},
				process.env.NODE_ENV === 'development' ? 100 : experiencedMode ? 4000 : 6000
			);

			setTimeout(
				() => {
					game.publicPlayersState[playerIndex].cardStatus.cardDisplayed = false;
					minister.playersState[playerIndex].cardStatus.cardBack = {};
					minister.playersState[ministerIndex].claim = 'didInvestigateLoyalty';
					sendInProgressGameUpdate(game, true);
					startElection(game);
				},
				process.env.NODE_ENV === 'development' ? 100 : experiencedMode ? 4200 : 8000
			);
		}
	}
};

/**
 * @param {object} game - game to act on.
 */
module.exports.showPlayerLoyalty = game => {
	const { seatedPlayers } = game.private;
	const { ministerIndex } = game.gameState;
	const minister = seatedPlayers[ministerIndex];

	if (!game.private.lock.showPlayerLoyalty && !(game.general.isTourny && game.general.tournyInfo.isCancelled)) {
		game.private.lock.showPlayerLoyalty = true;

		game.general.status = 'Waiting for Minister of Magic to show their party.';
		minister.playersState
			.filter((player, i) => i !== ministerIndex && !seatedPlayers[i].isDead)
			.forEach(player => {
				player.notificationStatus = 'notification';
			});
		game.publicPlayersState[ministerIndex].isLoader = true;
		game.gameState.clickActionInfo = [
			minister.userName,
			seatedPlayers.filter((player, i) => i !== ministerIndex && !seatedPlayers[i].isDead).map(player => seatedPlayers.indexOf(player))
		];
		game.gameState.phase = 'selectPartyMembershipInvestigateReverse';
		sendInProgressGameUpdate(game, true);
	}
};

/**
 * @param {object} passport - socket authentication.
 * @param {object} game - target game.
 * @param {object} data from socket emit
 * @param {object} socket - socket
 */
module.exports.selectPartyMembershipInvestigateReverse = (passport, game, data, socket) => {
	if (game.general.timedMode && game.private.timerId) {
		clearTimeout(game.private.timerId);
		game.private.timerId = null;
		game.gameState.timedModeEnabled = false;
	}

	if (game.gameState.isGameFrozen) {
		if (socket) {
			socket.emit('sendAlert', 'An AEM member has prevented this game from proceeding. Please wait.');
		}
		return;
	}

	if (game.general.isRemade) {
		if (socket) {
			socket.emit('sendAlert', 'This game has been remade and is now no longer playable.');
		}
		return;
	}

	const { playerIndex } = data;
	const { experiencedMode } = game.general;
	const { ministerIndex } = game.gameState;
	const { seatedPlayers } = game.private;
	const minister = seatedPlayers[ministerIndex];
	const playersTeam = game.private.seatedPlayers[ministerIndex].role.team;

	if (playerIndex === ministerIndex) {
		return;
	}

	if (!minister || minister.userName !== passport.user) {
		return;
	}

	if (!game.private.lock.selectPartyMembershipInvestigateReverse && !(game.general.isTourny && game.general.tournyInfo.isCancelled)) {
		game.private.lock.selectPartyMembershipInvestigateReverse = true;

		const targetPlayer = seatedPlayers[playerIndex];
		if (!targetPlayer.isDead) {
			game.gameState.audioCue = 'selectedInvestigate';
			seatedPlayers[ministerIndex].wasInvestigated = true;

			minister.playersState.forEach(player => {
				player.notificationStatus = '';
			});

			game.private.summary = game.private.summary.updateLog({
				investigationId: playerIndex
			});

			game.publicPlayersState[ministerIndex].isLoader = false;
			game.publicPlayersState[ministerIndex].cardStatus = {
				cardDisplayed: true,
				cardFront: 'partymembership',
				cardBack: {}
			};

			sendInProgressGameUpdate(game, true);

			setTimeout(
				() => {
					const chat = {
						timestamp: new Date(),
						gameChat: true
					};

					targetPlayer.playersState[ministerIndex].cardStatus = {
						isFlipped: true,
						cardBack: {
							cardName: `membership-${playersTeam}`
						}
					};

					if (!game.general.disableGamechat) {
						seatedPlayers
							.filter(player => player.userName !== minister.userName && player.userName !== targetPlayer.userName)
							.forEach(player => {
								chat.chat = [
									{ text: 'Minister of Magic ' },
									{
										text: game.general.blindMode ? `{${ministerIndex + 1}}` : `${minister.userName} {${ministerIndex + 1}}`,
										type: 'player'
									},
									{ text: ' shows their party membership to ' },
									{
										text: game.general.blindMode ? `{${playerIndex + 1}}` : `${seatedPlayers[playerIndex].userName} {${playerIndex + 1}}`,
										type: 'player'
									},
									{ text: '.' }
								];

								player.gameChats.push(chat);
							});

						game.private.unSeatedGameChats.push(chat);

						minister.gameChats.push({
							timestamp: new Date(),
							gameChat: true,
							chat: [
								{
									text: 'You have shown your party membership card to '
								},
								{
									text: game.general.blindMode ? `{${playerIndex + 1}}` : `${targetPlayer.userName} {${playerIndex + 1}}`,
									type: 'player'
								},
								{ text: '.' }
							]
						});
						targetPlayer.gameChats.push({
							timestamp: new Date(),
							gameChat: true,
							chat: [
								{
									text: game.general.blindMode ? `{${ministerIndex + 1}}` : `${minister.userName} {${ministerIndex + 1}}`,
									type: 'player'
								},
								{ text: ' has shown you their party membership, and you determine that they are on the ' },
								{
									text: playersTeam,
									type: playersTeam
								},
								{ text: ' team.' }
							]
						});
					}

					const modOnlyChat = {
						timestamp: new Date(),
						gameChat: true,
						chat: [
							{
								text: 'Minister of Magic '
							},
							{
								text: `${seatedPlayers[ministerIndex].userName} {${ministerIndex + 1}}`,
								type: 'player'
							},
							{
								text: ' shows their '
							},
							{
								text: playersTeam,
								type: playersTeam
							},
							{
								text: ' loyalty card.'
							}
						]
					};
					game.private.hiddenInfoChat.push(modOnlyChat);
					sendInProgressModChatUpdate(game, modOnlyChat);

					if (
						!game.general.disableGamechat &&
						!(game.private.seatedPlayers[ministerIndex].role.cardName === 'voldemort' && targetPlayer.role.team === 'death eater')
					) {
						targetPlayer.playersState[ministerIndex].nameStatus = playersTeam;
					}

					sendInProgressGameUpdate(game);
				},
				process.env.NODE_ENV === 'development' ? 100 : experiencedMode ? 200 : 2000
			);

			setTimeout(
				() => {
					game.gameState.audioCue = '';
					targetPlayer.playersState[ministerIndex].cardStatus.isFlipped = false;
					sendInProgressGameUpdate(game, true);
				},
				process.env.NODE_ENV === 'development' ? 100 : experiencedMode ? 4000 : 6000
			);

			setTimeout(
				() => {
					game.publicPlayersState[ministerIndex].cardStatus.cardDisplayed = false;
					targetPlayer.playersState[ministerIndex].cardStatus.cardBack = {};
					targetPlayer.playersState[playerIndex].claim = 'didInvestigateLoyalty';
					sendInProgressGameUpdate(game, true);
					startElection(game);
				},
				process.env.NODE_ENV === 'development' ? 100 : experiencedMode ? 4200 : 8000
			);
		}
	}
};

/**
 * @param {object} game - game to act on.
 */
module.exports.specialElection = game => {
	const { seatedPlayers } = game.private;
	const { ministerIndex } = game.gameState;
	const minister = seatedPlayers[ministerIndex];

	if (!game.private.lock.specialElection && !(game.general.isTourny && game.general.tournyInfo.isCancelled)) {
		game.private.lock.specialElection = true;
		game.general.status = 'Minister of Magic to select special election.';
		game.gameState.specialElectionFormerMinisterIndex = ministerIndex;
		game.publicPlayersState[ministerIndex].isLoader = true;

		minister.playersState
			.filter((player, index) => index !== ministerIndex && !seatedPlayers[index].isDead)
			.forEach(player => {
				player.notificationStatus = 'notification';
			});

		game.gameState.phase = 'specialElection';
		game.gameState.clickActionInfo = [
			minister.userName,
			seatedPlayers.filter((player, i) => i !== ministerIndex && !seatedPlayers[i].isDead).map(player => seatedPlayers.indexOf(player))
		];
		sendInProgressGameUpdate(game, true);
	}
};

/**
 * @param {object} passport - socket authentication.
 * @param {object} game - target game.
 * @param {object} data from socket emit
 * @param {object} socket - socket
 */
module.exports.selectSpecialElection = (passport, game, data, socket) => {
	const { playerIndex } = data;
	const { ministerIndex } = game.gameState;
	const gameChat = {
		timestamp: new Date(),
		gameChat: true,
		chat: []
	};
	const minister = game.private.seatedPlayers[ministerIndex];
	const seatedPlayers = game.private.seatedPlayers;
	if (!minister || minister.userName !== passport.user) {
		return;
	}

	if (game.gameState.isGameFrozen) {
		if (socket) {
			socket.emit('sendAlert', 'An AEM member has prevented this game from proceeding. Please wait.');
		}
		return;
	}

	if (game.general.isRemade) {
		if (socket) {
			socket.emit('sendAlert', 'This game has been remade and is now no longer playable.');
		}
		return;
	}

	if (playerIndex === ministerIndex) {
		return;
	}

	if (game.general.timedMode && game.private.timerId) {
		clearTimeout(game.private.timerId);
		game.private.timerId = null;
		game.gameState.timedModeEnabled = false;
	}

	if (!game.private.lock.selectSpecialElection && !(game.general.isTourny && game.general.tournyInfo.isCancelled)) {
		game.private.lock.selectSpecialElection = true;

		game.private.summary = game.private.summary.updateLog({
			specialElection: data.playerIndex
		});

		game.publicPlayersState[game.gameState.ministerIndex].isLoader = false;

		game.private.seatedPlayers[game.gameState.ministerIndex].playersState.forEach(player => {
			player.notificationStatus = '';
		});

		if (!game.general.disableGamechat) {
			seatedPlayers
				.filter(player => player.userName !== minister.userName)
				.forEach(player => {
					gameChat.chat = [
						{ text: 'Minister of Magic ' },
						{
							text: game.general.blindMode ? `{${ministerIndex + 1}}` : `${minister.userName} {${ministerIndex + 1}}`,
							type: 'player'
						},
						{ text: ' has chosen to special elect ' },
						{
							text: game.general.blindMode ? `{${playerIndex + 1}}` : `${seatedPlayers[playerIndex].userName} {${playerIndex + 1}}`,
							type: 'player'
						},
						{ text: ' as minister of magic.' }
					];

					player.gameChats.push(gameChat);
				});

			game.private.unSeatedGameChats.push(gameChat);

			minister.gameChats.push({
				timestamp: new Date(),
				gameChat: true,
				chat: [
					{ text: 'You choose to special-elect ' },
					{
						text: game.general.blindMode ? `{${playerIndex + 1}}` : `${seatedPlayers[playerIndex].userName} {${playerIndex + 1}}`,
						type: 'player'
					},
					{ text: ' as minister of magic.' }
				]
			});
		}

		sendInProgressGameUpdate(game);

		startElection(game, data.playerIndex);
	}
};

/**
 * @param {object} game - game to act on.
 */
module.exports.executePlayer = game => {
	const { seatedPlayers } = game.private;
	const { ministerIndex } = game.gameState;
	const minister = seatedPlayers[ministerIndex];

	if (!game.private.lock.executePlayer && !(game.general.isTourny && game.general.tournyInfo.isCancelled)) {
		game.private.lock.executePlayer = true;
		game.general.status = 'Minister of Magic to execute a player.';
		game.publicPlayersState[ministerIndex].isLoader = true;

		if (!game.general.disableGamechat) {
			minister.gameChats.push({
				gameChat: true,
				timestamp: new Date(),
				chat: [{ text: 'You must select a player to execute.' }]
			});
		}

		minister.playersState
			.filter(
				(player, index) =>
					index !== ministerIndex &&
					!seatedPlayers[index].isDead &&
					((!game.customGameSettings.fasCanShootHit && !(minister.role.cardName === 'death eater' && seatedPlayers[index].role.cardName === 'voldemort')) ||
						(game.customGameSettings.fasCanShootHit && !(minister.role.cardName === 'death eater' && seatedPlayers[index].role.cardName === 'voldemort')) ||
						(game.customGameSettings.fasCanShootHit && minister.role.cardName === 'death eater' && seatedPlayers[index].role.cardName === 'voldemort'))
			)
			.forEach(player => {
				player.notificationStatus = 'notification';
			});

		game.gameState.clickActionInfo = [
			minister.userName,
			seatedPlayers
				.filter(
					(player, i) =>
						i !== ministerIndex &&
						!seatedPlayers[i].isDead &&
						((!game.customGameSettings.fasCanShootHit && !(minister.role.cardName === 'death eater' && seatedPlayers[i].role.cardName === 'voldemort')) ||
							(game.customGameSettings.fasCanShootHit && !(minister.role.cardName === 'death eater' && seatedPlayers[i].role.cardName === 'voldemort')) ||
							(game.customGameSettings.fasCanShootHit && minister.role.cardName === 'death eater' && seatedPlayers[i].role.cardName === 'voldemort'))
				)
				.map(player => seatedPlayers.indexOf(player))
		];
		game.gameState.phase = 'execution';
		sendInProgressGameUpdate(game);
	}
};

/**
 * @param {object} passport - socket authentication.
 * @param {object} game - target game.
 * @param {object} data from socket emit
 * @param {object} socket - socket
 */
module.exports.selectPlayerToExecute = (passport, game, data, socket) => {
	const { playerIndex } = data;
	const { ministerIndex } = game.gameState;
	const { seatedPlayers } = game.private;
	const selectedPlayer = seatedPlayers[playerIndex];
	const publicSelectedPlayer = game.publicPlayersState[playerIndex];
	const minister = seatedPlayers[ministerIndex];

	if (game.gameState.isGameFrozen) {
		if (socket) {
			socket.emit('sendAlert', 'An AEM member has prevented this game from proceeding. Please wait.');
		}
		return;
	}

	if (game.general.isRemade) {
		if (socket) {
			socket.emit('sendAlert', 'This game has been remade and is now no longer playable.');
		}
		return;
	}

	// Make sure the target is valid
	if (
		playerIndex === ministerIndex ||
		selectedPlayer.isDead ||
		(!game.customGameSettings.fasCanShootHit && minister.role.cardName === 'death eater' && seatedPlayers[playerIndex].role.cardName === 'voldemort')
	) {
		return;
	}

	if (!minister || minister.userName !== passport.user) {
		return;
	}

	const nonMinisterChat = {
		gameChat: true,
		timestamp: new Date(),
		chat: [
			{ text: 'Minister of Magic ' },
			{
				text: game.general.blindMode ? `{${ministerIndex + 1}}` : `${minister.userName} {${ministerIndex + 1}}`,
				type: 'player'
			},
			{ text: ' selects to execute ' },
			{
				text: game.general.blindMode ? `{${playerIndex + 1}}` : `${selectedPlayer.userName} {${playerIndex + 1}}`,
				type: 'player'
			},
			{ text: '.' }
		]
	};

	if (game.general.timedMode && game.private.timerId) {
		clearTimeout(game.private.timerId);
		game.private.timerId = null;
		game.gameState.timedModeEnabled = false;
	}

	if (!game.private.lock.selectPlayerToExecute && !(game.general.isTourny && game.general.tournyInfo.isCancelled)) {
		game.gameState.audioCue = 'selectedExecution';
		game.private.lock.selectPlayerToExecute = true;

		game.private.summary = game.private.summary.updateLog({
			execution: playerIndex
		});

		if (!game.general.disableGamechat) {
			game.private.unSeatedGameChats.push(nonMinisterChat);

			seatedPlayers
				.filter(player => player.userName !== minister.userName)
				.forEach(player => {
					player.gameChats.push(nonMinisterChat);
				});

			minister.gameChats.push({
				gameChat: true,
				timestamp: new Date(),
				chat: [
					{ text: 'You select to execute ' },
					{
						text: game.general.blindMode ? `{${playerIndex + 1}}` : `${selectedPlayer.userName} {${playerIndex + 1}}`,
						type: 'player'
					},
					{ text: '.' }
				]
			});
		}

		game.publicPlayersState[ministerIndex].isLoader = false;

		minister.playersState.forEach(player => {
			player.notificationStatus = '';
		});

		publicSelectedPlayer.cardStatus.cardDisplayed = true;
		publicSelectedPlayer.cardStatus.cardFront = 'secretrole';
		publicSelectedPlayer.notificationStatus = 'danger';
		publicSelectedPlayer.isDead = true;
		sendInProgressGameUpdate(game);

		setTimeout(
			() => {
				game.gameState.audioCue = '';
				selectedPlayer.isDead = publicSelectedPlayer.isDead = true;
				publicSelectedPlayer.notificationStatus = '';
				game.general.livingPlayerCount--;
				sendInProgressGameUpdate(game, true);

				if (selectedPlayer.role.cardName === 'voldemort') {
					const chat = {
						timestamp: new Date(),
						gameChat: true,
						chat: [
							{
								text: 'Voldemort',
								type: 'voldemort'
							},
							{ text: '  has been executed.' }
						]
					};

					publicSelectedPlayer.cardStatus.cardBack = selectedPlayer.role;
					publicSelectedPlayer.cardStatus.isFlipped = true;

					seatedPlayers.forEach((player, i) => {
						player.gameChats.push(chat);
					});

					game.private.unSeatedGameChats.push(chat);

					setTimeout(
						() => {
							game.publicPlayersState.forEach((player, i) => {
								player.cardStatus.cardFront = 'secretrole';
								player.cardStatus.cardDisplayed = true;
								player.cardStatus.cardBack = seatedPlayers[i].role;
							});
							game.gameState.audioCue = 'voldemortShot';
							sendInProgressGameUpdate(game);
						},
						process.env.NODE_ENV === 'development' ? 100 : 1000
					);

					setTimeout(
						() => {
							game.publicPlayersState.forEach(player => {
								player.cardStatus.isFlipped = true;
							});

							game.gameState.audioCue = '';
							completeGame(game, 'order');
						},
						process.env.NODE_ENV === 'development' ? 100 : 2000
					);
				} else {
					let libAlive = false;
					seatedPlayers.forEach(p => {
						if (p.role.cardName == 'order' && !p.isDead) libAlive = true;
					});
					if (!libAlive) {
						const chat = {
							timestamp: new Date(),
							gameChat: true,
							chat: [
								{ text: 'All ' },
								{
									text: 'orders',
									type: 'order'
								},
								{ text: '  have been executed.' }
							]
						};

						publicSelectedPlayer.cardStatus.cardBack = selectedPlayer.role;
						publicSelectedPlayer.cardStatus.isFlipped = true;

						seatedPlayers.forEach((player, i) => {
							player.gameChats.push(chat);
						});

						game.private.unSeatedGameChats.push(chat);

						setTimeout(
							() => {
								game.publicPlayersState.forEach((player, i) => {
									player.cardStatus.cardFront = 'secretrole';
									player.cardStatus.cardDisplayed = true;
									player.cardStatus.cardBack = seatedPlayers[i].role;
								});
								game.gameState.audioCue = 'voldemortShot';
								sendInProgressGameUpdate(game);
							},
							process.env.NODE_ENV === 'development' ? 100 : 1000
						);

						setTimeout(
							() => {
								game.publicPlayersState.forEach(player => {
									player.cardStatus.isFlipped = true;
								});

								game.gameState.audioCue = '';
								completeGame(game, 'death eater');
							},
							process.env.NODE_ENV === 'development' ? 100 : 2000
						);
					} else {
						let playersAlive = 0;
						seatedPlayers.forEach(p => {
							if (!p.isDead) playersAlive++;
						});
						if (playersAlive <= 2) {
							const chat = {
								timestamp: new Date(),
								gameChat: true,
								chat: [
									{
										text: 'Voldemort',
										type: 'voldemort'
									},
									{
										text: ' and one '
									},
									{
										text: 'order',
										type: 'order'
									},
									{
										text: ' remain, top-decking to the end...'
									}
								]
							};

							seatedPlayers.forEach((player, i) => {
								player.gameChats.push(chat);
							});

							game.private.unSeatedGameChats.push(chat);
							game.general.status = 'Top-decking to the end...';
							sendInProgressGameUpdate(game);

							const playCard = () => {
								if (game.private.proclamations.length < 3) shuffleProclamations(game);
								const index = game.trackState.enactedProclamations.length;
								const proclamation = game.private.proclamations.shift();
								game.trackState[`${proclamation}ProclamationCount`]++;
								sendGameList();
								game.trackState.enactedProclamations.push({
									position: 'middle',
									cardBack: proclamation,
									isFlipped: false
								});
								game.trackState.enactedProclamations[index].isFlipped = true;
								const chat = {
									timestamp: new Date(),
									gameChat: true,
									chat: [
										{ text: 'A ' },
										{
											text: proclamation === 'order' ? 'order' : 'death eater',
											type: proclamation === 'order' ? 'order' : 'death eater'
										},
										{
											text: ` proclamation has been enacted. (${
												proclamation === 'order' ? game.trackState.orderProclamationCount.toString() : game.trackState.deathEaterProclamationCount.toString()
											}/${proclamation === 'order' ? '5' : '6'})`
										}
									]
								};
								game.trackState.enactedProclamations[index].position =
									proclamation === 'order' ? `order${game.trackState.orderProclamationCount}` : `death eater${game.trackState.deathEaterProclamationCount}`;

								if (!game.general.disableGamechat) {
									game.private.seatedPlayers.forEach(player => {
										player.gameChats.push(chat);
									});

									game.private.unSeatedGameChats.push(chat);
								}
								if (game.trackState.orderProclamationCount === 5 || game.trackState.deathEaterProclamationCount === 6) {
									game.publicPlayersState.forEach((player, i) => {
										player.cardStatus.cardFront = 'secretrole';
										player.cardStatus.cardBack = game.private.seatedPlayers[i].role;
										player.cardStatus.cardDisplayed = true;
										player.cardStatus.isFlipped = false;
									});
									game.gameState.audioCue = game.trackState.orderProclamationCount === 5 ? 'ordersWin' : 'death eatersWin';
									setTimeout(
										() => {
											game.publicPlayersState.forEach((player, i) => {
												player.cardStatus.isFlipped = true;
											});
											game.gameState.audioCue = '';
											if (process.env.NODE_ENV === 'development') {
												completeGame(game, game.trackState.orderProclamationCount === 1 ? 'order' : 'death eater');
											} else {
												completeGame(game, game.trackState.orderProclamationCount === 5 ? 'order' : 'death eater');
											}
										},
										process.env.NODE_ENV === 'development' ? 100 : 2000
									);
								} else setTimeout(playCard, 2500);
								sendInProgressGameUpdate(game);
							};
							setTimeout(playCard, 2500);
						} else {
							publicSelectedPlayer.cardStatus.cardDisplayed = false;
							sendInProgressGameUpdate(game, true);
							setTimeout(
								() => {
									game.trackState.electionTrackerCount = 0;
									startElection(game);
								},
								process.env.NODE_ENV === 'development' ? 100 : 2000
							);
						}
					}
				}
			},
			process.env.NODE_ENV === 'development' ? 100 : 4000
		);
	}
};
