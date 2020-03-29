const { sendInProgressGameUpdate, sendInProgressModChatUpdate } = require('../util');
const { startElection, shuffleProclamations } = require('./common');
const { sendGameList } = require('../user-requests');
const { selectHeadmaster } = require('./election-util');
const {
	specialElection,
	proclamationPeek,
	investigateLoyalty,
	executePlayer,
	selectProclamations,
	selectPlayerToExecute,
	selectPartyMembershipInvestigate,
	selectSpecialElection,
	showPlayerLoyalty,
	proclamationPeekAndDrop
} = require('./proclamation-powers');
const { completeGame } = require('./end-game');
const _ = require('lodash');
const { makeReport } = require('../report.js');

const powerMapping = {
	investigate: [investigateLoyalty, 'The minister of magic must investigate the party membership of another player.'],
	deckpeek: [proclamationPeek, 'The minister of magic must examine the top 3 proclamations.'],
	election: [specialElection, 'The minister of magic must select a player for a special election.'],
	bullet: [executePlayer, 'The minister of magic must select a player for execution.'],
	reverseinv: [showPlayerLoyalty, 'The minister of magic must reveal their party membership to another player.'],
	peekdrop: [proclamationPeekAndDrop, 'The minister of magic must examine the top proclamation, and may discard it.']
};

const ministerPowers = [
	{
		0: null,
		1: null,
		2: powerMapping.deckpeek,
		3: powerMapping.bullet,
		4: powerMapping.bullet
	},
	{
		0: null,
		1: powerMapping.investigate,
		2: powerMapping.election,
		3: powerMapping.bullet,
		4: powerMapping.bullet
	},
	{
		0: powerMapping.investigate,
		1: powerMapping.investigate,
		2: powerMapping.election,
		3: powerMapping.bullet,
		4: powerMapping.bullet
	}
];

/**
 * @param {object} game - game to act on.
 * @param {string} team - name of team that is enacting proclamation.
 * @param {object} socket - socket
 */
const enactProclamation = (game, team, socket) => {
	const index = game.trackState.enactedProclamations.length;
	const { experiencedMode } = game.general;

	if (game.private.lock.selectHeadmaster) {
		game.private.lock.selectHeadmaster = false;
	}

	if (game.private.lock.selectHeadmasterVoteOnVeto) {
		game.private.lock.selectHeadmasterVoteOnVeto = false;
	}

	if (game.private.lock.selectHeadmasterProclamation) {
		game.private.lock.selectHeadmasterProclamation = false;
	}

	if (game.private.lock.proclamationPeek) {
		game.private.lock.proclamationPeek = false;
	}

	if (game.private.lock.proclamationPeekAndDrop) {
		game.private.lock.proclamationPeekAndDrop = false;
	}

	if (game.private.lock.selectPlayerToExecute) {
		game.private.lock.selectPlayerToExecute = false;
	}

	if (game.private.lock.executePlayer) {
		game.private.lock.executePlayer = false;
	}

	if (game.private.lock.selectSpecialElection) {
		game.private.lock.selectSpecialElection = false;
	}

	if (game.private.lock.specialElection) {
		game.private.lock.specialElection = false;
	}

	if (game.private.lock.selectPartyMembershipInvestigate) {
		game.private.lock.selectPartyMembershipInvestigate = false;
	}

	if (game.private.lock.investigateLoyalty) {
		game.private.lock.investigateLoyalty = false;
	}

	if (game.private.lock.showPlayerLoyalty) {
		game.private.lock.showPlayerLoyalty = false;
	}

	if (game.private.lock.selectPartyMembershipInvestigateReverse) {
		game.private.lock.selectPartyMembershipInvestigateReverse = false;
	}

	if (game.private.lock.selectProclamations) {
		game.private.lock.selectProclamations = false;
	}

	if (game.private.lock.selectOneProclamation) {
		game.private.lock.selectOneProclamation = false;
	}

	if (game.private.lock.selectBurnCard) {
		game.private.lock.selectBurnCard = false;
	}

	game.gameState.pendingHeadmasterIndex = null;

	game.private.summary = game.private.summary.updateLog({
		enactedProclamation: team
	});

	game.general.status = 'A proclamation is being enacted.';
	game.trackState[`${team}ProclamationCount`]++;
	sendGameList();

	game.trackState.enactedProclamations.push({
		position: 'middle',
		cardBack: team,
		isFlipped: false
	});

	sendInProgressGameUpdate(game, true);

	setTimeout(
		() => {
			game.trackState.enactedProclamations[index].isFlipped = true;
			game.gameState.audioCue = team === 'order' ? 'enactProclamationO' : 'enactProclamationD';
			sendInProgressGameUpdate(game, true);
		},
		process.env.NODE_ENV === 'development' ? 100 : experiencedMode ? 300 : 2000
	);

	setTimeout(
		() => {
			game.gameState.audioCue = '';
			const chat = {
				timestamp: new Date(),
				gameChat: true,
				chat: [
					{ text: 'A ' },
					{
						text: team === 'order' ? 'order member' : 'death eater',
						type: team === 'order' ? 'order' : 'death eater'
					},
					{
						text: ` proclamation has been enacted. (${
							team === 'order' ? game.trackState.orderProclamationCount.toString() : game.trackState.deathEaterProclamationCount.toString()
						}/${team === 'order' ? '5' : '6'})`
					}
				]
			};
			const addPreviousGovernmentStatus = () => {
				game.publicPlayersState.forEach(player => {
					if (player.previousGovernmentStatus) {
						player.previousGovernmentStatus = '';
					}
				});

				if (game.trackState.electionTrackerCount <= 2 && game.publicPlayersState.findIndex(player => player.governmentStatus === 'isHeadmaster') > -1) {
					game.publicPlayersState[game.gameState.ministerIndex].previousGovernmentStatus = 'wasMinister';
					game.publicPlayersState[game.publicPlayersState.findIndex(player => player.governmentStatus === 'isHeadmaster')].previousGovernmentStatus =
						'wasHeadmaster';
				}
			};
			const powerToEnact =
				team === 'death eater'
					? game.customGameSettings.enabled
						? powerMapping[game.customGameSettings.powers[game.trackState.deathEaterProclamationCount - 1]]
						: ministerPowers[game.general.type][game.trackState.deathEaterProclamationCount - 1]
					: null;

			game.trackState.enactedProclamations[index].position =
				team === 'order' ? `order${game.trackState.orderProclamationCount}` : `death eater${game.trackState.deathEaterProclamationCount}`;

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

				sendInProgressGameUpdate(game);

				game.gameState.audioCue = game.trackState.orderProclamationCount === 5 ? 'ordersWin' : 'deathEatersWin';
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
			} else if (powerToEnact && game.trackState.electionTrackerCount <= 2) {
				const chat = {
					timestamp: new Date(),
					gameChat: true,
					chat: [{ text: powerToEnact[1] }]
				};

				const { seatedPlayers } = game.private;

				if (!game.general.disableGamechat) {
					seatedPlayers.forEach(player => {
						player.gameChats.push(chat);
					});

					game.private.unSeatedGameChats.push(chat);
				}
				powerToEnact[0](game);
				addPreviousGovernmentStatus();

				if (game.general.timedMode) {
					const { ministerIndex } = game.gameState;

					if (game.private.timerId) {
						clearTimeout(game.private.timerId);
						game.private.timerId = null;
					}
					game.gameState.timedModeEnabled = true;
					game.private.timerId = setTimeout(
						() => {
							if (game.gameState.timedModeEnabled) {
								const minister = seatedPlayers[ministerIndex];
								let list = seatedPlayers.filter((player, i) => i !== ministerIndex && !seatedPlayers[i].isDead);

								game.gameState.timedModeEnabled = false;

								switch (powerToEnact[1]) {
									case 'The minister of magic must examine the top 3 proclamations.':
										selectProclamations({ user: minister.userName }, game, socket);
										break;
									case 'The minister of magic must select a player for execution.':
										if (minister.role.cardName === 'death eater') {
											list = list.filter(player => player.role.cardName !== 'voldemort');
										}
										selectPlayerToExecute({ user: minister.userName }, game, { playerIndex: seatedPlayers.indexOf(_.shuffle(list)[0]) }, socket);
										break;
									case 'The minister of magic must investigate the party membership of another player.':
										selectPartyMembershipInvestigate({ user: minister.userName }, game, { playerIndex: seatedPlayers.indexOf(_.shuffle(list)[0]) }, socket);
										break;
									case 'The minister of magic must select a player for a special election.':
										selectSpecialElection({ user: minister.userName }, game, { playerIndex: seatedPlayers.indexOf(_.shuffle(list)[0]) }, socket);
										break;
								}
							}
						},
						process.env.DEVTIMEDDELAY ? process.env.DEVTIMEDDELAY : game.general.timedMode * 1000
					);
					sendInProgressGameUpdate(game);
				}
			} else {
				sendInProgressGameUpdate(game);
				addPreviousGovernmentStatus();
				startElection(game);
			}

			game.trackState.electionTrackerCount = 0;
		},
		process.env.NODE_ENV === 'development' ? 100 : experiencedMode ? 1000 : 4000
	);
};

