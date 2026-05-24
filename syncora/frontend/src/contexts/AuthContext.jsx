import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('syncora_user') || 'null'); }
    catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem('syncora_token'));

  useEffect(() => {
    if (token) localStorage.setItem('syncora_token', token);
    else localStorage.removeItem('syncora_token');
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem('syncora_user', JSON.stringify(user));
    else localStorage.removeItem('syncora_user');
  }, [user]);

  const login = async (email, password) => {
    const { token, user } = await api.login({ email, password });
    setToken(token); setUser(user);
  };
  const register = async (email, password, displayName) => {
    const { token, user } = await api.register({ email, password, displayName });
    setToken(token); setUser(user);
  };
  const logout = () => { setToken(null); setUser(null); };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isAuthed: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}
