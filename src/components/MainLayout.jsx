import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "../utils/TranslationContext.jsx";
import { useAuth } from "../utils/AuthContext.jsx";
import { useUserNavigation } from "../hooks/useUserNavigation.js";
import LanguageSelector from "./LanguageSelector.jsx";
import UserDropdown from "./UserDropdown.jsx";

export default function MainLayout({ children }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { getUserPageUrl } = useUserNavigation();
  const location = useLocation();
  
  const isActive = (page) => {
    if (!user) return false;
    const expectedPath = `/${user.username}/${page}`;
    return location.pathname === expectedPath;
  };
  
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
                {user && (
                  <>
                    <Link 
                      to={getUserPageUrl("draw")} 
                      className={`rounded-md px-3 py-2 text-sm font-medium ${
                        isActive("draw") 
                          ? "bg-create-primary text-white" 
                          : "text-slate-300 hover:bg-slate-700 hover:text-white"
                      }`}
                    >
                      {t("draw.title")}
                    </Link>
                    <Link 
                      to={getUserPageUrl("manage")} 
                      className={`rounded-md px-3 py-2 text-sm font-medium ${
                        isActive("manage") 
                          ? "bg-create-primary text-white" 
                          : "text-slate-300 hover:bg-slate-700 hover:text-white"
                      }`}
                    >
                      {t("manage.title") || "Manage"}
                    </Link>
                    <Link 
                      to={getUserPageUrl("account")} 
                      className={`rounded-md px-3 py-2 text-sm font-medium ${
                        isActive("account") 
                          ? "bg-create-primary text-white" 
                          : "text-slate-300 hover:bg-slate-700 hover:text-white"
                      }`}
                    >
                      Account
                    </Link>
                    {user.isSuperAdmin && (
                      <Link 
                        to={getUserPageUrl("admin")} 
                        className={`rounded-md px-3 py-2 text-sm font-medium ${
                          isActive("admin") 
                            ? "bg-create-primary text-white" 
                            : "text-slate-300 hover:bg-slate-700 hover:text-white"
                        }`}
                      >
                        {t("admin.title") || "Admin"}
                      </Link>
                    )}
                  </>
                )}
              </nav>
            </div>
            <div className="flex items-center gap-6">
              <UserDropdown />
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
