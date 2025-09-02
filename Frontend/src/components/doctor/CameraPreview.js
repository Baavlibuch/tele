import React, { useEffect, useRef, useState } from 'react';
import './CameraPreview.css';

const DoctorCameraPreview = ({ onClose }) => {
  const videoRef = useRef(null);
  const [localStream, setLocalStream] = useState(null);
  const [error, setError] = useState(null);
  const previewRef = useRef(null);

  // Request camera & mic
  useEffect(() => {
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setLocalStream(stream);
      } catch (err) {
        console.error('Camera access error:', err);
        setError('Unable to access camera/microphone. Please check permissions.');
      }
    };

    initCamera();

    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleEndCall = () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (onClose) onClose();
  };

  // Dragging logic
  useEffect(() => {
    const previewEl = previewRef.current;
    if (!previewEl) return;

    let offsetX = 0;
    let offsetY = 0;
    let isDragging = false;

    const onMouseDown = (e) => {
      isDragging = true;
      offsetX = e.clientX - previewEl.getBoundingClientRect().left;
      offsetY = e.clientY - previewEl.getBoundingClientRect().top;
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      previewEl.style.left = `${e.clientX - offsetX}px`;
      previewEl.style.top = `${e.clientY - offsetY}px`;
    };

    const onMouseUp = () => {
      isDragging = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    const header = previewEl.querySelector('.camera-preview-header');
    header.addEventListener('mousedown', onMouseDown);

    return () => {
      header.removeEventListener('mousedown', onMouseDown);
    };
  }, []);

  return (
    <div
      ref={previewRef}
      className="camera-preview doctor"
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 9999,
        width: '300px',
        background: '#1e293b',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      }}
    >
      <div
        className="camera-preview-header"
        style={{
          cursor: 'move',
          padding: '8px 12px',
          background: '#0f172a',
          borderTopLeftRadius: '12px',
          borderTopRightRadius: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: '#fff',
        }}
      >
        <h4 style={{ margin: 0, fontSize: '14px' }}>Doctor’s Camera</h4>
        <button
          className="minimize-btn"
          onClick={handleEndCall}
          style={{
            fontSize: '18px',
            background: 'transparent',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          ×
        </button>
      </div>

      <div className="video-container" style={{ padding: '8px' }}>
        {error ? (
          <div style={{ color: '#ef4444', textAlign: 'center' }}>{error}</div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="camera-feed"
            style={{
              width: '100%',
              borderRadius: '8px',
              backgroundColor: '#000',
            }}
          />
        )}
      </div>

      <div
        className="camera-actions"
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          padding: '8px',
        }}
      >
        <button
          className="minimize-btn"
          onClick={() => {
            const videoTracks = localStream?.getVideoTracks() || [];
            videoTracks.forEach((track) => {
              track.enabled = !track.enabled;
            });
          }}
          title="Toggle video"
        >
          📹
        </button>
        <button
          className="minimize-btn"
          onClick={() => {
            const audioTracks = localStream?.getAudioTracks() || [];
            audioTracks.forEach((track) => {
              track.enabled = !track.enabled;
            });
          }}
          title="Toggle audio"
        >
          🎤
        </button>
        <button
          className="minimize-btn"
          onClick={handleEndCall}
          style={{ backgroundColor: '#ef4444' }}
          title="End call"
        >
          📞
        </button>
      </div>
    </div>
  );
};

export default DoctorCameraPreview;