import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import MainLayout from "./components/MainLayout.jsx";
import AuthenticatedHome from "./components/AuthenticatedHome.jsx";
import UserRoutes from "./components/UserRoutes.jsx";
import AuthDebug from "./components/AuthDebug.jsx";
import Stock from "./pages/Stock.jsx";
import { TranslationProvider } from "./utils/TranslationContext.jsx";
import { AuthProvider } from "./utils/AuthContext.jsx";
import { ToastProvider } from "./contexts/ToastContext.jsx";
import { SubscriptionProvider } from "./contexts/SubscriptionContext.jsx";
import { BrandingProvider } from "./contexts/BrandingContext.jsx";

export default function App() {
  return (
    <AuthProvider>
      <SubscriptionProvider>
        <BrandingProvider>
          <ToastProvider>
            <TranslationProvider>
              <BrowserRouter>
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<MainLayout><AuthenticatedHome /></MainLayout>} />
                  {/* Demo routes */}
                  <Route path="/demo" element={<Navigate to="/demo/stock" replace />} />
                  <Route path="/demo/stock" element={<MainLayout><Stock /></MainLayout>} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  
                  {/* Username-based routes: /{username}/{page} */}
                  <Route path="/*" element={<UserRoutes />} />
                </Routes>
                <AuthDebug />
              </BrowserRouter>
            </TranslationProvider>
          </ToastProvider>
        </BrandingProvider>
      </SubscriptionProvider>
    </AuthProvider>
  );
}
