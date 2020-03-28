import '../../matchers';

// mock game tests
import testGenericGame from './testGenericGame';
import testP5VoldemortElected from './testP5VoldemortElected';
import testP7VoldemortKilled from './testP7VoldemortKilled';
import testP7LiberalWin from './testP7LiberalWin';

describe('profileDelta', () => {
	describe('it should work for', () => {
		testGenericGame();
		testP5VoldemortElected();
		testP7VoldemortKilled();
		testP7LiberalWin();
	});
});
