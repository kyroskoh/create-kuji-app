import { useEffect, useMemo, useState } from "react";
import useLocalStorageDAO from "../../hooks/useLocalStorageDAO.js";
import { DEFAULT_TIER_COLOR_MAP, DEFAULT_TIER_SEQUENCE, compareTierLabels, tierChipClass, tierSwatchClass } from "../../utils/tierColors.js";
import { COLOR_PALETTE } from "../../utils/colorPalette.js";
import { flagFromCountryCode, normalizeCountryCode } from "../../utils/flags.js";

const SESSION_STATUSES = ["INACTIVE", "ACTIVE", "PAUSED"];

const WEIGHT_MODES = [
  {
    id: "basic",
    label: "Basic (weight only)",
    description: "Uses the raw weight value once per prize. Quantity only prevents exhausted prizes from being drawn."
  },
  {
    id: "advanced",
    label: "Advanced (weight x quantity)",
    description: "Weights are multiplied by remaining quantity and tier priority to keep total probability near 100%."
  }
];

const COUNTRY_OPTIONS = [
  { name: "Malaysia", currency: "MYR", locale: "ms-MY", code: "MY" },
  { name: "Singapore", currency: "SGD", locale: "en-SG", code: "SG" },
  { name: "United States", currency: "USD", locale: "en-US", code: "US" },
  { name: "United Kingdom", currency: "GBP", locale: "en-GB", code: "GB" },
  { name: "Japan", currency: "JPY", locale: "ja-JP", code: "JP" },
  { name: "Australia", currency: "AUD", locale: "en-AU", code: "AU" },
  { name: "Indonesia", currency: "IDR", locale: "id-ID", code: "ID" },
  { name: "Philippines", currency: "PHP", locale: "en-PH", code: "PH" },
  { name: "Thailand", currency: "THB", locale: "th-TH", code: "TH" },
  { name: "Vietnam", currency: "VND", locale: "vi-VN", code: "VN" }
];

const formatSample = (locale, code) =>
  new Intl.NumberFormat(locale, {
    style: "currency",
    currency: code,
    maximumFractionDigits: 0
  }).format(1234);

const normalizeTierKey = (value) => value.trim().toUpperCase().slice(0, 6);

