import { io, Socket } from 'socket.io-client';
import type { ServerToClientEvents, ClientToServerEvents } from '../types';

const URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class GameSocketService {
    private static instance: GameSocketService;
    public socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

    private constructor() {}

    public static getInstance(): GameSocketService {
        if (!GameSocketService.instance) {
            GameSocketService.instance = new GameSocketService();
        }
        return GameSocketService.instance;
    }

    public connect(token?: string) {
        console.log('Connecting to socket...', URL);
        if (this.socket?.connected) return;

        const auth = token ? { token: `Bearer ${token}` } : undefined;

        this.socket = io(URL, {
            auth,
            transports: ['websocket'],
            withCredentials: true
        });

        this.socket.on('connect', () => {
            console.log('Connected to game server');
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from game server');
        });

        this.socket.on('connect_error', (err) => {
            console.error("SOCKET ERROR DETAILS:", err.message);
        });
    }

    public disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    public joinQueue() {
        this.emit('FIND_MATCH');
    }

    public debugStart() {
        this.emit('DEBUG_START');
    }

    public getRooms() {
        this.emit('GET_ROOMS');
    }

    public emit<T extends keyof ClientToServerEvents>(event: T, ...args: Parameters<ClientToServerEvents[T]>) {
        if (this.socket) {
            this.socket.emit(event, ...args);
        }
    }

    public on<T extends keyof ServerToClientEvents>(event: T, callback: ServerToClientEvents[T]) {
        if (this.socket) {
            // @ts-ignore: socket.io types are tricky with generics
            this.socket.on(event, callback);
        }
    }

    public off<T extends keyof ServerToClientEvents>(event: T, callback: ServerToClientEvents[T]) {
        if (this.socket) {
            // @ts-ignore: socket.io types are tricky with generics
            this.socket.off(event, callback);
        }
    }
}

export const gameSocket = GameSocketService.getInstance();
