const mongoose = require('mongoose');
const { Schema } = mongoose;
const modDM = new Schema({
	date: Date,
	user: String,
	moderator: String,
	from: String,
	chat: String,
	isTerminator: Boolean
});

module.exports = mongoose.model('ModMessage', modDM);
