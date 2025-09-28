import { useState } from "react";
import PrizePoolManager from "../components/Admin/PrizePoolManager.jsx";
import PricingManager from "../components/Admin/PricingManager.jsx";
import Settings from "../components/Admin/Settings.jsx";
import { useTranslation } from "../utils/TranslationContext.jsx";

export default function Admin() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("prizes");

  const tabs = [
    { id: "prizes", label: t("admin.prizes") },
    { id: "pricing", label: t("admin.pricing") },
    { id: "settings", label: t("admin.settings") }
  ];

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold text-white">{t("admin.title")}</h2>
        <p className="text-sm text-slate-400">
          {t("admin.description") || "Manage prize pools, configure pricing presets, and control session settings."}
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
                ? "bg-caris-primary text-white"
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