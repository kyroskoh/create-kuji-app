import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const isActive = (page) => {
    if (!user) return false;
    const expectedPath = `/${user.username}/${page}`;
    
    // For manage page, also match all manage sub-routes
    if (page === "manage") {
      return location.pathname.startsWith(`/${user.username}/manage`);
    }
    
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
              
              {/* Mobile menu button */}
              <button
                type="button"
                className="ml-4 md:hidden inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <span className="sr-only">Open main menu</span>
                {mobileMenuOpen ? (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
              
              {/* Desktop navigation */}
              <nav className="ml-8 hidden space-x-4 md:flex">
                {!user && (
                  <>
                    <Link 
                      to="/demo-page" 
                      className="rounded-md px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white"
                    >
                      Try Demo 🎮
                    </Link>
                    <Link 
                      to="/demo/stock" 
                      className="rounded-md px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white"
                    >
                      Demo Stock 📦
                    </Link>
                  </>
                )}
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
            
            {/* Desktop user controls */}
            <div className="hidden md:flex items-center gap-6">
              <UserDropdown />
              <LanguageSelector />
            </div>
          </div>
          
          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-3 space-y-1">
              {!user && (
                <>
                  <Link 
                    to="/demo-page" 
                    className="block rounded-md px-3 py-2 text-base font-medium text-slate-300 hover:bg-slate-700 hover:text-white"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Try Demo 🎮
                  </Link>
                  <Link 
                    to="/demo/stock" 
                    className="block rounded-md px-3 py-2 text-base font-medium text-slate-300 hover:bg-slate-700 hover:text-white"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Demo Stock 📦
                  </Link>
                </>
              )}
              {user && (
                <>
                  <Link 
                    to={getUserPageUrl("draw")} 
                    className={`block rounded-md px-3 py-2 text-base font-medium ${
                      isActive("draw") 
                        ? "bg-create-primary text-white" 
                        : "text-slate-300 hover:bg-slate-700 hover:text-white"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t("draw.title")}
                  </Link>
                  <Link 
                    to={getUserPageUrl("manage")} 
                    className={`block rounded-md px-3 py-2 text-base font-medium ${
                      isActive("manage") 
                        ? "bg-create-primary text-white" 
                        : "text-slate-300 hover:bg-slate-700 hover:text-white"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t("manage.title") || "Manage"}
                  </Link>
                  <Link 
                    to={getUserPageUrl("account")} 
                    className={`block rounded-md px-3 py-2 text-base font-medium ${
                      isActive("account") 
                        ? "bg-create-primary text-white" 
                        : "text-slate-300 hover:bg-slate-700 hover:text-white"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Account
                  </Link>
                  {user.isSuperAdmin && (
                    <Link 
                      to={getUserPageUrl("admin")} 
                      className={`block rounded-md px-3 py-2 text-base font-medium ${
                        isActive("admin") 
                          ? "bg-create-primary text-white" 
                          : "text-slate-300 hover:bg-slate-700 hover:text-white"
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t("admin.title") || "Admin"}
                    </Link>
                  )}
                </>
              )}
              
              {/* Mobile user controls */}
              <div className="border-t border-slate-700 pt-3 mt-3 space-y-2">
                <div className="px-3">
                  <UserDropdown />
                </div>
                <div className="px-3">
                  <LanguageSelector />
                </div>
              </div>
            </div>
          )}
        </div>
      </header>
      
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
