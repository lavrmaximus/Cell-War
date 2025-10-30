import React, { useState } from 'react';
import { Cell as CellType } from '../types/game.ts';

const GRID_SIZE = 20;

type BrushType = 'plain' | 'mountain' | 'water' | 'player1' | 'player2';

const MapEditor: React.FC = () => {
    const [brush, setBrush] = useState<BrushType>('plain');
    const [cells, setCells] = useState<CellType[][]>(() => 
        Array.from({ length: GRID_SIZE }, (_, x) => 
            Array.from({ length: GRID_SIZE }, (_, y) => ({
                x, y, type: 'plain', ownerId: null, building: null, defense: 0
            }))
        )
    );

    const handleCellClick = (x: number, y: number) => {
        const newCells = cells.map(row => [...row]);
        const targetCell = newCells[x][y];

        if (brush === 'player1') {
            targetCell.ownerId = 'player1';
            targetCell.type = 'plain'; // Player cells are always plain type
        } else if (brush === 'player2') {
            targetCell.ownerId = 'player2';
            targetCell.type = 'plain'; // Player cells are always plain type
        } else {
            targetCell.type = brush;
            targetCell.ownerId = null; // Clear owner if not a player brush
        }
        setCells(newCells);
    };

    const saveMap = () => {
        const mapData = JSON.stringify(cells, null, 2);
        const blob = new Blob([mapData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'custom-map.json';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="container mt-4">
            <h2 className="mb-4">Map Editor</h2>
            <div className="d-flex" style={{ gap: '20px' }}>
                <div className="d-flex flex-column p-3 border rounded">
                    <h3 className="mb-3">Brushes</h3>
                    <button className="btn btn-outline-primary mb-2" onClick={() => setBrush('plain')}>Plain</button>
                    <button className="btn btn-outline-primary mb-2" onClick={() => setBrush('mountain')}>Mountain</button>
                    <button className="btn btn-outline-primary mb-2" onClick={() => setBrush('water')}>Water</button>
                    <hr className="my-3" />
                    {/* Add Player Brushes */}
                    <button className="btn btn-outline-info mb-2" onClick={() => setBrush('player1')}>Player 1 Start</button>
                    <button className="btn btn-outline-danger mb-2" onClick={() => setBrush('player2')}>Player 2 Start</button>
                    <hr className="my-3" />
                    <button className="btn btn-success" onClick={saveMap}>Save Map</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${GRID_SIZE}, 32px)` }}>
                    {cells.map((row, x) => 
                        row.map((cell, y) => (
                            <div 
                                key={`${x}-${y}`}
                                onClick={() => handleCellClick(x, y)}
                                style={{
                                    width: '30px',
                                    height: '30px',
                                    border: '1px solid #ccc',
                                    backgroundColor:
                                        cell.ownerId === 'player1' ? 'lightblue' :
                                        cell.ownerId === 'player2' ? 'lightcoral' :
                                        cell.type === 'water' ? '#a0c4ff' :
                                        cell.type === 'mountain' ? '#8d99ae' :
                                        '#f8f9fa',
                                }}
                            ></div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default MapEditor;
