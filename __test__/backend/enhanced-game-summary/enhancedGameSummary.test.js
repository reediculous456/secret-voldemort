import buildEnhancedGameSummary from '../../../models/game-summary/buildEnhancedGameSummary';
import { mockGameSummary } from '../../mocks';
import '../../matchers';

// mock game tests
import testGenericGame from './testGenericGame';
import testP5VoldemortElected from './testP5VoldemortElected';
import testP7VoldemortKilled from './testP7VoldemortKilled';
import testP7OrderWin from './testP7OrderWin';
import testVeto from './testVeto';
import testVeto2 from './testVeto2';
import testVoldemortKilledOrderLoss from './testVoldemortKilledOrderLoss';

describe('build enhanced game summary', () => {
	const game = buildEnhancedGameSummary(mockGameSummary);

	it('should convert game summary to immutable collections and options', () => {
		const { summary, turns } = game;

		// general
		expect(summary).toBeTypeOf('object');
		expect(summary._id).toBeTypeOf('string');
		expect(summary.date).toBeInstanceOf(Date);
		expect(summary.players).toBeAList();

		const player = summary.players.first();

		expect(player).toBeTypeOf('object');
		expect(player.username).toBeTypeOf('string');
		expect(player.role).toBeTypeOf('string');

		// logs
		const logs = summary.logs;
		const log = logs.first();

		expect(logs).toBeAList();
		expect(log).toBeTypeOf('object');
		expect(log.ministerId).toBeTypeOf('number');
		expect(log.headmasterId).toBeTypeOf('number');
		expect(log.votes).toBeAList();
		expect(log.ministerHand).toBeAnOption();
		expect(log.ministerHand.value()).toBeTypeOf('object');
		expect(log.execution).toBeAnOption();

		// turns
		expect(turns).toBeAList();
		expect(turns.first()).toBeTypeOf('object');
	});

	describe('it should work for', () => {
		testGenericGame();
		testP5VoldemortElected();
		testP7VoldemortKilled();
		testP7OrderWin();
		testVeto();
		testVeto2();
		testVoldemortKilledOrderLoss();
	});
});
