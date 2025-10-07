import { useState } from "react";
import PrizePoolManager from "../components/Manage/PrizePoolManager.jsx";
import PricingManager from "../components/Manage/PricingManager.jsx";
import Settings from "../components/Manage/Settings.jsx";
import { useTranslation } from "../utils/TranslationContext.jsx";

export default function Manage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("prizes");

  const tabs = [
    { id: "prizes", label: t("manage.prizes") || "Prizes" },
    { id: "pricing", label: t("manage.pricing") || "Pricing" },
    { id: "settings", label: t("manage.settings") || "Settings" }
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
            onClick={() => setActiveTab(tab.id)}
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