import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';
import api from '../services/api';

export interface User {
    id: string;
    username: string;
    avatar?: string;
    elo: number;
    role?: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    authCode: string | null;
    token: string | null;
    login: () => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEV = import.meta.env.DEV;
const TOKEN_KEY = 'cw_token';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [authCode, setAuthCode] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const stopPolling = () => {
        if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
        }
    };

    const checkAuth = async (jwt?: string) => {
        try {
            const headers = jwt ? { Authorization: `Bearer ${jwt}` } : {};
            const res = await api.get('/api/user/me', { headers });
            setUser(res.data);
        } catch {
            setUser(null);
            localStorage.removeItem(TOKEN_KEY);
            setToken(null);
        } finally {
            setIsLoading(false);
        }
    };

    // Initial auth check
    useEffect(() => {
        const saved = localStorage.getItem(TOKEN_KEY);
        if (saved) checkAuth(saved);
        else checkAuth();
    }, []);

    // Poll for external auth completion
    useEffect(() => {
        if (!authCode) return;
        stopPolling();
        pollRef.current = setInterval(async () => {
            try {
                const res = await api.post('/api/auth/complete', { code: authCode });
                const jwt = res.data?.token;
                if (jwt) {
                    localStorage.setItem(TOKEN_KEY, jwt);
                    setToken(jwt);
                }
                setAuthCode(null);
                stopPolling();
                await checkAuth(jwt);
            } catch {
                // Keep polling until success or user cancels
            }
        }, 2000);

        return stopPolling;
    }, [authCode]);

    const login = async () => {
        if (DEV) {
            // Dev mode: instant login via local backend
            try {
                const res = await api.post('/api/dev/auth', { username: 'DevPlayer' });
                const jwt = res.data?.token;
                if (jwt) {
                    localStorage.setItem(TOKEN_KEY, jwt);
                    setToken(jwt);
                    await checkAuth(jwt);
                }
            } catch (err) {
                console.error('Dev auth failed:', err);
            }
            return;
        }

        // Production: external auth flow (Telegram bot, etc.)
        try {
            const res = await api.post('/api/auth/init');
            if (res.data?.code) setAuthCode(res.data.code);
        } catch (err) {
            console.error('Auth init failed:', err);
        }
    };

    const logout = async () => {
        try { await api.post('/api/auth/logout'); } catch { /* ignore */ }
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
        setAuthCode(null);
        stopPolling();
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, authCode, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
