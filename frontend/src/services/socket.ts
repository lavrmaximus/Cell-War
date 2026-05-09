import { io, Socket } from 'socket.io-client';
import type { ServerToClientEvents, ClientToServerEvents } from '../types';

type GameSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

// In production (served by backend), connect to same origin.
// In dev, Vite proxy forwards /socket.io → localhost:3000.
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || '';

class GameSocketService {
    private static instance: GameSocketService;
    public socket: GameSocket | null = null;

    private constructor() {}

    static getInstance(): GameSocketService {
        if (!GameSocketService.instance) GameSocketService.instance = new GameSocketService();
        return GameSocketService.instance;
    }

    connect(token?: string) {
        // If already connected with same auth, skip
        if (this.socket?.connected) return;

        // Disconnect stale socket before creating a new one
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }

        const auth: Record<string, string> = {};
        if (token) auth.token = token;

        this.socket = io(SOCKET_URL, {
            auth,
            withCredentials: true,
            transports: ['websocket', 'polling']
        });

        this.socket.on('connect', () => console.log('[socket] connected', this.socket?.id));
        this.socket.on('disconnect', (reason) => console.log('[socket] disconnected', reason));
        this.socket.on('connect_error', (err) => console.error('[socket] error', err.message));
    }

    disconnect() {
        this.socket?.disconnect();
        this.socket = null;
    }

    emit<E extends keyof ClientToServerEvents>(
        event: E,
        ...args: Parameters<ClientToServerEvents[E]>
    ) {
        this.socket?.emit(event, ...args);
    }
}

export const gameSocket = GameSocketService.getInstance();
