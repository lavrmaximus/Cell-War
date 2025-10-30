import React from 'react';
import { Cell as CellType } from '../types/game.ts';

interface CellProps {
    cell: CellType;
    isSelected: boolean;
    onClick: (cell: CellType) => void;
}

// Mapping cell types to their sprite files in the public folder
const terrainSpriteMap: { [key: string]: string } = {
    plain: '/sprites/Grass.png',
    mountain: '/sprites/Mountain.png',
    hill: '/sprites/Hill.png',
    water: '/sprites/Water.png',
};

const buildingSpriteMap: { [key: string]: string } = {
    farm: '/sprites/Farm.png',
};

// Player colors with 30% opacity
const playerColorMap: { [key: string]: string } = {
    player1: 'rgba(219, 50, 77, 0.3)', // #db324d
    player2: 'rgba(87, 98, 213, 0.3)', // #5762d5
};

const Cell: React.FC<CellProps> = ({ cell, isSelected, onClick }) => {

    const containerStyle: React.CSSProperties = {
        border: '1px solid var(--grid-color)', // Consistent border
        width: '32px',
        height: '32px',
        cursor: 'pointer',
        position: 'relative',
        boxSizing: 'border-box',
        outline: isSelected ? '2px solid var(--secondary-color)' : 'none', // Use outline for selection
        outlineOffset: '-1px', // Draw outline just inside the border
    };

    const spriteStyle: React.CSSProperties = {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    };

    const overlayStyle: React.CSSProperties = {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: cell.ownerId ? playerColorMap[cell.ownerId] : 'transparent',
        transition: 'background-color 0.3s ease',
    };

    const defenseStyle: React.CSSProperties = {
        position: 'absolute',
        bottom: 1,
        right: 3,
        fontSize: '0.8em',
        fontWeight: 'bold',
        color: '#fff',
        textShadow: '1px 1px 2px black',
    };

    return (
        <div style={containerStyle} onClick={() => onClick(cell)}>
            {/* Base Terrain Sprite */}
            <img src={terrainSpriteMap[cell.type] || terrainSpriteMap.plain} style={spriteStyle} alt={cell.type} />

            {/* Player Color Overlay */}
            <div style={overlayStyle}></div>

            {/* Building Sprite (e.g., Farm) */}
            {cell.building && buildingSpriteMap[cell.building] && (
                <img src={buildingSpriteMap[cell.building]} style={spriteStyle} alt={cell.building} />
            )}

            {/* Defense Value */}
            {cell.defense > 0 && <span style={defenseStyle}>{cell.defense}</span>}
        </div>
    );
};

export default Cell;
