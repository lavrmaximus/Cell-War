import React, { useState, useMemo } from 'react';
import { useGameState } from '../../hooks/useGameState';
import { useAuth } from '../../context/AuthContext';
import GridTile from './GridTile';
import type { Cell, MoveType, Player } from '../../types';
import { cn } from '../../utils/cn';
import { Sword, Wheat, Shield, SkipForward, LogOut, Zap, Clock } from 'lucide-react';

interface GameArenaProps {
    onLeave: () => void;
}

const GameArena: React.FC<GameArenaProps> = ({ onLeave }) => {
    const { gameState, makeMove, passTurn, leaveGame } = useGameState();
    const { user } = useAuth();
    const [selectedCell, setSelectedCell] = useState<Cell | null>(null);

    const myId = user?.id ?? '';
    const enemyId = useMemo(
        () => gameState?.playerOrder.find(id => id !== myId) ?? '',
        [gameState, myId]
    );

    const myPlayer: Player | null = gameState?.players[myId] ?? null;
    const enemyPlayer: Player | null = gameState?.players[enemyId] ?? null;
    const isMyTurn = gameState?.turn === myId;

    const captureCost = useMemo(() => {
        if (!selectedCell) return 0;
        let cost = 1;
        if (selectedCell.owner && selectedCell.owner !== myId) cost = selectedCell.defense + 1;
        if (selectedCell.type === 'hill') cost += 1;
        return cost;
    }, [selectedCell, myId]);

    const farmCost = myPlayer ? Math.floor(myPlayer.farms / 10) + 1 : 1;

    const canCapture = useMemo(() => {
        if (!selectedCell || !isMyTurn) return false;
        if (selectedCell.owner === myId) return false;
        if (selectedCell.type === 'water' || selectedCell.type === 'mountain') return false;
        return (myPlayer?.gold ?? 0) >= captureCost;
    }, [selectedCell, isMyTurn, myId, myPlayer, captureCost]);

    const canFarm = useMemo(() => {
        if (!selectedCell || !isMyTurn) return false;
        if (selectedCell.owner !== myId) return false;
        if (selectedCell.structure !== null) return false;
        if (selectedCell.type === 'water' || selectedCell.type === 'mountain') return false;
        return (myPlayer?.gold ?? 0) >= farmCost;
    }, [selectedCell, isMyTurn, myId, myPlayer, farmCost]);

    const canDefend = useMemo(() => {
        if (!selectedCell || !isMyTurn) return false;
        if (selectedCell.owner !== myId) return false;
        return (myPlayer?.gold ?? 0) >= 1;
    }, [selectedCell, isMyTurn, myId, myPlayer]);

    const handleAction = (type: MoveType) => {
        if (!selectedCell) return;
        makeMove({ type, x: selectedCell.x, y: selectedCell.y, amount: type === 'defend' ? 1 : undefined });
        setSelectedCell(null);
    };

    const handleLeave = () => {
        leaveGame();
        onLeave();
    };

    const terryCounts = useMemo(() => {
        if (!gameState) return { my: 0, enemy: 0 };
        let my = 0, enemy = 0;
        for (const row of gameState.grid) {
            for (const cell of row) {
                if (cell.owner === myId) my++;
                else if (cell.owner === enemyId) enemy++;
            }
        }
        return { my, enemy };
    }, [gameState, myId, enemyId]);

    if (!gameState) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-cyan-400 font-mono animate-pulse">Loading game...</div>
            </div>
        );
    }

    const selectedIsImpassable = selectedCell?.type === 'water' || selectedCell?.type === 'mountain';

    return (
        <div className="flex flex-col h-full">
            {/* ── Header ── */}
            <header className="flex items-center justify-between px-4 h-14 bg-black/60 border-b border-cyan-900/30 flex-shrink-0">
                {/* My info */}
                <PlayerInfo
                    player={myPlayer}
                    label={user?.username ?? 'You'}
                    territory={terryCounts.my}
                    accent="cyan"
                    isMe
                />

                {/* Turn indicator */}
                <div className={cn(
                    'flex items-center gap-2 px-4 py-1 rounded border font-mono text-sm font-bold tracking-widest',
                    isMyTurn
                        ? 'border-cyan-500/60 text-cyan-300 bg-cyan-950/60'
                        : 'border-rose-900/50 text-rose-400/70 bg-rose-950/30'
                )}>
                    {isMyTurn ? <Zap size={14} /> : <Clock size={14} />}
                    {isMyTurn ? 'YOUR TURN' : 'WAITING'}
                </div>

                {/* Enemy info */}
                <PlayerInfo
                    player={enemyPlayer}
                    label={enemyId === 'DEBUG_BOT' ? 'BOT' : enemyId.slice(0, 8)}
                    territory={terryCounts.enemy}
                    accent="rose"
                />
            </header>

            {/* ── Main ── */}
            <div className="flex flex-1 overflow-hidden">
                {/* Grid area */}
                <div className="flex-1 flex items-center justify-center p-3 overflow-hidden">
                    <div
                        className="grid gap-px bg-black"
                        style={{
                            gridTemplateColumns: `repeat(${gameState.width}, 1fr)`,
                            width: `min(calc(100vw - 280px - 1.5rem), calc(100vh - 3.5rem - 1.5rem))`,
                            aspectRatio: '1 / 1',
                        }}
                    >
                        {gameState.grid.flat().map(cell => (
                            <GridTile
                                key={`${cell.x}-${cell.y}`}
                                cell={cell}
                                isSelected={selectedCell?.x === cell.x && selectedCell?.y === cell.y}
                                myPlayerId={myId}
                                onClick={() => setSelectedCell(prev =>
                                    prev?.x === cell.x && prev?.y === cell.y ? null : cell
                                )}
                            />
                        ))}
                    </div>
                </div>

                {/* ── Sidebar ── */}
                <aside className="w-64 flex flex-col border-l border-cyan-900/30 bg-black/30 flex-shrink-0 overflow-y-auto scrollbar-thin">
                    {/* Selected cell info */}
                    <div className="p-3 border-b border-cyan-900/20">
                        <div className="text-[10px] text-cyan-700 uppercase tracking-widest mb-1">Selected</div>
                        {selectedCell ? (
                            <div className="font-mono text-xs space-y-0.5">
                                <div className="text-white">
                                    [{selectedCell.x}, {selectedCell.y}]&nbsp;
                                    <span className={cn(
                                        'uppercase',
                                        selectedCell.type === 'water' && 'text-blue-400',
                                        selectedCell.type === 'mountain' && 'text-stone-400',
                                        selectedCell.type === 'hill' && 'text-amber-400',
                                        selectedCell.type === 'grass' && 'text-emerald-400',
                                    )}>{selectedCell.type}</span>
                                </div>
                                <div className="text-zinc-400">
                                    Owner:&nbsp;
                                    {!selectedCell.owner
                                        ? <span className="text-zinc-500">neutral</span>
                                        : selectedCell.owner === myId
                                            ? <span className="text-cyan-400">you</span>
                                            : <span className="text-rose-400">enemy</span>}
                                </div>
                                {selectedCell.defense > 0 && (
                                    <div className="text-zinc-400">Defense: <span className="text-white">{selectedCell.defense}</span></div>
                                )}
                                {selectedCell.structure && (
                                    <div className="text-zinc-400">Structure: <span className="text-emerald-400">{selectedCell.structure}</span></div>
                                )}
                            </div>
                        ) : (
                            <div className="text-zinc-600 text-xs font-mono">click a tile</div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="p-3 flex flex-col gap-2 border-b border-cyan-900/20">
                        <div className="text-[10px] text-cyan-700 uppercase tracking-widest mb-1">Actions</div>

                        <ActionButton
                            icon={<Sword size={14} />}
                            label="CAPTURE"
                            cost={captureCost}
                            unit="g"
                            disabled={!canCapture}
                            disabledReason={
                                !selectedCell ? 'select a tile'
                                : selectedCell.owner === myId ? 'already yours'
                                : selectedIsImpassable ? 'impassable'
                                : !isMyTurn ? 'not your turn'
                                : 'not enough gold'
                            }
                            onClick={() => handleAction('capture')}
                            accent="cyan"
                        />

                        <ActionButton
                            icon={<Wheat size={14} />}
                            label="BUILD FARM"
                            cost={farmCost}
                            unit="g"
                            disabled={!canFarm}
                            disabledReason={
                                !selectedCell ? 'select a tile'
                                : selectedCell.owner !== myId ? 'not your tile'
                                : selectedCell.structure ? 'already has structure'
                                : !isMyTurn ? 'not your turn'
                                : 'not enough gold'
                            }
                            onClick={() => handleAction('build_farm')}
                            accent="emerald"
                        />

                        <ActionButton
                            icon={<Shield size={14} />}
                            label="DEFEND +1"
                            cost={1}
                            unit="g"
                            disabled={!canDefend}
                            disabledReason={
                                !selectedCell ? 'select a tile'
                                : selectedCell.owner !== myId ? 'not your tile'
                                : !isMyTurn ? 'not your turn'
                                : 'not enough gold'
                            }
                            onClick={() => handleAction('defend')}
                            accent="amber"
                        />
                    </div>

                    {/* Turn controls */}
                    <div className="p-3 flex flex-col gap-2">
                        <button
                            onClick={passTurn}
                            disabled={!isMyTurn}
                            className={cn(
                                'flex items-center gap-2 w-full px-3 py-2 rounded border text-xs font-mono font-bold tracking-wider transition-colors',
                                isMyTurn
                                    ? 'border-zinc-600 text-zinc-300 hover:border-zinc-400 hover:text-white'
                                    : 'border-zinc-800 text-zinc-700 cursor-not-allowed'
                            )}
                        >
                            <SkipForward size={13} />
                            PASS TURN
                        </button>

                        <button
                            onClick={handleLeave}
                            className="flex items-center gap-2 w-full px-3 py-2 rounded border border-rose-900/50 text-rose-500/70 hover:border-rose-600 hover:text-rose-400 text-xs font-mono font-bold tracking-wider transition-colors"
                        >
                            <LogOut size={13} />
                            LEAVE GAME
                        </button>
                    </div>

                    {/* Legend */}
                    <div className="mt-auto p-3 border-t border-cyan-900/20">
                        <div className="text-[9px] text-zinc-700 uppercase tracking-widest mb-2">Legend</div>
                        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] font-mono text-zinc-500">
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-cyan-950 border border-cyan-700/50 rounded-[1px]" />
                                <span>yours</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-rose-950 border border-rose-700/50 rounded-[1px]" />
                                <span>enemy</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-cyan-400 rounded-[1px]" />
                                <span>farm</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-amber-950 border border-amber-900/40 rounded-[1px]" />
                                <span>hill +1g</span>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

/* ─── Sub-components ─── */

function PlayerInfo({
    player, label, territory, accent, isMe
}: {
    player: Player | null;
    label: string;
    territory: number;
    accent: 'cyan' | 'rose';
    isMe?: boolean;
}) {
    const color = accent === 'cyan' ? 'text-cyan-400' : 'text-rose-400';
    const dim = accent === 'cyan' ? 'text-cyan-700' : 'text-rose-800';
    return (
        <div className={cn('flex flex-col font-mono text-xs', !isMe && 'items-end')}>
            <span className={cn('font-bold tracking-wider', color)}>{label}</span>
            <span className="text-zinc-400">
                💰 <span className="text-white">{player?.gold ?? '—'}g</span>
                &nbsp;·&nbsp;
                🌾 <span className="text-white">{player?.farms ?? '—'}</span>
                &nbsp;·&nbsp;
                <span className={dim}>{territory} cells</span>
            </span>
        </div>
    );
}

function ActionButton({
    icon, label, cost, unit, disabled, disabledReason, onClick, accent
}: {
    icon: React.ReactNode;
    label: string;
    cost: number;
    unit: string;
    disabled: boolean;
    disabledReason?: string;
    onClick: () => void;
    accent: 'cyan' | 'emerald' | 'amber';
}) {
    const colors = {
        cyan: 'border-cyan-700/60 text-cyan-300 hover:bg-cyan-950/60 hover:border-cyan-500',
        emerald: 'border-emerald-800/50 text-emerald-400 hover:bg-emerald-950/60 hover:border-emerald-600',
        amber: 'border-amber-800/50 text-amber-400 hover:bg-amber-950/60 hover:border-amber-600',
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            title={disabled ? disabledReason : undefined}
            className={cn(
                'flex items-center justify-between w-full px-3 py-2 rounded border text-xs font-mono font-bold tracking-wider transition-all',
                disabled
                    ? 'border-zinc-800 text-zinc-700 cursor-not-allowed'
                    : colors[accent]
            )}
        >
            <span className="flex items-center gap-1.5">
                {icon}
                {label}
            </span>
            <span className={disabled ? 'text-zinc-700' : 'opacity-70'}>
                {cost}{unit}
            </span>
        </button>
    );
}

export default GameArena;
