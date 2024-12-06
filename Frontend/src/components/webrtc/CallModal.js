import React, { useEffect, useState } from "react";
import * as Icon from "react-feather";
import PropTypes from "prop-types";

function CallModal({ status, startCall, rejectCall, chatStarted }) {
	const [reveal, setReveal] = useState(status);

	const [isPlaying, setIsPlaying] = useState(false);


	useEffect(() => {
		setReveal(status);

		const ringtoneAudio = document.getElementById("ringtone-audio");

		if (ringtoneAudio) {
			ringtoneAudio
				.play()
				.then(() => {
					setIsPlaying(true);
				})
				.catch((error) => {
					console.log("Ringtone playback blocked due to autoplay policy:", error);
				});
		}

		return () => {
			if (ringtoneAudio) {
				ringtoneAudio.pause();
				ringtoneAudio.currentTime = 0;
				setReveal(null)
			}

		};
	}, [reveal,status]);

	const acceptWithVideo = (video) => {
		return () => {
			const ringtoneAudio = document.getElementById("ringtone-audio");

			if (typeof chatStarted === "function") {
				chatStarted();
			}

			if (ringtoneAudio) {
				ringtoneAudio.pause();
				ringtoneAudio.currentTime = 0;
				setIsPlaying(false);
			}

			const config = { audio: true, video };
			startCall(false, config);
		};
	};

	const handleRejectCall = () => {
		const ringtoneAudio = document.getElementById("ringtone-audio");
		if (ringtoneAudio) {
			ringtoneAudio.pause();
			ringtoneAudio.currentTime = 0;
			setIsPlaying(false);
		}
		rejectCall();
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
			<button className="send incoming-call-button" onClick={handleRejectCall}>
				<Icon.X />
			</button>
			<audio
				id="ringtone-audio"
				src="./ringtone/simple.mp3"
				preload="auto"
				loop
			/>
		</div>
	);
}

CallModal.propTypes = {
	status: PropTypes.string.isRequired,
	startCall: PropTypes.func.isRequired,
	rejectCall: PropTypes.func.isRequired,
	chatStarted: PropTypes.func,
};

export default CallModal;
