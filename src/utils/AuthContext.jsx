import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import localforage from 'localforage';
import { authAPI } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const accessToken = await localforage.getItem('accessToken');
      
      if (accessToken) {
        // Fetch current user from API
        const response = await authAPI.getCurrentUser();
        setUser(response.data.user);
      }
    } catch (err) {
      console.error('Failed to initialize auth:', err);
      // Clear invalid tokens
      await localforage.removeItem('accessToken');
      await localforage.removeItem('refreshToken');
    } finally {
      setLoading(false);
    }
  };

  const login = useCallback(async (emailOrUsername, password, rememberMe = false) => {
    try {
      setError(null);
      const response = await authAPI.login({
        emailOrUsername,
        password,
        rememberMe,
      });

      const { user: userData, tokens } = response.data;

      // Store tokens
      await localforage.setItem('accessToken', tokens.accessToken);
      await localforage.setItem('refreshToken', tokens.refreshToken);

      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  const signup = useCallback(async (email, username, password, hcaptchaToken) => {
    try {
      setError(null);
      const response = await authAPI.signup({
        email,
        username,
        password,
        hcaptchaToken,
      });

      const { user: userData, tokens } = response.data;

      // Store tokens
      await localforage.setItem('accessToken', tokens.accessToken);
      await localforage.setItem('refreshToken', tokens.refreshToken);

      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Signup failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const refreshToken = await localforage.getItem('refreshToken');
      
      if (refreshToken) {
        await authAPI.logout(refreshToken);
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear local state regardless
      setUser(null);
      await localforage.removeItem('accessToken');
      await localforage.removeItem('refreshToken');
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const response = await authAPI.getCurrentUser();
      setUser(response.data.user);
      return response.data.user;
    } catch (err) {
      console.error('Failed to refresh user:', err);
      return null;
    }
  }, []);

  const requestPasswordReset = useCallback(async (email) => {
    try {
      await authAPI.requestPasswordReset(email);
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to request password reset';
      return { success: false, error: errorMessage };
    }
  }, []);

  const resetPassword = useCallback(async (token, newPassword) => {
    try {
      await authAPI.resetPassword(token, newPassword);
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to reset password';
      return { success: false, error: errorMessage };
    }
  }, []);

  const verifyEmail = useCallback(async (token) => {
    try {
      await authAPI.verifyEmail(token);
      // Refresh user data to update verification status
      await refreshUser();
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to verify email';
      return { success: false, error: errorMessage };
    }
  }, [refreshUser]);

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    isSuperAdmin: user?.isSuperAdmin || false,
    login,
    signup,
    logout,
    refreshUser,
    requestPasswordReset,
    resetPassword,
    verifyEmail,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}