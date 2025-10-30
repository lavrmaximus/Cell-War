import React from 'react';
import { GameState, Player } from '../types/game.ts';

interface PlayerPanelProps {
    gameState: GameState | null;
}

const PlayerPanel: React.FC<PlayerPanelProps> = ({ gameState }) => {
    if (!gameState) {
        return <div>Loading player info...</div>;
    }

    const players = Object.values(gameState.players);

    return (
        <div className="player-panel card mb-3">
            <h2 className="card-title">Players</h2>
            {players.map(player => (
                <div key={player.id} className="card-body mb-2" style={{ color: player.color, border: player.id === gameState.currentPlayerId ? '2px solid gold' : 'none', padding: '5px' }}>
                    <h3 className="card-subtitle mb-2">{player.name}</h3>
                    <p className="card-text">Gold: {player.gold}</p>
                    <p className="card-text">Income: {player.income}</p>
                </div>
            ))}
        </div>
    );
};

export default PlayerPanel;
