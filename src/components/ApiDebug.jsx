import React from 'react';

export default function ApiDebug() {
  const viteApiUrl = import.meta.env.VITE_API_URL;
  const apiBaseUrl = viteApiUrl || '/api';
  const isUsingSameValue = viteApiUrl ? (viteApiUrl === apiBaseUrl) : false;
  const isUsingProxy = apiBaseUrl === '/api';

  if (import.meta.env.MODE !== 'development') {
    return null; // Only show in development
  }

  return (
    <div className="fixed bottom-4 right-4 bg-slate-800 text-white p-4 rounded-lg shadow-lg text-xs max-w-md z-50 border border-slate-600">
      <h3 className="font-bold text-sm mb-2">🔧 API Configuration Debug</h3>
      <div className="space-y-1">
        <div>
          <span className="text-slate-400">VITE_API_URL:</span>{' '}
          <span className="text-green-400">{viteApiUrl || 'undefined'}</span>
        </div>
        <div>
          <span className="text-slate-400">API_BASE_URL:</span>{' '}
          <span className="text-blue-400">{apiBaseUrl}</span>
        </div>
        <div>
          <span className="text-slate-400">Are they the same?</span>{' '}
          <span className={viteApiUrl ? (isUsingSameValue ? "text-green-400" : "text-red-400") : "text-yellow-400"}>
            {viteApiUrl ? (isUsingSameValue ? 'YES' : 'NO') : 'N/A (using fallback)'}
          </span>
        </div>
        <div>
          <span className="text-slate-400">Using Vite proxy?</span>{' '}
          <span className={isUsingProxy ? "text-green-400" : "text-red-400"}>
            {isUsingProxy ? 'YES (→ localhost:3001)' : 'NO (direct)'}
          </span>
        </div>
      </div>
    </div>
  );
}