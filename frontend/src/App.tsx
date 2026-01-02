import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import GameHUD from './components/layout/GameHUD';
import HeroScreen from './components/screens/HeroScreen';
import LobbyBrowser from './components/screens/LobbyBrowser';
import GameArena from './components/game/GameArena';
import { useGameState } from './hooks/useGameState';

function AppContent() {
  const [view, setView] = useState<'hero' | 'lobby' | 'game'>('hero');
  const { gameState } = useGameState();

  useEffect(() => {
    if (gameState) {
      setView('game');
    } else if (view === 'game') {
      // If game ends or state is cleared, go back to hero
      setView('hero');
    }
  }, [gameState]);

  return (
      <div className="min-h-screen w-full bg-[#050505] text-white overflow-hidden font-sans">
        <GameHUD />
        
        <AnimatePresence mode="wait">
          {view === 'hero' && (
            <motion.div
              key="hero"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0"
            >
              <HeroScreen onNavigate={(screen) => setView(screen as any)} />
            </motion.div>
          )}
          
          {view === 'lobby' && (
            <motion.div
              key="lobby"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0"
            >
              <LobbyBrowser onBack={() => setView('hero')} />
            </motion.div>
          )}

          {view === 'game' && (
            <motion.div
              key="game"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <GameArena />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
