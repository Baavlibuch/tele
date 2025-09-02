import { io } from 'socket.io-client';
import { ENDPOINT } from '../config';

// Get WebSocket URL with proper path
const getWebSocketUrl = (url) => {
  const baseUrl = url || 'http://localhost:3001';
  // Convert http to ws and add socket.io path
  const wsUrl = baseUrl.startsWith('http') ? 
    baseUrl.replace(/^http/, 'ws') : 
    `ws://${baseUrl}`;
  
  // Add socket.io path if not already present
  const finalUrl = wsUrl.endsWith('/socket.io') ? wsUrl : `${wsUrl}/socket.io`;
  
  console.log('WebSocket connection URL:', finalUrl);
  return finalUrl;
};

// Create a single socket connection instance
let socket;

// Socket.IO connection options
const socketOptions = {
  path: '/socket.io',
  transports: ['websocket', 'polling'],
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
  withCredentials: true,
  extraHeaders: {
    'Access-Control-Allow-Origin': '*',
  }
};

// Enable debug logging
localStorage.debug = 'socket.io-client:*';

/**
 * Initialize a socket.io connection
 * @param {string} namespace - The namespace to connect to (e.g., '/app_chat')
 * @param {Object} options - Additional socket.io options
 * @returns {Object} - The socket.io client instance
 */
export const initSocket = (namespace = '/', options = {}) => {
  if (socket?.connected) {
    console.log('Reusing existing socket connection');
    return socket;
  }

  const wsUrl = getWebSocketUrl(ENDPOINT);
  
  console.log(`Initializing socket connection to namespace: ${namespace}`);
  
  // Merge default options with provided options
  const mergedOptions = {
    ...socketOptions,
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
    // Secure flag for HTTPS
    secure: window.location.protocol === 'https:',
    // Add agent for better connection handling
    agent: false,
    // Ping settings
    pingTimeout: 60000,
    pingInterval: 25000,
    // Apply any additional options last to allow overrides
    ...options
  };

  console.log('Socket connection options:', JSON.stringify(mergedOptions, null, 2));
  
  // Build the connection URL with namespace if provided
  const url = namespace && namespace !== '/' ? `${wsUrl}${namespace}` : wsUrl;
  
  console.log(`Connecting to WebSocket at: ${url}`);
  
  // Initialize the socket with the merged options
  socket = io(url, mergedOptions);
  
  // Connection event handlers
  socket.on('connect', () => {
    console.log(`Socket connected to ${namespace} namespace`);
    console.log('Socket ID:', socket.id);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error.message);
    console.error('Error details:', error);
  });

  socket.on('disconnect', (reason) => {
    console.log(`Socket disconnected from ${namespace} namespace. Reason:`, reason);
    if (reason === 'io server disconnect') {
      // Reconnect manually if disconnected by server
      console.log('Attempting to reconnect...');
      socket.connect();
    }
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  // Handle reconnection events
  socket.on('reconnect_attempt', (attempt) => {
    console.log(`Reconnection attempt ${attempt}`);
  });

  socket.on('reconnect_error', (error) => {
    console.error('Reconnection error:', error);
  });

  socket.on('reconnect_failed', () => {
    console.error('Reconnection failed after multiple attempts');
  });

  // Manually connect after setting up all event handlers
  socket.connect();
  
  return socket;
};

export const getSocket = () => {
  if (!socket) {
    console.warn('Socket not initialized. Creating new connection...');
    return initSocket();
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
