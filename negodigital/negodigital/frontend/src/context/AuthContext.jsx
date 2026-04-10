import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('negodigital_token'));
  const [loading, setLoading] = useState(true);

  // Load user on mount if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await authAPI.getMe();
        setUser(res.data);
      } catch {
        localStorage.removeItem('negodigital_token');
        localStorage.removeItem('negodigital_user');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [token]);

  const login = useCallback(async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { user: userData, token: newToken } = res.data;
    localStorage.setItem('negodigital_token', newToken);
    localStorage.setItem('negodigital_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    return userData;
  }, []);

  const register = useCallback(async (formData) => {
    const res = await authAPI.register(formData);
    const { user: userData, token: newToken } = res.data;
    localStorage.setItem('negodigital_token', newToken);
    localStorage.setItem('negodigital_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('negodigital_token');
    localStorage.removeItem('negodigital_user');
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback(async (data) => {
    const res = await authAPI.updateProfile(data);
    setUser(res.data);
    return res.data;
  }, []);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isOwner: user?.role === 'owner',
    isScout: user?.role === 'scout',
    isCreator: user?.role === 'creator',
    isAgency: user?.role === 'agency',
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
