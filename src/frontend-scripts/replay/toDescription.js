import { text, handToText, mapOpt1, capitalize } from '../../../utils';

export default function(snapshot, game) {
	const { isVotePassed, lumoses, noxes } = game.turns.get(snapshot.turnNum);
	const usernameOf = id => game.usernameOf(id).valueOrElse('');
	const claimToText = claim => claim.valueOrElse(text('player', 'nothing'));
	const claimHandToText = claim => claimToText(mapOpt1(handToText)(claim));
	const gameOverText = supplied => supplied.concat([text(game.winningTeam, capitalize(game.winningTeam) + 's'), text('normal', 'win the game.')]);

	switch (snapshot.phase) {
		case 'candidacy':
			return [text('player', usernameOf(snapshot.ministerId)), text('normal', 'is Minister')];
		case 'nomination':
			return [
				text('player', usernameOf(snapshot.ministerId)),
				text('normal', 'nominates'),
				text('player', usernameOf(snapshot.headmasterId)),
				text('normal', 'as Headmaster')
			];
		case 'election':
			if (snapshot.gameOver) {
				return gameOverText([text('voldemort', 'Voldemort'), text('normal', 'is elected.')]);
			} else {
				return [
					text('normal', 'The vote'),
					text('normal', isVotePassed ? 'passes' : 'fails'),
					text('player', lumoses),
					text('normal', 'to'),
					text('player', noxes)
				];
			}
		case 'topDeck':
			return [text('normal', 'The election tracker is maxed')];
		case 'ministerLegislation':
			return [text('player', usernameOf(snapshot.ministerId)), text('normal', 'draws')]
				.concat(handToText(snapshot.ministerHand))
				.concat([text('normal', 'and claims')])
				.concat(claimHandToText(snapshot.ministerClaim));
		case 'headmasterLegislation':
			return [text('player', usernameOf(snapshot.headmasterId)), text('normal', 'receives')]
				.concat(handToText(snapshot.headmasterHand))
				.concat([text('normal', 'and claims')])
				.concat(claimHandToText(snapshot.headmasterClaim));
		case 'veto':
			return [text('normal', 'The veto'), text('player', snapshot.isVetoSuccessful ? 'succeeds' : 'fails')];
		case 'proclamationEnaction':
			if (snapshot.gameOver) {
				return gameOverText([
					text('normal', 'The last'),
					text(snapshot.enactedProclamation, capitalize(snapshot.enactedProclamation)),
					text('normal', 'proclamation is enacted.')
				]);
			} else {
				return [text('normal', 'A'), text(snapshot.enactedProclamation, capitalize(snapshot.enactedProclamation)), text('normal', 'proclamation is enacted.')];
			}
		case 'investigation':
			return [
				text('player', usernameOf(snapshot.ministerId)),
				text('normal', 'investigates'),
				text('player', usernameOf(snapshot.investigationId)),
				text('normal', 'and claims'),
				claimToText(snapshot.investigationClaim.map(i => text(i, capitalize(i))))
			];
		case 'proclamationPeek':
			return [text('player', usernameOf(snapshot.ministerId)), text('normal', 'peeks')]
				.concat(handToText(snapshot.proclamationPeek))
				.concat([text('normal', 'and claims')])
				.concat(claimHandToText(snapshot.proclamationPeekClaim));
		case 'specialElection':
			return [text('player', usernameOf(snapshot.ministerId)), text('normal', 'special elects'), text('player', usernameOf(snapshot.specialElection))];
		case 'execution':
			if (snapshot.gameOver) {
				return gameOverText([text('voldemort', 'Voldemort'), text('normal', 'is killed.')]);
			} else {
				return [text('player', usernameOf(snapshot.ministerId)), text('normal', 'executes'), text('player', usernameOf(snapshot.execution))];
			}
	}
}
