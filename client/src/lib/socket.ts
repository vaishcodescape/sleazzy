import { io, Socket } from 'socket.io-client';
import { SOCKET_EVENTS } from './socketEvents';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

class SocketService {
    private socket: Socket | null = null;
    private connectionPromise: Promise<void> | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;

    connect() {
        if (this.socket?.connected) return Promise.resolve();
        if (this.connectionPromise) return this.connectionPromise;

        this.connectionPromise = new Promise((resolve, reject) => {
            this.socket = io(SOCKET_URL, {
                reconnectionAttempts: this.maxReconnectAttempts,
                timeout: 10000,
            });

            this.socket.on('connect', () => {
                console.log('[Socket.io] Connected');
                this.reconnectAttempts = 0;
                resolve();
            });

            this.socket.on('connect_error', (error) => {
                console.warn('[Socket.io] Connection error:', error.message);
                this.reconnectAttempts++;
                if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                    reject(error);
                }
            });
        });

        return this.connectionPromise;
    }

    joinAdmin() {
        this.socket?.emit('join:admin');
    }

    joinClub(clubId: string) {
        this.socket?.emit('join:club', clubId);
    }

    on(event: string, callback: (...args: any[]) => void) {
        this.socket?.on(event, callback);
    }

    off(event: string, callback?: (...args: any[]) => void) {
        this.socket?.off(event, callback);
    }

    getSocketInstance() {
        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
        this.connectionPromise = null;
    }
}

export const socketService = new SocketService();

export const getSocket = () => {
    const existing = socketService.getSocketInstance();
    if (existing) return existing;

    // Lazily initialize the singleton so callers can subscribe immediately.
    void socketService.connect().catch((error) => {
        console.warn('[Socket.io] Initial lazy connect failed:', error);
    });

    return socketService.getSocketInstance();
};

export { SOCKET_EVENTS };
