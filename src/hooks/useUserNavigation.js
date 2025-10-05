import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';

export function useUserNavigation() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Navigate to a user-specific page
  const navigateToUserPage = (page, username = null) => {
    const targetUsername = username || user?.username;
    if (!targetUsername) {
      // If no user, redirect to login
      navigate('/login');
      return;
    }
    navigate(`/${targetUsername}/${page}`);
  };

  // Get the URL for a user-specific page
  const getUserPageUrl = (page, username = null) => {
    const targetUsername = username || user?.username;
    if (!targetUsername) return '/login';
    return `/${targetUsername}/${page}`;
  };

  // Navigate to user's home page (draw page)
  const navigateToUserHome = (username = null) => {
    navigateToUserPage('draw', username);
  };

  // Check if current user can access another user's pages
  const canAccessUser = (targetUsername) => {
    if (!user) return false;
    return user.username === targetUsername || user.isSuperAdmin;
  };

  return {
    navigateToUserPage,
    getUserPageUrl,
    navigateToUserHome,
    canAccessUser,
    currentUser: user
  };
}