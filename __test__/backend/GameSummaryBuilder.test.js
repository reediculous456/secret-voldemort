import GameSummaryBuilder from '../../models/game-summary/GameSummaryBuilder';
import GameSummary from '../../models/game-summary';
import '../matchers';

describe('GameSummaryBuilder', () => {
	let gsb;

	it('should initialize correctly', () => {
		gsb = new GameSummaryBuilder(
			'devgame',
			new Date(),
			{
				rebalance6p: false,
				rebalance7p: false,
				rebalance9p: false,
				rerebalance9p: false
			},
			['order', 'death eater', 'order', 'death eater', 'order']
		);

		expect(gsb._id).toBeDefined();
		expect(gsb.date).toBeDefined();
		expect(gsb.logs.size).toBe(0);
	});

	it('should append a new log on next turn', () => {
		gsb = gsb.nextTurn();

		expect(gsb.logs.size).toBe(1);
	});

	it('should update log', () => {
		gsb = gsb.updateLog({ ministerId: 0 });

		expect(gsb.logs.get(0).ministerId).toBe(0);
	});

	it('should snap to log', () => {
		const ministerClaim = { reds: 2, blues: 1 };

		gsb = gsb
			.nextTurn()
			.updateLog({ ministerId: 1 })
			.updateLog({ ministerClaim }, { ministerId: 0 });

		expect(gsb.logs.get(1).ministerClaim).toBeUndefined();
		expect(gsb.logs.get(0).ministerClaim).toEqual(ministerClaim);
	});

	it('should publish a GameSummary', () => {
		const gs = gsb.publish();

		expect(gs).toBeInstanceOf(GameSummary);
		expect(gs.logs[0].ministerId).toBe(0);
	});
});
