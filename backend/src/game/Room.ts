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

export interface SerializedRoom {
    id: string;
    players: Record<string, Player>;
    grid: Cell[][];
    turn: string | null;
    status: RoomStatus;
    width: number;
    height: number;
    playerOrder: string[];
}

export class Room {
    id: string;
    players: Map<string, Player>;
    grid: Cell[][];
    turn: string | null;
    status: RoomStatus;
    width: number = 20;
    height: number = 20;
    playerOrder: string[];
    isDebug: boolean = false;

    constructor(id: string) {
        this.id = id;
        this.players = new Map();
        this.grid = [];
        this.turn = null;
        this.status = 'waiting';
        this.playerOrder = [];
        this.initializeGrid();
    }

    private initializeGrid() {
        for (let y = 0; y < this.height; y++) {
            const row: Cell[] = [];
            for (let x = 0; x < this.width; x++) {
                let type: CellType = 'grass';
                const rand = Math.random();
                if (rand > 0.92) type = 'mountain';
                else if (rand > 0.88) type = 'water';
                else if (rand > 0.82) type = 'hill';

                row.push({ x, y, type, owner: null, structure: null, defense: 0 });
            }
            this.grid.push(row);
        }
    }

    addPlayer(userId: string): boolean {
        if (this.players.size >= 2) return false;
        if (this.players.has(userId)) return true;

        const colors = ['#22d3ee', '#f43f5e'];
        this.players.set(userId, {
            id: userId,
            color: colors[this.players.size],
            gold: 0,
            ready: false,
            farms: 0
        });
        this.playerOrder.push(userId);
        return true;
    }

    setPlayerReady(userId: string, ready: boolean) {
        const player = this.players.get(userId);
        if (player) {
            player.ready = ready;
            this.checkStart();
        }
    }

    private checkStart() {
        if (this.players.size === 2 && Array.from(this.players.values()).every(p => p.ready)) {
            this.startGame();
        }
    }

    startGame() {
        this.status = 'playing';
        this.turn = this.playerOrder[0];

        this.players.forEach(p => {
            p.gold = 10;
            p.farms = 0;
        });

        this.assignStartTerritory(this.playerOrder[0], 2, 2);
        this.assignStartTerritory(this.playerOrder[1], this.width - 3, this.height - 3);
    }

    private assignStartTerritory(userId: string, centerX: number, centerY: number) {
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                const x = centerX + dx;
                const y = centerY + dy;
                if (this.isValidCell(x, y)) {
                    const cell = this.grid[y][x];
                    if (cell.type === 'water' || cell.type === 'mountain') cell.type = 'grass';
                    cell.owner = userId;
                }
            }
        }
    }

    handleMove(userId: string, move: MoveAction): { success: boolean; message?: string } {
        if (this.status !== 'playing') return { success: false, message: 'Game not started' };
        if (this.turn !== userId) return { success: false, message: 'Not your turn' };

        const player = this.players.get(userId);
        if (!player) return { success: false, message: 'Player not found' };

        const { x, y } = move;
        if (!this.isValidCell(x, y)) return { success: false, message: 'Invalid coordinates' };

        const cell = this.grid[y][x];

        switch (move.type) {
            case 'capture': return this.handleCapture(player, cell);
            case 'build_farm': return this.handleBuildFarm(player, cell);
            case 'defend': return this.handleDefend(player, cell, move.amount ?? 1);
            default: return { success: false, message: 'Unknown move type' };
        }
    }

    private handleCapture(player: Player, cell: Cell): { success: boolean; message?: string } {
        if (cell.owner === player.id) return { success: false, message: 'Already owned' };
        if (cell.type === 'water' || cell.type === 'mountain') return { success: false, message: 'Cannot capture this terrain' };
        if (!this.isAdjacentToTerritory(player.id, cell.x, cell.y)) {
            return { success: false, message: 'Must be adjacent to your territory' };
        }

        let cost = 1;
        if (cell.owner && cell.owner !== player.id) cost = cell.defense + 1;
        if (cell.type === 'hill') cost += 1;

        if (player.gold < cost) return { success: false, message: `Not enough gold (need ${cost}g)` };

        player.gold -= cost;

        if (cell.owner && cell.owner !== player.id) {
            const enemy = this.players.get(cell.owner);
            if (enemy && cell.structure === 'farm') enemy.farms = Math.max(0, enemy.farms - 1);
            cell.structure = null;
            cell.defense = 0;
        }

        cell.owner = player.id;
        return { success: true };
    }

    private handleBuildFarm(player: Player, cell: Cell): { success: boolean; message?: string } {
        if (cell.owner !== player.id) return { success: false, message: 'Must own this cell' };
        if (cell.structure) return { success: false, message: 'Cell already has a structure' };
        if (cell.type === 'water' || cell.type === 'mountain') return { success: false, message: 'Cannot build here' };

        const cost = Math.floor(player.farms / 10) + 1;
        if (player.gold < cost) return { success: false, message: `Not enough gold (need ${cost}g)` };

        player.gold -= cost;
        cell.structure = 'farm';
        player.farms += 1;
        return { success: true };
    }

    private handleDefend(player: Player, cell: Cell, amount: number): { success: boolean; message?: string } {
        if (cell.owner !== player.id) return { success: false, message: 'Must own this cell' };

        const validAmount = Math.max(1, Math.min(9, amount));
        if (player.gold < validAmount) return { success: false, message: `Not enough gold (need ${validAmount}g)` };

        player.gold -= validAmount;
        cell.defense = Math.min(9, cell.defense + validAmount);
        return { success: true };
    }

    nextTurn() {
        if (this.status !== 'playing') return;

        const currentIndex = this.playerOrder.indexOf(this.turn!);
        const nextIndex = (currentIndex + 1) % this.playerOrder.length;
        this.turn = this.playerOrder[nextIndex];

        const nextPlayer = this.players.get(this.turn);
        if (nextPlayer) {
            nextPlayer.gold += nextPlayer.farms;
        }
    }

    checkWinCondition(): string | null {
        if (this.status !== 'playing') return null;

        const counts = new Map<string, number>();
        for (const id of this.playerOrder) counts.set(id, 0);

        for (const row of this.grid) {
            for (const cell of row) {
                if (cell.owner && counts.has(cell.owner)) {
                    counts.set(cell.owner, (counts.get(cell.owner) ?? 0) + 1);
                }
            }
        }

        for (const [id, count] of counts) {
            if (count === 0) {
                const winner = this.playerOrder.find(p => p !== id) ?? null;
                if (winner) this.status = 'finished';
                return winner;
            }
        }
        return null;
    }

    serialize(): SerializedRoom {
        const players: Record<string, Player> = {};
        this.players.forEach((p, id) => { players[id] = { ...p }; });
        return {
            id: this.id,
            players,
            grid: this.grid,
            turn: this.turn,
            status: this.status,
            width: this.width,
            height: this.height,
            playerOrder: [...this.playerOrder]
        };
    }

    private isValidCell(x: number, y: number): boolean {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }

    private isAdjacentToTerritory(userId: string, x: number, y: number): boolean {
        const dirs = [{ dx: 0, dy: 1 }, { dx: 0, dy: -1 }, { dx: 1, dy: 0 }, { dx: -1, dy: 0 }];
        for (const { dx, dy } of dirs) {
            const nx = x + dx;
            const ny = y + dy;
            if (this.isValidCell(nx, ny) && this.grid[ny][nx].owner === userId) return true;
        }
        return false;
    }
}
