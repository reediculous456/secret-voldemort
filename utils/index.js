/* eslint-disable spaced-comment */
const { none } = require('option');
const { Range, List } = require('immutable');

/**************************
 * IMMUTABLES AND OPTIONS *
 ***************************/

// (opt: Option[A], predicate: A => Boolean) => Option[A]
exports.filterOpt = (opt, predicate) => {
	return opt.flatMap(o => (predicate(o) ? opt : none));
};

// (xs: List[Option[A]]) => List[A]
exports.flattenListOpts = xs => xs.filter(x => x.isSome()).map(x => x.value());

// (xs: List[A], opt: Option[A]) => List[A]
exports.pushOpt = (xs, opt) => {
	return xs.concat(opt.map(x => List([x])).valueOrElse(List()));
};

// (x: A) => B => (x: Option[A]) => Option[B]
exports.mapOpt1 = f => {
	return x => x.map(xx => f(xx));
};

// (x: A, y: B) => C => (x: Option[A], y: Option[B]) => Option[C]
exports.mapOpt2 = f => {
	return (x, y) => x.flatMap(xx => y.map(yy => f(xx, yy)));
};

/*****************
 * GAME ENTITIES *
 *****************/

/*
 * ALIASES:
 *
 * Hand: { reds: Int, blues: Int }
 * Proclamation: String ('death-eater' | 'order')
 */

// (handX: Hand, handY: Hand) => Hand
exports.handDiff = (handX, handY) => {
	return {
		reds: handX.reds - handY.reds,
		blues: handX.blues - handY.blues
	};
};

// expects hand to contain only a single card
// (hand: Hand) => Proclamation
exports.handToProclamation = hand => {
	if (hand.reds > 0 && hand.blues > 0) {
		throw new Error('Expected hand to contain only a single card');
	}
	return hand.reds > 0 ? 'death-eater' : 'order';
};

// consistently ordered 'death-eater' first, followed by 'order'
// (hand: Hand) => List[Proclamation]
const handToProclamations = (exports.handToProclamations = hand => {
	const toProclamations = (count, type) => {
		return Range(0, count)
			.map(i => type)
			.toList();
	};

	const reds = toProclamations(hand.reds, 'death-eater');
	const blues = toProclamations(hand.blues, 'order');

	return reds.concat(blues).toList();
});

// (proclamation: Proclamation) => Hand
exports.proclamationToHand = proclamation => {
	return proclamation === 'death-eater' ? { reds: 1, blues: 0 } : { reds: 0, blues: 1 };
};

// (proclamation: Proclamation) => String ('P' | 'R')
exports.proclamationToString = proclamation => {
	return proclamation === 'death-eater' ? 'P' : 'R';
};

const text = (exports.text = (type, text, space) => ({ type, text, space }));

// (hand: Hand) => String ('P*R*')
exports.handToText = hand => {
	const proclamationToString = proclamation => (proclamation === 'death-eater' ? 'P' : 'R');

	return handToProclamations(hand)
		.map(proclamation => text(proclamation, proclamationToString(proclamation), false))
		.concat(text('normal', ''))
		.toArray();
};

/********
 * MISC *
 ********/

// (s: String) => String
exports.capitalize = s => {
	return s.charAt(0).toUpperCase() + s.slice(1);
};

// (target: Object, subset: Object) => Boolean
// compares attributes with strict equality
exports.objectContains = (target, subset) => {
	return Object.keys(subset).reduce((acc, key) => acc && target[key] === subset[key], true);
};
