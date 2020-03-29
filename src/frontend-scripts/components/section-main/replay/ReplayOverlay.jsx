import React from 'react'; // eslint-disable-line
import { List } from 'immutable';
import classnames from 'classnames';
import CardGroup from '../../reusable/CardGroup.jsx';
import { handToCards } from './replay-utils.jsx';
import { some, none } from 'option';

const Legislation = ({ type, handTitle, claimTitle, hand, discard, claim }) => (
	<div className={classnames(type, 'legislation')}>
		<CardGroup className="hand card-group" title={handTitle} cards={handToCards(hand, discard.valueOrElse(null))} />
		<CardGroup className="claim card-group" title={claimTitle} cards={claim.map(c => handToCards(c)).valueOrElse(List())} />
	</div>
);

const PresidentLegislation = ({ hand, discard, claim }) => (
	<Legislation type="president" handTitle={'President Hand'} claimTitle={'President Claim'} hand={hand} discard={some(discard)} claim={claim} />
);

const ChancellorLegislation = ({ hand, discard, claim }) => (
	<Legislation type="chancellor" handTitle={'Chancellor Hand'} claimTitle={'Chancellor Claim'} hand={hand} discard={discard} claim={claim} />
);

const ProclamationPeek = ({ peek, claim }) => (
	<Legislation type="proclamation-peek" handTitle={'Proclamation Peek'} claimTitle={'Claim'} hand={peek} claim={claim} discard={none} />
);

const ReplayOverlay = ({ snapshot }) => {
	const overlay = (() => {
		switch (snapshot.phase) {
			case 'presidentLegislation':
				return <PresidentLegislation hand={snapshot.presidentHand} discard={snapshot.presidentDiscard} claim={snapshot.presidentClaim} />;
			case 'chancellorLegislation':
				return <ChancellorLegislation hand={snapshot.chancellorHand} discard={snapshot.chancellorDiscard} claim={snapshot.chancellorClaim} />;
			case 'proclamationPeek':
				return <ProclamationPeek peek={snapshot.proclamationPeek} claim={snapshot.proclamationPeekClaim} />;
			default:
				return null;
		}
	})();

	return <section className="replay-overlay">{overlay}</section>;
};

export default ReplayOverlay;
