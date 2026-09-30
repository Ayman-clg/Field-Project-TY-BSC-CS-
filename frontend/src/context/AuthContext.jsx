import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginApi, getProfileApi } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Initialize from storage or default admin demo
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('scm_token');
      if (token) {
        try {
          const res = await getProfileApi();
          if (res.data?.success) {
            setUser(res.data.data);
          }
        } catch (err) {
          console.warn('Session expired or invalid, clearing storage');
          localStorage.removeItem('scm_token');
          // Auto fallback to Admin login for instant demo experience
          await loginAsRole('Admin');
        }
      } else {
        // Auto-login as default Admin for seamless dev/testing
        await loginAsRole('Admin');
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setAuthError(null);
      const res = await loginApi(email, password);
      if (res.data?.success) {
        const { token, ...userData } = res.data.data;
        localStorage.setItem('scm_token', token);
        setUser(userData);
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      setAuthError(msg);
      return { success: false, message: msg };
    }
  };

  const loginAsRole = async (targetRole) => {
    let email = 'admin@apex.com';
    if (targetRole === 'Manager') email = 'manager@apex.com';
    if (targetRole === 'Clerk') email = 'clerk@apex.com';

    try {
      const res = await loginApi(email, 'password123');
      if (res.data?.success) {
        const { token, ...userData } = res.data.data;
        localStorage.setItem('scm_token', token);
        setUser(userData);
        return { success: true };
      }
    } catch (err) {
      // Fallback local mock state if backend not reached yet
      const mockUser = {
        _id: 'mock-usr-1',
        name: targetRole === 'Admin' ? 'Sarah Connor' : targetRole === 'Manager' ? 'Michael Scott' : 'Jim Halpert',
        email,
        role: targetRole,
      };
      setUser(mockUser);
    }
  };

  const logout = () => {
    localStorage.removeItem('scm_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authError,
        login,
        loginAsRole,
        logout,
        isAdmin: user?.role === 'Admin',
        isManager: user?.role === 'Manager' || user?.role === 'Admin',
        isClerk: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
