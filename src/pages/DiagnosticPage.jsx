import { useAuth } from '../utils/AuthContext';
import { useLocation } from 'react-router-dom';

export default function DiagnosticPage() {
  const auth = useAuth();
  const location = useLocation();
  
  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'monospace', 
      backgroundColor: '#1e293b', 
      color: '#e2e8f0',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#60a5fa', marginBottom: '20px' }}>🔍 Authentication Diagnostic</h1>
      
      <div style={{ backgroundColor: '#334155', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2 style={{ color: '#fbbf24' }}>Current Location</h2>
        <p><strong>Pathname:</strong> {location.pathname}</p>
        <p><strong>Search:</strong> {location.search || '(none)'}</p>
      </div>

      <div style={{ backgroundColor: '#334155', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2 style={{ color: '#fbbf24' }}>Auth Context Values</h2>
        <p><strong>isAuthenticated:</strong> {String(auth.isAuthenticated)}</p>
        <p><strong>loading:</strong> {String(auth.loading)}</p>
        <p><strong>isSuperAdmin:</strong> {String(auth.isSuperAdmin)}</p>
        <p><strong>error:</strong> {auth.error || '(none)'}</p>
      </div>

      <div style={{ backgroundColor: '#334155', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2 style={{ color: '#fbbf24' }}>User Object</h2>
        {auth.user ? (
          <>
            <p><strong>id:</strong> {auth.user.id}</p>
            <p><strong>username:</strong> {auth.user.username}</p>
            <p><strong>displayName:</strong> {auth.user.displayName || '(none)'}</p>
            <p><strong>usernameSetByUser:</strong> {String(auth.user.usernameSetByUser)}</p>
            <p><strong>emailVerified:</strong> {String(auth.user.emailVerified)}</p>
            <p><strong>isSuperAdmin:</strong> {String(auth.user.isSuperAdmin)}</p>
          </>
        ) : (
          <p style={{ color: '#ef4444' }}>❌ User is NULL or UNDEFINED</p>
        )}
      </div>

      <div style={{ backgroundColor: '#334155', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2 style={{ color: '#fbbf24' }}>Full User Object (JSON)</h2>
        <pre style={{ 
          backgroundColor: '#1e293b', 
          padding: '10px', 
          borderRadius: '4px',
          overflow: 'auto'
        }}>
          {JSON.stringify(auth.user, null, 2)}
        </pre>
      </div>

      <div style={{ backgroundColor: '#334155', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2 style={{ color: '#fbbf24' }}>Available Methods</h2>
        <p><strong>login:</strong> {typeof auth.login}</p>
        <p><strong>logout:</strong> {typeof auth.logout}</p>
        <p><strong>refreshUser:</strong> {typeof auth.refreshUser}</p>
      </div>

      <div style={{ backgroundColor: '#334155', padding: '15px', borderRadius: '8px' }}>
        <h2 style={{ color: '#fbbf24' }}>Actions</h2>
        <button 
          onClick={() => auth.refreshUser()}
          style={{
            padding: '10px 20px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Refresh User
        </button>
        <button 
          onClick={() => window.location.reload()}
          style={{
            padding: '10px 20px',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Reload Page
        </button>
      </div>
    </div>
  );
}
