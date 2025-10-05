import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Draw from "./pages/Draw.jsx";
import Admin from "./pages/Admin.jsx";
import AdminUsers from "./pages/AdminUsers.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Account from "./pages/Account.jsx";
import Stock from "./pages/Stock.jsx";
import Demo from "./pages/Demo.jsx";
import MainLayout from "./components/MainLayout.jsx";
import { TranslationProvider } from "./utils/TranslationContext.jsx";
import { AuthProvider } from "./utils/AuthContext.jsx";
import { ToastProvider } from "./contexts/ToastContext.jsx";
import RequireAuth from "./auth/RequireAuth.jsx";
import RequireSuperAdmin from "./auth/RequireSuperAdmin.jsx";

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <TranslationProvider>
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<MainLayout><Home /></MainLayout>} />
              <Route path="/stock" element={<MainLayout><Stock /></MainLayout>} />
              <Route path="/demo" element={<Demo />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              
              {/* Protected routes (require authentication) */}
              <Route 
                path="/draw" 
                element={
                  <RequireAuth>
                    <MainLayout><Draw /></MainLayout>
                  </RequireAuth>
                } 
              />
              <Route 
                path="/account" 
                element={
                  <RequireAuth>
                    <MainLayout><Account /></MainLayout>
                  </RequireAuth>
                } 
              />
              
              {/* Super admin routes */}
              <Route 
                path="/admin" 
                element={
                  <RequireSuperAdmin>
                    <MainLayout><Admin /></MainLayout>
                  </RequireSuperAdmin>
                } 
              />
              <Route 
                path="/admin/users" 
                element={
                  <RequireSuperAdmin>
                    <MainLayout><AdminUsers /></MainLayout>
                  </RequireSuperAdmin>
                } 
              />
              
              {/* 404 redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </TranslationProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
