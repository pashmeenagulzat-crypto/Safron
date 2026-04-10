import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { User } from '../types';
import { logout as apiLogout } from '../utils/api';

interface AuthCtx {
  user: User | null;
  setUser: (u: User | null) => void;
  isLoggedIn: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx>({
  user: null, setUser: () => {}, isLoggedIn: false, logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(() => {
    try { return JSON.parse(localStorage.getItem('safron_user') ?? 'null'); }
    catch { return null; }
  });

  const setUser = useCallback((u: User | null) => {
    setUserState(u);
    if (u) localStorage.setItem('safron_user', JSON.stringify(u));
    else localStorage.removeItem('safron_user');
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
  }, [setUser]);

  return (
    <AuthContext.Provider value={{ user, setUser, isLoggedIn: !!user, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() { return useContext(AuthContext); }
