// frontend/src/context/AuthContext.jsx
// ──────────────────────────────────────────────────────────
// Global authentication state. Wraps the app so any component
// can read the current user, call login/logout, etc.
// ──────────────────────────────────────────────────────────

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/apiServices';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(() => localStorage.getItem('tfp_token'));
  const [loading, setLoading] = useState(true); // initial hydration

  // ── Hydrate user from stored token on mount ────────────
  useEffect(() => {
    const hydrate = async () => {
      if (!token) { setLoading(false); return; }
      try {
        const { data } = await authService.getMe();
        setUser(data.user);
      } catch {
        // Token invalid / expired — clear storage
        localStorage.removeItem('tfp_token');
        localStorage.removeItem('tfp_user');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    hydrate();
  }, []); // run once on mount

  // ── Persist token and user ─────────────────────────────
  const persist = (tkn, usr) => {
    localStorage.setItem('tfp_token', tkn);
    localStorage.setItem('tfp_user', JSON.stringify(usr));
    setToken(tkn);
    setUser(usr);
  };

  const register = useCallback(async (formData) => {
    const { data } = await authService.register(formData);
    persist(data.token, data.user);
    toast.success(`Welcome, ${data.user.name}! 🎉`);
    return data;
  }, []);

  const login = useCallback(async (formData) => {
    const { data } = await authService.login(formData);
    persist(data.token, data.user);
    toast.success(`Welcome back, ${data.user.name}!`);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try { await authService.logout(); } catch { /* ignore */ }
    localStorage.removeItem('tfp_token');
    localStorage.removeItem('tfp_user');
    setToken(null);
    setUser(null);
    toast.success('Logged out');
  }, []);

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('tfp_user', JSON.stringify(updatedUser));
  }, []);

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, token, loading, register, login, logout, updateUser, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
