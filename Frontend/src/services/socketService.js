import { io } from 'socket.io-client';
import { ENDPOINT } from '../config';

// Convert HTTP URL to WebSocket URL
const getWebSocketUrl = (url) => {
  if (!url) return 'ws://localhost:3001';
  return url.replace(/^http/, 'ws');
};

// Enable debug logging
localStorage.debug = 'socket.io-client:*';

let socket = null;

const connectSocket = (username, onConnect, onError) => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  const wsUrl = getWebSocketUrl(ENDPOINT);
  console.log('Connecting to WebSocket server at:', wsUrl);
  
  // Connect to the WebSocket server with proper configuration
  const socketOptions = {
    // Use the WebSocket URL directly
    path: '/socket.io',
    // Force WebSocket transport only
    transports: ['websocket'],
    // Disable auto-upgrade from long-polling
    upgrade: false,
    // Auto-connect
    autoConnect: true,
    // Reconnection settings
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    // Timeout settings
    timeout: 20000,
    // Credentials
    withCredentials: true,
    // Headers
    extraHeaders: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    },
    // Force new connection
    forceNew: true,
    // Query parameters
    query: {
      type: 'doctor',
      username: username || 'anonymous',
      version: '1.0',
      // Add a timestamp to prevent caching
      t: Date.now()
    },
    secure: window.location.protocol === 'https:',
    // Add agent for better connection handling
    agent: false,
    // Disable ping/pong for testing
    pingTimeout: 60000,
    pingInterval: 25000
  };
  
  console.log('Connecting with options:', socketOptions);
  socket = io(wsUrl, socketOptions);

  socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
    if (onConnect) onConnect(socket);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
    if (onError) onError(error);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
    if (reason === 'io server disconnect') {
      // Reconnect if server disconnects
      socket.connect();
    }
  });

  return socket;
};

const getSocket = () => socket;

const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export { connectSocket, getSocket, disconnectSocket };
