const mongoose = require('mongoose');
const Game = require('../models/game');
const moment = require('moment');
const _ = require('lodash');
const fs = require('fs');
const labels = [];
const data = {};
const { CURRENTSEASONNUMBER } = require('../src/frontend-scripts/node-constants');

const allPlayerGameData = {
	deathEaterWinCount: 0,
	totalGameCount: 0,
	deathEaterWinCountSeason: 0,
	totalGameCountSeason: 0
};
const fivePlayerGameData = {
	deathEaterWinCount: 0,
	totalGameCount: 0,
	deathEaterWinCountSeason: 0,
	totalGameCountSeason: 0
};
const sixPlayerGameData = {
	deathEaterWinCount: 0,
	totalGameCount: 0,
	rebalancedDeathEaterWinCount: 0,
	rebalancedTotalGameCount: 0,
	deathEaterWinCountSeason: 0,
	totalGameCountSeason: 0,
	rebalancedDeathEaterWinCountSeason: 0,
	rebalancedTotalGameCountSeason: 0
};
const sevenPlayerGameData = {
	deathEaterWinCount: 0,
	totalGameCount: 0,
	rebalancedDeathEaterWinCount: 0,
	rebalancedTotalGameCount: 0,
	deathEaterWinCountSeason: 0,
	totalGameCountSeason: 0,
	rebalancedDeathEaterWinCountSeason: 0,
	rebalancedTotalGameCountSeason: 0
};
const eightPlayerGameData = {
	deathEaterWinCount: 0,
	totalGameCount: 0,
	deathEaterWinCountSeason: 0,
	totalGameCountSeason: 0
};
const ninePlayerGameData = {
	deathEaterWinCount: 0,
	totalGameCount: 0,
	rebalanced2fDeathEaterWinCount: 0,
	rebalanced2fTotalGameCount: 0,
	deathEaterWinCountSeason: 0,
	totalGameCountSeason: 0,
	rebalanced2fDeathEaterWinCountSeason: 0,
	rebalanced2fTotalGameCountSeason: 0
};
const tenPlayerGameData = {
	deathEaterWinCount: 0,
	totalGameCount: 0,
	deathEaterWinCountSeason: 0,
	totalGameCountSeason: 0
};

mongoose.Promise = global.Promise;
mongoose.connect(`mongodb://localhost:27017/secret-voldemort-app`);

