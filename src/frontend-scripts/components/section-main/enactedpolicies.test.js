import React from 'react'; // eslint-disable-line
import { shallow } from 'enzyme';
import EnactedProclamations from './EnactedProclamations';

describe('EnactedProclamations', () => {
	it('should initialize correctly', () => {
		const component = shallow(<EnactedProclamations gameInfo={{ cardFlingerState: [], trackState: { enactedProclamations: [{}] } }} />);

		expect(component).toHaveLength(1);
	});
});
