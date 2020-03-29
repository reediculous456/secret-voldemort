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
			presidentId: 0,
			chancellorId: 7,
			enactedProclamation: 'death eater',
			_id: '595052626419ea7a9b545b53',
			chancellorClaim: {
				reds: 2,
				blues: 0
			},
			presidentClaim: {
				reds: 3,
				blues: 0
			},
			chancellorHand: {
				reds: 2,
				blues: 0
			},
			presidentHand: {
				reds: 3,
				blues: 0
			},
			votes: [true, true, true, true, true, true, true, true]
		},
		// turn 1
		{
			presidentId: 1,
			chancellorId: 6,
			enactedProclamation: 'order',
			_id: '595052626419ea7a9b545b52',
			chancellorClaim: {
				reds: 2,
				blues: 0
			},
			presidentClaim: {
				reds: 3,
				blues: 0
			},
			chancellorHand: {
				reds: 0,
				blues: 2
			},
			presidentHand: {
				reds: 1,
				blues: 2
			},
			votes: [true, true, true, true, true, true, true, true]
		},
		// turn 2
		{
			presidentId: 2,
			chancellorId: 5,
			enactedProclamation: 'death eater',
			investigationId: 3,
			investigationClaim: 'death eater',
			_id: '595052626419ea7a9b545b51',
			chancellorHand: {
				reds: 2,
				blues: 0
			},
			presidentHand: {
				reds: 3,
				blues: 0
			},
			votes: [true, true, true, true, true, true, true, true]
		},
		// turn 3
		{
			presidentId: 3,
			chancellorId: 1,
			_id: '595052626419ea7a9b545b50',
			chancellorClaim: {
				reds: 2,
				blues: 0
			},
			presidentClaim: {
				reds: 3,
				blues: 0
			},
			votes: [false, false, false, false, false, true, false, false]
		},
		// turn 4
		{
			presidentId: 4,
			chancellorId: 1,
			enactedProclamation: 'death eater',
			specialElection: 6,
			_id: '595052626419ea7a9b545b4f',
			chancellorHand: {
				reds: 2,
				blues: 0
			},
			presidentHand: {
				reds: 3,
				blues: 0
			},
			votes: [true, true, true, true, true, true, true, true]
		},
		// turn 5
		{
			presidentId: 6,
			chancellorId: 1,
			_id: '595052626419ea7a9b545b4e',
			votes: [false, false, false, true, false, true, true, false]
		},
		// turn 6
		{
			presidentId: 5,
			chancellorId: 6,
			enactedProclamation: 'order',
			_id: '595052626419ea7a9b545b4d',
			chancellorClaim: {
				reds: 0,
				blues: 2
			},
			presidentClaim: {
				reds: 2,
				blues: 1
			},
			chancellorHand: {
				reds: 1,
				blues: 1
			},
			presidentHand: {
				reds: 1,
				blues: 2
			},
			votes: [true, false, false, true, true, true, true, true]
		},
		// turn 7
		{
			presidentId: 6,
			chancellorId: 1,
			_id: '595052626419ea7a9b545b4c',
			votes: [false, false, false, true, false, true, true, false]
		},
		// turn 8
		{
			presidentId: 7,
			chancellorId: 3,
			_id: '595052626419ea7a9b545b4b',
			votes: [true, false, false, false, true, true, false, true]
		},
		// turn 9
		{
			presidentId: 0,
			chancellorId: 4,
			enactedProclamation: 'order',
			_id: '595052626419ea7a9b545b4a',
			chancellorClaim: {
				reds: 0,
				blues: 2
			},
			presidentClaim: {
				reds: 1,
				blues: 2
			},
			chancellorHand: {
				reds: 0,
				blues: 2
			},
			presidentHand: {
				reds: 0,
				blues: 3
			},
			votes: [true, true, true, true, true, false, false, false]
		},
		// turn 10
		{
			presidentId: 1,
			chancellorId: 6,
			_id: '595052626419ea7a9b545b49',
			votes: [false, true, false, false, true, false, true, false]
		},
		// turn 11
		{
			presidentId: 2,
			chancellorId: 5,
			_id: '595052626419ea7a9b545b48',
			votes: [false, false, true, false, false, false, false, false]
		},
		// turn 12
		{
			presidentId: 3,
			chancellorId: 6,
			enactedProclamation: 'death eater',
			_id: '595052626419ea7a9b545b47',
			chancellorClaim: {
				reds: 2,
				blues: 0
			},
			presidentClaim: {
				reds: 3,
				blues: 0
			},
			votes: [true, false, false, false, false, true, true, false]
		},
		// turn 13
		{
			presidentId: 4,
			chancellorId: 6,
			enactedProclamation: 'death eater',
			execution: 7,
			_id: '595052626419ea7a9b545b46',
			chancellorHand: {
				reds: 2,
				blues: 0
			},
			presidentHand: {
				reds: 3,
				blues: 0
			},
			votes: [true, true, false, true, true, false, true, false]
		},
		// turn 14
		{
			presidentId: 5,
			chancellorId: 2,
			_id: '595052626419ea7a9b545b45',
			votes: [false, false, true, false, false, true, false, false]
		},
		// turn 15
		{
			presidentId: 6,
			chancellorId: 1,
			enactedProclamation: 'order',
			_id: '595052626419ea7a9b545b44',
			chancellorHand: {
				reds: 1,
				blues: 1
			},
			presidentHand: {
				reds: 2,
				blues: 1
			},
			votes: [false, true, false, true, true, false, true, false]
		},
		// turn 16
		{
			presidentId: 0,
			chancellorId: 4,
			_id: '595052626419ea7a9b545b43',
			votes: [true, false, true, false, false, false, false, false]
		},
		// turn 17
		{
			presidentId: 1,
			chancellorId: 3,
			_id: '595052626419ea7a9b545b42',
			chancellorHand: {
				reds: 2,
				blues: 0
			},
			presidentHand: {
				reds: 3,
				blues: 0
			},
			votes: [false, true, false, true, true, true, true, false]
		},
		// turn 18
		{
			presidentId: 2,
			chancellorId: 6,
			enactedProclamation: 'death eater',
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
			role: 'death eater',
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
			role: 'death eater',
			_id: '595052626419ea7a9b545b54'
		}
	],
	__v: 0
};
