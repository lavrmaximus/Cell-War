import React from 'react';
import { GameState, Player } from '../types/game';

interface PlayerPanelProps {
    gameState: GameState | null;
}

const PlayerPanel: React.FC<PlayerPanelProps> = ({ gameState }) => {
    if (!gameState) {
        return <div>Loading player info...</div>;
    }

    const players = Object.values(gameState.players);

    return (
        <div className="player-panel">
            <h2>Players</h2>
            {players.map(player => (
                <div key={player.id} style={{ color: player.color, border: player.id === gameState.currentPlayerId ? '2px solid gold' : 'none', padding: '5px' }}>
                    <h3>{player.name}</h3>
                    <p>Gold: {player.gold}</p>
                    <p>Income: {player.income}</p>
                </div>
            ))}
        </div>
    );
};

export default PlayerPanel;
