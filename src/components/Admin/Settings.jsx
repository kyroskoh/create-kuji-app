import { useEffect, useState } from "react";
import useLocalStorageDAO from "../../hooks/useLocalStorageDAO.js";
import { COLOR_PALETTE, DEFAULT_TIER_SEQUENCE } from "../../utils/tierColors.js";
import { getAllCountries } from "../../utils/flags.js";
import { useTranslation } from "../../utils/TranslationContext.jsx";

const CURRENCY_OPTIONS = [
  { code: "MYR", name: "Malaysian Ringgit", symbol: "RM", locale: "ms-MY" },
  { code: "SGD", name: "Singapore Dollar", symbol: "$", locale: "en-SG" },
  { code: "USD", name: "US Dollar", symbol: "$", locale: "en-US" },
  { code: "GBP", name: "British Pound", symbol: "£", locale: "en-GB" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", locale: "ja-JP" },
  { code: "AUD", name: "Australian Dollar", symbol: "$", locale: "en-AU" },
  { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp", locale: "id-ID" },
  { code: "PHP", name: "Philippine Peso", symbol: "₱", locale: "en-PH" },
  { code: "THB", name: "Thai Baht", symbol: "฿", locale: "th-TH" },
  { code: "VND", name: "Vietnamese Dong", symbol: "₫", locale: "vi-VN" }
];

export default function Settings() {
  const { getSettings, setSettings, resetAll, getHistory, getPrizes, getPricing } = useLocalStorageDAO();
  const { t } = useTranslation();
  const [settings, updateSettings] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState(null);
  const [showExportPrompt, setShowExportPrompt] = useState(false);
  const [exportData, setExportData] = useState(null);
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const storedSettings = await getSettings();
      if (mounted) {
        updateSettings(storedSettings);
        setCountries(getAllCountries());
        setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [getSettings]);

  const handleChange = (key, value) => {
    updateSettings((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    try {
      await setSettings(settings);
      setStatus({ type: "success", message: `${t("app.success")}: ${t("settings.saved")}` });
    } catch (error) {
      setStatus({ type: "error", message: `${t("app.error")}: ${error.message}` });
    }
  };

  const handleReset = async () => {
    // Get all data before resetting
    const [history, prizes, pricing] = await Promise.all([
      getHistory(),
      getPrizes(),
      getPricing()
    ]);
    
    // Prepare export data
    setExportData({
      history,
      prizes,
      pricing,
      settings
    });
    
    // Show export prompt
    setShowExportPrompt(true);
  };
  
  const handleConfirmReset = async () => {
    try {
      await resetAll();
      const freshSettings = await getSettings();
      updateSettings(freshSettings);
      setStatus({ type: "success", message: t("settings.resetSuccess") });
      setShowExportPrompt(false);
    } catch (error) {
      setStatus({ type: "error", message: `${t("app.error")}: ${error.message}` });
    }
  };
  
  const handleExportAllData = () => {
    if (!exportData) return;
    
    const jsonData = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `caris-kuji-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  const handleCancelReset = () => {
    setShowExportPrompt(false);
    setExportData(null);
  };

  const handleTierColorChange = (tier, colorId) => {
    updateSettings((prev) => ({
      ...prev,
      tierColors: {
        ...(prev.tierColors || {}),
        [tier]: colorId
      }
    }));
  };

  const handleCountryChange = (e) => {
    const selectedCountry = countries.find(c => c.code === e.target.value) || {};
    updateSettings((prev) => ({
      ...prev,
      country: selectedCountry.name || "",
      countryCode: selectedCountry.code || "",
      countryEmoji: selectedCountry.emoji || ""
    }));
  };

  if (isLoading) {
    return <p className="text-sm text-slate-400">{t("app.loading")}</p>;
  }

  return (
    <div className="space-y-6">
      <section className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/60 p-6">
        <h3 className="text-lg font-semibold text-white">{t("settings.title")}</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-xs uppercase tracking-wide text-slate-400">
              {t("settings.currency")}
            </label>
            <select
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-caris-primary/70 focus:outline-none focus:ring-2 focus:ring-caris-primary/30"
              value={settings.currency || "MYR"}
              onChange={(e) => {
                const selected = CURRENCY_OPTIONS.find((c) => c.code === e.target.value);
                if (selected) {
                  handleChange("currency", selected.code);
                  handleChange("locale", selected.locale);
                }
              }}
            >
              {CURRENCY_OPTIONS.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.name} ({currency.symbol})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide text-slate-400">
              {t("settings.nextSessionNumber")}
            </label>
            <input
              type="number"
              min="1"
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-caris-primary/70 focus:outline-none focus:ring-2 focus:ring-caris-primary/30"
              value={settings.nextSessionNumber || 1}
              onChange={(e) => handleChange("nextSessionNumber", Math.max(1, parseInt(e.target.value, 10) || 1))}
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide text-slate-400">
              {t("settings.country")}
            </label>
            <div className="mt-1 flex items-center gap-2">
              <select
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-caris-primary/70 focus:outline-none focus:ring-2 focus:ring-caris-primary/30"
                value={settings.countryCode || ""}
                onChange={handleCountryChange}
              >
                <option value="">-- {t("settings.selectCountry")} --</option>
                {countries.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.emoji} {country.name}
                  </option>
                ))}
              </select>
              <span className="text-xl">{settings.countryEmoji}</span>
            </div>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide text-slate-400">
              {t("settings.weightMode")}
            </label>
            <select
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-caris-primary/70 focus:outline-none focus:ring-2 focus:ring-caris-primary/30"
              value={settings.weightMode || "basic"}
              onChange={(e) => handleChange("weightMode", e.target.value)}
            >
              <option value="basic">{t("settings.basic")}</option>
              <option value="advanced">{t("settings.advanced")}</option>
            </select>
            <p className="mt-1 text-xs text-slate-400">
              {settings.weightMode === "advanced" 
                ? t("settings.advancedDesc")
                : t("settings.basicDesc")}
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/60 p-6">
        <h3 className="text-lg font-semibold text-white">{t("settings.tierColors")}</h3>
        <p className="text-sm text-slate-400">
          {t("settings.tierColorsDesc")}
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {DEFAULT_TIER_SEQUENCE.slice(0, 12).map((tier) => (
            <div key={tier} className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-200">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-xs font-bold">
                  {tier}
                </span>
                {t("draw.tier")} {tier}
              </label>
              <select
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-caris-primary/70 focus:outline-none focus:ring-2 focus:ring-caris-primary/30"
                value={settings.tierColors?.[tier] || ""}
                onChange={(e) => handleTierColorChange(tier, e.target.value)}
              >
                {COLOR_PALETTE.map((color) => (
                  <option key={color.id} value={color.id}>
                    {color.label}
                  </option>
                ))}
              </select>
              <div
                className={`h-2 w-full rounded-full ${COLOR_PALETTE.find((c) => c.id === (settings.tierColors?.[tier] || ""))?.swatchClass || "bg-slate-400"}`}
              />
            </div>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={handleSave}>
          {t("app.save")}
        </button>
        <button
          type="button"
          className="bg-red-800 text-red-100"
          onClick={handleReset}
        >
          {t("settings.resetAll")}
        </button>
        {status && (
          <span
            className={`text-sm font-medium ${
              status.type === "error" ? "text-red-400" : "text-emerald-400"
            }`}
          >
            {status.message}
          </span>
        )}
      </div>

      {showExportPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-white">{t("settings.resetWarning")}</h3>
            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                className="bg-emerald-800 text-emerald-100"
                onClick={handleExportAllData}
              >
                {t("settings.exportFirst")}
              </button>
              <button
                type="button"
                className="bg-red-800 text-red-100"
                onClick={handleConfirmReset}
              >
                {t("settings.resetConfirm")}
              </button>
              <button
                type="button"
                className="bg-slate-800 text-slate-200"
                onClick={handleCancelReset}
              >
                {t("settings.resetCancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}