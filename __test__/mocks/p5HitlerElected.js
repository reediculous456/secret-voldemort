// voldemort elected
// also a top deck happens
module.exports = {
	_id: 'voldemort-elected-5p',
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
			chancellorId: 4,
			enactedPolicy: 'death eater',
			chancellorHand: {
				reds: 1,
				blues: 1
			},
			presidentHand: {
				reds: 1,
				blues: 2
			},
			votes: [true, true, true, true, true]
		},
		// turn 1
		{
			presidentId: 1,
			chancellorId: 3,
			votes: [false, false, false, false, false]
		},
		// turn 2
		{
			presidentId: 2,
			chancellorId: 1,
			votes: [false, false, false, false, false]
		},
		// turn 3
		{
			presidentId: 3,
			chancellorId: 2,
			enactedPolicy: 'death eater',
			votes: [false, false, false, false, false]
		},
		// turn 4
		{
			presidentId: 4,
			chancellorId: 1,
			enactedPolicy: 'death eater',
			policyPeek: {
				reds: 2,
				blues: 1
			},
			policyPeekClaim: {
				reds: 3,
				blues: 0
			},
			chancellorHand: {
				reds: 1,
				blues: 1
			},
			presidentHand: {
				reds: 2,
				blues: 1
			},
			votes: [true, true, true, true, true]
		},
		// turn 5
		{
			presidentId: 0,
			chancellorId: 3,
			votes: [false, false, false, false, false]
		},
		{
			presidentId: 1,
			chancellorId: 0,
			votes: [true, true, true, true, false]
		}
	],
	players: [
		{
			username: 'Uther',
			role: 'voldemort'
		},
		{
			username: 'Jaina',
			role: 'death eater'
		},
		{
			username: 'Rexxar',
			role: 'order'
		},
		{
			username: 'Thrall',
			role: 'order'
		},
		{
			username: 'Malfurian',
			role: 'order'
		}
	],
	__v: 0
};
