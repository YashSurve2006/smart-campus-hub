import { io } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';

let socket;

export function getSocket() {
  const token = useAuthStore.getState().token;
  if (!token) return undefined;

  if (!socket) {
    socket = io(import.meta.env.VITE_API_BASE || window.location.origin, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 8,
      reconnectionDelay: 500,
      reconnectionDelayMax: 4000,
      timeout: 10000,
    });
  } else {
    socket.auth = { token };
    if (!socket.connected) socket.connect();
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = undefined;
  }
}
