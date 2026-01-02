import React from 'react';
import NeonButton from '../ui/NeonButton';
import type { Cell, MoveType } from '../../types';
import { Sword, Wheat, Shield, LogOut } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ActionPanelProps {
    selectedTile: Cell | null;
    onAction: (type: MoveType) => void;
    onExit?: () => void;
    myPlayerId: string | null;
    gold: number;
    costs: {
        capture: number;
        farm: number;
        defend: number;
    };
}

const ActionPanel: React.FC<ActionPanelProps> = ({ selectedTile, onAction, onExit, myPlayerId, gold, costs }) => {
    if (!selectedTile) {
        return (
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex gap-4">
                <div className="bg-black/80 border border-cyan-900/50 p-4 rounded-lg backdrop-blur-sm text-cyan-500/50 font-mono text-sm pointer-events-none select-none">
                    SELECT A TILE TO ACT
                </div>
                {onExit && (
                    <NeonButton
                        onClick={onExit}
                        className="border-red-900 text-red-500 hover:bg-red-900/20 hover:text-red-400"
                    >
                        <LogOut size={20} />
                    </NeonButton>
                )}
            </div>
        );
    }

    const isMine = selectedTile.owner === myPlayerId;
    
    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex gap-4 bg-black/80 border border-cyan-900/50 p-4 rounded-lg backdrop-blur-sm z-50">
            {/* Attack / Capture */}
            <NeonButton 
                onClick={() => onAction('capture')}
                disabled={isMine || gold < costs.capture}
                className={cn(
                    "flex flex-col items-center gap-1 min-w-[100px]",
                    (isMine || gold < costs.capture) && "opacity-50 cursor-not-allowed grayscale"
                )}
            >
                <Sword size={20} />
                <span className="text-xs">ATTACK</span>
                <span className="text-[10px] opacity-70">{costs.capture}g</span>
            </NeonButton>

            {/* Build Farm */}
            <NeonButton 
                onClick={() => onAction('build_farm')}
                disabled={!isMine || selectedTile.structure !== null || gold < costs.farm}
                className={cn(
                    "flex flex-col items-center gap-1 min-w-[100px]",
                    (!isMine || selectedTile.structure !== null || gold < costs.farm) && "opacity-50 cursor-not-allowed grayscale"
                )}
            >
                <Wheat size={20} />
                <span className="text-xs">FARM</span>
                <span className="text-[10px] opacity-70">{costs.farm}g</span>
            </NeonButton>

            {/* Fortify */}
            <NeonButton
                onClick={() => onAction('defend')}
                disabled={!isMine || gold < costs.defend}
                className={cn(
                    "flex flex-col items-center gap-1 min-w-[100px]",
                    (!isMine || gold < costs.defend) && "opacity-50 cursor-not-allowed grayscale"
                )}
            >
                <Shield size={20} />
                <span className="text-xs">DEFEND</span>
                <span className="text-[10px] opacity-70">{costs.defend}g</span>
            </NeonButton>

            {/* Exit Button */}
            {onExit && (
                <NeonButton
                    onClick={onExit}
                    className="flex flex-col items-center gap-1 min-w-[60px] border-red-900 text-red-500 hover:bg-red-900/20 hover:text-red-400 ml-4"
                >
                    <LogOut size={20} />
                    <span className="text-xs">EXIT</span>
                </NeonButton>
            )}
        </div>
    );
};

export default ActionPanel;
