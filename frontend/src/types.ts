export type CellType = 'grass' | 'water' | 'mountain' | 'hill';
export type StructureType = 'farm' | null;
export type RoomStatus = 'waiting' | 'playing' | 'finished';

export interface Cell {
    x: number;
    y: number;
    type: CellType;
    owner: string | null; // userId
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
    players: Record<string, Player>; // Serialized Map
    grid: Cell[][];
    turn: string | null;
    status: RoomStatus;
    width: number;
    height: number;
    playerOrder: string[];
}

// Events
export interface ServerToClientEvents {
    game_state: (state: GameState) => void;
    error: (message: string) => void;
    joined_room: (roomId: string) => void;
}

export interface ClientToServerEvents {
    join_game: () => void; // Request matchmaking
    set_ready: (ready: boolean) => void;
    make_move: (action: MoveAction) => void;
    DEBUG_START: () => void;
    leave_game: () => void;
}
