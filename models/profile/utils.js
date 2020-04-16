const Profile = require('./index');
const Account = require('../account');
const { profiles } = require('../../routes/socket/models');
const debug = require('debug')('game:profile');
const { List } = require('immutable');
const { flattenListOpts } = require('../../utils');

// handles all stat computation logic
function profileDelta(username, game) {
	const { playerSize, isRebalanced, date, id } = game;
	const isWinner = game.isWinner(username).value();
	const loyalty = game.loyaltyOf(username).value();
	const isOrder = loyalty === 'order';
	const isDeathEater = !isOrder;
	const votes = game.voldemortZone
		.map(hz =>
			flattenListOpts(
				game
					.votesOf(username)
					.value()
					.slice(hz)
			).filter(v => game.loyaltyOf(v.ministerId).value() === 'death-eater' || game.roleOf(v.headmasterId).value() === 'voldemort')
		)
		.valueOrElse(List());
	const accurateVotes = votes.filterNot(v => {
		const { ministerId, headmasterId, lumos } = v;
		const ministerLoyalty = game.loyaltyOf(ministerId).value();
		const headmasterRole = game.roleOf(headmasterId).value();

		return lumos && (ministerLoyalty === 'death-eater' || headmasterRole === 'voldemort');
	});
	const shots = game.shotsOf(username).value();
	const accurateShots = shots.filter(id => game.loyaltyOf(id).value() === 'death-eater');

	if (game.casualGame) {
		return {
			stats: {
				matches: {
					allMatches: {
						events: 0,
						successes: 0
					},
					order: {
						events: 0,
						successes: 0
					},
					deathEater: {
						events: 0,
						successes: 0
					}
				},
				actions: {
					voteAccuracy: {
						events: 0,
						successes: 0
					},
					shotAccuracy: {
						events: 0,
						successes: 0
					}
				}
			},
			recentGames: {
				_id: id,
				loyalty,
				playerSize,
				isWinner,
				isRebalanced,
				date
			}
		};
	}

	return {
		stats: {
			matches: {
				allMatches: {
					events: 1,
					successes: isWinner ? 1 : 0
				},
				order: {
					events: isOrder ? 1 : 0,
					successes: isOrder && isWinner ? 1 : 0
				},
				deathEater: {
					events: isDeathEater ? 1 : 0,
					successes: isDeathEater && isWinner ? 1 : 0
				}
			},
			actions: {
				voteAccuracy: {
					events: isOrder ? votes.size : 0,
					successes: isOrder ? accurateVotes.size : 0
				},
				shotAccuracy: {
					events: isOrder ? shots.size : 0,
					successes: isOrder ? accurateShots.size : 0
				}
			}
		},
		recentGames: {
			_id: id,
			loyalty,
			playerSize,
			isWinner,
			isRebalanced,
			date
		}
	};
}

// username: String, game: enhancedGameSummary, options: { version: String, cache: Boolean }
function updateProfile(username, game, options = {}) {
	const { version, cache } = options;
	const delta = profileDelta(username, game);

	return (
		Profile.findByIdAndUpdate(
			username,
			{
				$inc: {
					'stats.matches.allMatches.events': delta.stats.matches.allMatches.events,
					'stats.matches.allMatches.successes': delta.stats.matches.allMatches.successes,

					'stats.matches.order.events': delta.stats.matches.order.events,
					'stats.matches.order.successes': delta.stats.matches.order.successes,

					'stats.matches.deathEater.events': delta.stats.matches.deathEater.events,
					'stats.matches.deathEater.successes': delta.stats.matches.deathEater.successes,

					'stats.actions.voteAccuracy.events': delta.stats.actions.voteAccuracy.events,
					'stats.actions.voteAccuracy.successes': delta.stats.actions.voteAccuracy.successes,

					'stats.actions.shotAccuracy.events': delta.stats.actions.shotAccuracy.events,
					'stats.actions.shotAccuracy.successes': delta.stats.actions.shotAccuracy.successes
				},
				$push: {
					recentGames: {
						$each: [delta.recentGames],
						$position: 0,
						$slice: 10
					}
				}
			},
			{
				new: true,
				upsert: true
			}
		)
			.exec()
			// drop the document when recalculating profiles
			.then(profile => {
				if (!profile) {
					return null;
				} else if (version && profile.version !== version) {
					return profile
						.update({ version }, { overwrite: true })
						.exec()
						.then(() => updateProfile(username, game, options));
				} else {
					return profile;
				}
			})
			// fetch account creation date when profile is first added
			.then(profile => {
				if (!profile) {
					return null;
				} else if (!profile.created) {
					return Account.findOne({ username: profile._id })
						.exec()
						.then(account => {
							if (account) {
								profile.created = account.created;
								return profile.save();
							} else return null;
						});
				} else {
					return profile;
				}
			})
			.then(profile => {
				if (!profile) return null;
				else if (cache) return profiles.push(profile);
				else return profile;
			})
			.catch(err => debug(err))
	);
}

// game: enhancedGameSummary, options: { version: String, cache: Boolean }
function updateProfiles(game, options = {}) {
	debug('Updating profiles for: %s', game.id);

	return Promise.all(game.players.map(p => p.username).map(username => updateProfile(username, game, options)));
}

// side effect: caches profile
function getProfile(username) {
	const profile = profiles.get(username);

	if (profile) {
		debug('Cache hit for: %s', username);
		return Promise.resolve(profile);
	} else {
		debug('Cache miss for: %s', username);
		return Profile.findById(username)
			.exec()
			.then(profile => profiles.push(profile));
	}
}

module.exports.updateProfiles = updateProfiles;
module.exports.profileDelta = profileDelta;
module.exports.getProfile = getProfile;
