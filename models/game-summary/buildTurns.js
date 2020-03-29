/* eslint-disable no-use-before-define */
const { List, Range } = require('immutable');
const { some, none, fromNullable } = require('option');
const { filterOpt, flattenListOpts, pushOpt, mapOpt1, mapOpt2, handDiff, proclamationToHand, handToProclamation } = require('../../utils');

module.exports = (
	logs,
	players,
	gameSetting = {
		rebalance6p: false,
		rebalance7p: false,
		rebalance9p: false,
		rerebalance9p: false
	}
) => buildTurns(List(), logs, players, gameSetting);

const buildTurns = (turns, logs, players, gameSetting) => {
	if (logs.isEmpty()) return turns;

	const nextTurn = buildTurn(fromNullable(turns.last()), logs.first(), players, gameSetting);

	return buildTurns(turns.push(nextTurn), logs.rest(), players, gameSetting);
};

const initialDeckSize = gameSetting => {
	if (gameSetting.rebalance6p || gameSetting.rebalance7p || gameSetting.rebalance9p) {
		return 16;
	} else if (gameSetting.rebalance9p2f) {
		return 15;
	}
	return 17;
};

const initialTrack = gameSetting => {
	if (gameSetting.rebalance6p) {
		return {
			reds: 1,
			blues: 0
		};
	} else if (gameSetting.rebalance9p) {
		return {
			reds: 0,
			blues: 1
		};
	}
	return {
		reds: 0,
		blues: 0
	};
};

const buildTurn = (prevTurnOpt, log, players, gameSetting) => {
	const prevTurn = prevTurnOpt.valueOrElse({
		isVotePassed: true,
		afterDeadPlayers: List(),
		execution: none,
		afterDeckSize: initialDeckSize(gameSetting),
		afterTrack: initialTrack(gameSetting),
		afterElectionTracker: 0,
		enactedProclamation: none
	});

	// List[Int]
	const beforeDeadPlayers = prevTurn.afterDeadPlayers;

	// List[Int]
	const afterDeadPlayers = pushOpt(beforeDeadPlayers, log.execution);

	// List[Int]
	const { beforePlayers, afterPlayers } = (() => {
		const p = deadPlayers => players.map((p, i) => Object.assign({}, p, { isDead: deadPlayers.includes(i) }));

		return {
			beforePlayers: p(beforeDeadPlayers),
			afterPlayers: p(afterDeadPlayers)
		};
	})();

	// List[Int]
	const alivePlayers = Range(0, players.size)
		.filterNot(i => beforeDeadPlayers.includes(i))
		.toList();

	// List[Option[Boolean]]
	const votes = log.votes.map((v, i) => (beforeDeadPlayers.includes(i) ? none : some(v)));

	// Int
	const jas = flattenListOpts(votes).count(v => v);

	// Int
	const neins = players.size - jas - beforeDeadPlayers.size;

	// Boolean
	const isVotePassed = jas > neins;

	// Boolean
	const isVoteFailed = !isVotePassed;

	// Boolean
	const isExecution = log.execution.isSome();

	// Boolean
	const isInvestigation = log.investigationId.isSome();

	// Boolean
	const isProclamationPeek = log.proclamationPeek.isSome();

	// Boolean
	const isSpecialElection = log.specialElection.isSome();

	// Boolean
	const poorMansVeto = isVotePassed && log.enactedProclamation.isNone(); // backwards compatability before veto was tracked

	// Option[Boolean]
	const presidentVeto = poorMansVeto ? some(true) : log.presidentVeto;

	// Option[Boolean]
	const chancellorVeto = poorMansVeto ? some(true) : log.chancellorVeto;

	// Boolean
	const isVeto = chancellorVeto.isSome();

	// Boolean
	const isVetoSuccessful = chancellorVeto.valueOrElse(false) && presidentVeto.valueOrElse(false);

	// Int
	const { beforeElectionTracker, afterElectionTracker } = (() => {
		const beforeElectionTracker = prevTurn.afterElectionTracker === 3 ? 0 : prevTurn.afterElectionTracker;

		const afterElectionTracker = isVotePassed && !isVetoSuccessful ? 0 : beforeElectionTracker + 1;

		return { beforeElectionTracker, afterElectionTracker };
	})();

	// Boolean
	const isElectionTrackerMaxed = afterElectionTracker === 3;

	// { reds: Int, blues: Int }
	const { beforeTrack, afterTrack } = (() => {
		const f = (count, proclamation, type) => {
			const inc = filterOpt(proclamation, x => x === type)
				.map(x => 1)
				.valueOrElse(0);

			return count + inc;
		};

		const beforeTrack = prevTurn.afterTrack;
		const afterTrack = {
			reds: f(beforeTrack.reds, log.enactedProclamation, 'death eater'),
			blues: f(beforeTrack.blues, log.enactedProclamation, 'order')
		};

		return { beforeTrack, afterTrack };
	})();

	// Boolean
	const isGameEndingProclamationEnacted = afterTrack.reds === 6 || afterTrack.blues === 5;

	// Boolean
	const isVoldemortElected = (() => {
		const voldemortIndex = players.findIndex(p => p.role === 'voldemort');

		return beforeTrack.reds >= 3 && log.chancellorId === voldemortIndex && isVotePassed;
	})();

	// Boolean
	const isVoldemortKilled = (() => {
		const voldemortIndex = players.findIndex(p => p.role === 'voldemort');

		return log.execution.map(e => e === voldemortIndex).valueOrElse(false);
	})();

	// Option[String]
	const { presidentDiscard, chancellorDiscard } = (() => {
		const handDiffOpt = mapOpt2(handDiff);
		const proclamationToHandOpt = mapOpt1(proclamationToHand);
		const handToProclamationOpt = mapOpt1(handToProclamation);

		const presidentDiscard = handToProclamationOpt(handDiffOpt(log.presidentHand, log.chancellorHand));

		const chancellorDiscard = handToProclamationOpt(handDiffOpt(log.chancellorHand, proclamationToHandOpt(log.enactedProclamation)));

		return { presidentDiscard, chancellorDiscard };
	})();

	// Int
	const { beforeDeckSize, afterDeckSize } = (() => {
		const numProclamationsInGame = 17;

		const beforeDeckSize = (() => {
			if (prevTurn.afterDeckSize < 3) {
				const numProclamationsOnTrack = beforeTrack.reds + beforeTrack.blues;
				return numProclamationsInGame - numProclamationsOnTrack;
			} else {
				return prevTurn.afterDeckSize;
			}
		})();

		const afterDeckSize = (() => {
			if (isVotePassed) {
				return beforeDeckSize - 3;
			} else if (isElectionTrackerMaxed) {
				return beforeDeckSize - 1;
			} else {
				return beforeDeckSize;
			}
		})();

		return { beforeDeckSize, afterDeckSize };
	})();

	return Object.assign({}, log, {
		beforeTrack,
		afterTrack,
		beforeDeckSize,
		afterDeckSize,
		isGameEndingProclamationEnacted,
		beforeDeadPlayers,
		afterDeadPlayers,
		beforePlayers,
		afterPlayers,
		players: null,
		alivePlayers,
		votes,
		jas,
		neins,
		isVotePassed,
		isVoteFailed,
		beforeElectionTracker,
		afterElectionTracker,
		isElectionTrackerMaxed,
		isInvestigation,
		isExecution,
		isVoldemortKilled,
		isVoldemortElected,
		presidentDiscard,
		chancellorDiscard,
		isSpecialElection,
		isProclamationPeek,
		isVeto,
		isVetoSuccessful,
		presidentVeto,
		chancellorVeto
	});
};
