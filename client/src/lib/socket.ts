import { io, type Socket } from 'socket.io-client';

const getSocketUrl = (): string => {
    const configured = import.meta.env.VITE_API_URL as string | undefined;
    if (configured) return configured.replace(/\/$/, '');
    if (typeof window !== 'undefined') return window.location.origin;
    return 'http://localhost:4000';
};

// Singleton socket connection – shared across the entire client app
let socket: Socket | null = null;

export const getSocket = (): Socket => {
    if (!socket) {
        socket = io(getSocketUrl(), {
            reconnectionAttempts: 5,
            reconnectionDelay: 2000,
            transports: ['websocket', 'polling'],
        });

        socket.on('connect', () => {
            console.log('[Socket.io] Connected:', socket?.id);
        });
        socket.on('disconnect', (reason) => {
            console.log('[Socket.io] Disconnected:', reason);
        });
        socket.on('connect_error', (err) => {
            console.warn('[Socket.io] Connection error:', err.message);
        });
    }
    return socket;
};

export const disconnectSocket = (): void => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
