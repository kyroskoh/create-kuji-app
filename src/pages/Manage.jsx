import { useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import PrizePoolManager from "../components/Manage/PrizePoolManager.jsx";
import PricingManager from "../components/Manage/PricingManager.jsx";
import Settings from "../components/Manage/Settings.jsx";
import { useTranslation } from "../utils/TranslationContext.jsx";

export default function Manage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { username } = useParams();
  
  // Redirect from /manage to /manage/prizes
  useEffect(() => {
    if (location.pathname === `/${username}/manage`) {
      navigate(`/${username}/manage/prizes`, { replace: true });
    }
  }, [location.pathname, username, navigate]);
  
  // Determine active tab from URL path
  const getActiveTabFromPath = () => {
    const path = location.pathname;
    if (path.includes('/manage/prizes')) return 'prizes';
    if (path.includes('/manage/pricing')) return 'pricing';
    if (path.includes('/manage/settings')) return 'settings';
    return 'prizes'; // default
  };
  
  const activeTab = getActiveTabFromPath();

  const tabs = [
    { id: "prizes", label: t("manage.prizes") || "Prizes" },
    { id: "pricing", label: t("manage.pricing") || "Pricing" },
    { id: "settings", label: t("manage.settings") || "Configuration" }
  ];

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold text-white">{t("manage.title") || "Manage"}</h2>
        <p className="text-sm text-slate-400">
          {t("manage.description") || "Manage prize pools, configure pricing presets, and control session settings."}
        </p>
      </header>
      <nav className="flex gap-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => navigate(`/${username}/manage/${tab.id}`)}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
              activeTab === tab.id
                ? "bg-create-primary text-white"
                : "bg-slate-800/60 text-slate-300 hover:bg-slate-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-lg">
        {activeTab === "prizes" && <PrizePoolManager />}
        {activeTab === "pricing" && <PricingManager />}
        {activeTab === "settings" && <Settings />}
      </div>
    </section>
  );
}