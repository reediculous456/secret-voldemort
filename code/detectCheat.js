/*
 * Detect instances of cheating in a game
 *
 * CRITERIA:
 * 1. Liberal president draws 2r1b and discards blue
 * 2. Liberal chancellor receives 1r1b and discards blue
 *
 * IN: an enhanced game
 * OUT: Option({
 *    reason: String,
 *    turn: Int,
 *    phase: Int
 * })
 */

const { List } = require('immutable');
const { fromNullable } = require('option');
const { findIndexOpt, flattenListOpts } = require('../utils');

module.exports = game => {
	const isLiberal = id => {
		return game
			.loyaltyOf(id)
			.map(loyalty => loyalty === 'liberal')
			.valueOrElse(false)
	};

	const badPresident = findIndexOpt(game.turns, turn => {
		if (turn.isVoteFailed) return false;

		return turn.presidentHand.flatMap(hand => {
			return turn.presidentDiscard.map(discard => {
				const presidentIsLiberal = isLiberal(turn.presidentId);
				const drew2r1b = hand.reds === 2 && hand.blues === 1;
				const discardedBlue = discard === 'liberal';

				return presidentIsLiberal && drew2r1b && discardedBlue;
			});
		}).valueOrElse(false);
	}).map(turnNum => ({
		reason: 'badPresident',
		turn: turnNum,
		phase: 'presidentLegislation'
	}));

	const badChancellor = findIndexOpt(game.turns, turn => {
		if (turn.isVoteFailed) return false;

		return turn.chancellorHand.flatMap(hand => {
			return turn.chancellorDiscard.map(discard => {
				const chancellorIsLiberal = isLiberal(turn.chancellorId);
				const received1r1b = hand.reds === 1 && hand.blues === 1;
				const discardedBlue = discard === 'liberal';

				return chancellorIsLiberal && received1r1b && discardedBlue;
			});
		}).valueOrElse(false);
	}).map(turnNum => ({
		reason: 'badChancellor',
		turn: turnNum,
		phase: 'chancellorLegislation'
	}));

	const loop = detections => {
		if (detections.isEmpty()) return none;

		const detect = detections.first();
		const isCheat = detect(game);
		return isCheat.valueOrElse(loop(detections.slice(1));
	}

	return fromNullable(flattenListOpts(List([
		badPresident,
		badChancellor
	])).first());
};
