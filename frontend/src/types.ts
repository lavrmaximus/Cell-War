export type CellType = 'grass' | 'water' | 'mountain' | 'hill';
export type StructureType = 'farm' | null;
export type RoomStatus = 'waiting' | 'playing' | 'finished';

export interface Cell {
    x: number;
    y: number;
    type: CellType;
    owner: string | null;
    structure: StructureType;
    defense: number;
}

export interface Player {
    id: string;
    color: string;
    gold: number;
    ready: boolean;
    farms: number;
}

export type MoveType = 'capture' | 'build_farm' | 'defend';

export interface MoveAction {
    type: MoveType;
    x: number;
    y: number;
    amount?: number;
}

export interface GameState {
    id: string;
    players: Record<string, Player>;
    grid: Cell[][];
    turn: string | null;
    status: RoomStatus;
    width: number;
    height: number;
    playerOrder: string[];
}

export interface GameOverData {
    winner: string | null;
    reason: 'conquest' | 'surrender' | 'disconnect' | string;
}

export interface RoomInfo {
    id: string;
    host: string;
    map: string;
    players: string;
    status: string;
    latency: number;
}

export interface ServerToClientEvents {
    game_state: (state: GameState) => void;
    GAME_START: (data: { roomId: string; state: GameState }) => void;
    game_over: (data: GameOverData) => void;
    joined_room: (roomId: string) => void;
    ROOM_LIST: (rooms: RoomInfo[]) => void;
    error: (message: string) => void;
}

export interface ClientToServerEvents {
    FIND_MATCH: () => void;
    GET_ROOMS: () => void;
    DEBUG_START: () => void;
    make_move: (action: MoveAction) => void;
    end_turn: () => void;
    leave_game: () => void;
}
