import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import NeonButton from '../ui/NeonButton';
import { Wifi, Volume2, VolumeX, Home } from 'lucide-react';

const GameHUD: React.FC = () => {
  const { user, login, authCode } = useAuth();
  const [isMuted, setIsMuted] = useState(false);
  const [ping, setPing] = useState(0);

  useEffect(() => {
    // Simulate ping updates
    const interval = setInterval(() => {
      setPing(Math.floor(Math.random() * 40) + 20);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-16 bg-black/80 border-b border-cyan-900/50 backdrop-blur-sm z-50 flex items-center justify-between px-6">
      {/* Left: User Profile */}
      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={user.avatar}
                alt={user.username}
                className="w-10 h-10 rounded-full border-2 border-cyan-500"
              />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border border-black"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-cyan-400 font-bold tracking-wider">{user.username}</span>
              <span className="text-xs text-cyan-700 font-mono">ELO: {user.elo}</span>
            </div>
          </div>
        ) : authCode ? (
          <div className="flex flex-col items-start animate-pulse">
            <span className="text-[10px] text-cyan-600 font-mono uppercase tracking-widest">Security Code</span>
            <span className="text-xl text-yellow-400 font-black tracking-[0.2em] font-mono">{authCode}</span>
          </div>
        ) : (
          <NeonButton onClick={login} className="!py-2 !px-4 text-sm">
            JACK IN
          </NeonButton>
        )}
      </div>

      {/* Right: System Tray */}
      <div className="flex items-center gap-6 text-cyan-500">
        <div className="flex items-center gap-2 font-mono text-sm">
          <Wifi size={16} className={ping > 100 ? 'text-red-500' : 'text-green-500'} />
          <span>{ping}ms</span>
        </div>
        
        <button 
          onClick={() => setIsMuted(!isMuted)}
          className="hover:text-cyan-300 transition-colors"
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>

        <a href="/" className="hover:text-cyan-300 transition-colors">
          <Home size={20} />
        </a>
      </div>
    </div>
  );
};

export default GameHUD;
