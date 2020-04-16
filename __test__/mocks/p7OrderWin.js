// order win
module.exports = {
	_id: 'order-win-7p',
	gameSetting: {
		rebalance6p: false,
		rebalance7p: false,
		rebalance9p: false,
		rerebalance9p: false
	},
	logs: [
		{
			ministerId: 0,
			headmasterId: 3,
			enactedProclamation: 'order',
			headmasterHand: {
				reds: 1,
				blues: 1
			},
			ministerHand: {
				reds: 2,
				blues: 1
			},
			votes: [true, true, true, true, true, false, true]
		},
		{
			ministerId: 1,
			headmasterId: 6,
			enactedProclamation: 'death-eater',
			headmasterHand: {
				reds: 2,
				blues: 0
			},
			ministerHand: {
				reds: 3,
				blues: 0
			},
			votes: [true, true, true, true, false, false, true]
		},
		{
			ministerId: 2,
			headmasterId: 5,
			enactedProclamation: 'order',
			headmasterHand: {
				reds: 1,
				blues: 1
			},
			ministerHand: {
				reds: 2,
				blues: 1
			},
			votes: [true, true, false, true, true, false, true]
		},
		{
			ministerId: 3,
			headmasterId: 4,
			enactedProclamation: 'order',
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
			headmasterId: 2,
			enactedProclamation: 'order',
			headmasterHand: {
				reds: 1,
				blues: 1
			},
			ministerHand: {
				reds: 2,
				blues: 1
			},
			votes: [true, false, true, false, true, true, true]
		},
		{
			ministerId: 5,
			headmasterId: 3,
			votes: [false, false, true, true, true, false, false]
		},
		{
			ministerId: 6,
			headmasterId: 5,
			enactedProclamation: 'order',
			headmasterHand: {
				reds: 0,
				blues: 2
			},
			ministerHand: {
				reds: 1,
				blues: 2
			},
			votes: [true, true, true, true, true, true, true]
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
			role: 'voldemort'
		},
		{
			username: 'Thrall',
			role: 'order'
		},
		{
			username: 'Malfurian',
			role: 'death-eater'
		},
		{
			username: 'Valeera',
			role: 'death-eater'
		},
		{
			username: 'Anduin',
			role: 'order'
		}
	],
	__v: 0
};
