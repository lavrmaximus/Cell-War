import React from 'react';
import { motion } from 'framer-motion';
import type { GameOverData } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Trophy, Skull } from 'lucide-react';

interface Props {
    data: GameOverData;
    onDismiss: () => void;
}

const reasonLabels: Record<string, string> = {
    conquest: 'Territory conquered',
    surrender: 'Opponent surrendered',
    disconnect: 'Opponent disconnected',
};

const GameOverScreen: React.FC<Props> = ({ data, onDismiss }) => {
    const { user } = useAuth();
    const isWinner = data.winner === user?.id;
    const isDraw = !data.winner;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        >
            <motion.div
                initial={{ scale: 0.85, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.85, y: 20 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                className="flex flex-col items-center gap-6 p-10 bg-[#080808] border border-cyan-900/40 rounded-lg max-w-sm w-full mx-4"
            >
                {isDraw ? (
                    <div className="text-4xl font-black tracking-widest text-zinc-400 font-mono">DRAW</div>
                ) : isWinner ? (
                    <>
                        <Trophy size={48} className="text-yellow-400" />
                        <div className="text-4xl font-black tracking-widest text-cyan-300 font-mono neon-text-cyan">
                            VICTORY
                        </div>
                    </>
                ) : (
                    <>
                        <Skull size={48} className="text-rose-500" />
                        <div className="text-4xl font-black tracking-widest text-rose-400 font-mono">
                            DEFEAT
                        </div>
                    </>
                )}

                <div className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
                    {data.reason ? (reasonLabels[data.reason] ?? data.reason) : ''}
                </div>

                <button
                    onClick={onDismiss}
                    className="mt-2 px-8 py-3 border-2 border-cyan-600 text-cyan-400 font-mono font-bold uppercase tracking-widest hover:bg-cyan-950 hover:text-white transition-colors rounded-sm"
                >
                    RETURN TO MENU
                </button>
            </motion.div>
        </motion.div>
    );
};

export default GameOverScreen;
