import buildEnhancedGameSummary from '../../../models/game-summary/buildEnhancedGameSummary';
import { voldemortKilledOrderLoss } from '../../mocks';
import { List, Range } from 'immutable';
import { some, none } from 'option';
import matches from '../../matchers';

export default () => {
	describe('voldemort killed so orders should win', () => {
		const game = buildEnhancedGameSummary(voldemortKilledOrderLoss);
		const { turns } = game;

		it('orders should be winning team', () => {
			expect(game.winningTeam).toBe('order');
			expect(game.isWinner('onebobby')).toEqual(some(true));
		});
	});
};
