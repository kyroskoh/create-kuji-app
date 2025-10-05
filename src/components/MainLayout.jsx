import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "../utils/TranslationContext.jsx";
import LanguageSelector from "./LanguageSelector.jsx";

export default function MainLayout({ children }) {
  const { t } = useTranslation();
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path;
  
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <header className="bg-slate-800 shadow-md">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link to="/" className="text-xl font-bold text-white">
                {t("app.title")}
              </Link>
              <nav className="ml-8 hidden space-x-4 md:flex">
                <Link 
                  to="/draw" 
                  className={`rounded-md px-3 py-2 text-sm font-medium ${
                    isActive("/draw") 
                      ? "bg-create-primary text-white" 
                      : "text-slate-300 hover:bg-slate-700 hover:text-white"
                  }`}
                >
                  {t("draw.title")}
                </Link>
                <Link 
                  to="/admin" 
                  className={`rounded-md px-3 py-2 text-sm font-medium ${
                    isActive("/admin") 
                      ? "bg-create-primary text-white" 
                      : "text-slate-300 hover:bg-slate-700 hover:text-white"
                  }`}
                >
                  {t("admin.title")}
                </Link>
              </nav>
            </div>
            <div className="flex items-center">
              <LanguageSelector />
            </div>
          </div>
        </div>
      </header>
      
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}