import React, { useState, useEffect, useRef } from 'react';
import * as Icon from 'react-feather';
import PropTypes from 'prop-types';

function CallWindow({ peerSrc, localSrc, config, mediaDevice, endCall }) {
	const peerVideo = useRef(null);
	const localVideo = useRef(null);
	const [video, setVideo] = useState(config.video);
	const [audio, setAudio] = useState(config.audio);

	useEffect(() => {
		if (peerVideo.current && peerSrc) peerVideo.current.srcObject = peerSrc;
		if (localVideo.current && localSrc) localVideo.current.srcObject = localSrc;
	});

	useEffect(() => {
		if (mediaDevice) {
			mediaDevice.toggle('Video', video);
			mediaDevice.toggle('Audio', audio);
		}
	});

	/**
	 * Turn on/off a media device
	 * @param {String} deviceType - Type of the device eg: Video, Audio
	 */
	const toggleMediaDevice = (deviceType) => {
		if (deviceType === 'video') {
			setVideo(!video);
			mediaDevice.toggle('Video');
		}
		if (deviceType === 'audio') {
			setAudio(!audio);
			mediaDevice.toggle('Audio');
		}
	};

	return (
		<div className="call-window rollDown">
			<video id="peerVideo" ref={peerVideo} autoPlay />
			<video id="localVideo" ref={localVideo} autoPlay muted />
			<div className="video-control rollDown">
				<button
					key="btnVideo"
					type="button"
					className="btn-action"
					onClick={() => toggleMediaDevice('video')}
				>
					{video ? <Icon.Video /> : <Icon.VideoOff />}
				</button>
				<button
					key="btnAudio"
					type="button"
					className="btn-action"
					onClick={() => toggleMediaDevice('audio')}
				>
					{audio ? <Icon.PhoneCall /> : <Icon.PhoneOff />}
				</button>
				<button type="button" className="btn-action hangup" onClick={() => endCall(true)}>
					<Icon.X />
				</button>
			</div>
		</div>
	);
}

CallWindow.propTypes = {
	status: PropTypes.string.isRequired,
	localSrc: PropTypes.object, // eslint-disable-line
	peerSrc: PropTypes.object, // eslint-disable-line
	config: PropTypes.shape({
		audio: PropTypes.bool.isRequired,
		video: PropTypes.bool.isRequired
	}).isRequired,
	mediaDevice: PropTypes.object, // eslint-disable-line
	endCall: PropTypes.func.isRequired
};

export default CallWindow;
