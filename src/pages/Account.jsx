import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { userAPI } from '../utils/api';
import SSOButtons from '../auth/SSOButtons';
import useLocalStorageDAO from '../hooks/useLocalStorageDAO.js';
import { SUBSCRIPTION_PLANS } from '../utils/subscriptionPlans';

export default function Account() {
  const { user, refreshUser, logout } = useAuth();
  const { getSettings } = useLocalStorageDAO();
  const toast = useToast();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState('');
  const [addingEmail, setAddingEmail] = useState(false);
  const [subscriptionPlan, setSubscriptionPlan] = useState('free');
  
  // Username setup state
  const [newUsername, setNewUsername] = useState('');
  const [settingUsername, setSettingUsername] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  
  // Password change form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    loadProfile();
    loadSubscriptionPlan();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await userAPI.getProfile();
      setProfile(response.data.user);
    } catch (error) {
      console.error('Failed to load detailed profile:', error);
      // Fallback to user data from AuthContext if backend is unavailable
      if (user) {
        setProfile({
          ...user,
          emails: user.emails || [{ 
            id: 'fallback', 
            address: user.email || 'No email set', 
            isPrimary: true, 
            verifiedAt: user.emailVerified ? new Date() : null 
          }],
          hasPassword: true, // Assume user has password
          providerAccounts: [] // Empty for fallback
        });
        toast.warning('Using cached profile data - some features may be limited');
      } else {
        toast.error('Failed to load profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadSubscriptionPlan = async () => {
    try {
      const settings = await getSettings();
      setSubscriptionPlan(settings.subscriptionPlan || 'free');
    } catch (error) {
      console.error('Failed to load subscription plan:', error);
      setSubscriptionPlan('free');
    }
  };

  const handleAddEmail = async (e) => {
    e.preventDefault();
    if (!newEmail || !newEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setAddingEmail(true);
    try {
      await userAPI.addEmail(newEmail);
      toast.success('Email added! Check your inbox to verify.');
      setNewEmail('');
      await loadProfile();
    } catch (error) {
      if (error.code === 'ERR_NETWORK' || error.response?.status >= 500) {
        toast.error('Server unavailable. Please try again later.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to add email');
      }
    } finally {
      setAddingEmail(false);
    }
  };

  const handleRemoveEmail = async (emailId) => {
    if (emailId === 'fallback') {
      toast.error('Cannot remove email while in fallback mode');
      return;
    }
    
    if (!confirm('Are you sure you want to remove this email?')) return;

    try {
      await userAPI.removeEmail(emailId);
      toast.success('Email removed successfully');
      await loadProfile();
    } catch (error) {
      if (error.code === 'ERR_NETWORK' || error.response?.status >= 500) {
        toast.error('Server unavailable. Please try again later.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to remove email');
      }
    }
  };

  const handleSetPrimary = async (emailId) => {
    if (emailId === 'fallback') {
      toast.error('Cannot modify email while in fallback mode');
      return;
    }
    
    try {
      await userAPI.setPrimaryEmail(emailId);
      toast.success('Primary email updated');
      await loadProfile();
      await refreshUser();
    } catch (error) {
      if (error.code === 'ERR_NETWORK' || error.response?.status >= 500) {
        toast.error('Server unavailable. Please try again later.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to set primary email');
      }
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmNewPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setChangingPassword(true);
    try {
      await userAPI.changePassword({
        currentPassword,
        newPassword,
      });
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error) {
      if (error.code === 'ERR_NETWORK' || error.response?.status >= 500) {
        toast.error('Server unavailable. Please try again later.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to change password');
      }
    } finally {
      setChangingPassword(false);
    }
  };

  const handleResendVerification = async (emailId) => {
    if (emailId === 'fallback') {
      toast.error('Cannot send verification email while in fallback mode');
      return;
    }
    
    try {
      await userAPI.resendEmailVerification(emailId);
      toast.success('Verification email sent! Check your inbox.');
    } catch (error) {
      if (error.code === 'ERR_NETWORK' || error.response?.status >= 500) {
        toast.error('Server unavailable. Please try again later.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to send verification email');
      }
    }
  };

  const handleUsernameChange = (e) => {
    setNewUsername(e.target.value);
    setUsernameError(''); // Clear error when user types
  };

  const handleSetUsername = async (e) => {
    e.preventDefault();
    setUsernameError('');

    // Validate username
    if (!newUsername) {
      setUsernameError('Username is required');
      return;
    }
    
    if (newUsername.length < 5 || newUsername.length > 20) {
      setUsernameError('Username must be 5-20 characters');
      return;
    }
    
    if (!/^[a-zA-Z0-9_-]+$/.test(newUsername)) {
      setUsernameError('Username can only contain letters, numbers, hyphens, and underscores');
      return;
    }

    setSettingUsername(true);
    try {
      const response = await userAPI.updateUsername(newUsername);
      toast.success('Username set successfully!');
      
      // Refresh user data
      await refreshUser();
      
      // Reload profile
      await loadProfile();
      
      // Navigate to new username URL
      navigate(`/${newUsername}/account`, { replace: true });
    } catch (error) {
      if (error.code === 'ERR_NETWORK' || error.response?.status >= 500) {
        setUsernameError('Server unavailable. Please try again later.');
      } else if (error.response?.status === 409 || error.response?.data?.error === 'USERNAME_EXISTS') {
        // Username is already taken
        setUsernameError(`Username "${newUsername}" is already taken. Please choose a different one.`);
      } else if (error.response?.status === 400 || error.response?.data?.error === 'INVALID_USERNAME') {
        // Invalid username format
        setUsernameError(error.response?.data?.message || 'Invalid username format.');
      } else {
        setUsernameError(error.response?.data?.message || 'Failed to set username');
      }
    } finally {
      setSettingUsername(false);
    }
  };

  const handleLogout = async () => {
    if (!confirm('Are you sure you want to log out?')) return;
    
    await logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-slate-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-slate-400">Failed to load profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Account Settings</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
        >
          Log Out
        </button>
      </div>

      {/* Username Setup Card - Show if username not set by user */}
      {profile && !profile.usernameSetByUser && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg border-2 border-blue-400 p-6 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-2">Complete Your Profile</h2>
              <p className="text-blue-100 mb-4">
                Please set a permanent username for your account. Once set, it cannot be changed (contact support if needed).
              </p>
              <form onSubmit={handleSetUsername} className="space-y-4">
                <div>
                  <label htmlFor="newUsername" className="block text-sm font-medium text-white mb-2">
                    Choose Your Username
                  </label>
                  <input
                    id="newUsername"
                    type="text"
                    value={newUsername}
                    onChange={handleUsernameChange}
                    className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
                    placeholder="username (5-20 characters, letters, numbers, - and _)"
                    disabled={settingUsername}
                    autoComplete="username"
                  />
                  {usernameError && (
                    <div className="mt-2 flex items-start gap-2 text-sm text-yellow-200 bg-red-500/20 px-3 py-2 rounded border border-red-500/30">
                      <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <span>{usernameError}</span>
                    </div>
                  )}
                  <p className="mt-2 text-sm text-blue-100">
                    Current temporary username: <span className="font-mono font-bold">{profile.username}</span>
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={settingUsername}
                  className="px-6 py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 disabled:bg-gray-300 disabled:text-gray-500 transition-colors shadow-lg"
                >
                  {settingUsername ? 'Setting Username...' : 'Set Username'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Email Verification Alert - Show if email not verified */}
      {profile && profile.emails[0] && !profile.emails[0].verifiedAt && (
        <div className="bg-yellow-500/10 border-2 border-yellow-500/50 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-yellow-500 mb-1">Email Verification Required</h3>
              <p className="text-slate-300 mb-3">
                Please verify your email address to access all features. Check your inbox for a verification link.
              </p>
              <button
                onClick={() => handleResendVerification(profile.emails[0].id)}
                className="text-sm text-yellow-400 hover:text-yellow-300 underline"
              >
                Resend Verification Email
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Account Info Card */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Account Information</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Username</label>
            <div className="flex items-center gap-2">
              <p className="text-white font-mono text-lg">{profile.username}</p>
              {profile.usernameSetByUser ? (
                <span className="text-xs text-green-500 bg-green-500/10 px-2 py-1 rounded">✓ Permanent</span>
              ) : (
                <span className="text-xs text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded">⚠ Temporary</span>
              )}
            </div>
            {profile.usernameSetByUser && (
              <p className="text-xs text-slate-500 mt-1">(Contact support to change)</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Display Name</label>
            <p className="text-white">{profile.displayName || 'Not set'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Subscription Plan</label>
            <div className="flex items-center gap-2">
              <p className="text-white font-semibold capitalize">
                {SUBSCRIPTION_PLANS[subscriptionPlan.toUpperCase()]?.name || 'Free'}
              </p>
              <span className={`text-xs px-2 py-1 rounded ${
                subscriptionPlan === 'free' 
                  ? 'bg-slate-600 text-slate-200'
                  : subscriptionPlan === 'basic'
                  ? 'bg-blue-500/20 text-blue-300'
                  : subscriptionPlan === 'advanced'
                  ? 'bg-purple-500/20 text-purple-300'
                  : 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-300'
              }`}>
                {SUBSCRIPTION_PLANS[subscriptionPlan.toUpperCase()]?.price || '$0'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {SUBSCRIPTION_PLANS[subscriptionPlan.toUpperCase()]?.description || 'Perfect for getting started'}
            </p>
            <button
              onClick={() => navigate(`/${user.username}/settings`)}
              className="mt-2 text-sm text-blue-400 hover:text-blue-300 underline"
            >
              Manage Plan →
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Account Created</label>
              <p className="text-white">{new Date(profile.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Last Login</label>
              <p className="text-white">
                {profile.lastLogin ? new Date(profile.lastLogin).toLocaleDateString() : 'Never'}
              </p>
            </div>
          </div>

          {profile.isSuperAdmin && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
              <span className="text-yellow-500 font-semibold">🔐 Super Admin</span>
            </div>
          )}
        </div>
      </div>

      {/* Email Management Card */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Email Addresses</h2>
        
        <div className="space-y-3 mb-4">
          {profile.emails.map((email) => (
            <div
              key={email.id}
              className="bg-slate-700 rounded-lg p-4 flex items-center justify-between"
            >
              <div className="flex-1">
                <p className="text-white font-medium">{email.address}</p>
                <div className="flex gap-2 mt-1">
                  {email.isPrimary && (
                    <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded">
                      Primary
                    </span>
                  )}
                  {email.verifiedAt ? (
                    <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded">
                      ✓ Verified
                    </span>
                  ) : (
                    <div className="flex gap-2 items-center">
                      <span className="text-xs bg-yellow-500 text-white px-2 py-0.5 rounded">
                        Unverified
                      </span>
                      <button
                        onClick={() => handleResendVerification(email.id)}
                        className="text-xs text-blue-400 hover:text-blue-300 underline"
                      >
                        Resend verification
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2">
                {!email.isPrimary && email.verifiedAt && (
                  <button
                    onClick={() => handleSetPrimary(email.id)}
                    className="text-sm text-blue-400 hover:text-blue-300"
                  >
                    Set Primary
                  </button>
                )}
                {!email.isPrimary && (
                  <button
                    onClick={() => handleRemoveEmail(email.id)}
                    className="text-sm text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleAddEmail} className="flex gap-2">
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="Add new email address"
            className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={addingEmail}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-medium rounded-lg transition-colors"
          >
            {addingEmail ? 'Adding...' : 'Add Email'}
          </button>
        </form>
      </div>

      {/* Password Change Card */}
      {profile.hasPassword && (
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Change Password</h2>
          
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-slate-300 mb-2">
                Current Password
              </label>
              <input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter current password"
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-slate-300 mb-2">
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter new password (min 8 characters)"
              />
            </div>

            <div>
              <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-slate-300 mb-2">
                Confirm New Password
              </label>
              <input
                id="confirmNewPassword"
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                required
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Confirm new password"
              />
            </div>

            <button
              type="submit"
              disabled={changingPassword}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-medium rounded-lg transition-colors"
            >
              {changingPassword ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>
      )}

      {/* Connected Accounts Card */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Connected Accounts</h2>
        
        {profile.providerAccounts && profile.providerAccounts.length > 0 ? (
          <div className="space-y-2 mb-4">
            {profile.providerAccounts.map((account) => (
              <div
                key={account.id}
                className="bg-slate-700 rounded-lg p-3 flex items-center justify-between"
              >
                <div>
                  <p className="text-white font-medium capitalize">{account.provider}</p>
                  <p className="text-sm text-slate-400">
                    Connected {new Date(account.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-green-500">✓ Connected</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400 mb-4">No connected accounts yet</p>
        )}

        <div>
          <p className="text-sm text-slate-400 mb-3">Connect more accounts:</p>
          <SSOButtons variant="compact" />
        </div>
      </div>
    </div>
  );
}
