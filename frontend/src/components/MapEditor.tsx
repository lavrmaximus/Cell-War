import React, { useState } from 'react';
import { Cell as CellType } from '../types/game';

const GRID_SIZE = 20;

type BrushType = 'plain' | 'mountain' | 'water';

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
        newCells[x][y].type = brush;
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
        <div>
            <h2>Map Editor</h2>
            <div style={{ display: 'flex', gap: '20px' }}>
                <div>
                    <h3>Brushes</h3>
                    <button onClick={() => setBrush('plain')}>Plain</button>
                    <button onClick={() => setBrush('mountain')}>Mountain</button>
                    <button onClick={() => setBrush('water')}>Water</button>
                    <hr />
                    <button onClick={saveMap}>Save Map</button>
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
                                    backgroundColor: cell.type === 'water' ? '#a0c4ff' : cell.type === 'mountain' ? '#8d99ae' : '#f8f9fa',
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
