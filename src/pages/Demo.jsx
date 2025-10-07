import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { useToast } from '../contexts/ToastContext';
import useLocalStorageDAO from '../hooks/useLocalStorageDAO';

export default function Demo() {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { login } = useAuth();
  const { getSettings, setSettings } = useLocalStorageDAO();
  const toast = useToast();
  const navigate = useNavigate();

  const demoUsers = [
    {
      type: 'Demo User',
      username: 'demo',
      email: 'demo@createkuji.com',
      password: 'Demo123!',
      description: 'Regular user with access to kuji drawing and account management',
      redirects: 'your personal draw page',
      color: 'bg-blue-600 hover:bg-blue-700',
      icon: '👤'
    }
  ];

  const handleDemoLogin = async (user) => {
    setIsLoggingIn(user.username);
    
    const result = await login(user.username, user.password, false);
    
    setIsLoggingIn(false);
    
    if (result.success) {
      // Set demo user to Pro plan
      if (user.username === 'demo') {
        try {
          const currentSettings = await getSettings();
          await setSettings({
            ...currentSettings,
            subscriptionPlan: 'pro'
          });
          console.log('✅ Demo user set to Pro plan');
        } catch (error) {
          console.error('Failed to set demo user plan:', error);
        }
      }
      
      toast.success(`Logged in as ${user.type}!`);
      // Redirect to user's space with new URL structure
      const redirectTo = result.user.isSuperAdmin 
        ? `/${result.user.username}/admin` 
        : `/${result.user.username}/draw`;
      navigate(redirectTo);
    } else {
      toast.error(result.error || 'Demo login failed');
    }
  };

  const features = [
    {
      title: 'User Authentication',
      description: 'Secure login/signup with JWT tokens and session management',
      icon: '🔐'
    },
    {
      title: 'Super Admin Dashboard',
      description: 'Complete user management with D3.js analytics and controls',
      icon: '📊'
    },
    {
      title: 'Kuji Drawing System',
      description: 'Interactive gacha-style prize drawing with animations',
      icon: '🎁'
    },
    {
      title: 'Account Management',
      description: 'Profile settings, email verification, and password management',
      icon: '⚙️'
    },
    {
      title: 'Responsive Design',
      description: 'Beautiful UI with Tailwind CSS and mobile-friendly layout',
      icon: '📱'
    },
    {
      title: 'Real-time Updates',
      description: 'Toast notifications and live data updates',
      icon: '🔄'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            🎮 Create Kuji App Demo
          </h1>
          <p className="text-xl text-slate-300 mb-6">
            Explore the full-featured kuji drawing application with user management
          </p>
          <div className="flex justify-center space-x-4">
            <Link 
              to="/" 
              className="px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
            >
              ← Back to Home
            </Link>
            <Link 
              to="/demo/stock" 
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              View Stock 📦
            </Link>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            🎯 Quick Demo Login
          </h2>
          <div className="flex justify-center max-w-md mx-auto">
            {demoUsers.map((user) => (
              <div key={user.username} className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{user.icon}</span>
                    <div>
                      <h3 className="text-xl font-bold text-white">{user.type}</h3>
                      <p className="text-slate-400 text-sm">Redirects to {user.redirects}</p>
                    </div>
                  </div>
                </div>
                
                <p className="text-slate-300 mb-4">{user.description}</p>
                
                <div className="bg-slate-900 rounded-lg p-4 mb-4 font-mono text-sm">
                  <div className="text-slate-400 mb-1">Username: <span className="text-green-400">{user.username}</span></div>
                  <div className="text-slate-400 mb-1">Email: <span className="text-green-400">{user.email}</span></div>
                  <div className="text-slate-400">Password: <span className="text-green-400">{user.password}</span></div>
                </div>
                
                <button
                  onClick={() => handleDemoLogin(user)}
                  disabled={isLoggingIn === user.username}
                  className={`w-full py-3 text-white font-semibold rounded-lg transition-colors ${user.color} disabled:bg-slate-600`}
                >
                  {isLoggingIn === user.username ? 'Logging in...' : `Login as ${user.type}`}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Features Showcase */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            ✨ App Features
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <div className="text-3xl mb-3">{feature.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            🛠️ Tech Stack
          </h2>
          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Frontend</h3>
                <ul className="space-y-2 text-slate-300">
                  <li>⚛️ React 18 + Vite</li>
                  <li>🎨 Tailwind CSS</li>
                  <li>🧭 React Router DOM</li>
                  <li>📊 D3.js for visualizations</li>
                  <li>🎭 Three.js for animations</li>
                  <li>💾 LocalForage for storage</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Backend</h3>
                <ul className="space-y-2 text-slate-300">
                  <li>🟢 Node.js + Express</li>
                  <li>📘 TypeScript</li>
                  <li>🗃️ Prisma ORM + SQLite</li>
                  <li>🔐 JWT Authentication</li>
                  <li>🛂 Passport.js</li>
                  <li>🔒 bcrypt password hashing</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Manual Login Option */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Or Try Manual Login
          </h2>
          <div className="space-x-4">
            <Link 
              to="/login" 
              className="inline-block px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              Manual Login 🔑
            </Link>
            <Link 
              to="/signup" 
              className="inline-block px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
            >
              Create Account ✨
            </Link>
          </div>
          <p className="text-slate-400 mt-4">
            Or explore the app directly in development mode
          </p>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-slate-700">
          <p className="text-slate-400">
            🎉 Built with love using modern web technologies
          </p>
        </div>
      </div>
    </div>
  );
}