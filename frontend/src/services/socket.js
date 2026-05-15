import { io } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';

let socket = null;

const SOCKET_URL =
  import.meta.env.VITE_API_BASE ||
  'http://localhost:5000';

export function getSocket() {
  const token = useAuthStore.getState().token;

  if (!token) {
    return null;
  }

  if (!socket) {
    socket = io(SOCKET_URL, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      auth: {
        token,
      },
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 15000,
      forceNew: false,
    });

    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('⚠️ Socket disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message);
    });
  } else {
    socket.auth = { token };

    if (!socket.connected) {
      socket.connect();
    }
  }

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}