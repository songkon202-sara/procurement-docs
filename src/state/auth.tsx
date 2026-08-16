import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import type { AuthUser } from '../types';
import { loadJSON, loadString, removeItem, saveJSON, saveString, STORAGE_KEYS } from '../lib/persistence';
import { api, setAuthToken, setUnauthorizedHandler } from '../lib/api';

interface AuthState {
  token: string | null;
  user: AuthUser | null;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function initAuth(): AuthState {
  const token = loadString(STORAGE_KEYS.authToken);
  const user = token ? loadJSON<AuthUser>(STORAGE_KEYS.authUser) : null;
  if (token) setAuthToken(token);
  return { token, user };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(initAuth);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post<{ token: string; user: AuthUser }>('/auth/login', { email, password });
    setAuthToken(res.token);
    saveString(STORAGE_KEYS.authToken, res.token);
    saveJSON(STORAGE_KEYS.authUser, res.user);
    setState({ token: res.token, user: res.user });
  }, []);

  const logout = useCallback(() => {
    setAuthToken(null);
    removeItem(STORAGE_KEYS.authToken);
    removeItem(STORAGE_KEYS.authUser);
    setState({ token: null, user: null });
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  return <AuthContext.Provider value={{ ...state, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
