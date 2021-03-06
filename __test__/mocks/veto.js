// from an actual game where veto is causing some kind of bug
module.exports = {
	_id: 'veto',
	date: '2017-06-25T23:58:27.945Z',
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
			headmasterId: 7,
			enactedProclamation: 'death-eater',
			_id: '595052626419ea7a9b545b53',
			headmasterClaim: {
				reds: 2,
				blues: 0
			},
			ministerClaim: {
				reds: 3,
				blues: 0
			},
			headmasterHand: {
				reds: 2,
				blues: 0
			},
			ministerHand: {
				reds: 3,
				blues: 0
			},
			votes: [true, true, true, true, true, true, true, true]
		},
		// turn 1
		{
			ministerId: 1,
			headmasterId: 6,
			enactedProclamation: 'order',
			_id: '595052626419ea7a9b545b52',
			headmasterClaim: {
				reds: 2,
				blues: 0
			},
			ministerClaim: {
				reds: 3,
				blues: 0
			},
			headmasterHand: {
				reds: 0,
				blues: 2
			},
			ministerHand: {
				reds: 1,
				blues: 2
			},
			votes: [true, true, true, true, true, true, true, true]
		},
		// turn 2
		{
			ministerId: 2,
			headmasterId: 5,
			enactedProclamation: 'death-eater',
			investigationId: 3,
			investigationClaim: 'death-eater',
			_id: '595052626419ea7a9b545b51',
			headmasterHand: {
				reds: 2,
				blues: 0
			},
			ministerHand: {
				reds: 3,
				blues: 0
			},
			votes: [true, true, true, true, true, true, true, true]
		},
		// turn 3
		{
			ministerId: 3,
			headmasterId: 1,
			_id: '595052626419ea7a9b545b50',
			headmasterClaim: {
				reds: 2,
				blues: 0
			},
			ministerClaim: {
				reds: 3,
				blues: 0
			},
			votes: [false, false, false, false, false, true, false, false]
		},
		// turn 4
		{
			ministerId: 4,
			headmasterId: 1,
			enactedProclamation: 'death-eater',
			specialElection: 6,
			_id: '595052626419ea7a9b545b4f',
			headmasterHand: {
				reds: 2,
				blues: 0
			},
			ministerHand: {
				reds: 3,
				blues: 0
			},
			votes: [true, true, true, true, true, true, true, true]
		},
		// turn 5
		{
			ministerId: 6,
			headmasterId: 1,
			_id: '595052626419ea7a9b545b4e',
			votes: [false, false, false, true, false, true, true, false]
		},
		// turn 6
		{
			ministerId: 5,
			headmasterId: 6,
			enactedProclamation: 'order',
			_id: '595052626419ea7a9b545b4d',
			headmasterClaim: {
				reds: 0,
				blues: 2
			},
			ministerClaim: {
				reds: 2,
				blues: 1
			},
			headmasterHand: {
				reds: 1,
				blues: 1
			},
			ministerHand: {
				reds: 1,
				blues: 2
			},
			votes: [true, false, false, true, true, true, true, true]
		},
		// turn 7
		{
			ministerId: 6,
			headmasterId: 1,
			_id: '595052626419ea7a9b545b4c',
			votes: [false, false, false, true, false, true, true, false]
		},
		// turn 8
		{
			ministerId: 7,
			headmasterId: 3,
			_id: '595052626419ea7a9b545b4b',
			votes: [true, false, false, false, true, true, false, true]
		},
		// turn 9
		{
			ministerId: 0,
			headmasterId: 4,
			enactedProclamation: 'order',
			_id: '595052626419ea7a9b545b4a',
			headmasterClaim: {
				reds: 0,
				blues: 2
			},
			ministerClaim: {
				reds: 1,
				blues: 2
			},
			headmasterHand: {
				reds: 0,
				blues: 2
			},
			ministerHand: {
				reds: 0,
				blues: 3
			},
			votes: [true, true, true, true, true, false, false, false]
		},
		// turn 10
		{
			ministerId: 1,
			headmasterId: 6,
			_id: '595052626419ea7a9b545b49',
			votes: [false, true, false, false, true, false, true, false]
		},
		// turn 11
		{
			ministerId: 2,
			headmasterId: 5,
			_id: '595052626419ea7a9b545b48',
			votes: [false, false, true, false, false, false, false, false]
		},
		// turn 12
		{
			ministerId: 3,
			headmasterId: 6,
			enactedProclamation: 'death-eater',
			_id: '595052626419ea7a9b545b47',
			headmasterClaim: {
				reds: 2,
				blues: 0
			},
			ministerClaim: {
				reds: 3,
				blues: 0
			},
			votes: [true, false, false, false, false, true, true, false]
		},
		// turn 13
		{
			ministerId: 4,
			headmasterId: 6,
			enactedProclamation: 'death-eater',
			execution: 7,
			_id: '595052626419ea7a9b545b46',
			headmasterHand: {
				reds: 2,
				blues: 0
			},
			ministerHand: {
				reds: 3,
				blues: 0
			},
			votes: [true, true, false, true, true, false, true, false]
		},
		// turn 14
		{
			ministerId: 5,
			headmasterId: 2,
			_id: '595052626419ea7a9b545b45',
			votes: [false, false, true, false, false, true, false, false]
		},
		// turn 15
		{
			ministerId: 6,
			headmasterId: 1,
			enactedProclamation: 'order',
			_id: '595052626419ea7a9b545b44',
			headmasterHand: {
				reds: 1,
				blues: 1
			},
			ministerHand: {
				reds: 2,
				blues: 1
			},
			votes: [false, true, false, true, true, false, true, false]
		},
		// turn 16
		{
			ministerId: 0,
			headmasterId: 4,
			_id: '595052626419ea7a9b545b43',
			votes: [true, false, true, false, false, false, false, false]
		},
		// turn 17
		{
			ministerId: 1,
			headmasterId: 3,
			_id: '595052626419ea7a9b545b42',
			headmasterHand: {
				reds: 2,
				blues: 0
			},
			ministerHand: {
				reds: 3,
				blues: 0
			},
			votes: [false, true, false, true, true, true, true, false]
		},
		// turn 18
		{
			ministerId: 2,
			headmasterId: 6,
			enactedProclamation: 'death-eater',
			_id: '595052626419ea7a9b545b41',
			votes: [false, false, true, false, false, false, false, false]
		}
	],
	players: [
		{
			username: 'Crazyuncle',
			role: 'voldemort',
			_id: '595052626419ea7a9b545b5b'
		},
		{
			username: 'cbell',
			role: 'order',
			_id: '595052626419ea7a9b545b5a'
		},
		{
			username: 'sebastian',
			role: 'death-eater',
			_id: '595052626419ea7a9b545b59'
		},
		{
			username: 'hootie',
			role: 'order',
			_id: '595052626419ea7a9b545b58'
		},
		{
			username: 'Mountainhawk',
			role: 'order',
			_id: '595052626419ea7a9b545b57'
		},
		{
			username: 'sethe',
			role: 'order',
			_id: '595052626419ea7a9b545b56'
		},
		{
			username: 'morewhales',
			role: 'order',
			_id: '595052626419ea7a9b545b55'
		},
		{
			username: 'obama',
			role: 'death-eater',
			_id: '595052626419ea7a9b545b54'
		}
	],
	__v: 0
};
