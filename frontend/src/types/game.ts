export interface Player {
    id: string;
    name: string;
    color: string;
    gold: number;
    income: number;
}

export interface Cell {
    x: number;
    y: number;
    ownerId: string | null;
    type: 'plain' | 'mountain' | 'hill' | 'water';
    building: 'farm' | null;
    defense: number;
}

export interface GameState {
    gameId: string;
    players: Record<string, Player>;
    cells: Cell[][];
    currentPlayerId: string;
    turnNumber: number;
    gameStatus: 'waiting' | 'active' | 'finished';
}
