import React, { useState } from 'react';
import { useAuth } from '../utils/AuthContext';

export default function DevDebugPanel() {
  const { user, loading } = useAuth();
  const [minimized, setMinimized] = useState(false);
  
  // API configuration
  const viteApiUrl = import.meta.env.VITE_API_URL;
  const apiBaseUrl = viteApiUrl || '/api';
  const isUsingProxy = apiBaseUrl === '/api';

  // Only show in development mode
  if (import.meta.env.MODE !== 'development') {
    return null;
  }

  // Minimized view - small floating icon
  if (minimized) {
    return (
      <button
        onClick={() => setMinimized(false)}
        className="fixed bottom-4 right-4 w-12 h-12 bg-slate-800 text-white rounded-full shadow-lg z-50 border border-slate-600 hover:bg-slate-700 transition-colors flex items-center justify-center"
        title="Expand Debug Panel"
      >
        <span className="text-lg">🛠️</span>
        {/* Status indicator */}
        <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border border-slate-800 ${
          user ? 'bg-green-500' : loading ? 'bg-yellow-500' : 'bg-red-500'
        }`}></div>
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-slate-800 text-white p-4 rounded-lg shadow-lg text-xs max-w-sm z-50 border border-slate-600">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-600">
        <h3 className="font-bold text-sm">
          🛠️ Development Debug Panel
        </h3>
        <button
          onClick={() => setMinimized(true)}
          className="text-slate-400 hover:text-white transition-colors p-1 rounded"
          title="Minimize"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      {/* API Configuration Section */}
      <div className="mb-4">
        <h4 className="font-semibold text-xs mb-2 text-blue-400">🌐 API Configuration</h4>
        <div className="space-y-1 pl-2">
          <div>
            <span className="text-slate-400">Base URL:</span>{' '}
            <span className="text-blue-300 font-mono">{apiBaseUrl}</span>
          </div>
          <div>
            <span className="text-slate-400">Mode:</span>{' '}
            <span className={isUsingProxy ? "text-green-400" : "text-yellow-400"}>
              {isUsingProxy ? '🔄 Proxy' : '🔗 Direct'}
            </span>
          </div>
          {viteApiUrl && (
            <div>
              <span className="text-slate-400">Env:</span>{' '}
              <span className="text-green-400 font-mono">{viteApiUrl}</span>
            </div>
          )}
        </div>
      </div>

      {/* Authentication Section */}
      <div>
        <h4 className="font-semibold text-xs mb-2 text-purple-400">🔐 Authentication</h4>
        <div className="space-y-1 pl-2">
          <div>
            <span className="text-slate-400">Status:</span>{' '}
            <span className={loading ? "text-yellow-400" : user ? "text-green-400" : "text-red-400"}>
              {loading ? '⏳ Loading' : user ? '✅ Authenticated' : '❌ Not authenticated'}
            </span>
          </div>
          {user && (
            <>
              <div>
                <span className="text-slate-400">User:</span>{' '}
                <span className="text-green-400 font-mono">{user.username}</span>
              </div>
              <div>
                <span className="text-slate-400">Role:</span>{' '}
                <span className={user.isSuperAdmin ? "text-red-400" : "text-blue-400"}>
                  {user.isSuperAdmin ? '👑 Admin' : '👤 User'}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Environment Info */}
      <div className="mt-3 pt-2 border-t border-slate-600">
        <div className="text-center">
          <span className="text-slate-500 text-xs">
            Mode: <span className="text-orange-400">{import.meta.env.MODE}</span>
          </span>
        </div>
      </div>
    </div>
  );
}