import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Draw from "./pages/Draw.jsx";
import Admin from "./pages/Admin.jsx";
import MainLayout from "./components/MainLayout.jsx";
import { TranslationProvider } from "./utils/TranslationContext.jsx";

export default function App() {
  return (
    <TranslationProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout><Home /></MainLayout>} />
          <Route path="/draw" element={<MainLayout><Draw /></MainLayout>} />
          <Route path="/admin" element={<MainLayout><Admin /></MainLayout>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </TranslationProvider>
  );
}