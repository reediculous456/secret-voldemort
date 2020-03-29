import React from 'react'; // eslint-disable-line
import _ from 'lodash';
import PropTypes from 'prop-types';

const EnactedProclamations = props => {
	let classes = 'enactedproclamations-container';

	const { gameInfo } = props;

	if (gameInfo.cardFlingerState.length || gameInfo.trackState.isBlurred) {
		classes += ' blurred';
	}

	return (
		<section className={classes}>
			{_.range(1, 12).map((num, i) => {
				const stateObj = props.gameInfo.trackState.enactedProclamations[i];

				const frontClasses = 'enactedproclamations-card front';
				let backClasses = 'enactedproclamations-card back';
				let containerClasses = `enactedproclamations-card-container`;

				if (stateObj && Object.keys(stateObj).length) {
					if (stateObj.isFlipped) {
						containerClasses += ' flippedY inplace';
					}

					if (stateObj.position) {
						containerClasses = `${containerClasses} ${stateObj.position}`;
					}

					if (stateObj.cardBack) {
						backClasses = `${backClasses} ${stateObj.cardBack}`;
					}
				}

				return (
					<div key={i} className={containerClasses}>
						<div className={frontClasses} />
						<div className={backClasses} />
					</div>
				);
			})}
		</section>
	);
};

EnactedProclamations.propTypes = {
	gameInfo: PropTypes.object
};

export default EnactedProclamations;
