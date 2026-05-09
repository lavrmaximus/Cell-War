import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import { gameSocket } from '../services/socket';
import { useAuth } from './AuthContext';
import type { GameState, MoveAction, GameOverData } from '../types';

interface GameStateContextType {
    gameState: GameState | null;
    gameOver: GameOverData | null;
    isConnected: boolean;
    isSearching: boolean;
    error: string | null;
    joinGame: () => void;
    makeMove: (action: MoveAction) => void;
    passTurn: () => void;
    leaveGame: () => void;
    debugStart: () => void;
    dismissGameOver: () => void;
}

const GameStateContext = createContext<GameStateContextType | undefined>(undefined);

export function GameStateProvider({ children }: { children: ReactNode }) {
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [gameOver, setGameOver] = useState<GameOverData | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { user, token } = useAuth();
    const cleanupRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        // Clean up previous listeners
        if (cleanupRef.current) {
            cleanupRef.current();
            cleanupRef.current = null;
        }

        if (!user) {
            gameSocket.disconnect();
            setIsConnected(false);
            setGameState(null);
            setGameOver(null);
            setIsSearching(false);
            return;
        }

        gameSocket.connect(token ?? undefined);

        const socket = gameSocket.socket;
        if (!socket) return;

        const onConnect = () => setIsConnected(true);
        const onDisconnect = () => setIsConnected(false);
        const onGameStart = (data: { roomId: string; state: GameState }) => {
            setGameState(data.state);
            setGameOver(null);
            setIsSearching(false);
            setError(null);
        };
        const onGameState = (state: GameState) => {
            setGameState(state);
            setError(null);
        };
        const onGameOver = (data: GameOverData) => {
            setGameOver(data);
            setIsSearching(false);
        };
        const onError = (msg: string) => {
            setError(msg);
            console.error('[game]', msg);
        };

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('GAME_START', onGameStart);
        socket.on('game_state', onGameState);
        socket.on('game_over', onGameOver);
        socket.on('error', onError);
        setIsConnected(socket.connected);

        cleanupRef.current = () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('GAME_START', onGameStart);
            socket.off('game_state', onGameState);
            socket.off('game_over', onGameOver);
            socket.off('error', onError);
        };

        return cleanupRef.current;
    }, [user, token]);

    const joinGame = useCallback(() => {
        setIsSearching(true);
        setError(null);
        gameSocket.emit('FIND_MATCH');
    }, []);

    const makeMove = useCallback((action: MoveAction) => {
        gameSocket.emit('make_move', action);
    }, []);

    const passTurn = useCallback(() => {
        gameSocket.emit('end_turn');
    }, []);

    const leaveGame = useCallback(() => {
        gameSocket.emit('leave_game');
        setGameState(null);
        setGameOver(null);
        setIsSearching(false);
    }, []);

    const debugStart = useCallback(() => {
        setIsSearching(true);
        gameSocket.emit('DEBUG_START');
    }, []);

    const dismissGameOver = useCallback(() => {
        setGameOver(null);
        setGameState(null);
    }, []);

    return (
        <GameStateContext.Provider value={{
            gameState, gameOver, isConnected, isSearching, error,
            joinGame, makeMove, passTurn, leaveGame, debugStart, dismissGameOver
        }}>
            {children}
        </GameStateContext.Provider>
    );
}

export function useGameState() {
    const ctx = useContext(GameStateContext);
    if (!ctx) throw new Error('useGameState must be used within GameStateProvider');
    return ctx;
}
