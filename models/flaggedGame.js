/*
 * Minimal representation of a game. Schema is likely final and should not be changed without good reason.
 * Use GameSummaryBuilder as a convenience tool to gradually build up this object.
 * Once you fetch this from the database, wrap it in an EnhancedGameSummary for a more human-friendly representation.
 * see: `./GameSummaryBuilder, ./EnhancedGameSummary`
 */

const mongoose = require('mongoose'),
	{Schema} = mongoose,
	gameSummary = new Schema({
		_id: String,
		date: Date,
		reason: String,
		turn: Number,
		phase: String
	});

module.exports = mongoose.model('GameSummary', gameSummary);
