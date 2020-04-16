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
			ministerId: 0,
			headmasterId: 2,
			enactedProclamation: 'death-eater',
			headmasterHand: {
				reds: 1,
				blues: 1
			},
			ministerHand: {
				reds: 1,
				blues: 2
			},
			votes: [true, true, true, true, true, true, true]
		},
		{
			ministerId: 1,
			headmasterId: 3,
			enactedProclamation: 'death-eater',
			investigationId: 2,
			ministerClaim: {
				reds: 0,
				blues: 3
			},
			headmasterHand: {
				reds: 1,
				blues: 1
			},
			ministerHand: {
				reds: 1,
				blues: 2
			},
			votes: [false, true, false, true, true, true, true]
		},
		{
			ministerId: 2,
			headmasterId: 4,
			votes: [false, false, false, false, false, true, true]
		},
		{
			ministerId: 3,
			headmasterId: 4,
			enactedProclamation: 'death-eater',
			specialElection: 4,
			headmasterHand: {
				reds: 1,
				blues: 1
			},
			ministerHand: {
				reds: 2,
				blues: 1
			},
			votes: [true, true, true, false, true, false, false]
		},
		{
			ministerId: 4,
			headmasterId: 5,
			enactedProclamation: 'death-eater',
			execution: 2,
			headmasterHand: {
				reds: 2,
				blues: 0
			},
			ministerHand: {
				reds: 3,
				blues: 0
			},
			votes: [true, true, false, true, false, true, true]
		}
	],
	players: [
		{
			username: 'Uther',
			role: 'order'
		},
		{
			username: 'Jaina',
			role: 'death-eater'
		},
		{
			username: 'Malfurian',
			role: 'voldemort'
		},
		{
			username: 'Rexxar',
			role: 'death-eater'
		},
		{
			username: 'Thrall',
			role: 'order'
		},
		{
			username: 'Valeera',
			role: 'order'
		},
		{
			username: 'Anduin',
			role: 'order'
		}
	],
	__v: 0
};