/**
 * @param {object} passport - socket authentication.
 * @param {object} game - target game.
 * @param {object} data - socket emit
 * @param {object} socket - socket
 */
const selectMinisterVoteOnVeto = (passport, game, data, socket) => {
	const { experiencedMode } = game.general;
	const minister = game.private.seatedPlayers[game.gameState.ministerIndex];
	const headmasterIndex = game.publicPlayersState.findIndex(player => player.governmentStatus === 'isHeadmaster');
	const publicHeadmaster = game.publicPlayersState[headmasterIndex];
	const publicMinister = game.publicPlayersState[game.gameState.ministerIndex];

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

	game.private.summary = game.private.summary.updateLog({
		ministerVeto: data.vote
	});

	if (
		!game.private.lock.selectMinisterVoteOnVeto &&
		Number.isInteger(headmasterIndex) &&
		game.publicPlayersState[headmasterIndex] &&
		!(game.general.isTourny && game.general.tournyInfo.isCancelled) &&
		minister.cardFlingerState &&
		minister.cardFlingerState[0]
	) {
		game.private.lock.selectMinisterVoteOnVeto = true;

		game.publicPlayersState[headmasterIndex].isLoader = false;
		publicMinister.isLoader = false;
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
							text: data.vote ? ' has voted to veto this election.' : ' has voted not to veto this election.'
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

				sendInProgressGameUpdate(game);

				if (data.vote) {
					game.trackState.electionTrackerCount++;
					const chat = {
						gameChat: true,
						timestamp: new Date(),
						chat: [
							{
								text: `The Minister of Magic and Hogwarts Headmaster have voted to veto this election and the election tracker moves forward. (${game.trackState.electionTrackerCount}/3)`
							}
						]
					};

					game.gameState.pendingHeadmasterIndex = null;
					game.private.lock.selectHeadmasterProclamation = game.private.lock.selectMinisterVoteOnVeto = game.private.lock.selectHeadmasterVoteOnVeto = false;

					if (!game.general.disableGamechat) {
						game.private.seatedPlayers.forEach(player => {
							player.gameChats.push(chat);
						});

						game.private.unSeatedGameChats.push(chat);
					}
					game.gameState.audioCue = 'passedVeto';
					setTimeout(
						() => {
							game.gameState.audioCue = '';
							minister.cardFlingerState = [];
							if (game.trackState.electionTrackerCount <= 2 && game.publicPlayersState.findIndex(player => player.governmentStatus === 'isHeadmaster') > -1) {
								game.publicPlayersState.forEach(player => {
									if (player.previousGovernmentStatus) {
										player.previousGovernmentStatus = '';
									}
								});
								game.publicPlayersState[game.gameState.ministerIndex].previousGovernmentStatus = 'wasMinister';
								game.publicPlayersState[headmasterIndex].previousGovernmentStatus = 'wasHeadmaster';
							}
							if (game.trackState.electionTrackerCount >= 3) {
								if (!game.gameState.undrawnProclamationCount) {
									shuffleProclamations(game);
								}

								enactProclamation(game, game.private.proclamations.shift(), socket);
								game.gameState.undrawnProclamationCount--;
								if (game.gameState.undrawnProclamationCount < 3) {
									shuffleProclamations(game);
								}
							} else {
								startElection(game);
							}
						},
						process.env.NODE_ENV === 'development' ? 100 : experiencedMode ? 1000 : 3000
					);
				} else {
					game.gameState.audioCue = 'failedVeto';
					sendInProgressGameUpdate(game);
					setTimeout(
						() => {
							game.gameState.audioCue = '';
							publicMinister.cardStatus.cardDisplayed = false;
							publicHeadmaster.cardStatus.cardDisplayed = false;
							minister.cardFlingerState = [];
							enactProclamation(game, game.private.currentElectionProclamations[0], socket);
							setTimeout(() => {
								publicHeadmaster.cardStatus.isFlipped = publicMinister.cardStatus.isFlipped = false;
							}, 1000);
						},
						process.env.NODE_ENV === 'development' ? 100 : experiencedMode ? 1000 : 2000
					);
				}
			},
			process.env.NODE_ENV === 'development' ? 100 : experiencedMode ? 500 : 2000
		);
	}
};

