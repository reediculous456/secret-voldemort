import React from 'react'; // eslint-disable-line
import { shallow } from 'enzyme';
import Proclamations from './Proclamations';

describe('Proclamations', () => {
	it('should initialize correctly', () => {
		const component = shallow(<Proclamations gameInfo={{ gameState: {}, trackState: {} }} />);

		expect(component).toHaveLength(1);
	});
});
