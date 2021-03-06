import buildEnhancedGameSummary from '../../../models/game-summary/buildEnhancedGameSummary';
import { mockGameSummary } from '../../mocks';
import { List, Range } from 'immutable';
import { some, none } from 'option';
import '../../matchers';

export default () => {
	const game = buildEnhancedGameSummary(mockGameSummary);
	const { turns } = game;

	describe('Generic game', () => {
		it('should track dead players', () => {
			const getBeforeDead = turnNum => turns.get(turnNum).beforeDeadPlayers;
			const getAfterDead = turnNum => turns.get(turnNum).afterDeadPlayers;

			expect(getBeforeDead(0)).toImmutableEqual(List());
			expect(getBeforeDead(1)).toImmutableEqual(List());
			expect(getBeforeDead(2)).toImmutableEqual(List());
			expect(getBeforeDead(3)).toImmutableEqual(List());
			expect(getBeforeDead(4)).toImmutableEqual(List([3]));
			expect(getBeforeDead(5)).toImmutableEqual(List([3]));
			expect(getBeforeDead(6)).toImmutableEqual(List([3]));
			expect(getBeforeDead(7)).toImmutableEqual(List([3, 2]));

			expect(getAfterDead(0)).toImmutableEqual(List());
			expect(getAfterDead(1)).toImmutableEqual(List());
			expect(getAfterDead(2)).toImmutableEqual(List());
			expect(getAfterDead(3)).toImmutableEqual(List([3]));
			expect(getAfterDead(4)).toImmutableEqual(List([3]));
			expect(getAfterDead(5)).toImmutableEqual(List([3]));
			expect(getAfterDead(6)).toImmutableEqual(List([3, 2]));
			expect(getAfterDead(7)).toImmutableEqual(List([3, 2]));
		});

		it('should track alive players', () => {
			const getAlive = turnNum => turns.get(turnNum).alivePlayers;
			const allAlive = List([0, 1, 2, 3, 4, 5, 6]);
			const p3Dead = List([0, 1, 2, 4, 5, 6]);
			const p3And2Dead = List([0, 1, 4, 5, 6]);

			expect(getAlive(0)).toImmutableEqual(allAlive);
			expect(getAlive(1)).toImmutableEqual(allAlive);
			expect(getAlive(2)).toImmutableEqual(allAlive);
			expect(getAlive(3)).toImmutableEqual(allAlive);
			expect(getAlive(4)).toImmutableEqual(p3Dead);
			expect(getAlive(5)).toImmutableEqual(p3Dead);
			expect(getAlive(6)).toImmutableEqual(p3Dead);
			expect(getAlive(7)).toImmutableEqual(p3And2Dead);
		});

		it('should track players', () => {
			const beforePlayers = turnNum => turns.get(turnNum).beforePlayers;

			expect(beforePlayers(0).first()).toEqual({
				id: 0,
				icon: 0,
				username: 'Uther',
				role: 'order',
				loyalty: 'order',
				isDead: false
			});
		});

		it('should track votes', () => {
			const getVotes = turnNum => turns.get(turnNum).votes.map(v => (v.isSome() ? v.value() : null));

			// immutable collections don't deep compare so convert to array then check
			const allJas = Range(0, 7)
				.map(i => true)
				.toArray();

			Range(0, 8).forEach(i => {
				expect(getVotes(i).size).toBe(7);
			});

			expect(getVotes(0).toArray()).toEqual(allJas);
			expect(getVotes(5).toArray()).toEqual([true, false, false, null, false, false, false]);
			expect(getVotes(7).toArray()).toEqual([true, false, null, null, true, true, true]);
		});

		it('should track lumoses', () => {
			const lumoses = turnNum => turns.get(turnNum).lumoses;

			expect(lumoses(0)).toBe(7);
			expect(lumoses(1)).toBe(7);
			expect(lumoses(2)).toBe(7);
			expect(lumoses(3)).toBe(5);
			expect(lumoses(4)).toBe(2);
			expect(lumoses(5)).toBe(1);
			expect(lumoses(6)).toBe(6);
			expect(lumoses(7)).toBe(4);
		});

		it('should track noxes', () => {
			const noxes = turnNum => turns.get(turnNum).noxes;

			expect(noxes(0)).toBe(0);
			expect(noxes(1)).toBe(0);
			expect(noxes(2)).toBe(0);
			expect(noxes(3)).toBe(2);
			expect(noxes(4)).toBe(4);
			expect(noxes(5)).toBe(5);
			expect(noxes(6)).toBe(0);
			expect(noxes(7)).toBe(1);
		});

		it('should track successful votes', () => {
			const getIsVotePassed = turnNum => turns.get(turnNum).isVotePassed;

			expect(getIsVotePassed(0)).toBe(true);
			expect(getIsVotePassed(3)).toBe(true);
			expect(getIsVotePassed(5)).toBe(false);
			expect(getIsVotePassed(7)).toBe(true);
		});

		it('should track the election tracker', () => {
			const beforeElectionTracker = turnNum => turns.get(turnNum).beforeElectionTracker;
			const afterElectionTracker = turnNum => turns.get(turnNum).afterElectionTracker;
			const isElectionTrackerMaxed = turnNum => turns.get(turnNum).isElectionTrackerMaxed;

			expect(beforeElectionTracker(0)).toBe(0);
			expect(beforeElectionTracker(1)).toBe(0);
			expect(beforeElectionTracker(2)).toBe(0);
			expect(beforeElectionTracker(3)).toBe(0);
			expect(beforeElectionTracker(4)).toBe(0);
			expect(beforeElectionTracker(5)).toBe(1);
			expect(beforeElectionTracker(6)).toBe(2);
			expect(beforeElectionTracker(7)).toBe(0);

			expect(afterElectionTracker(0)).toBe(0);
			expect(afterElectionTracker(1)).toBe(0);
			expect(afterElectionTracker(2)).toBe(0);
			expect(afterElectionTracker(3)).toBe(0);
			expect(afterElectionTracker(4)).toBe(1);
			expect(afterElectionTracker(5)).toBe(2);
			expect(afterElectionTracker(6)).toBe(0);
			expect(afterElectionTracker(7)).toBe(0);

			expect(isElectionTrackerMaxed(0)).toBe(false);
			expect(isElectionTrackerMaxed(1)).toBe(false);
			expect(isElectionTrackerMaxed(2)).toBe(false);
			expect(isElectionTrackerMaxed(3)).toBe(false);
			expect(isElectionTrackerMaxed(4)).toBe(false);
			expect(isElectionTrackerMaxed(5)).toBe(false);
			expect(isElectionTrackerMaxed(6)).toBe(false);
			expect(isElectionTrackerMaxed(7)).toBe(false);
		});

		it('should track the deck size', () => {
			const beforeDeckSize = turnNum => turns.get(turnNum).beforeDeckSize;
			const afterDeckSize = turnNum => turns.get(turnNum).afterDeckSize;

			expect(beforeDeckSize(0)).toBe(17);
			expect(beforeDeckSize(1)).toBe(14);
			expect(beforeDeckSize(2)).toBe(11);
			expect(beforeDeckSize(3)).toBe(8);
			expect(beforeDeckSize(4)).toBe(5);
			expect(beforeDeckSize(5)).toBe(5);
			expect(beforeDeckSize(6)).toBe(5);
			expect(beforeDeckSize(7)).toBe(12);

			expect(afterDeckSize(0)).toBe(14);
			expect(afterDeckSize(1)).toBe(11);
			expect(afterDeckSize(2)).toBe(8);
			expect(afterDeckSize(3)).toBe(5);
			expect(afterDeckSize(4)).toBe(5);
			expect(afterDeckSize(5)).toBe(5);
			expect(afterDeckSize(6)).toBe(2);
			expect(afterDeckSize(7)).toBe(9);
		});

		it('should track enacted proclamations', () => {
			const getEnactedProclamation = turnNum => turns.get(turnNum).enactedProclamation;

			expect(getEnactedProclamation(0)).toEqual(some('death-eater'));
			expect(getEnactedProclamation(1)).toEqual(some('death-eater'));
			expect(getEnactedProclamation(3)).toEqual(some('death-eater'));
			expect(getEnactedProclamation(5)).toEqual(none);
			expect(getEnactedProclamation(7)).toEqual(some('death-eater'));
		});

		it('should track minister hands', () => {
			const ministerHand = turnNum => turns.get(turnNum).ministerHand;

			expect(ministerHand(0)).toEqual(some({ reds: 2, blues: 1 }));
			expect(ministerHand(1)).toEqual(some({ reds: 2, blues: 1 }));
			expect(ministerHand(2)).toEqual(some({ reds: 1, blues: 2 }));
			expect(ministerHand(3)).toEqual(some({ reds: 2, blues: 1 }));
			expect(ministerHand(4)).toEqual(none);
			expect(ministerHand(5)).toEqual(none);
			expect(ministerHand(6)).toEqual(some({ reds: 2, blues: 1 }));
			expect(ministerHand(7)).toEqual(some({ reds: 2, blues: 1 }));
		});

		it('should track minister claims', () => {
			const ministerClaim = turnNum => turns.get(turnNum).ministerClaim;

			expect(ministerClaim(0)).toEqual(some({ reds: 2, blues: 1 }));
			expect(ministerClaim(1)).toEqual(some({ reds: 2, blues: 1 }));
			expect(ministerClaim(2)).toEqual(some({ reds: 2, blues: 1 }));
			expect(ministerClaim(3)).toEqual(some({ reds: 2, blues: 1 }));
			expect(ministerClaim(4)).toEqual(none);
			expect(ministerClaim(5)).toEqual(none);
			expect(ministerClaim(6)).toEqual(some({ reds: 2, blues: 1 }));
			expect(ministerClaim(7)).toEqual(none);
		});

		it('should track minister discard', () => {
			const ministerDiscard = turnNum => turns.get(turnNum).ministerDiscard;

			expect(ministerDiscard(0)).toEqual(some('order'));
			expect(ministerDiscard(1)).toEqual(some('death-eater'));
			expect(ministerDiscard(2)).toEqual(some('order'));
			expect(ministerDiscard(3)).toEqual(some('death-eater'));
			expect(ministerDiscard(4)).toEqual(none);
			expect(ministerDiscard(5)).toEqual(none);
			expect(ministerDiscard(6)).toEqual(some('order'));
			expect(ministerDiscard(7)).toEqual(some('order'));
		});

		it('should track headmaster hands', () => {
			const headmasterHand = turnNum => turns.get(turnNum).headmasterHand;

			expect(headmasterHand(0)).toEqual(some({ reds: 2, blues: 0 }));
			expect(headmasterHand(1)).toEqual(some({ reds: 1, blues: 1 }));
			expect(headmasterHand(2)).toEqual(some({ reds: 1, blues: 1 }));
			expect(headmasterHand(3)).toEqual(some({ reds: 1, blues: 1 }));
			expect(headmasterHand(4)).toEqual(none);
			expect(headmasterHand(5)).toEqual(none);
			expect(headmasterHand(6)).toEqual(some({ reds: 2, blues: 0 }));
			expect(headmasterHand(7)).toEqual(some({ reds: 2, blues: 0 }));
		});

		it('should track headmaster claims', () => {
			const headmasterClaim = turnNum => turns.get(turnNum).headmasterClaim;

			expect(headmasterClaim(0)).toEqual(some({ reds: 2, blues: 0 }));
			expect(headmasterClaim(1)).toEqual(some({ reds: 2, blues: 0 }));
			expect(headmasterClaim(2)).toEqual(some({ reds: 2, blues: 0 }));
			expect(headmasterClaim(3)).toEqual(some({ reds: 2, blues: 0 }));
			expect(headmasterClaim(4)).toEqual(none);
			expect(headmasterClaim(5)).toEqual(none);
			expect(headmasterClaim(6)).toEqual(some({ reds: 2, blues: 0 }));
			expect(headmasterClaim(7)).toEqual(none);
		});

		it('should track headmaster discard', () => {
			const headmasterDiscard = turnNum => turns.get(turnNum).headmasterDiscard;

			expect(headmasterDiscard(0)).toEqual(some('death-eater'));
			expect(headmasterDiscard(1)).toEqual(some('order'));
			expect(headmasterDiscard(2)).toEqual(some('order'));
			expect(headmasterDiscard(3)).toEqual(some('order'));
			expect(headmasterDiscard(4)).toEqual(none);
			expect(headmasterDiscard(5)).toEqual(none);
			expect(headmasterDiscard(6)).toEqual(some('death-eater'));
			expect(headmasterDiscard(7)).toEqual(some('death-eater'));
		});

		it('should track executions', () => {
			const execution = turnNum => turns.get(turnNum).isExecution;

			expect(execution(0)).toBe(false);
			expect(execution(1)).toBe(false);
			expect(execution(2)).toBe(false);
			expect(execution(3)).toBe(true);
			expect(execution(4)).toBe(false);
			expect(execution(5)).toBe(false);
			expect(execution(6)).toBe(true);
			expect(execution(7)).toBe(false);
		});

		it('should track investigations', () => {
			const investigation = turnNum => turns.get(turnNum).isInvestigation;

			expect(investigation(0)).toBe(false);
			expect(investigation(1)).toBe(true);
			expect(investigation(2)).toBe(false);
			expect(investigation(3)).toBe(false);
			expect(investigation(4)).toBe(false);
			expect(investigation(5)).toBe(false);
			expect(investigation(6)).toBe(false);
			expect(investigation(7)).toBe(false);
		});

		it('should track if voldemort is killed', () => {
			const isVoldemortKilled = turnNum => turns.get(turnNum).isVoldemortKilled;

			expect(isVoldemortKilled(0)).toBe(false);
			expect(isVoldemortKilled(1)).toBe(false);
			expect(isVoldemortKilled(2)).toBe(false);
			expect(isVoldemortKilled(3)).toBe(false);
			expect(isVoldemortKilled(4)).toBe(false);
			expect(isVoldemortKilled(5)).toBe(false);
			expect(isVoldemortKilled(6)).toBe(false);
			expect(isVoldemortKilled(7)).toBe(false);
		});

		it('should track player indexes', () => {
			expect(game.indexOf('Uther')).toEqual(some(0));
			expect(game.indexOf('Jaina')).toEqual(some(1));
			expect(game.indexOf('Rexxar')).toEqual(some(2));
			expect(game.indexOf('Anduin')).toEqual(some(6));
			expect(game.indexOf('Malfurian')).toEqual(some(3));
			expect(game.indexOf('Thrall')).toEqual(some(4));
			expect(game.indexOf('Valeera')).toEqual(some(5));
		});

		it('should track loyalties', () => {
			expect(game.loyaltyOf('Uther')).toEqual(some('order'));
			expect(game.loyaltyOf('Jaina')).toEqual(some('order'));
			expect(game.loyaltyOf('Rexxar')).toEqual(some('order'));
			expect(game.loyaltyOf('Anduin')).toEqual(some('order'));
			expect(game.loyaltyOf('Malfurian')).toEqual(some('death-eater'));
			expect(game.loyaltyOf('Thrall')).toEqual(some('death-eater'));
			expect(game.loyaltyOf('Valeera')).toEqual(some('death-eater'));
		});

		it('should track usernames', () => {
			expect(game.usernameOf(0)).toEqual(some('Uther'));
			expect(game.usernameOf(1)).toEqual(some('Jaina'));
			expect(game.usernameOf(2)).toEqual(some('Rexxar'));
			expect(game.usernameOf(3)).toEqual(some('Malfurian'));
			expect(game.usernameOf(4)).toEqual(some('Thrall'));
			expect(game.usernameOf(5)).toEqual(some('Valeera'));
			expect(game.usernameOf(6)).toEqual(some('Anduin'));
		});

		it('should track tags', () => {
			expect(game.tagOf(0)).toEqual(some('Uther [0]'));
			expect(game.tagOf(1)).toEqual(some('Jaina [1]'));
			expect(game.tagOf(2)).toEqual(some('Rexxar [2]'));
			expect(game.tagOf(3)).toEqual(some('Malfurian [3]'));
			expect(game.tagOf(4)).toEqual(some('Thrall [4]'));
			expect(game.tagOf(5)).toEqual(some('Valeera [5]'));
			expect(game.tagOf(6)).toEqual(some('Anduin [6]'));
		});

		it('should track roles', () => {
			expect(game.roleOf('Uther')).toEqual(some('order'));
			expect(game.roleOf('Jaina')).toEqual(some('order'));
			expect(game.roleOf('Rexxar')).toEqual(some('order'));
			expect(game.roleOf('Anduin')).toEqual(some('order'));
			expect(game.roleOf('Malfurian')).toEqual(some('death-eater'));
			expect(game.roleOf('Thrall')).toEqual(some('voldemort'));
			expect(game.roleOf('Valeera')).toEqual(some('death-eater'));
		});

		it('should track winners', () => {
			expect(game.isWinner('Uther')).toEqual(some(false));
			expect(game.isWinner('Jaina')).toEqual(some(false));
			expect(game.isWinner('Rexxar')).toEqual(some(false));
			expect(game.isWinner('Anduin')).toEqual(some(false));
			expect(game.isWinner('Malfurian')).toEqual(some(true));
			expect(game.isWinner('Thrall')).toEqual(some(true));
			expect(game.isWinner('Valeera')).toEqual(some(true));
		});

		it('should track winning team', () => {
			expect(game.winningTeam).toBe('death-eater');
		});

		it('should track votes', () => {
			expect(
				game
					.votesOf('Uther')
					.value()
					.get(4)
			).toEqual(
				some({
					lumos: true,
					ministerId: 4,
					headmasterId: 2
				})
			);

			expect(
				game
					.votesOf('Malfurian')
					.value()
					.get(5)
			).toEqual(none);
		});

		it('should track voldemort zone', () => {
			expect(game.voldemortZone).toEqual(some(3));
		});

		it('should track player size', () => {
			expect(game.playerSize).toBe(7);
		});

		it('should track shots', () => {
			expect(game.shotsOf('Uther').value()).toImmutableEqual(List([]));
			expect(game.shotsOf('Jaina').value()).toImmutableEqual(List([3]));
		});
	});
};
