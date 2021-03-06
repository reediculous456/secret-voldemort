document.addEventListener('DOMContentLoaded', function(event) {
	// this page/code is total shit but I would need to get a different graphing library to make it better.

	const processWinrateData = (deathEaterWinCount, totalGameCount) => {
		const fWins = Math.round((deathEaterWinCount / totalGameCount) * 100000) / 1000;
		const lWins = Math.round(((totalGameCount - deathEaterWinCount) / totalGameCount) * 100000) / 1000;

		return {
			series: [fWins, lWins],
			labels: [`${fWins.toFixed()}% Death Eater wins`, `${lWins.toFixed()}% Order Member wins`]
		};
	};

	$.ajax({
		url: 'data',
		success: function(data) {
			new Chartist.Line('#chart-completed-games', {
				labels: data.completedGames.labels,
				series: [data.completedGames.series]
			});

			setTimeout(() => {
				const { labels } = data.completedGames;
				const $labels = $('#chart-completed-games .ct-label.ct-horizontal');
				const showingLabelIndexes = [0, Math.round(labels.length / 4), Math.round(labels.length / 2), Math.round(labels.length / 1.5), labels.length - 1];
				const $shownlabels = $labels.filter(index => showingLabelIndexes.includes(index));

				$shownlabels.show(); // barf
			}, 500);

			new Chartist.Pie('#chart-allplayer-games-winrate', processWinrateData(data.allPlayerGameData.deathEaterWinCount, data.allPlayerGameData.totalGameCount), {
				width: '400px',
				height: '400px'
			});

			$('#chart-allplayer-games-winrate').after(`<p style="text-align: center">Total games played: ${data.allPlayerGameData.totalGameCount}</p>`);

			new Chartist.Pie(
				'#chart-fiveplayer-games-winrate',
				processWinrateData(data.fivePlayerGameData.deathEaterWinCount, data.fivePlayerGameData.totalGameCount),
				{
					width: '400px',
					height: '400px'
				}
			);

			$('#chart-fiveplayer-games-winrate').after(
				`<p style="text-align: center">Total 5 player games played: ${data.fivePlayerGameData.totalGameCount} | Percentage of Death Eaters in game: <span style="color: red; font-weight: bold">40%</span></p>`
			);

			new Chartist.Pie('#chart-sixplayer-games-winrate', processWinrateData(data.sixPlayerGameData.deathEaterWinCount, data.sixPlayerGameData.totalGameCount), {
				width: '400px',
				height: '400px'
			});

			$('#chart-sixplayer-games-winrate').after(
				`<p style="text-align: center">Total 6 player games played: ${data.sixPlayerGameData.totalGameCount} | Percentage of Death Eaters in game: <span style="color: red; font-weight: bold">33%</span></p><h2 class="ui header centered">Winrate for 6 player games (rebalanced)</h2><div class="chart" id="chart-sixplayer-rebalanced-games-winrate"></div><p style="text-align: center">Total 6 player rebalanced games played: ${data.sixPlayerGameData.rebalancedTotalGameCount} | Percentage of Death Eaters in game: <span style="color: red; font-weight: bold">33%</span></p>`
			);

			new Chartist.Pie(
				'#chart-sixplayer-rebalanced-games-winrate',
				processWinrateData(data.sixPlayerGameData.rebalancedDeathEaterWinCount, data.sixPlayerGameData.rebalancedTotalGameCount),
				{ width: '400px', height: '400px' }
			);

			new Chartist.Pie(
				'#chart-sevenplayer-games-winrate',
				processWinrateData(data.sevenPlayerGameData.deathEaterWinCount, data.sevenPlayerGameData.totalGameCount),
				{ width: '400px', height: '400px' }
			);

			$('#chart-sevenplayer-games-winrate').after(
				`<p style="text-align: center">Total 7 player games played: ${data.sevenPlayerGameData.totalGameCount} | Percentage of Death Eaters in game: <span style="color: red; font-weight: bold">43%</span></p><h2 class="ui header centered">Winrate for 7 player games (rebalanced)</h2><div class="chart" id="chart-sevenplayer-rebalanced-games-winrate"></div><p style="text-align: center">Total 7 player rebalanced games played: ${data.sevenPlayerGameData.rebalancedTotalGameCount} | Percentage of Death Eaters in game: <span style="color: red; font-weight: bold">43%</span></p>`
			);

			new Chartist.Pie(
				'#chart-sevenplayer-rebalanced-games-winrate',
				processWinrateData(data.sevenPlayerGameData.rebalancedDeathEaterWinCount, data.sevenPlayerGameData.rebalancedTotalGameCount),
				{ width: '400px', height: '400px' }
			);

			new Chartist.Pie(
				'#chart-eightplayer-games-winrate',
				processWinrateData(data.eightPlayerGameData.deathEaterWinCount, data.eightPlayerGameData.totalGameCount),
				{ width: '400px', height: '400px' }
			);

			$('#chart-eightplayer-games-winrate').after(
				`<p style="text-align: center">Total 8 player games played: ${data.eightPlayerGameData.totalGameCount} | Percentage of Death Eaters in game: <span style="color: red; font-weight: bold">38%</span></p>`
			);

			new Chartist.Pie(
				'#chart-nineplayer-games-winrate',
				processWinrateData(data.ninePlayerGameData.deathEaterWinCount, data.ninePlayerGameData.totalGameCount),
				{
					width: '400px',
					height: '400px'
				}
			);

			$('#chart-nineplayer-games-winrate').after(
				`<p style="text-align: center">Total 9 player games played: ${data.ninePlayerGameData.totalGameCount} | Percentage of Death Eaters in game: <span style="color: red; font-weight: bold">44%</span></p><h2 class="ui header centered">Winrate for 9 player games (rebalanced)</h2><div class="chart" id="chart-nineplayer-rebalanced-games-winrate"></div><p style="text-align: center">Total 9 player rebalanced games played: ${data.ninePlayerGameData.rebalanced2fDeathEaterWinCount} | Percentage of Death Eaters in game: <span style="color: red; font-weight: bold">44%</span></p>`
			);

			new Chartist.Pie(
				'#chart-nineplayer-rebalanced-games-winrate',
				processWinrateData(data.ninePlayerGameData.rebalanced2fDeathEaterWinCount, data.ninePlayerGameData.rebalanced2fTotalGameCount),
				{ width: '400px', height: '400px' }
			);

			new Chartist.Pie('#chart-tenplayer-games-winrate', processWinrateData(data.tenPlayerGameData.deathEaterWinCount, data.tenPlayerGameData.totalGameCount), {
				width: '400px',
				height: '400px'
			});

			$('#chart-tenplayer-games-winrate').after(
				`<p style="text-align: center">Total 10 player games played: ${data.tenPlayerGameData.totalGameCount} | Percentage of Death Eaters in game: <span style="color: red; font-weight: bold">40%</span></p>`
			);
		}
	});
});