export default function Settings() {
  const { getPrizes, getPricing, getHistory, getSettings, setSettings, resetAll } = useLocalStorageDAO();
  const [settings, setLocalSettings] = useState({
    sessionStatus: "INACTIVE",
    lastReset: null,
    country: "Malaysia",
    countryCode: "MY",
    countryEmoji: flagFromCountryCode("MY"),
    currency: "MYR",
    locale: "ms-MY",
    tierColors: DEFAULT_TIER_COLOR_MAP,
    nextSessionNumber: 1,
    weightMode: "basic"
  });
  const [statusMessage, setStatusMessage] = useState(null);
  const [countryQuery, setCountryQuery] = useState("Malaysia");
  const [customCurrency, setCustomCurrency] = useState("");
  const [newTierKey, setNewTierKey] = useState("");
  const [activeTier, setActiveTier] = useState("S");

  useEffect(() => {
    let mounted = true;
    (async () => {
      const data = await getSettings();
      if (mounted) {
        setLocalSettings(data);
        setCountryQuery(data.country ?? "");
        const tiers = data.tierColors ? Object.keys({ ...DEFAULT_TIER_COLOR_MAP, ...data.tierColors }) : DEFAULT_TIER_SEQUENCE;
        const sortedTiers = tiers.sort(compareTierLabels);
        setActiveTier(sortedTiers[0] ?? "S");
      }
    })();
    return () => {
      mounted = false;
    };
  }, [getSettings]);

  const tierColors = settings.tierColors ?? DEFAULT_TIER_COLOR_MAP;

  const tierList = useMemo(() => {
    const keys = new Set(DEFAULT_TIER_SEQUENCE);
    Object.keys(tierColors).forEach((key) => keys.add(key));
    return Array.from(keys).sort(compareTierLabels);
  }, [tierColors]);

  useEffect(() => {
    if (!tierList.includes(activeTier) && tierList.length) {
      setActiveTier(tierList[0]);
    }
  }, [tierList, activeTier]);

  const updateSettings = async (next) => {
    const nextTierColors = next.tierColors
      ? { ...DEFAULT_TIER_COLOR_MAP, ...tierColors, ...next.tierColors }
      : tierColors;

    const countryCode = normalizeCountryCode(next.countryCode ?? settings.countryCode ?? "");
    const countryEmoji = next.countryEmoji || (countryCode ? flagFromCountryCode(countryCode) : settings.countryEmoji);

    const merged = {
      ...settings,
      ...next,
      tierColors: nextTierColors,
      countryCode: countryCode || settings.countryCode,
      countryEmoji: countryEmoji || settings.countryEmoji
    };

    setLocalSettings(merged);
    await setSettings(merged);
    setStatusMessage("Settings saved.");
  };

  const performReset = async () => {
    await resetAll();
    const fresh = await getSettings();
    setLocalSettings(fresh);
    setCountryQuery(fresh.country ?? "");
    const tiers = fresh.tierColors ? Object.keys({ ...DEFAULT_TIER_COLOR_MAP, ...fresh.tierColors }) : DEFAULT_TIER_SEQUENCE;
    const sortedTiers = tiers.sort(compareTierLabels);
    setActiveTier(sortedTiers[0] ?? "S");
    setStatusMessage("All data reset.");
  };

  const handleResetClick = async () => {
    if (!window.confirm("Export prizes, pricing, and history before resetting. Continue with session reset?")) {
      return;
    }
    await performReset();
  };

  const handleResetCounter = async () => {
    if (!window.confirm("Export your data before resetting the session counter. Reset counter now?")) {
      return;
    }
    await updateSettings({ nextSessionNumber: 1 });
  };

  const handleExportAll = async () => {
    const [prizeData, pricingData, historyData, currentSettings] = await Promise.all([
      getPrizes(),
      getPricing(),
      getHistory(),
      getSettings()
    ]);

    const payload = {
      exportedAt: new Date().toISOString(),
      settings: currentSettings,
      prizes: prizeData,
      pricing: pricingData,
      history: historyData
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const now = new Date();
    const pad = (value) => String(value).padStart(2, "0");
    const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    link.download = `caris-kuji-export-settings-${timestamp}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setStatusMessage("Data export generated.");
  };

  const matchedCountry = useMemo(() => {
    const query = (countryQuery || "").trim().toLowerCase();
    return COUNTRY_OPTIONS.find((option) => option.name.toLowerCase() === query);
  }, [countryQuery]);

  const handleCountryInput = (value) => {
    setCountryQuery(value);
    const match = COUNTRY_OPTIONS.find((option) => option.name.toLowerCase() === value.trim().toLowerCase());
    if (match) {
      updateSettings({
        country: match.name,
        countryCode: match.code,
        currency: match.currency,
        locale: match.locale,
        countryEmoji: flagFromCountryCode(match.code)
      });
    }
  };

  const applyCountrySelection = () => {
    const trimmed = countryQuery.trim();
    if (!trimmed) return;
    const match = COUNTRY_OPTIONS.find((option) => option.name.toLowerCase() === trimmed.toLowerCase());
    if (match) {
      updateSettings({
        country: match.name,
        countryCode: match.code,
        currency: match.currency,
        locale: match.locale,
        countryEmoji: flagFromCountryCode(match.code)
      });
    } else {
      updateSettings({ country: trimmed });
    }
  };

  const handleCustomCurrency = async (event) => {
    event.preventDefault();
    const value = customCurrency.trim().toUpperCase();
    if (!value) return;
    await updateSettings({ currency: value });
    setCustomCurrency("");
  };

  const handleTierSelection = (tier) => {
    setActiveTier(tier);
  };

  const handleAddTier = () => {
    const tier = normalizeTierKey(newTierKey);
    if (!tier) return;
    const updatedColors = { ...tierColors };
    if (!updatedColors[tier]) {
      const nextPalette = COLOR_PALETTE[Object.keys(updatedColors).length % COLOR_PALETTE.length]?.id ?? COLOR_PALETTE[0].id;
      updatedColors[tier] = nextPalette;
    }
    updateSettings({ tierColors: updatedColors });
    setActiveTier(tier);
    setNewTierKey("");
  };

  const handleTierColorChange = (colorId) => {
    if (!activeTier) return;
    const updatedColors = { ...tierColors, [activeTier]: colorId };
    updateSettings({ tierColors: updatedColors });
  };

  const handleWeightModeChange = (mode) => {
    updateSettings({ weightMode: mode === "advanced" ? "advanced" : "basic" });
  };

  const activeCountryEmoji = settings.countryEmoji || flagFromCountryCode(settings.countryCode || "");

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h3 className="text-xl font-semibold text-white">Session Controls</h3>
        <div className="flex flex-wrap gap-2">
          {SESSION_STATUSES.map((status) => (
            <button
              key={status}
              type="button"
              className={`rounded-full px-4 py-2 text-xs font-semibold uppercase ${
                settings.sessionStatus === status
                  ? "bg-caris-primary text-white"
                  : "bg-slate-800 text-slate-300"
              }`}
              onClick={() => updateSettings({ sessionStatus: status })}
            >
              {status}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <h3 className="text-xl font-semibold text-white">Region & Currency</h3>
        <p className="text-sm text-slate-400">
          Search for a country to auto-fill locale, currency, and flag. Override currency manually if needed.
        </p>
        <div className="flex flex-wrap gap-3">
          <div className="flex w-full flex-col gap-2 sm:w-auto">
            <label className="text-xs uppercase tracking-wide text-slate-500" htmlFor="country-search">
              Country search
            </label>
            <div className="flex gap-2">
              <input
                id="country-search"
                list="country-options"
                className="w-56 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-caris-primary/70 focus:outline-none focus:ring-2 focus:ring-caris-primary/30"
                value={countryQuery}
                onChange={(event) => handleCountryInput(event.target.value)}
                placeholder="Malaysia"
              />
              <button type="button" className="bg-slate-800 text-slate-200" onClick={applyCountrySelection}>
                Apply
              </button>
            </div>
            <datalist id="country-options">
              {COUNTRY_OPTIONS.map((option) => {
                const emoji = flagFromCountryCode(option.code);
                return <option key={option.name} value={option.name} label={`${emoji} ${option.name}`} />;
              })}
            </datalist>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto">
            <label className="text-xs uppercase tracking-wide text-slate-500" htmlFor="currency-code">
              Custom currency code
            </label>
            <form className="flex gap-2" onSubmit={handleCustomCurrency}>
              <input
                id="currency-code"
                maxLength={5}
                className="w-32 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm uppercase text-slate-100 focus:border-caris-primary/70 focus:outline-none focus:ring-2 focus:ring-caris-primary/30"
                value={customCurrency}
                onChange={(event) => setCustomCurrency(event.target.value)}
                placeholder="MYR"
              />
              <button type="submit">
                Save
              </button>
            </form>
          </div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-xs text-slate-400">
          <p>
            Active configuration: {activeCountryEmoji ? `${activeCountryEmoji} ` : ""}
            {settings.country || "Unknown country"} | {settings.currency || "Currency"} | {settings.locale || "Locale"}
          </p>
          <p className="mt-2">Sample formatting:</p>
          <ul className="mt-2 grid gap-2 sm:grid-cols-2">
            {COUNTRY_OPTIONS.map((option) => {
              const emoji = flagFromCountryCode(option.code);
              return (
                <li key={option.name} className="flex flex-col text-slate-300">
                  <span className="text-xs uppercase tracking-wide text-slate-500">
                    {emoji} {option.name}
                  </span>
                  <span className="font-semibold">
                    {option.currency} | {formatSample(option.locale, option.currency)}
                  </span>
                </li>
              );
            })}
          </ul>
          {matchedCountry ? (
            <p className="mt-2 text-emerald-400">
              Matched {flagFromCountryCode(matchedCountry.code)} {matchedCountry.name} | Currency {matchedCountry.currency}
            </p>
          ) : (
            <p className="mt-2 text-slate-500">Type a country name to auto-detect currency.</p>
          )}
        </div>
      </div>
      <div className="space-y-3">
        <h3 className="text-xl font-semibold text-white">Weight Engine</h3>
        <p className="text-sm text-slate-400">
          Advanced mode factors in remaining quantity and tier priority so probabilities stay near 100%.
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {WEIGHT_MODES.map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => handleWeightModeChange(mode.id)}
              className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
                settings.weightMode === mode.id
                  ? "border-caris-primary bg-caris-primary/20 text-white"
                  : "border-slate-700 bg-slate-900 text-slate-200 hover:border-caris-primary/60"
              }`}
            >
              <div className="font-semibold">{mode.label}</div>
              <div className="mt-1 text-xs text-slate-400">{mode.description}</div>
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <h3 className="text-xl font-semibold text-white">Tier Color Palette</h3>
        <p className="text-sm text-slate-400">
          Tier S is the top tier by default. Assign swatches to keep prize lists scannable.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {tierList.map((tier) => (
            <button
              key={tier}
              type="button"
              onClick={() => handleTierSelection(tier)}
              className={`${tierChipClass(tier, tierColors)} ${
                activeTier === tier ? "ring-2 ring-offset-2 ring-offset-slate-900" : ""
              }`}
            >
              Tier {tier}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-wide text-slate-500" htmlFor="new-tier">
              Add tier label
            </label>
            <input
              id="new-tier"
              className="w-32 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm uppercase text-slate-100 focus:border-caris-primary/70 focus:outline-none focus:ring-2 focus:ring-caris-primary/30"
              value={newTierKey}
              onChange={(event) => setNewTierKey(event.target.value)}
              placeholder="E"
            />
          </div>
          <button type="button" className="bg-slate-800 text-slate-200" onClick={handleAddTier}>
            Add tier
          </button>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {COLOR_PALETTE.map((palette) => (
            <button
              key={palette.id}
              type="button"
              onClick={() => handleTierColorChange(palette.id)}
              className={`flex items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm font-semibold transition ${
                tierColors[activeTier] === palette.id
                  ? "border-caris-primary bg-caris-primary/20 text-white"
                  : "border-slate-700 bg-slate-900 text-slate-200 hover:border-caris-primary/60"
              }`}
            >
              <span className={`h-4 w-4 rounded-full ${tierSwatchClass(palette.id)}`} />
              <span>{palette.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <h3 className="text-xl font-semibold text-white">Maintenance</h3>
        <p className="text-sm text-slate-400">
          Export your data regularly so you can restore sessions after resets.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" className="bg-slate-800 text-slate-200" onClick={handleExportAll}>
            Export All Data
          </button>
          <button type="button" className="bg-red-600/80" onClick={handleResetClick}>
            Reset Session Data
          </button>
          <button type="button" className="bg-slate-800 text-slate-200" onClick={handleResetCounter}>
            Reset Session Counter
          </button>
        </div>
        <p className="text-xs text-slate-500">Next session number: {settings.nextSessionNumber ?? 1}</p>
        {settings.lastReset && (
          <p className="text-xs text-slate-500">
            Last reset: {new Date(settings.lastReset).toLocaleString()}
          </p>
        )}
      </div>
      {statusMessage && <p className="text-sm text-emerald-400">{statusMessage}</p>}
    </div>
  );
}

