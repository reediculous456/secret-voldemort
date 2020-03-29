/*
 * Minimal representation of a game. Schema is likely final and should not be changed without good reason.
 * Use GameSummaryBuilder as a convenience tool to gradually build up this object.
 * Once you fetch this from the database, wrap it in an EnhancedGameSummary for a more human-friendly representation.
 * see: `./GameSummaryBuilder, ./EnhancedGameSummary`
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;
const gameSummary = new Schema({
	_id: String,
	date: Date,
	gameSetting: {
		rebalance6p: Boolean,
		rebalance7p: Boolean,
		rebalance9p: Boolean,
		rerebalance9p: Boolean,
		casualGame: Boolean
	},
	players: [
		{
			username: String,
			role: String,
			icon: Number,
			hashUid: String
		}
	],
	libElo: {
		overall: Number,
		season: Number
	},
	fasElo: {
		overall: Number,
		season: Number
	},
	logs: [
		{
			// election
			ministerId: Number,
			headmasterId: Number,
			votes: Array, // [Boolean]

			// proclamation enaction
			ministerHand: {
				reds: Number,
				blues: Number
			},
			headmasterHand: {
				reds: Number,
				blues: Number
			},
			enactedProclamation: String,

			ministerClaim: {
				reds: Number,
				blues: Number
			},
			headmasterClaim: {
				reds: Number,
				blues: Number
			},

			ministerVeto: Boolean,
			headmasterVeto: Boolean,

			// actions
			proclamationPeek: {
				reds: Number,
				blues: Number
			},
			proclamationPeekClaim: {
				reds: Number,
				blues: Number
			},
			investigationId: Number,
			investigationClaim: String,
			specialElection: Number,
			execution: Number
		}
	],
	customGameSettings: {
		enabled: Boolean,
		powers: Array, // [power x5, string or null]
		voldemortZone: Number,
		vetoZone: Number,
		deathEaterCount: Number,
		hitKnowsFas: Boolean,
		deckState: {
			lib: Number,
			fas: Number
		},
		trackState: {
			lib: Number,
			fas: Number
		}
	}
});

module.exports = mongoose.model('GameSummary', gameSummary);
