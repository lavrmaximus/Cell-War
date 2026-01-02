import { Room } from './Room';
import { v4 as uuidv4 } from 'uuid';
import { Socket } from 'socket.io';
import { isAdmin } from '../middleware/auth';

export class GameManager {
    private rooms: Map<string, Room>;

    constructor() {
        this.rooms = new Map();
    }

    handleConnection(socket: Socket) {
        socket.on('DEBUG_START', () => {
            this.createDebugMatch(socket);
        });
    }

    createDebugMatch(socket: Socket) {
        if (!isAdmin(socket)) {
            socket.emit('error', { message: 'Unauthorized: Admin only' });
            return;
        }

        const userId = socket.data.user.userId;
        // Create room with admin as host
        const roomId = this.createRoom(userId);
        const room = this.rooms.get(roomId);

        if (room) {
            room.isDebug = true;
            // Add bot as Player 2
            // Using 'DEBUG_BOT' as ID to match Room logic
            room.addPlayer('DEBUG_BOT');

            // Auto-ready both players to start game
            room.setPlayerReady(userId, true);
            room.setPlayerReady('DEBUG_BOT', true);

            // Notify the admin that match is created
            socket.emit('debug_match_created', { roomId });
            
            // If the game started, we might want to emit game state
            if (room.status === 'playing') {
                socket.emit('game_start', {
                    roomId,
                    state: {
                        grid: room.grid,
                        players: Array.from(room.players.values()),
                        turn: room.turn
                    }
                });
            }
        }
    }

    createRoom(hostId: string): string {
        const roomId = uuidv4();
        const room = new Room(roomId);
        room.addPlayer(hostId);
        this.rooms.set(roomId, room);
        return roomId;
    }

    joinRoom(roomId: string, userId: string): boolean {
        const room = this.rooms.get(roomId);
        if (!room) return false;
        return room.addPlayer(userId);
    }

    findMatch(userId: string): string {
        // Find a room with 1 player that is waiting
        for (const room of this.rooms.values()) {
            if (room.status === 'waiting' && room.players.size < 2) {
                // Check if player is already in the room to avoid self-match (though addPlayer handles duplicates)
                if (!room.players.has(userId)) {
                    if (room.addPlayer(userId)) {
                        return room.id;
                    }
                }
            }
        }

        // If no room found, create one
        return this.createRoom(userId);
    }

    getRoom(roomId: string): Room | undefined {
        return this.rooms.get(roomId);
    }

    // Helper to clean up empty rooms or finished games
    removeRoom(roomId: string) {
        this.rooms.delete(roomId);
    }
}
