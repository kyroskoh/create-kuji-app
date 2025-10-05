import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';

/**
 * Component that enforces username setup and email verification
 * Redirects to account page if user hasn't:
 * 1. Set their username (usernameSetByUser === false)
 * 2. Verified their email address
 */
export default function RequireSetup({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Allow access to account page regardless of setup status
  const isAccountPage = location.pathname.includes('/account');
  if (isAccountPage) {
    return children;
  }

  // Check if user has set their username
  if (!user.usernameSetByUser) {
    return <Navigate to={`/${user.username}/account`} state={{ from: location, needsUsernameSetup: true }} replace />;
  }

  // Check if user has verified their email
  if (!user.emailVerified) {
    return <Navigate to={`/${user.username}/account`} state={{ from: location, needsEmailVerification: true }} replace />;
  }

  // User has completed setup, allow access
  return children;
}
