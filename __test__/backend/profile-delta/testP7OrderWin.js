import { profileDelta } from '../../../models/profile/utils';
import buildEnhancedGameSummary from '../../../models/game-summary/buildEnhancedGameSummary';
import { p7OrderWin } from '../../mocks';

export default () => {
	const game = buildEnhancedGameSummary(p7OrderWin);

	describe('order win, 7p', () => {
		it('Uther', () => {
			const delta = profileDelta('Uther', game);

			expect(delta.stats.matches.allMatches.events).toBe(1);
			expect(delta.stats.matches.allMatches.successes).toBe(1);

			expect(delta.stats.matches.order.events).toBe(1);
			expect(delta.stats.matches.order.successes).toBe(1);

			expect(delta.stats.matches.deathEater.events).toBe(0);
			expect(delta.stats.matches.deathEater.successes).toBe(0);

			expect(delta.stats.actions.voteAccuracy.events).toBe(0);
			expect(delta.stats.actions.voteAccuracy.successes).toBe(0);

			expect(delta.stats.actions.shotAccuracy.events).toBe(0);
			expect(delta.stats.actions.shotAccuracy.successes).toBe(0);

			expect(delta.recentGames.loyalty).toBe('order');
			expect(delta.recentGames.playerSize).toBe(7);
			expect(delta.recentGames.isWinner).toBe(true);
		});

		it('Rexxar', () => {
			const delta = profileDelta('Rexxar', game);

			expect(delta.stats.matches.allMatches.events).toBe(1);
			expect(delta.stats.matches.allMatches.successes).toBe(0);

			expect(delta.stats.matches.order.events).toBe(0);
			expect(delta.stats.matches.order.successes).toBe(0);

			expect(delta.stats.matches.deathEater.events).toBe(1);
			expect(delta.stats.matches.deathEater.successes).toBe(0);

			expect(delta.stats.actions.voteAccuracy.events).toBe(0);
			expect(delta.stats.actions.voteAccuracy.successes).toBe(0);

			expect(delta.stats.actions.shotAccuracy.events).toBe(0);
			expect(delta.stats.actions.shotAccuracy.successes).toBe(0);

			expect(delta.recentGames.loyalty).toBe('death-eater');
			expect(delta.recentGames.playerSize).toBe(7);
			expect(delta.recentGames.isWinner).toBe(false);
		});
	});
};
