import _ from 'lodash';
import Emitter from './Emitter';

/**
 * Manage all media devices
 */
class MediaDevice extends Emitter {
	/**
	 * Start media devices and send stream
	 * @param {Object} config - Configuration for media devices
	 */
	start(config = { video: true, audio: true }) {
		const constraints = {
			video: config.video ? {
				facingMode: 'user',
				height: { min: 360, ideal: 720, max: 1080 },
				width: { min: 480, ideal: 1280, max: 1920 },
				frameRate: { ideal: 30, max: 60 }
			} : false,
			audio: config.audio
		};

		// Stop any existing tracks
		if (this.stream) {
			this.stop();
		}

		console.log('Requesting media with constraints:', constraints);

		navigator.mediaDevices
			.getUserMedia(constraints)
			.then((stream) => {
				console.log('Media stream obtained:', stream);
				this.stream = stream;
				this.emit('stream', stream);
			})
			.catch((err) => {
				console.error('Error accessing media devices:', err);
				if (err instanceof DOMException) {
					if (err.name === 'NotAllowedError') {
						alert('Please allow camera and microphone access to continue');
					} else if (err.name === 'NotFoundError') {
						alert('No camera found. Please connect a camera and try again.');
					} else {
						alert(`Cannot access camera/microphone: ${err.message}`);
					}
				} else {
					console.error('Media device error:', err);
					alert(`Error accessing media devices: ${err.message}`);
				}
				this.emit('error', err);
			});

		return this;
	}

	/**
	 * Turn on/off a device
	 * @param {String} type - Type of the device
	 * @param {Boolean} [on] - State of the device
	 */
	toggle(type, on) {
		const len = arguments.length;
		if (this.stream) {
			this.stream[`get${type}Tracks`]().forEach((track) => {
				const state = len === 2 ? on : !track.enabled;
				_.set(track, 'enabled', state);
			});
		}
		return this;
	}

	/**
	 * Stop all media track of devices
	 */
	stop() {
		if (this.stream) {
			this.stream.getTracks().forEach((track) => track.stop());
		}
		return this;
	}
}

export default MediaDevice;
