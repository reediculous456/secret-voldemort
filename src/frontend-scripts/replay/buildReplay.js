/* eslint-disable no-use-before-define */
import { List } from 'immutable';

export default function buildReplay(game) {
	// iterates through a game stepwise by phase, generating a list of snapshots along the way
	function traverse(tick, list) {
		return tick.gameOver ? list.push(snapshot(tick)) : traverse(step(tick), list.push(snapshot(tick)));
	}

	// given the current turn and phase, returns a slice of that turn showing the game at that instant in time
	function snapshot(tick) {
		const { turnNum, phase, gameOver } = tick;

		const {
			beforeTrack,
			afterTrack,
			beforePlayers,
			afterPlayers,
			beforeElectionTracker,
			afterElectionTracker,
			beforeDeckSize,
			afterDeckSize,
			presidentId,
			headmasterId,
			votes,
			enactedProclamation,
			presidentHand,
			headmasterHand,
			presidentClaim,
			headmasterClaim,
			presidentDiscard,
			headmasterDiscard,
			presidentVeto,
			headmasterVeto,
			isVetoSuccessful,
			execution,
			investigationId,
			investigationClaim,
			proclamationPeek,
			proclamationPeekClaim,
			specialElection
		} = game.turns.get(turnNum);

		const base = {
			turnNum,
			phase,
			gameOver,
			track: beforeTrack,
			deckSize: beforeDeckSize,
			players: beforePlayers,
			electionTracker: beforeElectionTracker
		};

		const add = middleware => obj => Object.assign({}, base, middleware, obj);

		const preEnactionAdd = add({
			players: beforePlayers,
			track: beforeTrack,
			electionTracker: beforeElectionTracker,
			deckSize: beforeDeckSize
		});

		const midEnactionAdd = add({
			presidentId,
			headmasterId,
			players: beforePlayers,
			track: beforeTrack,
			electionTracker: afterElectionTracker,
			deckSize: afterDeckSize
		});

		const postEnactionAdd = add({
			presidentId,
			headmasterId,
			players: afterPlayers,
			track: afterTrack,
			electionTracker: afterElectionTracker,
			deckSize: afterDeckSize
		});

		switch (phase) {
			case 'candidacy':
				return preEnactionAdd({ presidentId });
			case 'nomination':
				return preEnactionAdd({ presidentId, headmasterId });
			case 'election':
				return preEnactionAdd({
					presidentId,
					headmasterId,
					votes,
					electionTracker: afterElectionTracker
				});
			case 'topDeck':
				return midEnactionAdd({});
			case 'presidentLegislation':
				return midEnactionAdd({
					presidentClaim,
					presidentHand: presidentHand.value(),
					presidentDiscard: presidentDiscard.value()
				});
			case 'headmasterLegislation':
				return midEnactionAdd({
					headmasterClaim,
					headmasterDiscard,
					headmasterHand: headmasterHand.value()
				});
			case 'veto':
				return midEnactionAdd({
					isVetoSuccessful,
					presidentVeto,
					headmasterVeto: headmasterVeto.value()
				});
			case 'proclamationEnaction':
				return postEnactionAdd({
					players: beforePlayers,
					enactedProclamation: enactedProclamation.value()
				});
			case 'investigation':
				return postEnactionAdd({
					investigationId: investigationId.value(),
					investigationClaim: investigationClaim
				});
			case 'proclamationPeek':
				return postEnactionAdd({
					proclamationPeek: proclamationPeek.value(),
					proclamationPeekClaim: proclamationPeekClaim
				});
			case 'specialElection':
				return postEnactionAdd({
					specialElection: specialElection.value()
				});
			case 'execution':
				return postEnactionAdd({
					execution: execution.value()
				});
		}
	}

	// given the current turn and phase, returns the next (or same) turn and phase
	function step(tick) {
		const { turnNum, phase } = tick;

		const {
			isVotePassed,
			isGameEndingProclamationEnacted,
			isVoldemortElected,
			isElectionTrackerMaxed,
			isInvestigation,
			isProclamationPeek,
			isSpecialElection,
			isExecution,
			isVoldemortKilled,
			isVeto,
			isVetoSuccessful
		} = game.turns.get(turnNum);

		const next = nextPhase => ({ turnNum, phase: nextPhase, gameOver: false });

		const jump = () => ({
			turnNum: turnNum + 1,
			phase: 'candidacy',
			gameOver: false
		});

		const gameOver = () => {
			return Object.assign({}, tick, { gameOver: true });
		};

		switch (phase) {
			case 'candidacy':
				return next('nomination');
			case 'nomination':
				return next('election');
			case 'election':
				if (isVoldemortElected) return gameOver();
				else if (isVotePassed) return next('presidentLegislation');
				else if (isElectionTrackerMaxed) return next('topDeck');
				else return jump();
			case 'topDeck':
				return next('proclamationEnaction');
			case 'presidentLegislation':
				return next('headmasterLegislation');
			case 'headmasterLegislation':
				if (isVeto) return next('veto');
				else return next('proclamationEnaction');
			case 'veto':
				if (isVetoSuccessful) {
					if (isElectionTrackerMaxed) return next('topDeck');
					else return jump();
				} else {
					return next('proclamationEnaction');
				}
			case 'proclamationEnaction':
				if (isGameEndingProclamationEnacted) return gameOver();
				else if (isInvestigation) return next('investigation');
				else if (isProclamationPeek) return next('proclamationPeek');
				else if (isSpecialElection) return next('specialElection');
				else if (isExecution) return next('execution');
				else return jump();
			case 'investigation':
			case 'proclamationPeek':
			case 'specialElection':
				return jump();
			case 'execution':
				if (isVoldemortKilled) return gameOver();
				else return jump();
		}
	}

	// main method
	return traverse({ turnNum: 0, phase: 'candidacy', gameOver: false }, List());
}
