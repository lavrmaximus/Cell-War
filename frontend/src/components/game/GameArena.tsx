import React, { useState, useMemo } from 'react';
import { useGameState } from '../../hooks/useGameState';
import { useAuth } from '../../context/AuthContext';
import GridTile from './GridTile';
import ActionPanel from './ActionPanel';
import type { Cell, MoveType } from '../../types';
import { gameSocket } from '../../services/socket';

const GameArena: React.FC = () => {
    const { gameState, makeMove, leaveGame } = useGameState();
    const { user } = useAuth();
    const [selectedTile, setSelectedTile] = useState<Cell | null>(null);

    // Determine my player ID
    const myPlayerId = user?.id || gameSocket.socket?.id || null;
    
    const myPlayer = useMemo(() => {
        if (!gameState || !myPlayerId) return null;
        // gameState.players is an object/map
        // If it's serialized from Map, it might be an object in JSON
        // The type definition says Record<string, Player>
        return gameState.players[myPlayerId];
    }, [gameState, myPlayerId]);

    const myGold = myPlayer?.gold || 0;

    const calculateCaptureCost = (cell: Cell | null) => {
        if (!cell) return 0;
        let cost = 1;
        if (cell.owner && cell.owner !== myPlayerId) {
            cost += cell.defense;
        }
        if (cell.type === 'hill') {
            cost += 1;
        }
        return cost;
    };

    const captureCost = calculateCaptureCost(selectedTile);
    const farmCost = myPlayer ? Math.floor(myPlayer.farms / 10) + 1 : 1;
    const defendCost = 1; // Default increment

    const handleAction = (type: MoveType) => {
        if (!selectedTile) return;
        
        // For defend, we need an amount. Default to 1.
        const amount = type === 'defend' ? 1 : undefined;

        makeMove({
            type,
            x: selectedTile.x,
            y: selectedTile.y,
            amount
        });
    };

    if (!gameState) return <div className="text-white">Loading Game...</div>;

    return (
        <div className="relative w-full h-full flex items-center justify-center bg-[#050505] overflow-hidden">
             {/* Grid Container */}
             <div 
                className="grid gap-0.5 p-2 bg-black/50 border border-cyan-900/30 rounded-lg backdrop-blur-sm shadow-[0_0_50px_rgba(6,182,212,0.1)]"
                style={{
                    gridTemplateColumns: `repeat(${gameState.width}, minmax(0, 1fr))`,
                    width: 'min(90vw, 80vh)',
                    aspectRatio: `${gameState.width}/${gameState.height}`
                }}
             >
                {gameState.grid.flat().map((cell) => (
                    <GridTile
                        key={`${cell.x}-${cell.y}`}
                        cell={cell}
                        isSelected={selectedTile?.x === cell.x && selectedTile?.y === cell.y}
                        onClick={() => setSelectedTile(cell)}
                        isMyTurn={gameState.turn === myPlayerId}
                        myPlayerId={myPlayerId}
                    />
                ))}
             </div>

             <ActionPanel
                selectedTile={selectedTile}
                onAction={handleAction}
                onExit={leaveGame}
                myPlayerId={myPlayerId}
                gold={myGold}
                costs={{
                    capture: captureCost,
                    farm: farmCost,
                    defend: defendCost
                }}
             />
        </div>
    );
};

export default GameArena;
