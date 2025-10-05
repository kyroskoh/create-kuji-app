import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import localforage from 'localforage';
import { authAPI } from './api';
import { triggerSyncOnLogin } from '../services/syncService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize auth state on mount
  useEffect(() => {
    if (!isInitialized) {
      initializeAuth();
    }
  }, [isInitialized]);

  const initializeAuth = async () => {
    try {
      console.log('🔄 Initializing auth...');
      const accessToken = await localforage.getItem('accessToken');
      const refreshToken = await localforage.getItem('refreshToken');
      
      console.log('Tokens found:', {
        accessToken: accessToken ? '***present***' : 'missing',
        refreshToken: refreshToken ? '***present***' : 'missing'
      });
      
      if (accessToken && refreshToken) {
        try {
          console.log('📞 Fetching current user from API...');
          // Fetch current user from API
          const response = await authAPI.getCurrentUser();
          setUser(response.data.user);
          console.log('✓ Successfully restored authentication for:', response.data.user.username);
        } catch (userErr) {
          // If user fetch fails, the token might be invalid or expired
          console.warn('⚠️ Failed to fetch user with existing token:', userErr);
          console.warn('Error details:', userErr.response?.status, userErr.response?.data?.message);
          console.log('🧹 Clearing invalid tokens...');
          await localforage.removeItem('accessToken');
          await localforage.removeItem('refreshToken');
          setUser(null);
        }
      } else {
        // If missing either token, clear everything
        if (accessToken || refreshToken) {
          console.log('⚠️ Incomplete token set found, clearing auth tokens');
          await localforage.removeItem('accessToken');
          await localforage.removeItem('refreshToken');
        }
        console.log('😫 No valid tokens found, user not authenticated');
        setUser(null);
      }
    } catch (err) {
      console.error('❌ Failed to initialize auth:', err);
      console.error('Error details:', err.message);
      // Clear authentication data on error, preserve kuji data
      await localforage.removeItem('accessToken');
      await localforage.removeItem('refreshToken');
      setUser(null);
    } finally {
      console.log('⚙️ Auth initialization complete, loading = false');
      setLoading(false);
      setIsInitialized(true);
    }
  };

  const login = useCallback(async (emailOrUsername, password, rememberMe = false) => {
    try {
      setError(null);
      
      // Clear any existing authentication data first
      const existingRefreshToken = await localforage.getItem('refreshToken');
      if (existingRefreshToken) {
        try {
          await authAPI.logout(existingRefreshToken);
        } catch (err) {
          console.warn('Failed to logout previous session:', err);
        }
      }
      
      // Clear only authentication data, preserve kuji data
      await localforage.removeItem('accessToken');
      await localforage.removeItem('refreshToken');
      setUser(null);
      
      const response = await authAPI.login({
        emailOrUsername,
        password,
        rememberMe,
      });

      const { user: userData, tokens } = response.data;

      // Store new tokens
      await localforage.setItem('accessToken', tokens.accessToken);
      await localforage.setItem('refreshToken', tokens.refreshToken);

      // Set new user data
      setUser(userData);
      
      // Trigger data sync for the logged-in user
      setTimeout(() => {
        triggerSyncOnLogin(userData.username);
      }, 1000); // Small delay to let UI update first
      
      return { success: true, user: userData };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  const signup = useCallback(async (email, password, hcaptchaToken) => {
    try {
      setError(null);
      const response = await authAPI.signup({
        email,
        password,
        hcaptchaToken,
      });

      const { user: userData, tokens } = response.data;

      // Store tokens
      await localforage.setItem('accessToken', tokens.accessToken);
      await localforage.setItem('refreshToken', tokens.refreshToken);

      setUser(userData);
      
      // Trigger data sync for the new user
      setTimeout(() => {
        triggerSyncOnLogin(userData.username);
      }, 1000); // Small delay to let UI update first
      
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
        try {
          await authAPI.logout(refreshToken);
          console.log('✓ Successfully logged out from server');
        } catch (logoutErr) {
          console.error('Server logout failed:', logoutErr);
          // Continue with client-side cleanup even if server logout fails
        }
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear local state first
      setUser(null);
      setError(null);
      
      // Clear only authentication data from storage, preserve kuji data
      await localforage.removeItem('accessToken');
      await localforage.removeItem('refreshToken');
      
      // Force re-initialize on next mount
      setLoading(false);
      
      console.log('✓ Client-side authentication data cleared');
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

  // Helper function to completely clear auth state (useful for debugging)
  const clearAuthState = useCallback(async () => {
    setUser(null);
    setError(null);
    setLoading(false);
    await localforage.clear();
    console.log('🧹 Authentication state cleared completely');
  }, []);

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
    clearAuthState,
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