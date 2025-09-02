module.exports = {
  launch: {
    headless: false,
    defaultViewport: {
      width: 1280,
      height: 800,
    },
    slowMo: 50,
    args: [
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream',
      '--use-file-for-fake-video-capture=tests/e2e/test-video.y4m',
      '--use-file-for-fake-audio-capture=tests/e2e/test-audio.wav'
    ]
  },
  browserContext: 'default',
  exitOnPageError: false
};
