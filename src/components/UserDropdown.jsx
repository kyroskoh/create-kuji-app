import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext.jsx';
import { useSubscription } from '../contexts/SubscriptionContext.jsx';
import { SUBSCRIPTION_PLANS } from '../utils/subscriptionPlans';

export default function UserDropdown() {
  const { user, logout, isAuthenticated } = useAuth();
  const { subscriptionPlan } = useSubscription();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
    navigate('/');
  };

  // Get plan color based on subscription tier
  const getPlanColor = (plan) => {
    switch (plan) {
      case 'free':
        return 'bg-slate-500/20 text-slate-300 border border-slate-500/30';
      case 'basic':
        return 'bg-blue-500/20 text-blue-300 border border-blue-500/30';
      case 'advanced':
        return 'bg-purple-500/20 text-purple-300 border border-purple-500/30';
      case 'pro':
        return 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-300 border border-yellow-500/30';
      default:
        return 'bg-slate-500/20 text-slate-300 border border-slate-500/30';
    }
  };

  // Don't render if user is not authenticated
  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
        aria-expanded={isOpen}
        aria-haspopup="true"
        title={user.usernameSetByUser ? user.username : `Temporary username: ${user.username}`}
      >
        <span className="flex items-center gap-1">
          {!user.usernameSetByUser && (
            <svg className="h-3 w-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )}
          {user.username}
        </span>
        <svg
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-md bg-slate-800 shadow-lg ring-1 ring-slate-700 z-50">
          <div className="py-1">
            {/* Subscription Plan Info */}
            <div className="px-4 py-3 border-b border-slate-700">
              <p className="text-xs text-slate-400 mb-2">Current Plan</p>
              <div className="flex items-center justify-between gap-2">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getPlanColor(subscriptionPlan)}`}>
                  {SUBSCRIPTION_PLANS[subscriptionPlan.toUpperCase()]?.name || 'Free'}
                </span>
                <span className="text-xs text-slate-400">
                  {SUBSCRIPTION_PLANS[subscriptionPlan.toUpperCase()]?.price || '$0'}
                </span>
              </div>
            </div>

            {/* Menu Items */}
            <button
              onClick={() => {
                setIsOpen(false);
                navigate(`/${user.username}/account`);
              }}
              className="block w-full text-left px-4 py-2 text-sm text-white bg-slate-800 transition hover:bg-purple-600/30"
            >
              Account Settings
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                navigate(`/${user.username}/account/plan`);
              }}
              className="block w-full text-left px-4 py-2 text-sm text-white bg-slate-800 transition hover:bg-purple-600/30"
            >
              Manage Plan
            </button>
            <div className="border-t border-slate-700 mt-1 pt-1">
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm text-red-400 bg-slate-800 transition hover:bg-purple-600/30"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
