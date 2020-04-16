const rateEloGame = (size, ordElo, deathElo, ordWin) => {
	const ordAdjust = {
		5: -19.253,
		6: 20.637,
		7: -17.282,
		8: 45.418,
		9: -70.679,
		10: -31.539
	};

	const deathSize = () => {
		if (size % 2 == 0) return size / 2 - 1;
		return (size - 1) / 2;
	};
	const winSize = () => {
		if (ordWin) return size - deathSize();
		return deathSize();
	};

	const b = ordWin ? 1 : 0;
	const averageRatingWinners = (ordWin ? ordElo : deathElo) + b * ordAdjust[size];
	const averageRatingLosers = (ordWin ? deathElo : ordElo) + (1 - b) * ordAdjust[size];

	const k = size * 3;
	const winFactor = k / winSize();
	const loseFactor = -k / (size - winSize());
	const p = 1 / (1 + Math.pow(10, (averageRatingWinners - averageRatingLosers) / 400));
	console.log(' Gain: ' + (p * winFactor).toFixed(1));
	console.log(' Loss: ' + (p * loseFactor).toFixed(1));
	console.log('RGain: ' + (p * winFactor * 4).toFixed(1));
	console.log('RLoss: ' + (p * loseFactor * 4).toFixed(1));
};

const stdin = process.openStdin();

const parseBoolean = val => {
	if (val.toLowerCase() === 'true') return true;
	return false;
};

stdin.addListener('data', function(d) {
	const data = d
		.toString()
		.trim()
		.split(' ');
	rateEloGame(parseInt(data[0]), parseFloat(data[1]), parseFloat(data[2]), parseBoolean(data[3]));
});

/*
Start the script with "node json-test"
Enter query with "<players> <ordelo> <deathelo> <ordwin>"
Stop the script with ctrl+c (terminate shortcut)
*/
