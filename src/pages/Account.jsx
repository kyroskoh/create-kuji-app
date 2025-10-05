import { useState, useEffect } from 'react';
import { useAuth } from '../utils/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { userAPI } from '../utils/api';
import SSOButtons from '../auth/SSOButtons';

export default function Account() {
  const { user, refreshUser } = useAuth();
  const toast = useToast();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState('');
  const [addingEmail, setAddingEmail] = useState(false);
  
  // Password change form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await userAPI.getProfile();
      setProfile(response.data.user);
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
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
      toast.error(error.response?.data?.message || 'Failed to add email');
    } finally {
      setAddingEmail(false);
    }
  };

  const handleRemoveEmail = async (emailId) => {
    if (!confirm('Are you sure you want to remove this email?')) return;

    try {
      await userAPI.removeEmail(emailId);
      toast.success('Email removed successfully');
      await loadProfile();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove email');
    }
  };

  const handleSetPrimary = async (emailId) => {
    try {
      await userAPI.setPrimaryEmail(emailId);
      toast.success('Primary email updated');
      await loadProfile();
      await refreshUser();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to set primary email');
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
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
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
      <h1 className="text-3xl font-bold text-white mb-6">Account Settings</h1>

      {/* Account Info Card */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Account Information</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Username</label>
            <div className="flex items-center gap-2">
              <p className="text-white font-mono text-lg">{profile.username}</p>
              <span className="text-xs text-slate-500">(contact support to change)</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Display Name</label>
            <p className="text-white">{profile.displayName || 'Not set'}</p>
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
                    <span className="text-xs bg-yellow-500 text-white px-2 py-0.5 rounded">
                      Unverified
                    </span>
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
