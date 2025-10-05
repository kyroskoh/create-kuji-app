import { useAuth } from '../utils/AuthContext';
import localforage from 'localforage';
import { useState, useEffect } from 'react';

export default function AuthDebug() {
  const { user, isAuthenticated, isSuperAdmin, clearAuthState } = useAuth();
  const [tokens, setTokens] = useState({});
  const [debugInfo, setDebugInfo] = useState('');
  const [isMinimized, setIsMinimized] = useState(() => {
    return localStorage.getItem('authDebug-minimized') === 'true';
  });
  const [isHidden, setIsHidden] = useState(() => {
    return localStorage.getItem('authDebug-hidden') === 'true';
  });

  useEffect(() => {
    loadTokens();
  }, [user]);

  // Persist minimize state
  useEffect(() => {
    localStorage.setItem('authDebug-minimized', isMinimized.toString());
  }, [isMinimized]);

  // Persist hide state
  useEffect(() => {
    localStorage.setItem('authDebug-hidden', isHidden.toString());
  }, [isHidden]);

  const loadTokens = async () => {
    try {
      const accessToken = await localforage.getItem('accessToken');
      const refreshToken = await localforage.getItem('refreshToken');
      setTokens({ accessToken, refreshToken });

      // Decode JWT payload if exists
      if (accessToken) {
        try {
          const payload = JSON.parse(atob(accessToken.split('.')[1]));
          setDebugInfo(JSON.stringify({
            jwt_payload: payload,
            exp: new Date(payload.exp * 1000).toISOString()
          }, null, 2));
        } catch (e) {
          setDebugInfo('Failed to decode JWT token');
        }
      } else {
        setDebugInfo('No access token found');
      }
    } catch (error) {
      console.error('Failed to load tokens:', error);
    }
  };

  const handleClearAuth = async () => {
    if (confirm('Clear all authentication data?')) {
      await clearAuthState();
      await loadTokens();
    }
  };

  const handleClearStorage = async () => {
    if (confirm('Clear all localStorage/localforage data?')) {
      await localforage.clear();
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    }
  };

  // Only show in development
  if (import.meta.env.PROD) return null;

  // Don't render if hidden
  if (isHidden) {
    return (
      <button
        onClick={() => setIsHidden(false)}
        className="fixed bottom-4 right-4 bg-slate-800/80 backdrop-blur-sm border border-slate-600 rounded-full p-3 text-lg text-yellow-400 hover:text-yellow-300 hover:bg-slate-700/80 z-50 transition-all duration-200 hover:scale-110 shadow-lg"
        title="Show Auth Debug Panel"
      >
        🐛
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-slate-800/95 backdrop-blur-sm border border-slate-600 rounded-lg text-xs text-white z-50 transition-all duration-200 shadow-xl max-w-xs">
      <div className="flex justify-between items-center p-3 border-b border-slate-700">
        <h3 className="font-bold text-yellow-400 flex items-center gap-2">
          🐛 <span className="text-sm">Auth Debug</span>
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded hover:bg-slate-700"
            title={isMinimized ? 'Expand Panel' : 'Minimize Panel'}
          >
            {isMinimized ? '⬆️' : '⬇️'}
          </button>
          <button
            onClick={() => setIsHidden(true)}
            className="text-slate-400 hover:text-white hover:text-red-400 transition-colors p-1 rounded hover:bg-slate-700"
            title="Hide Panel (click bug icon to show)"
          >
            ✕
          </button>
        </div>
      </div>
      
      {!isMinimized && (
        <div className="px-3 pb-3 space-y-2">
        <div>
          <strong>User:</strong> {user ? user.username : 'null'}
        </div>
        <div>
          <strong>Is Authenticated:</strong> {isAuthenticated ? '✅' : '❌'}
        </div>
        <div>
          <strong>Is Super Admin:</strong> {isSuperAdmin ? '⚠️ YES' : '❌ NO'}
        </div>
        <div>
          <strong>Has Access Token:</strong> {tokens.accessToken ? '✅' : '❌'}
        </div>
        <div>
          <strong>Has Refresh Token:</strong> {tokens.refreshToken ? '✅' : '❌'}
        </div>
        
        {debugInfo && (
          <details className="mt-2">
            <summary className="cursor-pointer text-blue-400">JWT Info</summary>
            <pre className="mt-1 text-xs bg-slate-900 p-2 rounded overflow-auto max-h-32">
              {debugInfo}
            </pre>
          </details>
        )}
        
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleClearAuth}
              className="px-2 py-1 bg-orange-600 hover:bg-orange-700 text-white text-xs rounded"
            >
              Clear Auth
            </button>
            <button
              onClick={handleClearStorage}
              className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded"
            >
              Clear Storage
            </button>
            <button
              onClick={loadTokens}
              className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded"
            >
              Refresh
            </button>
          </div>
        </div>
      )}
    </div>
  );
}