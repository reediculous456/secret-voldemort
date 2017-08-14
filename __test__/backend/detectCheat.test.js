import buildEnhancedGameSummary from '../../models/game-summary/buildEnhancedGameSummary';
import { mockGameSummary, p5HitlerElected } from '../mocks';
import detectCheat from '../../code/detectCheat';
import { some } from 'option';

describe('Detect cheat system', () => {
	it('should find liberal presidents who discard liberal policies', () => {
		const game = buildEnhancedGameSummary(mockGameSummary);
		expect(detectCheat(game)).toEqual(some({
			reason: 'badPresident',
			turn: 0,
			phase: 'presidentLegislation'
		}));
	});

	it('should find liberal chancellors who discard liberal policies', () => {
		const game = buildEnhancedGameSummary(p5HitlerElected);
		expect(detectCheat(game)).toEqual(some({
			reason: 'badChancellor',
			turn: 0,
			phase: 'chancellorLegislation'
		}));
	});
});
