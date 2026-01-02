import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Wheat, Mountain, Waves, Tent } from 'lucide-react';
import type { Cell } from '../../types';
import { cn } from '../../utils/cn';

interface GridTileProps {
    cell: Cell;
    isSelected: boolean;
    onClick: () => void;
    isMyTurn: boolean;
    myPlayerId: string | null;
}

const GridTile: React.FC<GridTileProps> = ({ cell, isSelected, onClick, isMyTurn, myPlayerId }) => {
    const isMine = cell.owner === myPlayerId;
    const isEnemy = cell.owner && !isMine;
    const isNeutral = !cell.owner;

    // Base styles based on terrain
    const getTerrainStyle = () => {
        switch (cell.type) {
            case 'water': return 'bg-blue-900/30 border-blue-800/50';
            case 'mountain': return 'bg-stone-800/50 border-stone-700/50';
            case 'hill': return 'bg-amber-900/30 border-amber-800/50';
            case 'grass': default: return 'bg-emerald-900/20 border-emerald-800/30';
        }
    };

    // Owner overlay styles
    const getOwnerStyle = () => {
        if (isMine) return 'shadow-[inset_0_0_20px_rgba(6,182,212,0.3)] border-cyan-500/50';
        if (isEnemy) return 'shadow-[inset_0_0_20px_rgba(236,72,153,0.3)] border-pink-500/50';
        return '';
    };

    return (
        <motion.div
            whileHover={{ scale: 0.95 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClick}
            className={cn(
                "relative w-full h-full aspect-square border flex items-center justify-center cursor-pointer transition-all duration-300",
                getTerrainStyle(),
                getOwnerStyle(),
                isSelected && "ring-2 ring-white shadow-[0_0_15px_rgba(255,255,255,0.5)] z-10",
                !isSelected && "hover:brightness-125"
            )}
        >
            {/* Terrain Icon (Faint background) */}
            <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                {cell.type === 'mountain' && <Mountain size={24} />}
                {cell.type === 'water' && <Waves size={24} />}
                {cell.type === 'hill' && <Tent size={20} />} 
            </div>

            {/* Structure / Defense */}
            <div className="relative z-10 flex flex-col items-center gap-1">
                {cell.structure === 'farm' && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={cn(
                            "p-1 rounded-full",
                            isMine ? "text-cyan-300 bg-cyan-900/50" : isEnemy ? "text-pink-300 bg-pink-900/50" : "text-gray-300"
                        )}
                    >
                        <Wheat size={20} />
                    </motion.div>
                )}
                
                {cell.defense > 0 && (
                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex items-center gap-0.5 text-[10px] font-bold text-white bg-black/50 px-1 rounded"
                    >
                        <Shield size={10} className={isMine ? "text-cyan-400" : "text-pink-400"} />
                        <span>{cell.defense}</span>
                    </motion.div>
                )}
            </div>

            {/* Selection Indicator */}
            {isSelected && (
                <motion.div
                    layoutId="selection-ring"
                    className="absolute inset-0 border-2 border-white/50 rounded-sm"
                    transition={{ duration: 0.2 }}
                />
            )}
        </motion.div>
    );
};

export default GridTile;
