import React from 'react';
import * as Icon from 'react-feather';
import PropTypes from 'prop-types';

// Import the ringtone file
import ringtone from './ringtone/simple.mp3';

function CallModal({ status, startCall, rejectCall, chatStarted }) {
	const [reveal, setReveal] = React.useState(status);
	const ringtoneAudio = React.useRef(null);

	React.useEffect(() => {
		// Initialize ringtone audio with volume control
		ringtoneAudio.current = new Audio(ringtone);
		ringtoneAudio.current.loop = true;
		ringtoneAudio.current.volume = 0.5; // Set initial volume to potentially allow autoplay

		// Cleanup on component unmount
		return () => {
			if (ringtoneAudio.current) {
				ringtoneAudio.current.pause();
				ringtoneAudio.current.currentTime = 0;
			}
		};
	}, []);

	React.useEffect(() => {
		setReveal(status);

		// Play ringtone if the call status is "incoming"
		if (status === "incoming" && ringtoneAudio.current) {
			ringtoneAudio.current.play().catch(error => {
				console.log("Ringtone playback blocked due to autoplay policy:", error);
				// Optional: Inform the user or provide a button to enable audio
			});
		} else if (ringtoneAudio.current) {
			// Stop ringtone when status changes
			ringtoneAudio.current.pause();
			ringtoneAudio.current.currentTime = 0;
		}
	}, [status]);

	const acceptWithVideo = (video) => {
		return () => {
			if (typeof chatStarted === 'function') {
				chatStarted();
			}
			console.log("chat started clicked");

			// Stop ringtone when call is accepted
			if (ringtoneAudio.current) {
				ringtoneAudio.current.pause();
				ringtoneAudio.current.currentTime = 0;
			}

			const config = { audio: true, video };
			startCall(false, config);
		};
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
			<button className="send incoming-call-button" onClick={() => {
				// Stop ringtone when call is rejected
				if (ringtoneAudio.current) {
					ringtoneAudio.current.pause();
					ringtoneAudio.current.currentTime = 0;
				}
				rejectCall();
			}}>
				<Icon.X />
			</button>
		</div>
	);
}

CallModal.propTypes = {
	status: PropTypes.string.isRequired,
	startCall: PropTypes.func.isRequired,
	rejectCall: PropTypes.func.isRequired,
	chatStarted: PropTypes.func
};

export default CallModal;
