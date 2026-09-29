import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('nexus_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    const res = await authService.login(email, password);
    const { token, user: userData } = res.data;
    localStorage.setItem('nexus_token', token);
    localStorage.setItem('nexus_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('nexus_token');
    localStorage.removeItem('nexus_user');
    setUser(null);
  };

  /** Replace the stored session user after a profile edit (token is unchanged). */
  const updateUser = (userData) => {
    localStorage.setItem('nexus_user', JSON.stringify(userData));
    setUser(userData);
  };

  const isAuthenticated = !!user;
  const hasRole = (...roles) => user && roles.includes(user.role);

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading, isAuthenticated, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
