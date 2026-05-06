import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);

  // Listen for forced logout from axios interceptor
  useEffect(() => {
    const handleLogout = () => clearSession();
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  const login = useCallback(async (credentials) => {
    setLoading(true);
    try {
      const data = await authService.login(credentials);
      const tokenValue = data.token;

      // Decode JWT payload to extract user info (base64)
      const payload = JSON.parse(atob(tokenValue.split('.')[1]));
      const userData = {
        username: payload.sub,
        roles: payload.scope ? payload.scope.split(' ') : [],
        expiryTime: data.expiryTime,
      };

      localStorage.setItem('token', tokenValue);
      localStorage.setItem('user', JSON.stringify(userData));
      setToken(tokenValue);
      setUser(userData);
      return { success: true };
    } catch (error) {
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (userData) => {
    setLoading(true);
    try {
      await authService.register(userData);
      return { success: true };
    } catch (error) {
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      if (token) await authService.logout(token);
    } catch {
      // Ignore logout errors, still clear session
    } finally {
      clearSession();
    }
  }, [token, clearSession]);

  const isAdmin = user?.roles?.includes('ROLE_ADMIN');
  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ user, token, loading, isAuthenticated, isAdmin, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
