import React from 'react';
import * as Icon from 'react-feather';
import PropTypes from 'prop-types';

function CallModal({ status, startCall, rejectCall }) {
	const [reveal, setReveal] = React.useState(status);

	React.useEffect(() => {
		setReveal(status);
	}, [status]);

	const acceptWithVideo = (video) => {
		const config = { audio: true, video };
		return () => startCall(false, config);
	};

	if (!reveal) return null;

	return (
		<div>
			<p className="incoming-message">इनकमिंग कॉल</p>
			<button className="send incoming-call-button" onClick={acceptWithVideo(true)}>
				<Icon.Video />
			</button>
			<button className="send incoming-call-button" onClick={acceptWithVideo(false)}>
				<Icon.PhoneCall />
			</button>
			<button className="send incoming-call-button" onClick={rejectCall}>
				<Icon.X />
			</button>
		</div>
	);
}

CallModal.propTypes = {
	status: PropTypes.string.isRequired,
	startCall: PropTypes.func.isRequired,
	rejectCall: PropTypes.func.isRequired
};

export default CallModal;
