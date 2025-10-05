import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Demo from "./pages/Demo.jsx";
import DemoStock from "./pages/DemoStock.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import MainLayout from "./components/MainLayout.jsx";
import AuthenticatedHome from "./components/AuthenticatedHome.jsx";
import UserRoutes from "./components/UserRoutes.jsx";
import AuthDebug from "./components/AuthDebug.jsx";
import { TranslationProvider } from "./utils/TranslationContext.jsx";
import { AuthProvider } from "./utils/AuthContext.jsx";
import { ToastProvider } from "./contexts/ToastContext.jsx";

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <TranslationProvider>
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<MainLayout><AuthenticatedHome /></MainLayout>} />
              <Route path="/demo" element={<Demo />} />
              <Route path="/demo/stock" element={<DemoStock />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              
              {/* Username-based routes: /{username}/{page} */}
              <Route path="/*" element={<UserRoutes />} />
            </Routes>
            <AuthDebug />
          </BrowserRouter>
        </TranslationProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
