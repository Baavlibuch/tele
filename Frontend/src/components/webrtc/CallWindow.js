import React, { useState, useEffect, useRef } from 'react';
import * as Icon from 'react-feather';
import PropTypes from 'prop-types';
import './CallWindow.css';

function CallWindow({ peerSrc, localSrc, config, mediaDevice, endCall, callBtn }) {
  const peerVideo = useRef(null);
  const localVideo = useRef(null);
  const [video, setVideo] = useState(config.video);
  const [audio, setAudio] = useState(config.audio);
  const [error, setError] = useState(null);

  // Handle peer video stream
  useEffect(() => {
    if (peerVideo.current && peerSrc) {
      peerVideo.current.srcObject = peerSrc;
    }
  }, [peerSrc]);

  // Handle local video stream
  useEffect(() => {
    console.log('Local source updated:', localSrc);
    if (localVideo.current) {
      if (localSrc) {
        console.log('Setting local video source:', localSrc);
        localVideo.current.srcObject = localSrc;
        localVideo.current.play().catch(err => {
          console.error('Error playing local video:', err);
        });
      } else {
        console.log('Clearing local video source');
        localVideo.current.srcObject = null;
      }
    }
  }, [localSrc]);

  // Toggle media devices when settings change
  useEffect(() => {
    if (mediaDevice) {
      mediaDevice.toggle('Video', video);
      mediaDevice.toggle('Audio', audio);
    }
  }, [video, audio, mediaDevice]);

  // Handle video element events
  const handleVideoPlay = () => {
    setError(null);
  };

  const handleVideoError = () => {
    setError(
      'Failed to load video stream. Please check your camera and microphone permissions.'
    );
  };

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
      {error && (
        <div className="video-error">
          <Icon.AlertCircle size={24} />
          <p>{error}</p>
        </div>
      )}

      <div className="video-container">
        <video
          id="peerVideo"
          ref={peerVideo}
          autoPlay
          playsInline
          onPlay={handleVideoPlay}
          onError={handleVideoError}
          style={{
            display: peerSrc ? 'block' : 'none',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            backgroundColor: '#000',
            borderRadius: '8px'
          }}
        />
        {!peerSrc && (
          <div className="video-placeholder">
            <Icon.VideoOff size={48} />
            <p>Waiting for peer connection...</p>
          </div>
        )}
      </div>

      {/* Local Preview */}
      <div className="local-video-container">
        <video
          id="localVideo"
          ref={localVideo}
          autoPlay
          muted
          playsInline
          onPlay={handleVideoPlay}
          onError={handleVideoError}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: 'scaleX(-1)', // Mirror effect for self-view
            backgroundColor: '#000',
            borderRadius: '4px'
          }}
        />
        {!localSrc && (
          <div className="local-video-placeholder">
            <Icon.VideoOff size={24} />
          </div>
        )}
      </div>

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
        <button
          type="button"
          className="btn-action hangup"
          onClick={() => endCall(true)}
        >
          <Icon.X />
        </button>
      </div>
    </div>
  );
}

CallWindow.propTypes = {
  status: PropTypes.string.isRequired,
  localSrc: PropTypes.object,
  peerSrc: PropTypes.object,
  config: PropTypes.shape({
    audio: PropTypes.bool.isRequired,
    video: PropTypes.bool.isRequired
  }).isRequired,
  mediaDevice: PropTypes.object,
  endCall: PropTypes.func.isRequired,
  callBtn: PropTypes.bool.isRequired
};

export default CallWindow;