const mongoose = require('mongoose');
const { Schema } = mongoose;
const profileSchema = new Schema({
	_id: String, // username
	username: String,
	version: String, // versioning for `recalculateProfiles`
	created: Date,
	customCardback: String,
	bio: String,
	lastConnectedIP: String,
	stats: {
		matches: {
			allMatches: {
				events: { type: Number, default: 0 },
				successes: { type: Number, default: 0 }
			},
			order: {
				events: { type: Number, default: 0 },
				successes: { type: Number, default: 0 }
			},
			deathEater: {
				events: { type: Number, default: 0 },
				successes: { type: Number, default: 0 }
			}
		},
		actions: {
			voteAccuracy: {
				events: { type: Number, default: 0 },
				successes: { type: Number, default: 0 }
			},
			shotAccuracy: {
				events: { type: Number, default: 0 },
				successes: { type: Number, default: 0 }
			}
		}
	},
	recentGames: {
		type: [
			{
				_id: String,
				loyalty: String,
				playerSize: Number,
				isWinner: Boolean,
				isRebalanced: Boolean,
				date: Date
			}
		],
		default: []
	}
});

module.exports = mongoose.model('Profile', profileSchema);
