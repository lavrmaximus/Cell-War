import { useState, useEffect, useCallback } from 'react';
import { gameSocket } from '../services/socket';
import { useAuth } from '../context/AuthContext';
import type { GameState, MoveAction } from '../types';

export const useGameState = () => {
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [isConnected, setIsConnected] = useState(gameSocket.socket?.connected || false);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    useEffect(() => {
        const token = (user as any)?.token;
        if (token) {
            gameSocket.connect(token);
        } else {
            gameSocket.disconnect();
        }
    }, [user]);

    useEffect(() => {
        const onConnect = () => setIsConnected(true);
        const onDisconnect = () => setIsConnected(false);
        const onGameState = (state: GameState) => {
            setGameState(state);
            setError(null);
        };
        const onGameStart = (data: { roomId: string, state: any }) => {
            console.log('Game started:', data);
            setGameState(data.state);
            setError(null);
        };
        const onError = (msg: string) => setError(msg);

        // Check if socket is initialized
        if (gameSocket.socket) {
            gameSocket.socket.on('connect', onConnect);
            gameSocket.socket.on('disconnect', onDisconnect);
            gameSocket.on('game_state', onGameState);
            gameSocket.on('GAME_START', onGameStart);
            gameSocket.on('error', onError);
        }

        return () => {
            if (gameSocket.socket) {
                gameSocket.socket.off('connect', onConnect);
                gameSocket.socket.off('disconnect', onDisconnect);
                gameSocket.off('game_state', onGameState);
                gameSocket.off('GAME_START', onGameStart);
                gameSocket.off('error', onError);
            }
        };
    }, [user]); // Re-run if user changes (and thus socket might reconnect)

    const joinGame = useCallback(() => {
        gameSocket.joinQueue();
    }, []);

    const setReady = useCallback((ready: boolean) => {
        gameSocket.emit('set_ready', ready);
    }, []);

    const makeMove = useCallback((action: MoveAction) => {
        gameSocket.emit('make_move', action);
    }, []);

    const leaveGame = useCallback(() => {
        gameSocket.emit('leave_game');
        setGameState(null);
    }, []);

    return {
        gameState,
        isConnected,
        error,
        joinGame,
        setReady,
        makeMove,
        leaveGame
    };
};
