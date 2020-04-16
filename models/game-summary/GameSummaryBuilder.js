const GameSummary = require('./index');
const debug = require('debug')('game:summary');
const { fromNullable } = require('option');
const { List } = require('immutable');
const { objectContains } = require('../../utils');

module.exports = class GameSummaryBuilder {
	constructor(uid, date, gameSetting, customGameSettings, players, ordElo, deathElo, logs = List()) {
		this._id = uid;
		this.date = date;
		this.gameSetting = gameSetting;
		this.customGameSettings = customGameSettings;
		this.players = players;
		this.logs = logs;
		this.ordElo = ordElo;
		this.deathElo = deathElo;

		debug('%O', { uid, date, gameSetting, customGameSettings, players, ordElo, deathElo, logs: logs.toArray() });
	}

	publish() {
		const { _id, date, gameSetting, customGameSettings, players, ordElo, deathElo, logs } = this;
		return new GameSummary({ _id, date, gameSetting, customGameSettings, players, ordElo, deathElo, logs: logs.toArray() });
	}

	// (update: Object, targetAttrs: (?) Object) => GameSummaryBuilder
	// targetAttrs used to attach claims to the correct log
	updateLog(update, _targetAttrs) {
		const { logs } = this;
		const targetAttrs = fromNullable(_targetAttrs);

		const targetIndex = targetAttrs.map(attrs => logs.findLastIndex(log => objectContains(log, attrs))).valueOrElse(logs.size - 1);

		const nextTarget = Object.assign({}, logs.get(targetIndex), update);

		const nextLogs = logs
			.slice(0, targetIndex)
			.push(nextTarget)
			.concat(logs.slice(targetIndex + 1));

		return new GameSummaryBuilder(this._id, this.date, this.gameSetting, this.customGameSettings, this.players, this.ordElo, this.deathElo, nextLogs);
	}

	nextTurn() {
		return new GameSummaryBuilder(this._id, this.date, this.gameSetting, this.customGameSettings, this.players, this.ordElo, this.deathElo, this.logs.push({}));
	}
};
