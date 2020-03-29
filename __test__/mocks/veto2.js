// all veto situations
module.exports = {
	_id: 'veto2',
	gameSetting: {
		rebalance6p: false,
		rebalance7p: false,
		rebalance9p: false,
		rerebalance9p: false
	},
	logs: [
		// turn 0
		{
			ministerId: 0,
			headmasterId: 1,
			enactedProclamation: 'death eater',
			headmasterHand: {
				reds: 1,
				blues: 1
			},
			ministerHand: {
				reds: 2,
				blues: 1
			},
			votes: [true, true, true, true, true]
		},
		// turn 1
		{
			ministerId: 1,
			headmasterId: 2,
			enactedProclamation: 'death eater',
			headmasterHand: {
				reds: 1,
				blues: 1
			},
			ministerHand: {
				reds: 2,
				blues: 1
			},
			votes: [true, true, true, true, true]
		},
		// turn 2
		{
			ministerId: 2,
			headmasterId: 1,
			enactedProclamation: 'death eater',
			proclamationPeek: {
				reds: 2,
				blues: 1
			},
			headmasterHand: {
				reds: 2,
				blues: 0
			},
			ministerHand: {
				reds: 3,
				blues: 0
			},
			votes: [true, true, true, true, true]
		},
		// turn 3
		{
			ministerId: 3,
			headmasterId: 2,
			enactedProclamation: 'death eater',
			execution: 4,
			headmasterHand: {
				reds: 2,
				blues: 0
			},
			ministerHand: {
				reds: 2,
				blues: 1
			},
			votes: [true, true, true, true, true]
		},
		// turn 4
		{
			ministerId: 0,
			headmasterId: 1,
			enactedProclamation: 'death eater',
			execution: 1,
			headmasterHand: {
				reds: 2,
				blues: 0
			},
			ministerHand: {
				reds: 2,
				blues: 1
			},
			votes: [true, true, true, true, true]
		},
		// turn 5
		{
			ministerId: 2,
			headmasterId: 0,
			headmasterVeto: true,
			ministerVeto: false,
			enactedProclamation: 'order',
			headmasterHand: {
				reds: 1,
				blues: 1
			},
			ministerHand: {
				reds: 1,
				blues: 2
			},
			votes: [true, true, true, true, true]
		},
		// turn 6
		{
			ministerId: 3,
			headmasterId: 2,
			headmasterVeto: false,
			enactedProclamation: 'order',
			headmasterHand: {
				reds: 1,
				blues: 1
			},
			ministerHand: {
				reds: 1,
				blues: 2
			},
			votes: [true, true, true, true, true]
		},
		// turn 7
		{
			ministerId: 0,
			headmasterId: 3,
			votes: [false, true, false, false, true]
		},
		// turn 8
		{
			ministerId: 2,
			headmasterId: 3,
			votes: [false, true, false, false, true]
		},
		// turn 9
		{
			ministerId: 3,
			headmasterId: 0,
			headmasterVeto: true,
			ministerVeto: true,
			enactedProclamation: 'death eater',
			headmasterHand: {
				reds: 1,
				blues: 1
			},
			ministerHand: {
				reds: 2,
				blues: 1
			},
			votes: [true, true, true, true, true]
		}
	],
	players: [
		{
			username: 'Malfurian',
			role: 'order'
		},
		{
			username: 'Jaina',
			role: 'order'
		},
		{
			username: 'Uther',
			role: 'death eater'
		},
		{
			username: 'Rexxar',
			role: 'voldemort'
		},
		{
			username: 'Thrall',
			role: 'order'
		}
	],
	__v: 0
};
