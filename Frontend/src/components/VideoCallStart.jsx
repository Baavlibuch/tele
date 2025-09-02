import React, { useEffect, useRef } from 'react';

const VideoCallStart = ({ onError }) => {
  const mainVideoRef = useRef(null);
  const selfPreviewRef = useRef(null);

  useEffect(() => {
    let stream = null;

    const startVideo = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });

        // Main video feed
        if (mainVideoRef.current) {
          mainVideoRef.current.srcObject = mediaStream;
        }

        // Self preview feed
        if (selfPreviewRef.current) {
          selfPreviewRef.current.srcObject = mediaStream;
        }

        stream = mediaStream;
      } catch (err) {
        console.error('Error accessing camera/microphone:', err);
        if (onError) onError(err);
        alert('Could not access camera/microphone. Please ensure you have granted the necessary permissions.');
      }
    };

    startVideo();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [onError]);

  return (
    <div
      className="video-call-container"
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        borderRadius: '12px',
        overflow: 'hidden',
        backgroundColor: 'black',
      }}
    >
      {/* Main video */}
      <video
        ref={mainVideoRef}
        autoPlay
        playsInline
        muted
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: 'scaleX(-1)',
        }}
      />

      {/* Self preview */}
      <video
        ref={selfPreviewRef}
        autoPlay
        playsInline
        muted
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          width: '150px',
          height: '100px',
          objectFit: 'contain',   // ✅ ensures full frame is shown
          backgroundColor: 'black',
          border: '2px solid white',
          borderRadius: '8px',
          transform: 'scaleX(-1)',
        }}
      />
    </div>
  );
};

export default VideoCallStart;