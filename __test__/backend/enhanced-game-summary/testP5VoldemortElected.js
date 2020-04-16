import buildEnhancedGameSummary from '../../../models/game-summary/buildEnhancedGameSummary';
import { p5VoldemortElected } from '../../mocks';
import { List, Range } from 'immutable';
import { some, none } from 'option';
import '../../matchers';

export default () => {
	describe('Voldemort elected: 5p', () => {
		const game = buildEnhancedGameSummary(p5VoldemortElected);
		const { turns } = game;

		if (
			('turn 3 should be a top deck',
			() => {
				expect(turns.get(3).isElectionTrackerMaxed).toBe(true);
				expect(turns.get(4).isElectionTrackerMaxed).toBe(false);
			})
		);

		it('last turn should have voldemort elected', () => {
			expect(turns.last().isVoldemortElected).toBe(true);
			expect(game.winningTeam).toBe('death-eater');
		});

		it('should track the deck size', () => {
			const beforeDeckSize = turnNum => turns.get(turnNum).beforeDeckSize;
			const afterDeckSize = turnNum => turns.get(turnNum).afterDeckSize;

			expect(beforeDeckSize(0)).toBe(17);
			expect(beforeDeckSize(1)).toBe(14);
			expect(beforeDeckSize(2)).toBe(14);
			expect(beforeDeckSize(3)).toBe(14);
			expect(beforeDeckSize(4)).toBe(13);
			expect(beforeDeckSize(5)).toBe(10);

			expect(afterDeckSize(0)).toBe(14);
			expect(afterDeckSize(1)).toBe(14);
			expect(afterDeckSize(2)).toBe(14);
			expect(afterDeckSize(3)).toBe(13);
			expect(afterDeckSize(4)).toBe(10);
			expect(afterDeckSize(5)).toBe(10);
		});

		it('should track proclamation peek', () => {
			expect(turns.get(0).isProclamationPeek).toBe(false);
			expect(turns.get(1).isProclamationPeek).toBe(false);
			expect(turns.get(2).isProclamationPeek).toBe(false);
			expect(turns.get(3).isProclamationPeek).toBe(false);
			expect(turns.get(4).isProclamationPeek).toBe(true);
			expect(turns.get(5).isProclamationPeek).toBe(false);
		});
	});
};
