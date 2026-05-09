import React from 'react';
import type { Cell } from '../../types';
import { cn } from '../../utils/cn';

interface GridTileProps {
    cell: Cell;
    isSelected: boolean;
    myPlayerId: string | null;
    onClick: () => void;
}

const GridTile: React.FC<GridTileProps> = ({ cell, isSelected, myPlayerId, onClick }) => {
    const isMine = cell.owner === myPlayerId;
    const isEnemy = !!cell.owner && !isMine;
    const impassable = cell.type === 'water' || cell.type === 'mountain';

    const base = cn(
        'relative border cursor-pointer select-none transition-all duration-75',
        // Terrain → owner layering
        cell.type === 'water' && 'bg-blue-950 border-blue-900/60',
        cell.type === 'mountain' && 'bg-stone-900 border-stone-800/60',
        cell.type === 'hill' && !cell.owner && 'bg-amber-950/50 border-amber-900/30',
        cell.type === 'grass' && !cell.owner && 'bg-zinc-900 border-zinc-800/40',
        isMine && 'bg-cyan-950 border-cyan-700/50',
        isEnemy && 'bg-rose-950 border-rose-700/50',
        // Interactivity
        impassable ? 'cursor-default' : 'hover:brightness-150',
        isSelected && 'ring-1 ring-white brightness-150 z-10',
    );

    return (
        <div className={base} onClick={impassable ? undefined : onClick}>
            {/* Farm icon */}
            {cell.structure === 'farm' && (
                <div className={cn(
                    'absolute top-0 left-0 w-2 h-2 m-[1px] rounded-[1px]',
                    isMine ? 'bg-cyan-400' : 'bg-rose-400'
                )} />
            )}

            {/* Defense badge */}
            {cell.defense > 0 && (
                <div className={cn(
                    'absolute bottom-0 right-0 text-[7px] font-bold leading-none px-[2px] py-[1px]',
                    isMine ? 'text-cyan-300' : 'text-rose-300'
                )}>
                    {cell.defense}
                </div>
            )}

            {/* Hill indicator */}
            {cell.type === 'hill' && !isMine && !isEnemy && (
                <div className="absolute inset-0 flex items-center justify-center opacity-20 text-[8px]">
                    ▲
                </div>
            )}
        </div>
    );
};

export default React.memo(GridTile);
