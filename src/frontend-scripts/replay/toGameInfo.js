import { mapOpt1 } from '../../../utils';

export default function toGameInfo(snapshot) {
	const gameState = {
		isTracksFlipped: true,
		undrawnProclamationCount: snapshot.deckSize
	};

	const general = {
		playerCount: snapshot.players.size,
		experiencedMode: false
	};

	const cardFlingerState = [];

	const publicPlayersState = snapshot.players
		.map((p, i) => {
			const maybe = (predicate, field, value) => (predicate ? { [field]: value } : {});

			const isSpecialElection = Number.isInteger(snapshot.specialElection);

			const maybePresident = maybe(
				(!isSpecialElection && snapshot.presidentId === i) || (isSpecialElection && snapshot.specialElection === i),
				'governmentStatus',
				'isPresident'
			);

			const maybeHeadmaster = maybe(!isSpecialElection && snapshot.headmasterId === i, 'governmentStatus', 'isHeadmaster');

			const cardStatus = (() => {
				const f = (cardDisplayed, isFlipped, cardFront, cardBack) => ({
					cardDisplayed,
					isFlipped,
					cardFront,
					cardBack
				});

				const blank = f(false, false, '', {});

				if (snapshot.gameOver) {
					return f(true, true, '', {
						cardName: p.role,
						icon: p.icon || 0
					});
				}

				switch (snapshot.phase) {
					case 'election':
						return f(true, true, 'ballot', {
							cardName: snapshot.votes
								.get(i)
								.map(x => (x ? 'ja' : 'nein'))
								.valueOrElse(null)
						});
					case 'investigation':
						const isInvTarget = i === snapshot.investigationId;

						return f(isInvTarget, isInvTarget, 'role', {
							cardName: isInvTarget && 'membership-' + p.loyalty
						});
					case 'veto':
						const vetoCard = vote => f(true, true, 'ballot', { cardName: vote ? 'ja' : 'nein' });

						if (i === snapshot.headmasterId) {
							return vetoCard(snapshot.headmasterVeto);
						} else if (i === snapshot.presidentId) {
							return mapOpt1(vetoCard)(snapshot.presidentVeto).valueOrElse(blank);
						} else {
							return blank;
						}
					default:
						return blank;
				}
			})();

			const base = {
				isDead: p.isDead,
				userName: p.username,
				nameStatus: p.role,
				connected: true,
				cardStatus
			};

			return Object.assign({}, base, maybePresident, maybeHeadmaster);
		})
		.toArray();

	const trackState = {
		deathEaterProclamationCount: snapshot.track.reds,
		orderProclamationCount: snapshot.track.blues,
		enactedProclamations: [],
		isBlurred: ['presidentLegislation', 'headmasterLegislation', 'proclamationPeek'].includes(snapshot.phase),
		isHidden: true
	};
	return {
		gameState,
		publicPlayersState,
		trackState,
		general,
		cardFlingerState
	};
}
