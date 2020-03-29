// keep this updated with GameSummary schema

// Jaina never votes for a death eater, kills a death eater
// Valeera shoots a liberal
// Uther always votes for a death eater
module.exports = {
	_id: 'generic-game',
	date: new Date(),
	gameSetting: {
		rebalance6p: false,
		rebalance7p: false,
		rebalance9p: false,
		rerebalance9p: false
	},
	logs: [
		// turn 0
		{
			presidentId: 0,
			chancellorId: 1,
			enactedPolicy: 'death eater',
			chancellorHand: {
				reds: 2,
				blues: 0
			},
			presidentHand: {
				reds: 2,
				blues: 1
			},
			votes: [true, true, true, true, true, true, true],
			presidentClaim: { reds: 2, blues: 1 },
			chancellorClaim: { reds: 2, blues: 0 }
		},
		// turn 1
		{
			presidentId: 1,
			chancellorId: 3,
			enactedPolicy: 'death eater',
			investigationId: 4,
			investigationClaim: 'death eater',
			chancellorHand: {
				reds: 1,
				blues: 1
			},
			presidentHand: {
				reds: 2,
				blues: 1
			},
			votes: [true, true, true, true, true, true, true],
			presidentClaim: { reds: 2, blues: 1 },
			chancellorClaim: { reds: 2, blues: 0 }
		},
		// turn 2
		{
			presidentId: 2,
			chancellorId: 0,
			enactedPolicy: 'death eater',
			specialElection: 1,
			chancellorHand: {
				reds: 1,
				blues: 1
			},
			presidentHand: {
				reds: 1,
				blues: 2
			},
			votes: [true, true, true, true, true, true, true],
			presidentClaim: { reds: 2, blues: 1 },
			chancellorClaim: { reds: 2, blues: 0 }
		},
		// turn 3
		{
			presidentId: 1,
			chancellorId: 6,
			enactedPolicy: 'death eater',
			execution: 3,
			chancellorHand: {
				reds: 1,
				blues: 1
			},
			presidentHand: {
				reds: 2,
				blues: 1
			},
			votes: [true, false, true, true, true, true, false],
			presidentClaim: { reds: 2, blues: 1 },
			chancellorClaim: { reds: 2, blues: 0 }
		},
		// turn 4
		{
			presidentId: 4,
			chancellorId: 2,
			votes: [true, false, false, true, false, true, false]
		},
		// turn 5
		{
			presidentId: 5,
			chancellorId: 4,
			votes: [true, false, false, true, false, false, false]
		},
		// turn 6
		{
			presidentId: 6,
			chancellorId: 2,
			enactedPolicy: 'death eater',
			execution: 2,
			chancellorHand: {
				reds: 2,
				blues: 0
			},
			presidentHand: {
				reds: 2,
				blues: 1
			},
			votes: [true, true, true, true, true, true, true],
			presidentClaim: { reds: 2, blues: 1 },
			chancellorClaim: { reds: 2, blues: 0 }
		},
		// turn 7
		{
			presidentId: 0,
			chancellorId: 5,
			enactedPolicy: 'death eater',
			chancellorHand: {
				reds: 2,
				blues: 0
			},
			presidentHand: {
				reds: 2,
				blues: 1
			},
			votes: [true, false, true, true, true, true, true]
		}
	],
	players: [
		{
			username: 'Uther',
			role: 'liberal'
		},
		{
			username: 'Jaina',
			role: 'liberal'
		},
		{
			username: 'Rexxar',
			role: 'liberal'
		},
		{
			username: 'Malfurian',
			role: 'death eater'
		},
		{
			username: 'Thrall',
			role: 'voldemort'
		},
		{
			username: 'Valeera',
			role: 'death eater'
		},
		{
			username: 'Anduin',
			role: 'liberal'
		}
	]
};
