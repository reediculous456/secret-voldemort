// keep this updated with GameSummary schema

// Jaina never votes for a death eater, kills a death eater
// Valeera shoots a order
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
			headmasterId: 1,
			enactedProclamation: 'death eater',
			headmasterHand: {
				reds: 2,
				blues: 0
			},
			presidentHand: {
				reds: 2,
				blues: 1
			},
			votes: [true, true, true, true, true, true, true],
			presidentClaim: { reds: 2, blues: 1 },
			headmasterClaim: { reds: 2, blues: 0 }
		},
		// turn 1
		{
			presidentId: 1,
			headmasterId: 3,
			enactedProclamation: 'death eater',
			investigationId: 4,
			investigationClaim: 'death eater',
			headmasterHand: {
				reds: 1,
				blues: 1
			},
			presidentHand: {
				reds: 2,
				blues: 1
			},
			votes: [true, true, true, true, true, true, true],
			presidentClaim: { reds: 2, blues: 1 },
			headmasterClaim: { reds: 2, blues: 0 }
		},
		// turn 2
		{
			presidentId: 2,
			headmasterId: 0,
			enactedProclamation: 'death eater',
			specialElection: 1,
			headmasterHand: {
				reds: 1,
				blues: 1
			},
			presidentHand: {
				reds: 1,
				blues: 2
			},
			votes: [true, true, true, true, true, true, true],
			presidentClaim: { reds: 2, blues: 1 },
			headmasterClaim: { reds: 2, blues: 0 }
		},
		// turn 3
		{
			presidentId: 1,
			headmasterId: 6,
			enactedProclamation: 'death eater',
			execution: 3,
			headmasterHand: {
				reds: 1,
				blues: 1
			},
			presidentHand: {
				reds: 2,
				blues: 1
			},
			votes: [true, false, true, true, true, true, false],
			presidentClaim: { reds: 2, blues: 1 },
			headmasterClaim: { reds: 2, blues: 0 }
		},
		// turn 4
		{
			presidentId: 4,
			headmasterId: 2,
			votes: [true, false, false, true, false, true, false]
		},
		// turn 5
		{
			presidentId: 5,
			headmasterId: 4,
			votes: [true, false, false, true, false, false, false]
		},
		// turn 6
		{
			presidentId: 6,
			headmasterId: 2,
			enactedProclamation: 'death eater',
			execution: 2,
			headmasterHand: {
				reds: 2,
				blues: 0
			},
			presidentHand: {
				reds: 2,
				blues: 1
			},
			votes: [true, true, true, true, true, true, true],
			presidentClaim: { reds: 2, blues: 1 },
			headmasterClaim: { reds: 2, blues: 0 }
		},
		// turn 7
		{
			presidentId: 0,
			headmasterId: 5,
			enactedProclamation: 'death eater',
			headmasterHand: {
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
			role: 'order'
		},
		{
			username: 'Jaina',
			role: 'order'
		},
		{
			username: 'Rexxar',
			role: 'order'
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
			role: 'order'
		}
	]
};
