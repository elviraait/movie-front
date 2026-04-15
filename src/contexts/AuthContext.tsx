'use client';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getAccessToken, getUserInfo, clearAccessToken, saveUserInfo } from '@/lib/auth';
import { apiGetProfile, apiLogout } from '@/lib/api';
import type { Role } from '@/types';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  refresh: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const profile = await apiGetProfile();
      const info = { id: profile.id, name: profile.name, email: profile.email, role: profile.role };
      saveUserInfo(info);
      setUser(info);
    } catch {
      clearAccessToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try { await apiLogout(); } catch {}
    clearAccessToken();
    setUser(null);
  }, []);

  // Initial load
  useEffect(() => {
    const cached = getUserInfo();
    if (cached && getAccessToken()) {
      setUser(cached);
      setLoading(false);
    } else {
      refresh();
    }
  }, [refresh]);

  // Listen for auth changes fired by login/register pages
  useEffect(() => {
    const handler = () => refresh();
    window.addEventListener('auth-changed', handler);
    return () => window.removeEventListener('auth-changed', handler);
  }, [refresh]);

  return (
    <AuthContext.Provider value={{ user, loading, refresh, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

/** Call this after login/register to notify Navbar immediately */
export function notifyAuthChanged() {
  window.dispatchEvent(new Event('auth-changed'));
}
