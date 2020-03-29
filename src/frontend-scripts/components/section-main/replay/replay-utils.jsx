import React from 'react'; // eslint-disable-line
import { handToProclamations } from '../../../../../utils';
import { fromNullable } from 'option';
import Card from '../../reusable/Card.jsx';

export const handToCards = (hand, _discard) => {
	const discard = fromNullable(_discard);

	const proclamations = handToProclamations(hand);
	const discardIndex = discard.map(d => proclamations.findLastIndex(p => p === d)).valueOrElse(-1);

	return proclamations.map((proclamation, i) =>
		i === discardIndex ? <Card key={i} type={proclamation} icon={'huge red ban'} /> : <Card key={i} type={proclamation} />
	);
};
