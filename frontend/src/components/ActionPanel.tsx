import React, { useState } from 'react';
import { Cell, GameState } from '../types/game.ts';

interface ActionPanelProps {
    selectedCell: Cell | null;
    gameState: GameState;
    onAction: (actionType: string, options?: { amount?: number }) => void;
}

const ActionPanel: React.FC<ActionPanelProps> = ({ selectedCell, gameState, onAction }) => {
    const [defenseAmount, setDefenseAmount] = useState(1);

    const handleDefenseAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const amount = parseInt(e.target.value, 10);
        if (amount >= 1 && amount <= 9) {
            setDefenseAmount(amount);
        }
    };

    if (!selectedCell) {
        return (
            <div className="action-panel card p-3">
                <h3 className="card-title">Actions</h3>
                <p className="card-text">Select a cell to see available actions.</p>
                <hr className="my-4" />
                <button className="btn btn-secondary" onClick={() => onAction('END_TURN')}>End Turn</button>
            </div>
        );
    }

    const isOwnCell = selectedCell.ownerId === gameState.currentPlayerId;
    const canUpgradeDefense = isOwnCell && !selectedCell.building;

    return (
        <div className="action-panel card p-3">
            <h3 className="card-title">Cell ({selectedCell.x}, {selectedCell.y})</h3>
            
            {isOwnCell && !selectedCell.building && (
                <button className="btn btn-primary mb-2" onClick={() => onAction('BUILD_FARM')}>Build Farm</button>
            )}

            {canUpgradeDefense && (
                 <div className="mb-2">
                    <input 
                        type="number" 
                        value={defenseAmount}
                        onChange={handleDefenseAmountChange}
                        min="1"
                        max="9"
                        className="form-control d-inline-block w-auto me-2"
                    />
                    <button className="btn btn-primary" onClick={() => onAction('UPGRADE_DEFENSE', { amount: defenseAmount })}>
                        Add Defense
                    </button>
                </div>
            )}

            {!isOwnCell && selectedCell.type !== 'mountain' && selectedCell.type !== 'water' && (
                <button className="btn btn-primary mb-2" onClick={() => onAction('CAPTURE')}>Capture</button>
            )}
            
            <hr className="my-4" />
            <button className="btn btn-secondary" onClick={() => onAction('END_TURN')}>End Turn</button>
            <div className="mt-4 text-muted small">
                <h4>Hotkeys:</h4>
                <p>Q: Capture</p>
                <p>W: Build Farm</p>
                <p>E: Upgrade Defense</p>
                <p>R: End Turn</p>
            </div>
        </div>
    );
};

export default ActionPanel;