module.exports.selectMinisterVoteOnVeto = selectMinisterVoteOnVeto;

/**
 * @param {object} passport - passport auth.
 * @param {object} game - target game.
 * @param {object} data - socket emit
 * @param {object} socket - socket
 */
const selectHeadmasterVoteOnVeto = (passport, game, data, socket) => {
	const { experiencedMode } = game.general;
	const minister = game.private.seatedPlayers[game.gameState.ministerIndex];
	const headmasterIndex = game.publicPlayersState.findIndex(player => player.governmentStatus === 'isHeadmaster');
	const headmaster = game.private.seatedPlayers.find(player => player.userName === game.private._headmasterPlayerName);
	const publicHeadmaster = game.publicPlayersState[headmasterIndex];

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

	if (!publicHeadmaster || !publicHeadmaster.userName || passport.user !== publicHeadmaster.userName) {
		return;
	}

	game.private.summary = game.private.summary.updateLog({
		headmasterVeto: data.vote
	});

	game.private.lock.selectMinisterVoteOnVeto = false;
	if (
		!game.private.lock.selectHeadmasterVoteOnVeto &&
		headmaster &&
		headmaster.cardFlingerState &&
		headmaster.cardFlingerState.length &&
		game.publicPlayersState[headmasterIndex] &&
		!(game.general.isTourny && game.general.tournyInfo.isCancelled)
	) {
		game.private.lock.selectHeadmasterVoteOnVeto = true;

		game.publicPlayersState[headmasterIndex].isLoader = false;

		headmaster.cardFlingerState[0].action = headmaster.cardFlingerState[1].action = '';
		headmaster.cardFlingerState[0].cardStatus.isFlipped = headmaster.cardFlingerState[1].cardStatus.isFlipped = false;

		if (data.vote) {
			headmaster.cardFlingerState[0].notificationStatus = 'selected';
			headmaster.cardFlingerState[1].notificationStatus = '';
		} else {
			headmaster.cardFlingerState[0].notificationStatus = '';
			headmaster.cardFlingerState[1].notificationStatus = 'selected';
		}

		publicHeadmaster.cardStatus = {
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
						{ text: 'Headmaster ' },
						{
							text: game.general.blindMode ? `{${headmasterIndex + 1}}` : `${passport.user} {${headmasterIndex + 1}}`,
							type: 'player'
						},
						{
							text: data.vote ? ' has voted to veto this election.' : ' has voted not to veto this election.'
						}
					]
				};

				if (!game.general.disableGamechat) {
					game.private.seatedPlayers.forEach(player => {
						player.gameChats.push(chat);
					});

					game.private.unSeatedGameChats.push(chat);
				}

				publicHeadmaster.cardStatus.isFlipped = true;
				sendInProgressGameUpdate(game);

				if (data.vote) {
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
						minister.gameChats.push({
							gameChat: true,
							timestamp: new Date(),
							chat: [
								{
									text:
										'You must vote whether or not to veto these proclamations.  Select Ja to veto the proclamations you passed to the Headmaster or select Nein to enact the proclamation the Headmaster has chosen in secret.'
								}
							]
						});
					}

					game.general.status = 'Minister of Magic to vote on proclamation veto.';
					sendInProgressGameUpdate(game);
					setTimeout(
						() => {
							minister.cardFlingerState[0].cardStatus.isFlipped = minister.cardFlingerState[1].cardStatus.isFlipped = true;
							minister.cardFlingerState[0].notificationStatus = minister.cardFlingerState[1].notificationStatus = 'notification';
							headmaster.cardFlingerState = [];
							game.publicPlayersState[game.gameState.ministerIndex].isLoader = true;
							game.gameState.phase = 'ministerVoteOnVeto';
							sendInProgressGameUpdate(game);

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
											selectMinisterVoteOnVeto({ user: minister.userName }, game, { vote: Boolean(Math.floor(Math.random() * 2)) }, socket);
										}
									},
									process.env.DEVTIMEDDELAY ? process.env.DEVTIMEDDELAY : game.general.timedMode * 1000
								);
							}
						},
						process.env.NODE_ENV === 'development' ? 100 : experiencedMode ? 500 : 1000
					);
				} else {
					game.gameState.audioCue = 'failedVeto';
					sendInProgressGameUpdate(game);
					setTimeout(
						() => {
							game.gameState.audioCue = '';
							publicHeadmaster.cardStatus.cardDisplayed = false;
							headmaster.cardFlingerState = [];
							setTimeout(() => {
								publicHeadmaster.cardStatus.isFlipped = false;
							}, 1000);
							enactProclamation(game, game.private.currentElectionProclamations[0], socket);
						},
						process.env.NODE_ENV === 'development' ? 100 : experiencedMode ? 500 : 2000
					);
				}
			},
			process.env.NODE_ENV === 'development' ? 100 : experiencedMode ? 500 : 2000
		);
	}
};

module.exports.selectHeadmasterVoteOnVeto = selectHeadmasterVoteOnVeto;

// todo check this argument for jsdoc
const handToLog = hand =>
	hand.reduce(
		(hand, proclamation) => {
			return proclamation === 'death eater' ? Object.assign({}, hand, { reds: hand.reds + 1 }) : Object.assign({}, hand, { blues: hand.blues + 1 });
		},
		{ reds: 0, blues: 0 }
	);

/**
 * @param {object} passport - socket authentication.
 * @param {object} game - target game.
 * @param {object} data - socket emit
 * @param {boolean} wasTimer - came from timer
 * @param {object} socket - socket
 */