Game.find({})
	.cursor()
	.eachAsync(game => {
		const playerCount = game.losingPlayers.length + game.winningPlayers.length;
		const deathEatersWon = game.winningTeam === 'death-eater';
		const gameDate = moment(new Date(game.date)).format('l');
		const rebalanced = (game.rebalance6p && playerCount === 6) || (game.rebalance7p && playerCount === 7) || (game.rebalance9p && playerCount === 9);
		const rebalanced9p2f = game.rebalance9p2f && playerCount === 9;

		if (
			gameDate === '5/13/2017' ||
			gameDate === moment(new Date()).format('l') ||
			(rebalanced &&
				playerCount === 9 &&
				(gameDate === '10/29/2017' || gameDate === '10/30/2017' || gameDate === '10/31/2017' || gameDate === '11/1/2017' || gameDate === '11/2/2017'))
		) {
			return;
		}

		switch (playerCount) {
			case 5:
				fivePlayerGameData.totalGameCount++;
				if (deathEatersWon) {
					fivePlayerGameData.deathEaterWinCount++;
				}

				if (game.season && game.season === CURRENTSEASONNUMBER) {
					fivePlayerGameData.totalGameCountSeason++;
					if (deathEatersWon) {
						fivePlayerGameData.deathEaterWinCountSeason++;
					}
				}
				break;
			case 6:
				if (rebalanced) {
					if (deathEatersWon) {
						sixPlayerGameData.rebalancedDeathEaterWinCount++;
					}
					sixPlayerGameData.rebalancedTotalGameCount++;

					if (game.season && game.season === CURRENTSEASONNUMBER) {
						sixPlayerGameData.rebalancedTotalGameCountSeason++;
						if (deathEatersWon) {
							sixPlayerGameData.rebalancedDeathEaterWinCountSeason++;
						}
					}
				} else {
					if (deathEatersWon) {
						sixPlayerGameData.deathEaterWinCount++;
					}
					sixPlayerGameData.totalGameCount++;

					if (game.season && game.season === CURRENTSEASONNUMBER) {
						sixPlayerGameData.totalGameCountSeason++;
						if (deathEatersWon) {
							sixPlayerGameData.deathEaterWinCountSeason++;
						}
					}
				}
				break;
			case 7:
				if (rebalanced) {
					if (deathEatersWon) {
						sevenPlayerGameData.rebalancedDeathEaterWinCount++;
					}
					sevenPlayerGameData.rebalancedTotalGameCount++;

					if (game.season && game.season === CURRENTSEASONNUMBER) {
						sevenPlayerGameData.rebalancedTotalGameCountSeason++;
						if (deathEatersWon) {
							sevenPlayerGameData.rebalancedDeathEaterWinCountSeason++;
						}
					}
				} else {
					if (deathEatersWon) {
						sevenPlayerGameData.deathEaterWinCount++;
					}
					sevenPlayerGameData.totalGameCount++;

					if (game.season && game.season === CURRENTSEASONNUMBER) {
						sevenPlayerGameData.totalGameCountSeason++;
						if (deathEatersWon) {
							sevenPlayerGameData.deathEaterWinCountSeason++;
						}
					}
				}
				break;
			case 8:
				eightPlayerGameData.totalGameCount++;
				if (deathEatersWon) {
					eightPlayerGameData.deathEaterWinCount++;
				}
				if (game.season && game.season === CURRENTSEASONNUMBER) {
					eightPlayerGameData.totalGameCountSeason++;
					if (deathEatersWon) {
						eightPlayerGameData.deathEaterWinCountSeason++;
					}
				}
				break;
			case 9:
				if (rebalanced) {
					if (deathEatersWon) {
						ninePlayerGameData.rebalancedDeathEaterWinCount++;
					}
					ninePlayerGameData.rebalancedTotalGameCount++;
				} else if (rebalanced9p2f) {
					if (deathEatersWon) {
						ninePlayerGameData.rebalanced2fDeathEaterWinCount++;
					}
					ninePlayerGameData.rebalanced2fTotalGameCount++;

					if (game.season && game.season === CURRENTSEASONNUMBER) {
						ninePlayerGameData.rebalanced2fTotalGameCountSeason++;
						if (deathEatersWon) {
							ninePlayerGameData.rebalanced2fDeathEaterWinCountSeason++;
						}
					}
				} else {
					if (deathEatersWon) {
						ninePlayerGameData.deathEaterWinCount++;
					}
					ninePlayerGameData.totalGameCount++;
					if (game.season && game.season === CURRENTSEASONNUMBER) {
						ninePlayerGameData.totalGameCountSeason++;
						if (deathEatersWon) {
							ninePlayerGameData.deathEaterWinCountSeason++;
						}
					}
				}
				break;
			case 10:
				tenPlayerGameData.totalGameCount++;
				if (deathEatersWon) {
					tenPlayerGameData.deathEaterWinCount++;
				}
				if (game.season && game.season === CURRENTSEASONNUMBER) {
					tenPlayerGameData.totalGameCountSeason++;
					if (deathEatersWon) {
						tenPlayerGameData.deathEaterWinCountSeason++;
					}
				}
				break;
		}
		allPlayerGameData.totalGameCount++;
		if (deathEatersWon) {
			allPlayerGameData.deathEaterWinCount++;
		}
		if (game.season && game.season === CURRENTSEASONNUMBER) {
			allPlayerGameData.totalGameCountSeason++;
			if (deathEatersWon) {
				allPlayerGameData.deathEaterWinCountSeason++;
			}
		}
		labels.push(moment(new Date(game.date)).format('l'));
	})
	.then(() => {
		const uLabels = _.uniq(labels),
			series = new Array(uLabels.length).fill(0);

		labels.forEach(date => {
			series[uLabels.indexOf(date)]++;
		});

		data.completedGames = {
			labels: uLabels,
			series
		};

		data.allPlayerGameData = allPlayerGameData;
		data.fivePlayerGameData = fivePlayerGameData;
		data.sixPlayerGameData = sixPlayerGameData;
		data.sevenPlayerGameData = sevenPlayerGameData;
		data.eightPlayerGameData = eightPlayerGameData;
		data.ninePlayerGameData = ninePlayerGameData;
		data.tenPlayerGameData = tenPlayerGameData;
		fs.writeFile('/var/www/secret-voldemort/data/data.json', JSON.stringify(data), () => {
			mongoose.connection.close();
		});
	});
