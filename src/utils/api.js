import axios from 'axios';
import localforage from 'localforage';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
console.log('🌐 Environment variables:');
console.log('   VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('   MODE:', import.meta.env.MODE);
console.log('   DEV:', import.meta.env.DEV);
console.log('🌐 Final API_BASE_URL:', API_BASE_URL);
console.log('🌐 Using proxy?', API_BASE_URL === '/api' ? 'YES' : 'NO');

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Allow cookies
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const accessToken = await localforage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't retried yet, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await localforage.getItem('refreshToken');
        
        if (!refreshToken) {
          // No refresh token, clear auth tokens but preserve kuji data
          await localforage.removeItem('accessToken');
          await localforage.removeItem('refreshToken');
          return Promise.reject(error);
        }

        // Try to refresh access token
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken: newAccessToken } = response.data;
        
        // Store new access token
        await localforage.setItem('accessToken', newAccessToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);

      } catch (refreshError) {
        // Refresh failed, clear auth tokens but preserve kuji data
        await localforage.removeItem('accessToken');
        await localforage.removeItem('refreshToken');
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Create a separate axios instance for public endpoints (no auth headers)
const publicApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // No cookies for public endpoints
});

export default api;

// Auth API functions
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  logout: (refreshToken) => api.post('/auth/logout', { refreshToken }),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  getCurrentUser: () => api.get('/auth/me'),
  requestPasswordReset: (email) => api.post('/auth/password-reset-request', { email }),
  resetPassword: (token, newPassword) => api.post('/auth/password-reset', { token, newPassword }),
  verifyEmail: (token) => api.get(`/auth/verify-email?token=${token}`),
};

// User API functions (for account management)
export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.patch('/user/profile', data),
  updateUsername: (username) => api.put('/user/username', { username }),
  changePassword: (data) => api.post('/user/change-password', data),
  addEmail: (email) => api.post('/user/emails', { email }),
  removeEmail: (emailId) => api.delete(`/user/emails/${emailId}`),
  setPrimaryEmail: (emailId) => api.patch(`/user/emails/${emailId}/primary`),
  resendEmailVerification: (emailId) => api.post(`/user/emails/${emailId}/resend-verification`),
};

// Admin API functions
export const adminAPI = {
  getUsers: (params) => api.get('/admin/users', { params }),
  getUser: (userId) => api.get(`/admin/users/${userId}`),
  updateUser: (userId, data) => api.patch(`/admin/users/${userId}`, data),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  getStats: () => api.get('/admin/stats'),
  revokeUserSessions: (userId) => api.post(`/admin/users/${userId}/revoke-sessions`),
};

// Kuji API functions
export const kujiAPI = {
  getStock: () => publicApi.get('/kuji/stock'), // Public endpoint - no auth needed
  getUserStock: (username) => api.get(`/users/${username}/stock`),
  getStockPageStatus: (username) => publicApi.get(`/users/${username}/stock-status`), // Public - for visibility check
  
  // Sync endpoints
  syncPrizes: (username, prizes) => api.post(`/users/${username}/sync-prizes`, { prizes }),
  syncSettings: (username, settings) => api.post(`/users/${username}/sync-settings`, settings),
  syncHistory: (username, history) => api.post(`/users/${username}/sync-history`, { history }),
  syncPresets: (username, presets) => api.post(`/users/${username}/sync-presets`, { presets }),
  
  // Data retrieval endpoints
  getUserPrizes: (username) => api.get(`/users/${username}/prizes`),
  getUserSettings: (username) => api.get(`/users/${username}/settings`),
  getUserPresets: (username) => api.get(`/users/${username}/presets`),
  
  // Branding endpoints
  getUserBranding: (username) => publicApi.get(`/users/${username}/branding`), // Public endpoint
  syncBranding: (username, branding) => api.post(`/users/${username}/branding/sync`, branding), // Authenticated
  deleteBranding: (username) => api.delete(`/users/${username}/branding`), // Authenticated
};