const selectHeadmasterProclamation = (passport, game, data, wasTimer, socket) => {
	const { experiencedMode } = game.general;
	const ministerIndex = game.publicPlayersState.findIndex(player => player.governmentStatus === 'isMinister');
	const minister = game.private.seatedPlayers[ministerIndex];
	const headmasterIndex = game.publicPlayersState.findIndex(player => player.governmentStatus === 'isHeadmaster');
	const headmaster = game.private.seatedPlayers[headmasterIndex];
	const enactedProclamation = game.private.currentHeadmasterOptions[data.selection === 3 ? 1 : 0];

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

	if (!headmaster || headmaster.userName !== passport.user) {
		return;
	}

	if (
		!game.private.lock.selectHeadmasterProclamation &&
		headmaster &&
		headmaster.cardFlingerState &&
		headmaster.cardFlingerState.length &&
		!(game.general.isTourny && game.general.tournyInfo.isCancelled)
	) {
		if (!wasTimer && !game.general.private) {
			if (
				headmaster.role.team === 'order' &&
				enactedProclamation === 'death eater' &&
				(game.private.currentHeadmasterOptions[0] === 'order' || game.private.currentHeadmasterOptions[1] === 'order')
			) {
				// Order headmaster chose to play death eater, probably throwing.
				makeReport(
					{
						player: headmaster.userName,
						seat: headmasterIndex + 1,
						role: 'Order',
						situation: `was given choice as headmaster, and played death eater.`,
						election: game.general.electionCount,
						title: game.general.name,
						uid: game.general.uid,
						gameType: game.general.casualGame ? 'Casual' : 'Ranked'
					},
					game,
					'report'
				);
			}
			if (
				headmaster.role.team === 'death eater' &&
				enactedProclamation === 'order' &&
				game.trackState.orderProclamationCount >= 4 &&
				(game.private.currentHeadmasterOptions[0] === 'death eater' || game.private.currentHeadmasterOptions[1] === 'death eater')
			) {
				// Death Eater headmaster chose to play 5th order member.
				makeReport(
					{
						player: headmaster.userName,
						seat: headmasterIndex + 1,
						role: 'Death Eater',
						situation: `was given choice as headmaster with 4 blues on the track, and played order.`,
						election: game.general.electionCount,
						title: game.general.name,
						uid: game.general.uid,
						gameType: game.general.casualGame ? 'Casual' : 'Ranked'
					},
					game,
					'report'
				);
			}
		}

		const modOnlyChat = {
			timestamp: new Date(),
			gameChat: true,
			chat: [
				{
					text: 'Headmaster '
				},
				{
					text: `${headmaster.userName} {${headmasterIndex + 1}}`,
					type: 'player'
				},
				{
					text: wasTimer ? ' has automatically chosen to play a ' : ' has chosen to play a '
				},
				{
					text: enactedProclamation,
					type: enactedProclamation
				},
				{
					text: wasTimer ? 'proclamation due to the timer expiring.' : ' proclamation.'
				}
			]
		};
		game.private.hiddenInfoChat.push(modOnlyChat);
		sendInProgressModChatUpdate(game, modOnlyChat);

		game.private.lock.selectMinisterProclamation = false;

		if (game.general.timedMode && game.private.timerId) {
			clearTimeout(game.private.timerId);
			game.private.timerId = null;
			game.gameState.timedModeEnabled = false;
		}

		game.private.lock.selectHeadmasterProclamation = true;

		if (data.selection === 3) {
			headmaster.cardFlingerState[0].notificationStatus = '';
			headmaster.cardFlingerState[1].notificationStatus = 'selected';
		} else {
			headmaster.cardFlingerState[0].notificationStatus = 'selected';
			headmaster.cardFlingerState[1].notificationStatus = '';
		}

		game.publicPlayersState[headmasterIndex].isLoader = false;
		headmaster.cardFlingerState[0].action = headmaster.cardFlingerState[1].action = '';
		headmaster.cardFlingerState[0].cardStatus.isFlipped = headmaster.cardFlingerState[1].cardStatus.isFlipped = false;

		if (game.gameState.isVetoEnabled) {
			game.private.currentElectionProclamations = [enactedProclamation];
			game.general.status = 'Headmaster to vote on proclamation veto.';
			sendInProgressGameUpdate(game);

			setTimeout(
				() => {
					const chat = {
						gameChat: true,
						timestamp: new Date(),
						chat: [
							{
								text:
									'You must vote whether or not to veto these proclamations.  Select Ja to veto the your chosen proclamation or select Nein to enact your chosen proclamation.'
							}
						]
					};

					game.publicPlayersState[headmasterIndex].isLoader = true;

					headmaster.cardFlingerState = [
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
						headmaster.gameChats.push(chat);
					}

					sendInProgressGameUpdate(game);

					setTimeout(
						() => {
							headmaster.cardFlingerState[0].cardStatus.isFlipped = headmaster.cardFlingerState[1].cardStatus.isFlipped = true;
							headmaster.cardFlingerState[0].notificationStatus = headmaster.cardFlingerState[1].notificationStatus = 'notification';
							game.gameState.phase = 'headmasterVoteOnVeto';

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

											selectHeadmasterVoteOnVeto({ user: headmaster.userName }, game, { vote: Boolean(Math.floor(Math.random() * 2)) }, socket);
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
		} else {
			game.private.currentElectionProclamations = [];
			game.gameState.phase = 'enactProclamation';
			sendInProgressGameUpdate(game);
			setTimeout(
				() => {
					headmaster.cardFlingerState = [];
					enactProclamation(game, enactedProclamation, socket);
				},
				experiencedMode ? 200 : 2000
			);
		}
		if (experiencedMode) {
			minister.playersState[ministerIndex].claim = 'wasMinister';
			headmaster.playersState[headmasterIndex].claim = 'wasHeadmaster';
		} else {
			setTimeout(() => {
				minister.playersState[ministerIndex].claim = 'wasMinister';
				headmaster.playersState[headmasterIndex].claim = 'wasHeadmaster';
				sendInProgressGameUpdate(game);
			}, 3000);
		}
	}
};

module.exports.selectHeadmasterProclamation = selectHeadmasterProclamation;

/**
 * @param {object} passport - socket authentication.
 * @param {object} game - target game.
 * @param {object} data - socket emit
 * @param {boolean} wasTimer - came from timer
 * @param {object} socket - socket
 */
const selectMinisterProclamation = (passport, game, data, wasTimer, socket) => {
	const { ministerIndex } = game.gameState;
	const minister = game.private.seatedPlayers[ministerIndex];
	const headmasterIndex = game.publicPlayersState.findIndex(player => player.governmentStatus === 'isHeadmaster');
	const headmaster = game.private.seatedPlayers[headmasterIndex];
	const nonDiscardedProclamations = _.range(0, 3).filter(num => num !== data.selection);

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

	if (!minister || minister.userName !== passport.user || nonDiscardedProclamations.length !== 2) {
		return;
	}

	if (
		!game.private.lock.selectMinisterProclamation &&
		minister &&
		minister.cardFlingerState &&
		minister.cardFlingerState.length &&
		Number.isInteger(headmasterIndex) &&
		game.publicPlayersState[headmasterIndex] &&
		!(game.general.isTourny && game.general.tournyInfo.isCancelled)
	) {
		if (game.general.timedMode && game.private.timerId) {
			clearTimeout(game.private.timerId);
			game.private.timerId = null;
			game.gameState.timedModeEnabled = false;
		}

		const discarded = game.private.currentElectionProclamations[data.selection];

		const modOnlyChat = {
			timestamp: new Date(),
			gameChat: true,
			chat: [
				{
					text: 'Minister of Magic '
				},
				{
					text: `${minister.userName} {${ministerIndex + 1}}`,
					type: 'player'
				},
				{
					text: wasTimer ? ' has automatically discarded a ' : ' has chosen to discard a '
				},
				{
					text: discarded,
					type: discarded
				},
				{
					text: wasTimer ? 'proclamation due to the timer expiring.' : ' proclamation.'
				}
			]
		};
		game.private.hiddenInfoChat.push(modOnlyChat);
		sendInProgressModChatUpdate(game, modOnlyChat);

		if (!wasTimer && !game.general.private) {
			// const presGetsPower = ministerPowers[game.general.type][game.trackState.death eaterProclamationCount] ? true : false;
			const track4blue = game.trackState.orderProclamationCount >= 4;
			const trackReds = game.trackState.deathEaterProclamationCount;

			const passed = [
				game.private.currentElectionProclamations[nonDiscardedProclamations[0]],
				game.private.currentElectionProclamations[nonDiscardedProclamations[1]]
			];
			let passedNicer = '';
			if (passed[0] === 'order') {
				if (passed[1] === 'order') passedNicer = 'BB';
				else passedNicer = 'BR';
			} else if (passed[1] === 'order') passedNicer = 'BR';
			else passedNicer = 'RR';

			if (minister.role.team === 'order') {
				// order
				if (discarded === 'order') {
					if (track4blue) {
						if (passedNicer === 'RR') {
							// tossed only blue on 4 blues
							makeReport(
								{
									player: minister.userName,
									seat: ministerIndex + 1,
									role: 'Order',
									situation: `got BRR with 4 blues on the track, and tossed the blue.`,
									election: game.general.electionCount,
									title: game.general.name,
									uid: game.general.uid,
									gameType: game.general.casualGame ? 'Casual' : 'Ranked'
								},
								game,
								'report'
							);
						} else if (passedNicer === 'BR') {
							// did not force 5th blue
							makeReport(
								{
									player: minister.userName,
									seat: ministerIndex + 1,
									role: 'Order',
									situation: `got BBR with 4 blues on the track, and did not force.`,
									election: game.general.electionCount,
									title: game.general.name,
									uid: game.general.uid,
									gameType: game.general.casualGame ? 'Casual' : 'Ranked'
								},
								game,
								'report'
							);
						}
					} else if (trackReds < 3) {
						if (passedNicer === 'RR') {
							// tossed only blue with no benefit
							makeReport(
								{
									player: minister.userName,
									seat: ministerIndex + 1,
									role: 'Order',
									situation: `got BRR before HZ, and tossed the blue.`,
									election: game.general.electionCount,
									title: game.general.name,
									uid: game.general.uid,
									gameType: game.general.casualGame ? 'Casual' : 'Ranked'
								},
								game,
								'report'
							);
						}
					} else if (trackReds === 5) {
						if (passedNicer === 'RR') {
							// tossed blue in VZ
							makeReport(
								{
									player: minister.userName,
									seat: ministerIndex + 1,
									role: 'Order',
									situation: `got BRR during veto zone, and tossed the blue.`,
									election: game.general.electionCount,
									title: game.general.name,
									uid: game.general.uid,
									gameType: game.general.casualGame ? 'Casual' : 'Ranked'
								},
								game,
								'report'
							);
						} else if (passedNicer === 'BR' && track4blue) {
							// tossed blue in VZ
							makeReport(
								{
									player: minister.userName,
									seat: ministerIndex + 1,
									role: 'Order',
									situation: `got BBR during veto zone, and did not force 5th blue.`,
									election: game.general.electionCount,
									title: game.general.name,
									uid: game.general.uid,
									gameType: game.general.casualGame ? 'Casual' : 'Ranked'
								},
								game,
								'report'
							);
						}
					}
				}
			} else {
				// death eater
				if (discarded === 'death eater') {
					if (track4blue) {
						if (passedNicer === 'BB' && headmaster.role.team !== 'order') {
							// forced 5th blue on another fas
							makeReport(
								{
									player: minister.userName,
									seat: ministerIndex + 1,
									role: 'Death Eater',
									situation: `got BBR with 4 blues on the track, and forced blues on a death eater headmaster.`,
									election: game.general.electionCount,
									title: game.general.name,
									uid: game.general.uid,
									gameType: game.general.casualGame ? 'Casual' : 'Ranked'
								},
								game,
								'report'
							);
						} else if (passedNicer === 'BR' && headmaster.role.team === 'order') {
							// offered 5th blue choice as fas
							makeReport(
								{
									player: minister.userName,
									seat: ministerIndex + 1,
									role: 'Death Eater',
									situation: `got BRR with 4 blues on the track, and offered choice to a order headmaster.`,
									election: game.general.electionCount,
									title: game.general.name,
									uid: game.general.uid,
									gameType: game.general.casualGame ? 'Casual' : 'Ranked'
								},
								game,
								'report'
							);
						}
					} else if (trackReds === 5) {
						if (passedNicer === 'BB' && headmaster.role.team !== 'order') {
							// forced 5th blue as hit
							makeReport(
								{
									player: minister.userName,
									seat: ministerIndex + 1,
									role: 'Death Eater',
									situation: `got BBR with 5 reds on the track, and forced blues on a death eater headmaster.`,
									election: game.general.electionCount,
									title: game.general.name,
									uid: game.general.uid,
									gameType: game.general.casualGame ? 'Casual' : 'Ranked'
								},
								game,
								'report'
							);
						} else if (passedNicer === 'BR' && headmaster.role.team === 'order') {
							// offered 5th blue choice as hit
							makeReport(
								{
									player: minister.userName,
									seat: ministerIndex + 1,
									role: 'Death Eater',
									situation: `got BRR with 5 reds on the track, and offered choice to a order headmaster.`,
									election: game.general.electionCount,
									title: game.general.name,
									uid: game.general.uid,
									gameType: game.general.casualGame ? 'Casual' : 'Ranked'
								},
								game,
								'report'
							);
						}
					}
				}
			}
		}

		game.private.lock.selectMinisterProclamation = true;
		game.publicPlayersState[ministerIndex].isLoader = false;
		game.publicPlayersState[headmasterIndex].isLoader = true;

		try {
			if (data.selection === 0) {
				minister.cardFlingerState[0].notificationStatus = 'selected';
				minister.cardFlingerState[1].notificationStatus = minister.cardFlingerState[2].notificationStatus = '';
			} else if (data.selection === 1) {
				minister.cardFlingerState[0].notificationStatus = minister.cardFlingerState[2].notificationStatus = '';
				minister.cardFlingerState[1].notificationStatus = 'selected';
			} else {
				minister.cardFlingerState[0].notificationStatus = minister.cardFlingerState[1].notificationStatus = '';
				minister.cardFlingerState[2].notificationStatus = 'selected';
			}
		} catch (error) {
			console.log(error, 'caught exception in minister cardflinger');
			return;
		}

		game.private.summary = game.private.summary.updateLog({
			headmasterHand: handToLog(game.private.currentElectionProclamations.filter((p, i) => i !== data.selection))
		});
		game.private.currentHeadmasterOptions = [
			game.private.currentElectionProclamations[nonDiscardedProclamations[0]],
			game.private.currentElectionProclamations[nonDiscardedProclamations[1]]
		];

		minister.cardFlingerState[0].action = minister.cardFlingerState[1].action = minister.cardFlingerState[2].action = '';
		minister.cardFlingerState[0].cardStatus.isFlipped = minister.cardFlingerState[1].cardStatus.isFlipped = minister.cardFlingerState[2].cardStatus.isFlipped = false;

		headmaster.cardFlingerState = [
			{
				position: 'middle-left',
				action: 'active',
				cardStatus: {
					isFlipped: false,
					cardFront: 'proclamation',
					cardBack: `${game.private.currentElectionProclamations[nonDiscardedProclamations[0]]}p`
				}
			},
			{
				position: 'middle-right',
				action: 'active',
				cardStatus: {
					isFlipped: false,
					cardFront: 'proclamation',
					cardBack: `${game.private.currentElectionProclamations[nonDiscardedProclamations[1]]}p`
				}
			}
		];

		game.general.status = 'Waiting on headmaster enactment.';
		game.gameState.phase = 'headmasterSelectingProclamation';

		if (!game.general.experiencedMode && !game.general.disableGamechat) {
			headmaster.gameChats.push({
				timestamp: new Date(),
				gameChat: true,
				chat: [{ text: 'As headmaster, you must select a proclamation to enact.' }]
			});
		}

		sendInProgressGameUpdate(game);

		setTimeout(
			() => {
				minister.cardFlingerState = [];
				headmaster.cardFlingerState.forEach(cardFlinger => {
					cardFlinger.cardStatus.isFlipped = true;
				});
				headmaster.cardFlingerState.forEach(cardFlinger => {
					cardFlinger.notificationStatus = 'notification';
				});

				if (game.general.timedMode) {
					if (game.private.timerId) {
						clearTimeout(game.private.timerId);
						game.private.timerId = null;
					}
					game.gameState.timedModeEnabled = true;
					game.private.timerId = setTimeout(
						() => {
							if (game.gameState.timedModeEnabled) {
								const isRightProclamation = Boolean(Math.floor(Math.random() * 2));

								selectHeadmasterProclamation({ user: headmaster.userName }, game, { selection: isRightProclamation ? 3 : 1 }, true, socket);
							}
						},
						process.env.DEVTIMEDDELAY ? process.env.DEVTIMEDDELAY : game.general.timedMode * 1000
					);
				}

				sendInProgressGameUpdate(game);
			},
			game.general.experiencedMode ? 200 : 2000
		);
	}
};

module.exports.selectMinisterProclamation = selectMinisterProclamation;

/**
 * @param {object} passport - socket authentication.
 * @param {object} game - target game.
 * @param {object} data from socket emit
 * @param {object} socket - socket
 * @param {bool} force - if action was forced
 */
module.exports.selectVoting = (passport, game, data, socket, force = false) => {
	const { seatedPlayers } = game.private;
	const { experiencedMode } = game.general;
	const player = seatedPlayers.find(player => player.userName === passport.user);
	const playerIndex = seatedPlayers.findIndex(play => play.userName === passport.user);

	if (game.gameState.isGameFrozen && !force) {
		if (socket) {
			socket.emit('sendAlert', 'An AEM member has prevented this game from proceeding. Please wait.');
		}
		return;
	}

	if (game.general.isRemade && !force) {
		if (socket) {
			socket.emit('sendAlert', 'This game has been remade and is now no longer playable.');
		}
		return;
	}

	const passedElection = socket => {
		const { gameState } = game;
		const { ministerIndex } = gameState;
		const headmasterIndex = game.publicPlayersState.findIndex(player => player.governmentStatus === 'isHeadmaster');

		game.private._headmasterPlayerName = game.private.seatedPlayers[headmasterIndex].userName;

		if (game.gameState.previousElectedGovernment.length) {
			game.private.seatedPlayers[game.gameState.previousElectedGovernment[0]].playersState[game.gameState.previousElectedGovernment[0]].claim = '';
			game.private.seatedPlayers[game.gameState.previousElectedGovernment[1]].playersState[game.gameState.previousElectedGovernment[1]].claim = '';
			let affectedSocketId = Object.keys(io.sockets.sockets).find(
				socketId =>
					io.sockets.sockets[socketId].handshake.session.passport &&
					io.sockets.sockets[socketId].handshake.session.passport.user === game.publicPlayersState[game.gameState.previousElectedGovernment[0]].userName
			);
			if (io.sockets.sockets[affectedSocketId]) {
				io.sockets.sockets[affectedSocketId].emit('removeClaim');
			}
			affectedSocketId = Object.keys(io.sockets.sockets).find(
				socketId =>
					io.sockets.sockets[socketId].handshake.session.passport &&
					io.sockets.sockets[socketId].handshake.session.passport.user === game.publicPlayersState[game.gameState.previousElectedGovernment[1]].userName
			);
			if (io.sockets.sockets[affectedSocketId]) {
				io.sockets.sockets[affectedSocketId].emit('removeClaim');
			}
		}

		game.general.status = 'Waiting on ministerial discard.';
		game.publicPlayersState[ministerIndex].isLoader = true;
		if (!experiencedMode && !game.general.disableGamechat) {
			seatedPlayers[ministerIndex].gameChats.push({
				timestamp: new Date(),
				gameChat: true,
				chat: [{ text: 'As minister of magic, you must select one proclamation to discard.' }]
			});
		}

		if (gameState.undrawnProclamationCount < 3) {
			shuffleProclamations(game);
		}

		gameState.undrawnProclamationCount--;
		game.private.currentElectionProclamations = [game.private.proclamations.shift(), game.private.proclamations.shift(), game.private.proclamations.shift()];
		const verifyCorrect = proclamation => {
			if (proclamation === 'order') return true;
			if (proclamation === 'death eater') return true;
			return false;
		};
		if (
			!verifyCorrect(game.private.currentElectionProclamations[0]) ||
			!verifyCorrect(game.private.currentElectionProclamations[1]) ||
			!verifyCorrect(game.private.currentElectionProclamations[2])
		) {
			makeReport(
				{
					player: 'A Player',
					seat: ministerIndex + 1,
					role: 'Order',
					situation: `has just received an invalid hand!\n${JSON.stringify(game.private.currentElectionProclamations)}`,
					election: game.general.electionCount,
					title: game.general.name,
					uid: game.general.uid,
					gameType: game.general.casualGame ? 'Casual' : 'Ranked'
				},
				game,
				'report'
			);
		}

		const modOnlyChat = {
			timestamp: new Date(),
			gameChat: true,
			chat: [
				{
					text: 'Minister '
				},
				{
					text: `${seatedPlayers[ministerIndex].userName} {${ministerIndex + 1}}`,
					type: 'player'
				},
				{
					text: ' received '
				},
				{
					text: game.private.currentElectionProclamations[0] === 'order' ? 'B' : 'R',
					type: game.private.currentElectionProclamations[0]
				},
				{
					text: game.private.currentElectionProclamations[1] === 'order' ? 'B' : 'R',
					type: game.private.currentElectionProclamations[1]
				},
				{
					text: game.private.currentElectionProclamations[2] === 'order' ? 'B' : 'R',
					type: game.private.currentElectionProclamations[2]
				},
				{
					text: '.'
				}
			]
		};
		game.private.hiddenInfoChat.push(modOnlyChat);
		sendInProgressModChatUpdate(game, modOnlyChat);

		game.private.summary = game.private.summary.updateLog({
			ministerHand: handToLog(game.private.currentElectionProclamations)
		});

		seatedPlayers[ministerIndex].cardFlingerState = [
			{
				position: 'middle-far-left',
				action: 'active',
				cardStatus: {
					isFlipped: false,
					cardFront: 'proclamation',
					cardBack: `${game.private.currentElectionProclamations[0]}p`
				}
			},
			{
				position: 'middle-center',
				action: 'active',
				cardStatus: {
					isFlipped: false,
					cardFront: 'proclamation',
					cardBack: `${game.private.currentElectionProclamations[1]}p`
				}
			},
			{
				position: 'middle-far-right',
				action: 'active',
				cardStatus: {
					isFlipped: false,
					cardFront: 'proclamation',
					cardBack: `${game.private.currentElectionProclamations[2]}p`
				}
			}
		];
		sendInProgressGameUpdate(game);
		setTimeout(() => {
			gameState.undrawnProclamationCount--;
			sendInProgressGameUpdate(game);
		}, 200);
		setTimeout(() => {
			gameState.undrawnProclamationCount--;
			sendInProgressGameUpdate(game);
		}, 400);
		setTimeout(
			() => {
				seatedPlayers[ministerIndex].cardFlingerState[0].cardStatus.isFlipped = seatedPlayers[
					ministerIndex
				].cardFlingerState[1].cardStatus.isFlipped = seatedPlayers[ministerIndex].cardFlingerState[2].cardStatus.isFlipped = true;
				seatedPlayers[ministerIndex].cardFlingerState[0].notificationStatus = seatedPlayers[
					ministerIndex
				].cardFlingerState[1].notificationStatus = seatedPlayers[ministerIndex].cardFlingerState[2].notificationStatus = 'notification';
				gameState.phase = 'ministerSelectingProclamation';

				game.gameState.previousElectedGovernment = [ministerIndex, headmasterIndex];

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
								selectMinisterProclamation({ user: seatedPlayers[ministerIndex].userName }, game, { selection: Math.floor(Math.random() * 3) }, true, socket);
							}
						},
						process.env.DEVTIMEDDELAY ? process.env.DEVTIMEDDELAY : game.general.timedMode * 1000
					);
				}
				sendInProgressGameUpdate(game);
			},
			experiencedMode ? 200 : 600
		);
	};
	const failedElection = () => {
		game.trackState.electionTrackerCount++;

		if (game.trackState.electionTrackerCount >= 3) {
			const chat = {
				timestamp: new Date(),
				gameChat: true,
				chat: [
					{
						text: 'The third consecutive election has failed and the top proclamation is enacted.'
					}
				]
			};

			game.gameState.previousElectedGovernment = [];

			if (!game.general.disableGamechat) {
				game.private.seatedPlayers.forEach(player => {
					player.gameChats.push(chat);
				});

				game.private.unSeatedGameChats.push(chat);
			}

			if (!game.gameState.undrawnProclamationCount) {
				shuffleProclamations(game);
			}

			game.gameState.undrawnProclamationCount--;
			setTimeout(
				() => {
					enactProclamation(game, game.private.proclamations.shift(), socket);
				},
				process.env.NODE_ENV === 'development' ? 100 : experiencedMode ? 500 : 2000
			);
		} else {
			if (game.general.timedMode) {
				if (game.private.timerId) {
					clearTimeout(game.private.timerId);
					game.private.timerId = null;
				}
				game.gameState.timedModeEnabled = true;
				game.private.timerId = setTimeout(
					() => {
						if (game.gameState.timedModeEnabled && game.gameState.phase === 'selectingHeadmaster') {
							const headmasterIndex = _.shuffle(game.gameState.clickActionInfo[1])[0];

							game.gameState.pendingHeadmasterIndex = null;
							game.gameState.timedModeEnabled = false;

							selectHeadmaster(null, { user: game.private.seatedPlayers[game.gameState.ministerIndex].userName }, game, { headmasterIndex: headmasterIndex });
						}
					},
					process.env.DEVTIMEDDELAY ? process.env.DEVTIMEDDELAY : game.general.timedMode * 1000
				);
			}

			setTimeout(
				() => {
					module.exports.startElection(game);
				},
				process.env.NODE_ENV === 'development' ? 100 : experiencedMode ? 500 : 2000
			);
		}
	};
	const flipBallotCards = socket => {
		if (!seatedPlayers[0]) {
			return;
		}
		const isConsensus = game.publicPlayersState
			.filter(player => !player.isDead)
			.every((el, i) => (seatedPlayers[i] ? seatedPlayers[i].voteStatus.didVoteYes === seatedPlayers[0].voteStatus.didVoteYes : false));

		game.publicPlayersState.forEach((player, i) => {
			if (!player.isDead && seatedPlayers[i]) {
				player.cardStatus.cardBack.cardName = seatedPlayers[i].voteStatus.didVoteYes ? 'ja' : 'nein';
				player.cardStatus.isFlipped = true;
			}
		});

		game.private.summary = game.private.summary.updateLog({
			votes: seatedPlayers.map(p => p.voteStatus.didVoteYes)
		});

		sendInProgressGameUpdate(game, true);

		setTimeout(
			() => {
				const chat = {
					timestamp: new Date(),
					gameChat: true
				};

				game.publicPlayersState.forEach((play, i) => {
					play.cardStatus.cardDisplayed = false;
				});

				setTimeout(
					() => {
						game.publicPlayersState.forEach((play, i) => {
							play.cardStatus.isFlipped = false;
						});
						sendInProgressGameUpdate(game);
					},
					process.env.NODE_ENV === 'development' ? 100 : experiencedMode ? 500 : 2000
				);

				if (seatedPlayers.filter(play => play.voteStatus.didVoteYes && !play.isDead).length / game.general.livingPlayerCount > 0.5) {
					const headmasterIndex = game.gameState.pendingHeadmasterIndex;
					const { ministerIndex } = game.gameState;

					game.publicPlayersState[ministerIndex].governmentStatus = 'isMinister';

					game.publicPlayersState[headmasterIndex].governmentStatus = 'isHeadmaster';
					chat.chat = [{ text: 'The election passes.' }];

					if (!experiencedMode && !game.general.disableGamechat) {
						seatedPlayers.forEach(player => {
							player.gameChats.push(chat);
						});

						game.private.unSeatedGameChats.push(chat);
					}

					if (
						game.trackState.deathEaterProclamationCount >= game.customGameSettings.voldemortZone &&
						game.private.seatedPlayers[headmasterIndex].role.cardName === 'voldemort'
					) {
						const getNumberText = val => {
							if (val == 1) return '1st';
							if (val == 2) return '2nd';
							if (val == 3) return '3rd';
							return `${val}th`;
						};
						const chat = {
							timestamp: new Date(),
							gameChat: true,
							chat: [
								{
									text: 'Voldemort',
									type: 'voldemort'
								},
								{
									text: ` has been elected headmaster after the ${getNumberText(
										game.customGameSettings.voldemortZone
									)} death eater proclamation has been enacted.`
								}
							]
						};

						setTimeout(
							() => {
								game.publicPlayersState.forEach((player, i) => {
									player.cardStatus.cardFront = 'secretrole';
									player.cardStatus.cardDisplayed = true;
									player.cardStatus.cardBack = seatedPlayers[i].role;
								});

								if (!game.general.disableGamechat) {
									seatedPlayers.forEach(player => {
										player.gameChats.push(chat);
									});

									game.gameState.audioCue = 'deathEatersWinVoldemortElected';
									game.private.unSeatedGameChats.push(chat);
								}
								sendInProgressGameUpdate(game);
							},
							process.env.NODE_ENV === 'development' ? 100 : experiencedMode ? 1000 : 3000
						);

						setTimeout(
							() => {
								game.gameState.audioCue = '';
								game.publicPlayersState.forEach(player => {
									player.cardStatus.isFlipped = true;
								});
								completeGame(game, 'death eater');
							},
							process.env.NODE_ENV === 'development' ? 100 : experiencedMode ? 2000 : 4000
						);
					} else {
						passedElection(socket);
					}
				} else {
					if (!game.general.disableGamechat) {
						chat.chat = [
							{
								text: `The election fails and the election tracker moves forward. (${game.trackState.electionTrackerCount + 1}/3)`
							}
						];

						seatedPlayers.forEach(player => {
							player.gameChats.push(chat);
						});

						game.private.unSeatedGameChats.push(chat);
						game.gameState.pendingHeadmasterIndex = null;
					}

					failedElection();
				}

				sendInProgressGameUpdate(game);
			},
			process.env.NODE_ENV === 'development' ? 2100 : isConsensus ? 1500 : 6000
		);
	};

	if (game.general.isTourny && game.general.tournyInfo.isCancelled) {
		return;
	}

	if (game.private.lock.selectHeadmaster) {
		game.private.lock.selectHeadmaster = false;
	}

	if (seatedPlayers.length !== seatedPlayers.filter(play => play && play.voteStatus && play.voteStatus.hasVoted).length && player && player.voteStatus) {
		player.voteStatus.hasVoted = !player.voteStatus.hasVoted ? true : player.voteStatus.didVoteYes ? !data.vote : data.vote;
		player.voteStatus.didVoteYes = player.voteStatus.hasVoted ? data.vote : false;
		game.publicPlayersState[playerIndex].isLoader = !player.voteStatus.hasVoted;

		if (force) {
			player.voteStatus.hasVoted = true;
			player.voteStatus.didVoteYes = data.vote;
			game.publicPlayersState[playerIndex].isLoader = false;
		}

		if (data.vote) {
			player.cardFlingerState = [
				{
					position: 'middle-left',
					notificationStatus: !player.voteStatus.hasVoted ? 'notification' : 'selected',
					action: 'active',
					cardStatus: {
						isFlipped: true,
						cardFront: 'ballot',
						cardBack: 'ja'
					}
				},
				{
					position: 'middle-right',
					notificationStatus: 'notification',
					action: 'active',
					cardStatus: {
						isFlipped: true,
						cardFront: 'ballot',
						cardBack: 'nein'
					}
				}
			];
		} else {
			player.cardFlingerState = [
				{
					position: 'middle-left',
					notificationStatus: 'notification',
					action: 'active',
					cardStatus: {
						isFlipped: true,
						cardFront: 'ballot',
						cardBack: 'ja'
					}
				},
				{
					position: 'middle-right',
					notificationStatus: !player.voteStatus.hasVoted ? 'notification' : 'selected',
					action: 'active',
					cardStatus: {
						isFlipped: true,
						cardFront: 'ballot',
						cardBack: 'nein'
					}
				}
			];
		}

		sendInProgressGameUpdate(game, true);

		if (seatedPlayers.filter(play => play.voteStatus.hasVoted && !play.isDead).length === game.general.livingPlayerCount) {
			game.general.status = 'Tallying results of ballots..';
			seatedPlayers.forEach(player => {
				if (player.cardFlingerState.length) {
					player.cardFlingerState[0].action = player.cardFlingerState[1].action = '';
					player.cardFlingerState[0].action = player.cardFlingerState[1].action = '';
					player.cardFlingerState[0].cardStatus.isFlipped = player.cardFlingerState[1].cardStatus.isFlipped = false;
				}
			});
			sendInProgressGameUpdate(game, true);
			setTimeout(
				() => {
					seatedPlayers.forEach(player => {
						player.cardFlingerState = [];
					});
					sendInProgressGameUpdate(game, true);
				},
				experiencedMode ? 200 : 2000
			);
			setTimeout(
				() => {
					if (game.general.timedMode && game.private.timerId) {
						clearTimeout(game.private.timerId);
						game.private.timerId = null;
						game.gameState.timedModeEnabled = false;
					}
					flipBallotCards(socket);
				},
				process.env.NODE_ENV === 'development' ? 100 : experiencedMode ? 2500 : 3000
			);
		}
	}
};

module.exports.startElection = startElection;
