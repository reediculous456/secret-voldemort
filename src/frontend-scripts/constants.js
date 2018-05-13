const cn = require('classnames');

const MODERATORS = (module.exports.MODERATORS = [
	'littlebird',
	'Hexicube',
	'RavenCaps',
	'JerMej1s',
	'jdudle3',
	'Rose',
	'Number5',
	'Ophxlia',
	'cayseron',
	'safi',
	'Wilmeister'
]);

module.exports.TRIALMODS = ['ZeroCool', 'neffni', 'waluigiwaro', 'benjamin172'];

const EDITORS = (module.exports.EDITORS = ['Max', 'cbell', 'Invidia', 'TheJustStopO']);
const ADMINS = (module.exports.ADMINS = ['coz', 'Stine']);
const CONTRIBUTORS = (module.exports.CONTRIBUTORS = [
	'banc',
	'HREmperor',
	'Royal2000H',
	'OuchYouHitMe',
	'Auengun',
	'Skyrra',
	'jbasrai',
	'sethe',
	'bot',
	'veggiemanz',
	'DFinn',
	'conundrum',
	'JerMej1s',
	'Invidia',
	'Wi1son',
	'LordVader',
	'voldemort',
	'goonbee'
]);

const CURRENTSEASONNUMBER = 2;

module.exports.CURRENTSEASONNUMBER = CURRENTSEASONNUMBER;

/**
 * @param {object} user - user from userlist.
 * @param {boolean} isSeasonal - whether or not to display seasonal colors.
 * @param {string} defaultClass - the default class
 * @return {string} list of classes for colors.
 */
module.exports.PLAYERCOLORS = (user, isSeasonal, defaultClass) => {
	if (MODERATORS.includes(user.userName) || ADMINS.includes(user.userName) || EDITORS.includes(user.userName) || CONTRIBUTORS.includes(user.userName)) {
		return cn(defaultClass, {
			admin: ADMINS.includes(user.userName),
			moderatorcolor: MODERATORS.includes(user.userName),
			editorcolor: EDITORS.includes(user.userName),
			contributer: CONTRIBUTORS.includes(user.userName),
			cbell: user.userName === 'cbell',
			max: user.userName === 'Max',
			dfinn: user.userName === 'DFinn',
			faaiz: user.userName === 'Faaiz1999',
			invidia: user.userName === 'Invidia',
			thejuststopo: user.userName === 'TheJustStopO'
		});
	} else {
		const w = isSeasonal ? user[`winsSeason${CURRENTSEASONNUMBER}`] : user.wins;
		const l = isSeasonal ? user[`lossesSeason${CURRENTSEASONNUMBER}`] : user.losses;

		if (w + l < 50) return defaultClass;
		var elo = user.eloOverall;
		if (elo < 1500) elo = 1500;
		if (elo > 2000) elo = 2000;
		elo = Math.round(elo);
		return cn(defaultClass, `elo${elo}`);
	}
};
