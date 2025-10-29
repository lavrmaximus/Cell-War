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
            <div className="action-panel">
                <h3>Actions</h3>
                <p>Select a cell to see available actions.</p>
                <hr />
                <button onClick={() => onAction('END_TURN')}>End Turn</button>
            </div>
        );
    }

    const isOwnCell = selectedCell.ownerId === gameState.currentPlayerId;
    const canUpgradeDefense = isOwnCell && !selectedCell.building;

    return (
        <div className="action-panel">
            <h3>Cell ({selectedCell.x}, {selectedCell.y})</h3>
            
            {isOwnCell && !selectedCell.building && (
                <button onClick={() => onAction('BUILD_FARM')}>Build Farm</button>
            )}

            {canUpgradeDefense && (
                 <div style={{ marginTop: '10px' }}>
                    <input 
                        type="number" 
                        value={defenseAmount}
                        onChange={handleDefenseAmountChange}
                        min="1"
                        max="9"
                        style={{ width: '50px', marginRight: '10px' }}
                    />
                    <button onClick={() => onAction('UPGRADE_DEFENSE', { amount: defenseAmount })}>
                        Add Defense
                    </button>
                </div>
            )}

            {!isOwnCell && selectedCell.type !== 'mountain' && selectedCell.type !== 'water' && (
                <button onClick={() => onAction('CAPTURE')}>Capture</button>
            )}
            
            <hr />
            <button onClick={() => onAction('END_TURN')}>End Turn</button>
            <div style={{ marginTop: '20px', fontSize: '0.8em', color: '#aaa' }}>
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
