import React from 'react';
import { GameState, Cell as CellType } from '../types/game';
import Cell from './Cell';

interface GameBoardProps {
    gameState: GameState;
    selectedCell: CellType | null;
    onCellClick: (cell: CellType) => void;
}

const GameBoard: React.FC<GameBoardProps> = ({ gameState, selectedCell, onCellClick }) => {
    return (
        <div className="game-board" style={{ display: 'grid', gridTemplateColumns: `repeat(${gameState.cells[0].length}, 34px)` }}>
            {gameState.cells.map((row, x) => 
                row.map((cell, y) => (
                    <Cell 
                        key={`${x}-${y}`} 
                        cell={cell} 
                        isSelected={selectedCell?.x === x && selectedCell?.y === y}
                        onClick={onCellClick}
                    />
                ))
            )}
        </div>
    );
};

export default GameBoard;
