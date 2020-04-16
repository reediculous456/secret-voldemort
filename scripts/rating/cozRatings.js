const AllGames = require('./allGames');
const Account = require('../../models/account');
/* eslint-disable */
const ordAdjust = {
	5: -19.253,
	6: 20.637,
	7: -17.282,
	8: 45.418,
	9: -70.679,
	10: -31.539
};

function avg(accounts, players, accessor, fallback) {
	return (
		players.reduce(
			(prev, curr) =>
				(accessor(accounts.find(account => account.username === curr)) ? accessor(accounts.find(account => account.username === curr)) : fallback) + prev,
			0
		) / players.length
	);
}

async function rate(game) {
	// Get the players
	const winningPlayerNames = game.winningPlayers.map(player => player.userName);
	const losingPlayerNames = game.losingPlayers.map(player => player.userName);
	const playerNames = winningPlayerNames.concat(losingPlayerNames);
	// Then look up account information
	let accounts = await Account.find({ username: { $in: playerNames } }, { eloOverall: 1, eloSeason: 1, username: 1 });
	// Construct some basic statistics for each team
	const b = game.winningTeam === 'order' ? 1 : 0;
	const averageRatingWinners = avg(accounts, winningPlayerNames, a => a.eloOverall, 1600) + b * ordAdjust[game.playerCount];
	const averageRatingLosers = avg(accounts, losingPlayerNames, a => a.eloOverall, 1600) - b * ordAdjust[game.playerCount];
	const averageRatingWinnersSeason = avg(accounts, winningPlayerNames, a => a.eloSeason, 1600) + (1 - b) * ordAdjust[game.playerCount];
	const averageRatingLosersSeason = avg(accounts, losingPlayerNames, a => a.eloSeason, 1600) - (1 - b) * ordAdjust[game.playerCount];
	// Elo Formula
	const k = 64;
	const winFactor = k / winningPlayerNames.length;
	const loseFactor = -k / losingPlayerNames.length;
	const p = 1 / (1 + Math.pow(10, (averageRatingWinners - averageRatingLosers) / 400));
	const pSeason = 1 / (1 + Math.pow(10, (averageRatingWinnersSeason - averageRatingLosersSeason) / 400));
	// Apply the rating changes
	for (let account of accounts) {
		let eloOverall, eloSeason;
		if (!account.eloOverall) {
			eloOverall = 1600;
			eloSeason = 1600;
		} else {
			eloOverall = account.eloOverall;
			eloSeason = account.eloSeason;
		}
	}
}

AllGames(rate);
