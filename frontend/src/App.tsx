import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import { GameStateProvider, useGameState } from './context/GameStateContext';
import GameHUD from './components/layout/GameHUD';
import HeroScreen from './components/screens/HeroScreen';
import LobbyBrowser from './components/screens/LobbyBrowser';
import GameArena from './components/game/GameArena';
import GameOverScreen from './components/screens/GameOverScreen';

type View = 'hero' | 'lobby' | 'game';

function AppContent() {
    const [view, setView] = useState<View>('hero');
    const { gameState, gameOver, dismissGameOver } = useGameState();

    useEffect(() => {
        if (gameState) setView('game');
        else if (view === 'game' && !gameOver) setView('hero');
    }, [gameState]);

    const handleGameOverDismiss = () => {
        dismissGameOver();
        setView('hero');
    };

    return (
        <div className="h-full w-full bg-[#030303] text-white overflow-hidden">
            {view !== 'game' && <GameHUD />}

            <AnimatePresence mode="wait">
                {view === 'hero' && (
                    <motion.div key="hero" {...fade} className="absolute inset-0">
                        <HeroScreen onNavigate={setView} />
                    </motion.div>
                )}
                {view === 'lobby' && (
                    <motion.div key="lobby" {...fade} className="absolute inset-0">
                        <LobbyBrowser onBack={() => setView('hero')} />
                    </motion.div>
                )}
                {view === 'game' && (
                    <motion.div key="game" {...fade} className="absolute inset-0">
                        <GameArena onLeave={() => setView('hero')} />
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {gameOver && (
                    <GameOverScreen data={gameOver} onDismiss={handleGameOverDismiss} />
                )}
            </AnimatePresence>
        </div>
    );
}

const fade = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 },
};

export default function App() {
    return (
        <AuthProvider>
            <GameStateProvider>
                <AppContent />
            </GameStateProvider>
        </AuthProvider>
    );
}
