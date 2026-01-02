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
    farms: number; // Track number of farms for cost calculation
}

export type MoveType = 'capture' | 'build_farm' | 'defend';

export interface MoveAction {
    type: MoveType;
    x: number;
    y: number;
    amount?: number; // For defend
}

export class Room {
    id: string;
    players: Map<string, Player>;
    grid: Cell[][];
    turn: string | null; // current player userId
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
                // Simple map generation: mostly grass, some random features
                let type: CellType = 'grass';
                const rand = Math.random();
                if (rand > 0.9) type = 'mountain';
                else if (rand > 0.85) type = 'water';
                else if (rand > 0.8) type = 'hill';

                row.push({
                    x,
                    y,
                    type,
                    owner: null,
                    structure: null,
                    defense: 0
                });
            }
            this.grid.push(row);
        }
    }

    addPlayer(userId: string): boolean {
        if (this.players.size >= 2) return false; // Max 2 players for now
        if (this.players.has(userId)) return true;

        const colors = ['#FF0000', '#0000FF'];
        const color = colors[this.players.size];

        this.players.set(userId, {
            id: userId,
            color,
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

        // Initialize players
        this.players.forEach(p => {
            p.gold = 10;
            p.farms = 0;
        });

        // Assign starting territories (3x3)
        // Player 1: Top-Left (2,2 center)
        this.assignStartTerritory(this.playerOrder[0], 2, 2);

        // Player 2: Bottom-Right (width-3, height-3 center)
        this.assignStartTerritory(this.playerOrder[1], this.width - 3, this.height - 3);
    }

    private assignStartTerritory(userId: string, centerX: number, centerY: number) {
        for (let y = centerY - 1; y <= centerY + 1; y++) {
            for (let x = centerX - 1; x <= centerX + 1; x++) {
                if (this.isValidCell(x, y)) {
                    const cell = this.grid[y][x];
                    // Force cell to be habitable for start
                    if (cell.type === 'water' || cell.type === 'mountain') {
                        cell.type = 'grass';
                    }
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
            case 'capture':
                return this.handleCapture(player, cell);
            case 'build_farm':
                return this.handleBuildFarm(player, cell);
            case 'defend':
                return this.handleDefend(player, cell, move.amount || 0);
            default:
                return { success: false, message: 'Unknown move type' };
        }
    }

    private handleCapture(player: Player, cell: Cell): { success: boolean; message?: string } {
        if (cell.owner === player.id) return { success: false, message: 'Already owned' };
        if (cell.type === 'water' || cell.type === 'mountain') return { success: false, message: 'Cannot capture this terrain' };

        // Check adjacency
        if (!this.isAdjacentToTerritory(player.id, cell.x, cell.y)) {
            return { success: false, message: 'Must be adjacent to your territory' };
        }

        let cost = 1;
        if (cell.owner && cell.owner !== player.id) {
            cost = cell.defense + 1;
        }
        if (cell.type === 'hill') {
            cost += 1;
        }

        if (player.gold < cost) return { success: false, message: 'Not enough gold' };

        player.gold -= cost;
        
        // If capturing enemy territory, remove their farm/defense
        if (cell.owner && cell.owner !== player.id) {
             const enemy = this.players.get(cell.owner);
             if (enemy && cell.structure === 'farm') {
                 enemy.farms = Math.max(0, enemy.farms - 1);
             }
             cell.structure = null;
             cell.defense = 0;
        }

        cell.owner = player.id;
        return { success: true };
    }

    private handleBuildFarm(player: Player, cell: Cell): { success: boolean; message?: string } {
        if (cell.owner !== player.id) return { success: false, message: 'Must own territory' };
        if (cell.structure) return { success: false, message: 'Structure already exists' };
        
        // Cost calculation based on total farms
        // 1-10: 1g, 11-20: 2g, etc.
        // Formula: Math.floor((currentFarms) / 10) + 1
        const cost = Math.floor(player.farms / 10) + 1;

        if (player.gold < cost) return { success: false, message: `Not enough gold. Cost: ${cost}` };

        player.gold -= cost;
        cell.structure = 'farm';
        player.farms += 1;

        return { success: true };
    }

    private handleDefend(player: Player, cell: Cell, amount: number): { success: boolean; message?: string } {
        if (cell.owner !== player.id) return { success: false, message: 'Must own territory' };
        if (cell.structure === 'farm') return { success: false, message: 'Cannot defend farm (must be empty)' }; // Based on interpretation
        if (amount < 1 || amount > 9) return { success: false, message: 'Amount must be 1-9' };

        if (player.gold < amount) return { success: false, message: 'Not enough gold' };

        player.gold -= amount;
        cell.defense += amount; // Add to existing defense? Rules say "Invest any amount". Assuming additive.

        return { success: true };
    }

    nextTurn() {
        if (this.status !== 'playing') return;

        const currentIndex = this.playerOrder.indexOf(this.turn!);
        const nextIndex = (currentIndex + 1) % this.playerOrder.length;
        this.turn = this.playerOrder[nextIndex];

        // Income Phase
        const nextPlayer = this.players.get(this.turn);
        if (nextPlayer) {
            nextPlayer.gold += nextPlayer.farms;
        }

        // Bot Logic
        if (this.turn === 'DEBUG_BOT') {
            setTimeout(() => {
                this.nextTurn();
            }, 500);
        }

        // TODO: Connectivity Check
    }

    private isValidCell(x: number, y: number): boolean {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }

    private isAdjacentToTerritory(userId: string, x: number, y: number): boolean {
        const directions = [
            { dx: 0, dy: 1 },
            { dx: 0, dy: -1 },
            { dx: 1, dy: 0 },
            { dx: -1, dy: 0 }
        ];

        for (const dir of directions) {
            const nx = x + dir.dx;
            const ny = y + dir.dy;
            if (this.isValidCell(nx, ny)) {
                if (this.grid[ny][nx].owner === userId) {
                    return true;
                }
            }
        }
        return false;
    }
}
