import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext.jsx';
import Home from '../pages/Home.jsx';

export default function AuthenticatedHome() {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Show loading state while auth is being determined
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated, redirect to their homepage (manage page)
  if (isAuthenticated && user) {
    return <Navigate to={`/${user.username}/manage`} replace />;
  }

  // If not authenticated, show the regular Home page
  return <Home />;
}