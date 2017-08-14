import { List } from 'immutable';
import { some, none } from 'option';

// (turnNum: Int, [phases: List[String] | phase: String]) => Int
exports.findTickPos = (ticks, turnNum, _phases) => {
	const phases = List.isList(_phases) ? _phases : List([ _phases ]);

	const i = ticks.findLastIndex(t =>
		t.turnNum === turnNum && phases.includes(t.phase)
	);

	return i > -1 ? some(i) : none;
};
