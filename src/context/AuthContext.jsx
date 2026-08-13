import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const res = await api.getUserProfile();
      if (res.data) {
        setUser(res.data);
        localStorage.setItem('user', JSON.stringify(res.data));
      }
    } catch (e) {
      console.warn("Could not refresh profile from backend:", e);
    }
  };

  useEffect(() => {
    // Restore session from localStorage if present
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('jwtToken');
    if (storedUser && token) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        // Refresh profile async
        fetchProfile();
      } catch (e) {
        localStorage.removeItem('user');
        localStorage.removeItem('jwtToken');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const res = await api.login(username, password);
    if (res.data && res.data.user) {
      setUser(res.data.user);
      fetchProfile();
    }
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('jwtToken');
    setUser(null);
    window.location.href = '/login';
  };

  const updateProfile = (updatedData) => {
    const newUser = { ...user, ...updatedData };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const hasPermission = (permissionName) => {
    if (!user) return false;
    // ADMIN has all permissions
    if (user.roles && user.roles.some(r => r === 'ROLE_ADMIN' || r === 'ADMIN')) return true;
    if (user.permissions && Array.isArray(user.permissions)) {
      return user.permissions.includes(permissionName);
    }
    return false;
  };

  const hasRole = (roleName) => {
    if (!user || !user.roles) return false;
    const formatted = roleName.startsWith('ROLE_') ? roleName : `ROLE_${roleName}`;
    return user.roles.some(r => r === formatted || r === roleName);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, updateProfile, hasPermission, hasRole, fetchProfile, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
