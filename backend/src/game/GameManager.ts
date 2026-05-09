import { Room } from './Room';
import type { MoveAction } from './Room';
import { v4 as uuidv4 } from 'uuid';
import { Socket, Server } from 'socket.io';
import { isAdmin } from '../middleware/auth';

export class GameManager {
    private rooms: Map<string, Room> = new Map();
    private playerRooms: Map<string, string> = new Map(); // userId → roomId
    private activeSockets: Map<string, string> = new Map(); // userId → socketId
    private io: Server;

    constructor(io: Server) {
        this.io = io;
    }

    handleConnection(socket: Socket) {
        const userId = socket.data.user?.userId;
        if (!userId) return;

        // Register this socket as the active one for this user
        this.activeSockets.set(userId, socket.id);

        socket.on('FIND_MATCH', () => this.handleFindMatch(socket));
        socket.on('GET_ROOMS', () => this.handleGetRooms(socket));
        socket.on('DEBUG_START', () => this.handleDebugStart(socket));
        socket.on('make_move', (action: MoveAction) => this.handleMove(socket, action));
        socket.on('end_turn', () => this.handleEndTurn(socket));
        socket.on('leave_game', () => this.handleLeaveGame(socket));
        socket.on('disconnect', () => this.handleDisconnect(socket));
    }

    private handleFindMatch(socket: Socket) {
        const userId = socket.data.user.userId;

        // Reconnect to existing game if still active
        const existingRoomId = this.playerRooms.get(userId);
        if (existingRoomId) {
            const room = this.rooms.get(existingRoomId);
            if (room && room.status === 'playing') {
                socket.join(existingRoomId);
                socket.emit('GAME_START', { roomId: existingRoomId, state: room.serialize() });
                return;
            }
        }

        const roomId = this.findOrCreateRoom(userId);
        socket.join(roomId);
        this.playerRooms.set(userId, roomId);

        const room = this.rooms.get(roomId)!;

        if (room.players.size === 2) {
            const [p1, p2] = Array.from(room.players.keys());
            room.setPlayerReady(p1, true);
            room.setPlayerReady(p2, true);

            if (room.status === 'playing') {
                this.io.to(roomId).emit('GAME_START', { roomId, state: room.serialize() });
            }
        } else {
            socket.emit('joined_room', roomId);
        }
    }

    private handleGetRooms(socket: Socket) {
        const rooms = Array.from(this.rooms.values())
            .filter(r => r.status === 'waiting')
            .map(r => ({
                id: r.id,
                host: Array.from(r.players.keys())[0] || 'Unknown',
                map: '20×20',
                players: `${r.players.size}/2`,
                status: r.status.toUpperCase(),
                latency: Math.floor(Math.random() * 50) + 10
            }));
        socket.emit('ROOM_LIST', rooms);
    }

    private handleDebugStart(socket: Socket) {
        if (!isAdmin(socket)) {
            socket.emit('error', 'Admin only');
            return;
        }

        const userId = socket.data.user.userId;
        const roomId = uuidv4();
        const room = new Room(roomId);
        room.isDebug = true;
        room.addPlayer(userId);
        room.addPlayer('DEBUG_BOT');
        room.setPlayerReady(userId, true);
        room.setPlayerReady('DEBUG_BOT', true);

        this.rooms.set(roomId, room);
        this.playerRooms.set(userId, roomId);
        socket.join(roomId);

        if (room.status === 'playing') {
            socket.emit('GAME_START', { roomId, state: room.serialize() });
        }
    }

    private handleMove(socket: Socket, action: MoveAction) {
        const userId = socket.data.user.userId;
        const room = this.findRoomByPlayer(userId);

        if (!room) {
            socket.emit('error', 'Not in a game');
            return;
        }

        const result = room.handleMove(userId, action);
        if (!result.success) {
            socket.emit('error', result.message ?? 'Move failed');
            return;
        }

        this.advanceTurn(room);
    }

    private handleEndTurn(socket: Socket) {
        const userId = socket.data.user.userId;
        const room = this.findRoomByPlayer(userId);

        if (!room || room.turn !== userId || room.status !== 'playing') return;

        this.advanceTurn(room);
    }

    private advanceTurn(room: Room) {
        const winner = room.checkWinCondition();
        if (winner) {
            room.status = 'finished';
            this.io.to(room.id).emit('game_state', room.serialize());
            this.io.to(room.id).emit('game_over', { winner, reason: 'conquest' });
            this.cleanupRoom(room.id);
            return;
        }

        room.nextTurn();
        this.io.to(room.id).emit('game_state', room.serialize());

        if (room.turn === 'DEBUG_BOT' && room.status === 'playing') {
            setTimeout(() => {
                if (room.status !== 'playing') return;
                room.nextTurn();
                this.io.to(room.id).emit('game_state', room.serialize());
            }, 1000);
        }
    }

    private handleLeaveGame(socket: Socket) {
        const userId = socket.data.user.userId;
        this.playerLeft(userId, 'surrender');
    }

    private handleDisconnect(socket: Socket) {
        const userId = socket.data.user?.userId;
        if (!userId) return;
        // Only act if this was the most recent socket for this user
        if (this.activeSockets.get(userId) === socket.id) {
            this.activeSockets.delete(userId);
            this.playerLeft(userId, 'disconnect');
        }
    }

    private playerLeft(userId: string, reason: string) {
        const roomId = this.playerRooms.get(userId);
        if (!roomId) return;

        const room = this.rooms.get(roomId);
        if (room) {
            if (room.status === 'playing') {
                const winner = Array.from(room.players.keys()).find(id => id !== userId) ?? null;
                room.status = 'finished';
                this.io.to(roomId).emit('game_over', { winner, reason });
            }
            // Clean up all players from this room
            for (const id of room.players.keys()) this.playerRooms.delete(id);
        }

        this.playerRooms.delete(userId);
        this.rooms.delete(roomId);
    }

    private cleanupRoom(roomId: string) {
        const room = this.rooms.get(roomId);
        if (!room) return;
        for (const id of room.players.keys()) this.playerRooms.delete(id);
        this.rooms.delete(roomId);
    }

    private findOrCreateRoom(userId: string): string {
        for (const room of this.rooms.values()) {
            if (room.status === 'waiting' && room.players.size < 2 && !room.players.has(userId)) {
                room.addPlayer(userId);
                return room.id;
            }
        }
        const roomId = uuidv4();
        const room = new Room(roomId);
        room.addPlayer(userId);
        this.rooms.set(roomId, room);
        return roomId;
    }

    private findRoomByPlayer(userId: string): Room | undefined {
        const roomId = this.playerRooms.get(userId);
        return roomId ? this.rooms.get(roomId) : undefined;
    }
}
