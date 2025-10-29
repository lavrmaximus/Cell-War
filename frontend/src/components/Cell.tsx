import React, { useState, useEffect, useRef } from 'react';
import { Cell as CellType } from '../types/game.ts';

interface CellProps {
    cell: CellType;
    isSelected: boolean;
    onClick: (cell: CellType) => void;
}

const Cell: React.FC<CellProps> = ({ cell, isSelected, onClick }) => {
    const [isCaptured, setIsCaptured] = useState(false);
    const prevOwnerId = useRef(cell.ownerId);

    useEffect(() => {
        if (prevOwnerId.current !== cell.ownerId && cell.ownerId !== null) {
            setIsCaptured(true);
            const timer = setTimeout(() => setIsCaptured(false), 500);
            return () => clearTimeout(timer);
        }
        prevOwnerId.current = cell.ownerId;
    }, [cell.ownerId]);

    const getBackgroundColor = () => {
        if (cell.type === 'water') return '#a0c4ff'; // Water
        if (cell.type === 'mountain') return '#8d99ae'; // Mountain

        if (cell.ownerId === 'player1') return '#cce5ff'; // Player 1 color
        if (cell.ownerId === 'player2') return '#ffcdd2'; // Player 2 color
        
        return '#f8f9fa'; // Neutral plain
    };

    const style: React.CSSProperties = {
        border: isSelected ? '2px solid #00ffff' : '1px solid #dee2e6',
        width: '30px',
        height: '30px',
        backgroundColor: getBackgroundColor(),
        cursor: 'pointer',
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '1.2em',
    };

    const buildingStyle: React.CSSProperties = {
        width: '15px',
        height: '15px',
        backgroundColor: '#9c6644', // Farm color
        position: 'absolute',
    };

    return (
        <div className={`cell ${isCaptured ? 'cell-captured' : ''}`} style={style} onClick={() => onClick(cell)}>
            {cell.building === 'farm' && <div style={buildingStyle}></div>}
            {cell.defense > 0 && <span style={{ position: 'absolute', bottom: 0, right: 2, fontSize: '0.8em', fontWeight: 'bold' }}>{cell.defense}</span>}
        </div>
    );
};

export default Cell;
