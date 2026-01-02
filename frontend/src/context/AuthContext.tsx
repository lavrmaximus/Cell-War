import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import api from '../services/api';
import { gameSocket } from '../services/socket';

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
  login: () => void;
  logout: () => void;
  authCode: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authCode, setAuthCode] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      // Try to get token if available, otherwise rely on cookies
      gameSocket.connect((user as any).token || '');
    } else {
      gameSocket.disconnect();
    }
  }, [user]);

  // Polling effect
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    if (authCode) {
      intervalId = setInterval(async () => {
        try {
          await api.post('/api/auth/complete', { code: authCode });
          // If successful
          setAuthCode(null);
          await checkAuth();
        } catch (error) {
          // Keep polling on error (assuming 4xx means not ready)
        }
      }, 2000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [authCode]);

  const checkAuth = async () => {
    try {
      const response = await api.get('/api/user/me');
      setUser(response.data);
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async () => {
    try {
      const response = await api.post('/api/auth/init');
      if (response.data && response.data.code) {
        setAuthCode(response.data.code);
      }
    } catch (error) {
      console.error('Login init failed', error);
    }
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout failed', error);
    }
    setUser(null);
    setAuthCode(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, authCode }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
