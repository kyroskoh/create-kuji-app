import { Routes, Route, Navigate, useParams } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";
import Draw from "../pages/Draw.jsx";
import Stock from "../pages/Stock.jsx";
import Account from "../pages/Account.jsx";
import Admin from "../pages/Admin.jsx";
import Manage from "../pages/Manage.jsx";
import SubscriptionPlanPage from "../pages/SubscriptionPlanPage.jsx";
import MainLayout from "./MainLayout.jsx";
import RequireAuth from "../auth/RequireAuth.jsx";
import RequireSuperAdmin from "../auth/RequireSuperAdmin.jsx";
import RequireSetup from "../auth/RequireSetup.jsx";

// Component to validate that the URL username matches the authenticated user
function ValidateUserAccess({ children }) {
  const { username: urlUsername } = useParams();
  const { user, loading } = useAuth();
  
  console.log(`🔍 ValidateUserAccess - URL: ${urlUsername}, User: ${user?.username}, Loading: ${loading}`);
  
  if (loading) {
    console.log(`⏳ ValidateUserAccess - Still loading auth...`);
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }
  
  // Check if user is authenticated and username matches
  if (!user) {
    console.log(`❌ ValidateUserAccess - No user, redirecting to login`);
    return <Navigate to="/login" replace />;
  }
  
  // Allow access if username matches or user is super admin
  if (user.username === urlUsername || user.isSuperAdmin) {
    console.log(`✅ Access granted to ${urlUsername} for user ${user.username}`);
    return children;
  }
  
  // Username doesn't match - redirect to user's own space
  console.log(`❌ Access denied: ${user.username} cannot access ${urlUsername}'s page, redirecting to /${user.username}/manage/prizes`);
  return <Navigate to={`/${user.username}/manage/prizes`} replace />;
}

// User-specific routes component
export default function UserRoutes() {
  return (
    <Routes>
      {/* User-specific routes: /{username}/page */}
      {/* Draw page - requires authentication and username match */}
      <Route path="/:username/draw" element={
        <ValidateUserAccess>
          <RequireAuth>
            <RequireSetup>
              <MainLayout><Draw /></MainLayout>
            </RequireSetup>
          </RequireAuth>
        </ValidateUserAccess>
      } />
      
      {/* Stock page - publicly accessible for all usernames */}
      <Route path="/:username/stock" element={
        <MainLayout><Stock /></MainLayout>
      } />
      
      <Route path="/:username/account" element={
        <ValidateUserAccess>
          <RequireAuth>
            <MainLayout><Account /></MainLayout>
          </RequireAuth>
        </ValidateUserAccess>
      } />
      
      {/* Manage routes - accessible to all authenticated users */}
      <Route path="/:username/manage" element={
        <ValidateUserAccess>
          <RequireAuth>
            <RequireSetup>
              <MainLayout><Manage /></MainLayout>
            </RequireSetup>
          </RequireAuth>
        </ValidateUserAccess>
      } />
      
      <Route path="/:username/manage/prizes" element={
        <ValidateUserAccess>
          <RequireAuth>
            <RequireSetup>
              <MainLayout><Manage /></MainLayout>
            </RequireSetup>
          </RequireAuth>
        </ValidateUserAccess>
      } />
      
      <Route path="/:username/manage/pricing" element={
        <ValidateUserAccess>
          <RequireAuth>
            <RequireSetup>
              <MainLayout><Manage /></MainLayout>
            </RequireSetup>
          </RequireAuth>
        </ValidateUserAccess>
      } />
      
      <Route path="/:username/manage/settings" element={
        <ValidateUserAccess>
          <RequireAuth>
            <RequireSetup>
              <MainLayout><Manage /></MainLayout>
            </RequireSetup>
          </RequireAuth>
        </ValidateUserAccess>
      } />
      
      <Route path="/:username/manage/analytics" element={
        <ValidateUserAccess>
          <RequireAuth>
            <RequireSetup>
              <MainLayout><Manage /></MainLayout>
            </RequireSetup>
          </RequireAuth>
        </ValidateUserAccess>
      } />
      
      <Route path="/:username/manage/branding" element={
        <ValidateUserAccess>
          <RequireAuth>
            <RequireSetup>
              <MainLayout><Manage /></MainLayout>
            </RequireSetup>
          </RequireAuth>
        </ValidateUserAccess>
      } />
      
      {/* Subscription Plan route */}
      <Route path="/:username/account/plan" element={
        <ValidateUserAccess>
          <RequireAuth>
            <RequireSetup>
              <MainLayout><SubscriptionPlanPage /></MainLayout>
            </RequireSetup>
          </RequireAuth>
        </ValidateUserAccess>
      } />
      
      {/* Admin route - user management (super admin only) */}
      <Route path="/:username/admin" element={
        <ValidateUserAccess>
          <RequireSuperAdmin>
            <RequireSetup>
              <MainLayout><Admin /></MainLayout>
            </RequireSetup>
          </RequireSuperAdmin>
        </ValidateUserAccess>
      } />
      
      {/* Default redirect for user routes */}
      <Route path="/:username" element={<Navigate to="./manage/settings" replace />} />
    </Routes>
  );
}
