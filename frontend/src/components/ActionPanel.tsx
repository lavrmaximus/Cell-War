import React from 'react';
import { Cell, GameState } from '../types/game';

interface ActionPanelProps {
    selectedCell: Cell | null;
    gameState: GameState;
    onAction: (actionType: string) => void;
}

const ActionPanel: React.FC<ActionPanelProps> = ({ selectedCell, gameState, onAction }) => {
    if (!selectedCell) {
        return (
            <div className="action-panel">
                <h3>Actions</h3>
                <p>Select a cell to see available actions.</p>
            </div>
        );
    }

    const isOwnCell = selectedCell.ownerId === gameState.currentPlayerId;

    return (
        <div className="action-panel">
            <h3>Cell ({selectedCell.x}, {selectedCell.y})</h3>
            {isOwnCell ? (
                <div>
                    <button onClick={() => onAction('BUILD_FARM')}>Build Farm (25G)</button>
                    <button onClick={() => onAction('UPGRADE_DEFENSE')}>Upgrade Defense (15G)</button>
                </div>
            ) : (
                <button onClick={() => onAction('CAPTURE')}>Capture (10G)</button>
            )}
            <hr />
            <button onClick={() => onAction('END_TURN')}>End Turn</button>
        </div>
    );
};

export default ActionPanel;
