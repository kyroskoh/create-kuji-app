import { Navigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import RequireAuth from './RequireAuth';

export default function RequireSuperAdmin({ children }) {
  const { isSuperAdmin } = useAuth();

  // Bypass super admin check in development mode for easier testing
  if (import.meta.env.DEV) {
    console.log('🚀 Dev mode: Bypassing super admin check on frontend');
    return children;
  }

  return (
    <RequireAuth>
      {isSuperAdmin ? (
        children
      ) : (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md p-8 bg-slate-800 rounded-lg">
            <div className="text-red-500 text-6xl mb-4">🚫</div>
            <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
            <p className="text-slate-400 mb-6">
              You need super admin privileges to access this page.
            </p>
            <a
              href="/"
              className="inline-block px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Go Home
            </a>
          </div>
        </div>
      )}
    </RequireAuth>
  );
}
