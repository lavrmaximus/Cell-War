import React from 'react';
import { motion } from 'framer-motion';
import { useGameState } from '../../hooks/useGameState';
import { useAuth } from '../../context/AuthContext';
import { Swords, Server, Bug, Lock } from 'lucide-react';
import { cn } from '../../utils/cn';

interface Props {
    onNavigate: (screen: 'hero' | 'lobby' | 'game') => void;
}

const HeroScreen: React.FC<Props> = ({ onNavigate }) => {
    const { joinGame, debugStart, isSearching, isConnected } = useGameState();
    const { user } = useAuth();

    const handleQuickMatch = () => {
        if (!user) return;
        joinGame();
    };

    const items = [
        {
            label: isSearching ? 'SEARCHING...' : 'QUICK MATCH',
            icon: <Swords size={18} />,
            action: handleQuickMatch,
            disabled: !user || isSearching || !isConnected,
            disabledReason: !user ? 'Login required' : !isConnected ? 'Connecting...' : undefined,
        },
        {
            label: 'SERVER BROWSER',
            icon: <Server size={18} />,
            action: () => onNavigate('lobby'),
            disabled: false,
        },
    ];

    if (user?.role === 'admin') {
        items.push({
            label: 'DEBUG SIMULATION',
            icon: <Bug size={16} />,
            action: debugStart,
            disabled: isSearching || !isConnected,
            disabledReason: undefined,
        });
    }

    return (
        <div className="flex flex-col items-center justify-center h-full w-full relative overflow-hidden bg-[#030303] pt-12">
            {/* Grid background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,black_40%,transparent_100%)] pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center gap-14">
                {/* Title */}
                <div className="relative select-none">
                    <motion.h1
                        className="text-[5rem] sm:text-[8rem] font-black tracking-[0.15em] text-white relative z-10"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        CELLWAR
                    </motion.h1>
                    {/* Cyan glitch layer */}
                    <motion.h1
                        aria-hidden
                        className="text-[5rem] sm:text-[8rem] font-black tracking-[0.15em] text-cyan-500 absolute inset-0 mix-blend-screen opacity-60"
                        animate={{ x: [-2, 3, -1, 0], y: [1, -1, 0] }}
                        transition={{ repeat: Infinity, duration: 0.18, repeatType: 'mirror', repeatDelay: 4 }}
                    >
                        CELLWAR
                    </motion.h1>
                    {/* Red glitch layer */}
                    <motion.h1
                        aria-hidden
                        className="text-[5rem] sm:text-[8rem] font-black tracking-[0.15em] text-rose-500 absolute inset-0 mix-blend-screen opacity-50"
                        animate={{ x: [2, -2, 1, 0], y: [-1, 2, 0] }}
                        transition={{ repeat: Infinity, duration: 0.22, repeatType: 'mirror', repeatDelay: 5 }}
                    >
                        CELLWAR
                    </motion.h1>
                </div>

                {/* Menu */}
                <div className="flex flex-col gap-3 w-72">
                    {items.map((item, i) => (
                        <motion.button
                            key={item.label}
                            onClick={item.action}
                            disabled={item.disabled}
                            title={item.disabledReason}
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + i * 0.08 }}
                            className={cn(
                                'flex items-center gap-3 px-6 py-3.5 border-2 font-mono font-bold uppercase tracking-widest text-sm rounded-sm transition-all duration-200',
                                item.disabled
                                    ? 'border-zinc-800 text-zinc-600 cursor-not-allowed'
                                    : 'border-cyan-600/70 text-cyan-400 hover:bg-cyan-950 hover:border-cyan-400 hover:text-white hover:shadow-neon-cyan'
                            )}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                            {item.disabledReason && (
                                <Lock size={12} className="ml-auto opacity-50" />
                            )}
                        </motion.button>
                    ))}
                </div>

                {/* Login prompt */}
                {!user && (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        className="text-xs font-mono text-zinc-600 tracking-widest"
                    >
                        JACK IN via the top menu to play
                    </motion.p>
                )}
            </div>

            {/* Footer */}
            <div className="absolute bottom-6 w-full flex justify-between px-10 text-zinc-700 text-xs font-mono tracking-[0.2em] uppercase">
                <span>v0.9.3</span>
                <span className={cn('flex items-center gap-1.5', isConnected ? 'text-green-700' : 'text-red-900')}>
                    <span className={cn('w-1.5 h-1.5 rounded-full', isConnected ? 'bg-green-600 animate-pulse' : 'bg-red-900')} />
                    {isConnected ? 'ONLINE' : 'OFFLINE'}
                </span>
            </div>
        </div>
    );
};

export default HeroScreen;
