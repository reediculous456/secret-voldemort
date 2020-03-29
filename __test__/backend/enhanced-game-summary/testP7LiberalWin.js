import buildEnhancedGameSummary from '../../../models/game-summary/buildEnhancedGameSummary';
import { p7OrderWin } from '../../mocks';
import { List, Range } from 'immutable';
import { some, none } from 'option';
import '../../matchers';

export default () => {
	describe('Order win: 7p', () => {
		const game = buildEnhancedGameSummary(p7OrderWin);
		const { turns } = game;

		it('last turn should have voldemort elected', () => {
			expect(turns.last().isGameEndingPolicyEnacted).toBe(true);
			expect(game.winningTeam).toBe('order');
		});
	});
};
