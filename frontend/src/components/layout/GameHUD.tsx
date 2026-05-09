import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useGameState } from '../../hooks/useGameState';
import { Wifi, WifiOff } from 'lucide-react';

const GameHUD: React.FC = () => {
    const { user, isLoading, authCode, login, logout } = useAuth();
    const { isConnected } = useGameState();

    return (
        <div className="fixed top-0 left-0 w-full h-12 bg-black/80 border-b border-cyan-900/30 backdrop-blur-sm z-40 flex items-center justify-between px-5">
            {/* Left: brand */}
            <span className="font-mono font-black text-sm tracking-[0.3em] text-cyan-500 neon-text-cyan select-none">
                CELLWAR
            </span>

            {/* Right: auth + connection */}
            <div className="flex items-center gap-4">
                {/* Connection indicator */}
                <div className="flex items-center gap-1.5 font-mono text-xs">
                    {isConnected
                        ? <Wifi size={13} className="text-green-500" />
                        : <WifiOff size={13} className="text-zinc-600" />}
                    <span className={isConnected ? 'text-green-500' : 'text-zinc-600'}>
                        {isConnected ? 'ONLINE' : 'OFFLINE'}
                    </span>
                </div>

                {/* User section */}
                {isLoading ? null : authCode ? (
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-zinc-500 font-mono uppercase">Code:</span>
                        <span className="text-yellow-400 font-mono font-black tracking-[0.2em] animate-pulse">
                            {authCode}
                        </span>
                    </div>
                ) : user ? (
                    <div className="flex items-center gap-3">
                        {user.avatar && (
                            <img src={user.avatar} alt="" className="w-7 h-7 rounded-full border border-cyan-700/50" />
                        )}
                        <div className="flex flex-col leading-none">
                            <span className="text-cyan-400 font-mono font-bold text-xs tracking-wider">{user.username}</span>
                            <span className="text-zinc-600 font-mono text-[10px]">{user.elo} ELO</span>
                        </div>
                        <button
                            onClick={logout}
                            className="text-[10px] font-mono text-zinc-600 hover:text-zinc-400 transition-colors uppercase"
                        >
                            logout
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={login}
                        className="px-4 py-1.5 border border-cyan-700/60 text-cyan-400 font-mono font-bold text-xs uppercase tracking-widest hover:bg-cyan-950 hover:border-cyan-500 transition-colors rounded-sm"
                    >
                        JACK IN
                    </button>
                )}
            </div>
        </div>
    );
};

export default GameHUD;
