const mongoose = require('mongoose');
const { Schema } = mongoose;
const Bias = new Schema({
	nickname: {
		type: String,
		required: true,
		unique: true
	},
	eloLiberal: Number,
	eloDeathEater: Number
});

module.exports = mongoose.model('Account', Bias);
