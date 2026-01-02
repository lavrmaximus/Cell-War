import React, { useState } from 'react';
import { motion } from 'framer-motion';
import NeonButton from '../ui/NeonButton';
import { useGameState } from '../../hooks/useGameState';
import { useAuth } from '../../context/AuthContext';
import { gameSocket } from '../../services/socket';

interface HeroScreenProps {
  onNavigate: (screen: string) => void;
}

const HeroScreen: React.FC<HeroScreenProps> = ({ onNavigate }) => {
  const { joinGame } = useGameState();
  const { user } = useAuth();
  const [isSearching, setIsSearching] = useState(false);

  const handleQuickMatch = () => {
    setIsSearching(true);
    joinGame();
  };

  const menuItems = [
    { label: isSearching ? 'SEARCHING...' : 'QUICK MATCH', action: handleQuickMatch, disabled: isSearching },
    { label: 'SERVER BROWSER', action: () => onNavigate('lobby'), disabled: isSearching },
    // { label: 'TRAINING', action: () => console.log('Training'), disabled: isSearching },
  ];

  if (user?.role === 'admin') {
    menuItems.push({
      label: '🛠 DEBUG SIMULATION',
      action: () => gameSocket.emit('DEBUG_START'),
      disabled: false
    });
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen w-full relative overflow-hidden bg-[#050505]">
      {/* Background Grid Effect */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      
      <div className="z-10 flex flex-col items-center gap-12">
        <div className="relative mb-8">
          <motion.h1 
            className="text-7xl md:text-9xl font-black tracking-widest text-white relative z-10 select-none"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            CELLWAR
          </motion.h1>
          
          {/* Glitch Layers */}
          <motion.h1 
            className="text-7xl md:text-9xl font-black tracking-widest text-cyan-500 absolute top-0 left-0 -z-10 select-none opacity-50 mix-blend-screen"
            animate={{ 
              x: [-2, 3, -1, 2, 0],
              y: [1, -2, 0, 1, 0],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 0.2,
              repeatType: "mirror",
              repeatDelay: 3
            }}
          >
            CELLWAR
          </motion.h1>
          <motion.h1 
            className="text-7xl md:text-9xl font-black tracking-widest text-red-500 absolute top-0 left-0 -z-10 select-none opacity-50 mix-blend-screen"
            animate={{ 
              x: [2, -3, 1, -2, 0],
              y: [-1, 2, 0, -1, 0],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 0.25,
              repeatType: "mirror",
              repeatDelay: 3.5
            }}
          >
            CELLWAR
          </motion.h1>
        </div>

        <div className="flex flex-col gap-6 w-64">
          {menuItems.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
            >
              <NeonButton
                onClick={item.action}
                className={`w-full ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={item.disabled}
              >
                {item.label}
              </NeonButton>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-8 w-full flex justify-between px-12 text-gray-500 text-xs md:text-sm tracking-[0.2em] uppercase">
        <span>v0.9.2 BETA</span>
        <span>System Status: <span className="text-green-500 animate-pulse">ONLINE</span></span>
      </div>
    </div>
  );
};

export default HeroScreen;
