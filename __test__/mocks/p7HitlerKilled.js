// voldemort executed
module.exports = {
	_id: 'voldemort-killed-7p',
	gameSetting: {
		rebalance6p: false,
		rebalance7p: false,
		rebalance9p: false,
		rerebalance9p: false
	},
	logs: [
		{
			presidentId: 0,
			chancellorId: 2,
			enactedPolicy: 'death eater',
			chancellorHand: {
				reds: 1,
				blues: 1
			},
			presidentHand: {
				reds: 1,
				blues: 2
			},
			votes: [true, true, true, true, true, true, true]
		},
		{
			presidentId: 1,
			chancellorId: 3,
			enactedPolicy: 'death eater',
			investigationId: 2,
			presidentClaim: {
				reds: 0,
				blues: 3
			},
			chancellorHand: {
				reds: 1,
				blues: 1
			},
			presidentHand: {
				reds: 1,
				blues: 2
			},
			votes: [false, true, false, true, true, true, true]
		},
		{
			presidentId: 2,
			chancellorId: 4,
			votes: [false, false, false, false, false, true, true]
		},
		{
			presidentId: 3,
			chancellorId: 4,
			enactedPolicy: 'death eater',
			specialElection: 4,
			chancellorHand: {
				reds: 1,
				blues: 1
			},
			presidentHand: {
				reds: 2,
				blues: 1
			},
			votes: [true, true, true, false, true, false, false]
		},
		{
			presidentId: 4,
			chancellorId: 5,
			enactedPolicy: 'death eater',
			execution: 2,
			chancellorHand: {
				reds: 2,
				blues: 0
			},
			presidentHand: {
				reds: 3,
				blues: 0
			},
			votes: [true, true, false, true, false, true, true]
		}
	],
	players: [
		{
			username: 'Uther',
			role: 'liberal'
		},
		{
			username: 'Jaina',
			role: 'death eater'
		},
		{
			username: 'Malfurian',
			role: 'voldemort'
		},
		{
			username: 'Rexxar',
			role: 'death eater'
		},
		{
			username: 'Thrall',
			role: 'liberal'
		},
		{
			username: 'Valeera',
			role: 'liberal'
		},
		{
			username: 'Anduin',
			role: 'liberal'
		}
	],
	__v: 0
};
