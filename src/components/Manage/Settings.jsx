import { useEffect, useMemo, useRef, useState } from "react";
import useLocalStorageDAO from "../../hooks/useLocalStorageDAO.js";
import { DEFAULT_TIER_COLOR_MAP, DEFAULT_TIER_SEQUENCE, compareTierLabels, tierChipClass, tierSwatchClass } from "../../utils/tierColors.js";
import { COLOR_PALETTE } from "../../utils/colorPalette.js";
import { flagFromCountryCode, normalizeCountryCode } from "../../utils/flags.js";
import { useAuth } from "../../utils/AuthContext.jsx";
import { syncUserData } from "../../services/syncService.js";
import { COUNTRIES, searchCountries, formatCurrencySample } from "../../utils/countries.js";
import { getAvailableColorsForPlan, canCreateTier, getAvailableWeightModesForPlan, getMaxTierNameLength, isTierSortingAllowed, validateTierName } from "../../utils/subscriptionPlans.js";
import SubscriptionPlan from "./SubscriptionPlan.jsx";

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

// Using comprehensive COUNTRIES database from utils/countries.js

const normalizeTierKey = (value) => value.trim().toUpperCase().slice(0, 6);

export default function Settings() {
  const { getPrizes, setPrizes, getPricing, setPricing, getHistory, saveHistory, getSettings, setSettings, resetAll } = useLocalStorageDAO();
  const { user } = useAuth();
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
    weightMode: "basic",
    subscriptionPlan: "free" // Default plan
  });
  const [statusMessage, setStatusMessage] = useState(null);
  const [countryQuery, setCountryQuery] = useState("Malaysia");
  const [filteredCountries, setFilteredCountries] = useState(COUNTRIES.slice(0, 20)); // Show first 20 by default
  const [customCurrency, setCustomCurrency] = useState("");
  const [newTierKey, setNewTierKey] = useState("");
  const [tierNameError, setTierNameError] = useState("");
  const [activeTier, setActiveTier] = useState("S");
  const [draggedTier, setDraggedTier] = useState(null);
  const fileInputRef = useRef(null);

  // Popular countries for sample display (Asia-focused with major global currencies)
  const popularCountries = useMemo(() => [
    // Southeast Asia
    "Malaysia", "Singapore", "Indonesia", "Thailand", "Philippines", "Vietnam",
    // East Asia
    "Japan", "South Korea", "China", "Hong Kong", "Taiwan",
    // South Asia & Oceania
    "India", "Australia",
    // Major global currencies
    "United States", "United Kingdom", "Germany", "Canada"
  ], []);

  // Get sample countries to display (popular countries or filtered results)
  const sampleCountries = useMemo(() => {
    if (countryQuery.trim() === "" || countryQuery.toLowerCase() === "malaysia") {
      // Show popular countries by default (Asia-focused + major currencies)
      return COUNTRIES.filter(c => popularCountries.includes(c.name));
    }
    // Show filtered results when searching
    return filteredCountries.slice(0, 12);
  }, [countryQuery, filteredCountries, popularCountries]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const data = await getSettings();
      if (mounted) {
        setLocalSettings(data);
        setCountryQuery(data.country ?? "");
        // Use the tier order from saved settings, or default sequence if none
        const tiers = data.tierColors ? Object.keys(data.tierColors) : DEFAULT_TIER_SEQUENCE;
        // Only sort if tier sorting is not allowed (determined by subscription plan)
        const shouldSort = !isTierSortingAllowed(data.subscriptionPlan || "free");
        const orderedTiers = shouldSort ? tiers.sort(compareTierLabels) : tiers;
        setActiveTier(orderedTiers[0] ?? "S");
      }
    })();
    return () => {
      mounted = false;
    };
  }, [getSettings]);

  const tierColors = settings.tierColors ?? DEFAULT_TIER_COLOR_MAP;

  // Check if tier sorting is allowed (must be declared before tierList)
  const tierSortingAllowed = useMemo(() => {
    return isTierSortingAllowed(settings.subscriptionPlan || "free");
  }, [settings.subscriptionPlan]);

  const tierList = useMemo(() => {
    // If tier sorting is allowed and we have custom order in tierColors, use that order
    // Otherwise, sort alphabetically
    const tierKeys = Object.keys(tierColors);
    if (tierKeys.length > 0 && tierSortingAllowed) {
      // Use the order from tierColors object (insertion order is preserved in JS objects)
      return tierKeys;
    }
    // Default: merge DEFAULT_TIER_SEQUENCE with tierColors keys and sort
    const keys = new Set(DEFAULT_TIER_SEQUENCE);
    Object.keys(tierColors).forEach((key) => keys.add(key));
    return Array.from(keys).sort(compareTierLabels);
  }, [tierColors, tierSortingAllowed]);

  // Get available colors and weight modes based on subscription plan
  const availableColors = useMemo(() => {
    return getAvailableColorsForPlan(COLOR_PALETTE, settings.subscriptionPlan || "free");
  }, [settings.subscriptionPlan]);

  const availableWeightModes = useMemo(() => {
    return getAvailableWeightModesForPlan(WEIGHT_MODES, settings.subscriptionPlan || "free");
  }, [settings.subscriptionPlan]);

  // Check if user can create more tiers
  const canAddMoreTiers = useMemo(() => {
    return canCreateTier(tierList.length, settings.subscriptionPlan || "free");
  }, [tierList.length, settings.subscriptionPlan]);

  // Get max tier name length for current plan
  const maxTierNameLength = useMemo(() => {
    return getMaxTierNameLength(settings.subscriptionPlan || "free");
  }, [settings.subscriptionPlan]);

  // Manage custom tier order (only for Advanced & Pro plans)
  const [customTierOrder, setCustomTierOrder] = useState([]);

  useEffect(() => {
    if (!tierList.includes(activeTier) && tierList.length) {
      setActiveTier(tierList[0]);
    }
  }, [tierList, activeTier]);

  const updateSettings = async (next) => {
    // When updating tierColors, preserve the order from next.tierColors if provided
    // Only merge with defaults if next.tierColors is not provided
    const nextTierColors = next.tierColors
      ? next.tierColors // Use the new order directly (for drag-and-drop reordering)
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
    
    // Sync settings to backend if user is authenticated
    if (user?.username) {
      setTimeout(async () => {
        try {
          await syncUserData(user.username, 'settings', merged);
          console.log('✅ Settings synced to backend');
        } catch (syncError) {
          console.warn('⚠️ Failed to sync settings to backend:', syncError);
        }
      }, 500);
    }
  };

  const performReset = async () => {
    await resetAll();
    const fresh = await getSettings();
    setLocalSettings(fresh);
    setCountryQuery(fresh.country ?? "");
    // Use the tier order from reset settings, or default sequence if none
    const tiers = fresh.tierColors ? Object.keys(fresh.tierColors) : DEFAULT_TIER_SEQUENCE;
    const shouldSort = !isTierSortingAllowed(fresh.subscriptionPlan || "free");
    const orderedTiers = shouldSort ? tiers.sort(compareTierLabels) : tiers;
    setActiveTier(orderedTiers[0] ?? "S");
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

  const handleImportAllClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportAll = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    try {
      const fileContents = await file.text();
      const payload = JSON.parse(fileContents);
      const prizes = Array.isArray(payload.prizes) ? payload.prizes : [];
      const pricing = Array.isArray(payload.pricing) ? payload.pricing : [];
      const history = Array.isArray(payload.history) ? payload.history : [];
      const incomingSettings = payload.settings ?? {};

      await Promise.all([setPrizes(prizes), setPricing(pricing), saveHistory(history)]);
      await setSettings(incomingSettings);

      const mergedSettings = await getSettings();
      setLocalSettings(mergedSettings);
      setCountryQuery(mergedSettings.country ?? "");
      // Use the tier order from imported settings, or default sequence if none
      const tiers = mergedSettings.tierColors ? Object.keys(mergedSettings.tierColors) : DEFAULT_TIER_SEQUENCE;
      const shouldSort = !isTierSortingAllowed(mergedSettings.subscriptionPlan || "free");
      const orderedTiers = shouldSort ? tiers.sort(compareTierLabels) : tiers;
      setActiveTier(orderedTiers[0] ?? "S");

      setStatusMessage("Data import complete.");
    } catch (error) {
      console.error("Import failed:", error);
      setStatusMessage("Failed to import data. Please verify the file.");
    } finally {
      event.target.value = "";
    }
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
    link.download = `create-kuji-export-settings-${timestamp}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setStatusMessage("Data export generated.");
  };

  const matchedCountry = useMemo(() => {
    const trimmed = countryQuery.trim();
    if (!trimmed) return null;
    return COUNTRIES.find((country) => country.name.toLowerCase() === trimmed.toLowerCase());
  }, [countryQuery]);

  const handleCountryInput = (value) => {
    setCountryQuery(value);
    
    // Update filtered list for dropdown
    const filtered = searchCountries(value);
    setFilteredCountries(filtered.slice(0, 50)); // Limit to 50 results
    
    // Auto-apply if exact match
    const match = COUNTRIES.find((country) => country.name.toLowerCase() === value.toLowerCase());
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
    const match = COUNTRIES.find((country) => country.name.toLowerCase() === trimmed.toLowerCase());
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
    setTierNameError("");
    
    if (!canAddMoreTiers) {
      setStatusMessage("Tier limit reached for your plan. Upgrade to add more tiers.");
      return;
    }

    // Validate tier name
    const validation = validateTierName(newTierKey, settings.subscriptionPlan || "free");
    if (!validation.valid) {
      setTierNameError(validation.error);
      return;
    }

    const tier = validation.value;
    
    // Check if tier already exists
    if (tierColors[tier]) {
      setTierNameError(`Tier "${tier}" already exists`);
      return;
    }

    // Preserve existing tier order and add new tier at the end
    const updatedColors = { ...tierColors, [tier]: availableColors[Object.keys(tierColors).length % availableColors.length]?.id ?? availableColors[0]?.id ?? COLOR_PALETTE[0].id };
    
    updateSettings({ tierColors: updatedColors });
    setActiveTier(tier);
    setNewTierKey("");
    setTierNameError("");
  };

  const handleTierColorChange = (colorId) => {
    if (!activeTier) return;
    const updatedColors = { ...tierColors, [activeTier]: colorId };
    updateSettings({ tierColors: updatedColors });
  };

  const handleWeightModeChange = (mode) => {
    updateSettings({ weightMode: mode === "advanced" ? "advanced" : "basic" });
  };

  const handlePlanChange = async (planId) => {
    await updateSettings({ subscriptionPlan: planId });
    setStatusMessage(`Plan changed to ${planId}. Features updated.`);
  };

  const activeCountryEmoji = settings.countryEmoji || flagFromCountryCode(settings.countryCode || "");

  return (
    <div className="space-y-6">
      {/* Subscription Plan Section */}
      <SubscriptionPlan 
        currentPlan={settings.subscriptionPlan || "free"} 
        onPlanChange={handlePlanChange}
      />
      <div className="space-y-3">
        <h3 className="text-xl font-semibold text-white">Session Controls</h3>
        <p className="text-sm text-slate-400">
          Control your kuji drawing session state. Use these to manage when prizes can be drawn.
        </p>
        <div className="flex flex-wrap gap-2">
          {SESSION_STATUSES.map((status) => {
            const statusInfo = {
              INACTIVE: {
                description: "Drawing disabled - Setup mode",
                icon: "⏸️"
              },
              ACTIVE: {
                description: "Drawing enabled - Users can draw prizes",
                icon: "✅"
              },
              PAUSED: {
                description: "Temporarily paused - No draws allowed",
                icon: "⏯️"
              }
            };
            
            return (
              <button
                key={status}
                type="button"
                className={`rounded-full px-4 py-2 text-xs font-semibold uppercase transition-all ${
                  settings.sessionStatus === status
                    ? "bg-create-primary text-white shadow-lg shadow-create-primary/30"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white hover:shadow-md"
                }`}
                onClick={() => updateSettings({ sessionStatus: status })}
                title={statusInfo[status]?.description || status}
              >
                {statusInfo[status]?.icon} {status}
              </button>
            );
          })}
        </div>
        <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
          <h4 className="text-sm font-semibold text-white mb-2">Session Status Guide:</h4>
          <ul className="space-y-2 text-xs text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-yellow-400 mt-0.5">⏸️</span>
              <div>
                <span className="font-semibold text-white">INACTIVE:</span> Use this when setting up your kuji event. 
                No prizes can be drawn. Perfect for configuring tiers, adding prizes, and testing.
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">✅</span>
              <div>
                <span className="font-semibold text-white">ACTIVE:</span> Your kuji event is live! 
                Users can draw prizes. Switch to this when you're ready to start the event.
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-0.5">⏯️</span>
              <div>
                <span className="font-semibold text-white">PAUSED:</span> Temporarily stop drawing without ending the session. 
                Use this for breaks, restocking prizes, or when you need to make adjustments.
              </div>
            </li>
          </ul>
          <div className="mt-3 pt-3 border-t border-slate-700">
            <p className="text-xs text-slate-400">
              💡 <span className="font-semibold">Tip:</span> Always start with INACTIVE to set up your event safely. 
              Switch to ACTIVE when ready, and use PAUSED for temporary breaks.
            </p>
          </div>
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
                className="w-56 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-create-primary/70 focus:outline-none focus:ring-2 focus:ring-create-primary/30"
                value={countryQuery}
                onChange={(event) => handleCountryInput(event.target.value)}
                placeholder="Malaysia"
              />
              <button 
                type="button" 
                className="bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white hover:shadow-md transition-all" 
                onClick={applyCountrySelection}
              >
                Apply
              </button>
            </div>
            <datalist id="country-options">
              {filteredCountries.map((country) => {
                const emoji = flagFromCountryCode(country.code);
                return <option key={country.code} value={country.name} label={`${emoji} ${country.name} (${country.currency})`} />;
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
                className="w-32 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm uppercase text-slate-100 focus:border-create-primary/70 focus:outline-none focus:ring-2 focus:ring-create-primary/30"
                value={customCurrency}
                onChange={(event) => setCustomCurrency(event.target.value)}
                placeholder="MYR"
              />
              <button 
                type="submit"
                className="hover:shadow-md transition-all"
              >
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
          <p className="mt-2">
            Sample formatting
            {countryQuery.trim() === "" || countryQuery.toLowerCase() === "malaysia" 
              ? " (Popular in Asia + Major Currencies)" 
              : " (showing top matches)"}
            :
          </p>
          <ul className="mt-2 grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {sampleCountries.map((country) => {
              const emoji = flagFromCountryCode(country.code);
              return (
                <li 
                  key={country.code} 
                  className="flex flex-col text-slate-300 rounded-lg px-2 py-1.5 transition-colors hover:bg-slate-800/60 hover:text-white cursor-default"
                >
                  <span className="text-xs uppercase tracking-wide text-slate-500 group-hover:text-slate-400">
                    {emoji} {country.name}
                  </span>
                  <span className="font-semibold">
                    {country.currency} | {formatCurrencySample(country.locale, country.currency)}
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
          {WEIGHT_MODES.map((mode) => {
            const isAvailable = availableWeightModes.some(m => m.id === mode.id);
            const isSelected = settings.weightMode === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => isAvailable && handleWeightModeChange(mode.id)}
                disabled={!isAvailable}
                className={`relative rounded-xl border px-4 py-3 text-left text-sm transition-all ${
                  isSelected
                    ? "border-create-primary bg-create-primary/20 text-white shadow-lg shadow-create-primary/20"
                    : isAvailable
                    ? "border-slate-700 bg-slate-900 text-slate-200 hover:border-create-primary/60 hover:bg-slate-800 hover:text-white hover:shadow-md"
                    : "border-slate-800 bg-slate-900/50 text-slate-500 cursor-not-allowed"
                }`}
              >
                {!isAvailable && (
                  <span className="absolute top-2 right-2 text-xs rounded-full bg-slate-700 px-2 py-0.5 text-slate-400">
                    🔒 Upgrade
                  </span>
                )}
                <div className="font-semibold">{mode.label}</div>
                <div className={`mt-1 text-xs ${
                  isSelected ? "text-slate-300" : isAvailable ? "text-slate-400 group-hover:text-slate-300" : "text-slate-600"
                }`}>{mode.description}</div>
              </button>
            );
          })}
        </div>
      </div>
      <div className="space-y-3">
        <h3 className="text-xl font-semibold text-white">Tier Color Palette</h3>
        <p className="text-sm text-slate-400">
          Tier S is the top tier by default. Assign swatches to keep prize lists scannable.
          {!canAddMoreTiers && <span className="text-amber-400"> (Tier limit reached - upgrade to add more)</span>}
        </p>
        <div className="flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Tiers: {tierList.length} / {canAddMoreTiers ? "more available" : "limit reached"} | Max name length: {maxTierNameLength} char{maxTierNameLength > 1 ? 's' : ''}
          </div>
          {tierSortingAllowed && (
            <div className="text-xs text-emerald-400 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
              Drag to reorder
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {tierList.map((tier, index) => (
            <button
              key={tier}
              type="button"
              draggable={tierSortingAllowed}
              onDragStart={(e) => {
                if (!tierSortingAllowed) return;
                setDraggedTier(index);
                e.dataTransfer.effectAllowed = 'move';
              }}
              onDragOver={(e) => {
                if (!tierSortingAllowed) return;
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
              }}
              onDrop={(e) => {
                if (!tierSortingAllowed || draggedTier === null) return;
                e.preventDefault();
                
                // Don't do anything if dropped on same position
                if (draggedTier === index) {
                  setDraggedTier(null);
                  return;
                }
                
                const newList = [...tierList];
                const draggedItem = newList[draggedTier];
                newList.splice(draggedTier, 1);
                newList.splice(index, 0, draggedItem);
                
                // Update tier colors with new order - order matters in objects!
                const reorderedColors = {};
                newList.forEach(t => {
                  reorderedColors[t] = tierColors[t];
                });
                
                console.log('Reordering tiers:', tierList, '→', newList);
                updateSettings({ tierColors: reorderedColors });
                setDraggedTier(null);
              }}
              onDragEnd={() => setDraggedTier(null)}
              onClick={() => handleTierSelection(tier)}
              className={`${tierChipClass(tier, tierColors)} ${
                activeTier === tier ? "ring-2 ring-offset-2 ring-offset-slate-900" : ""
              } ${tierSortingAllowed ? "cursor-move" : ""} ${draggedTier === index ? "opacity-50" : ""}`}
            >
              {tierSortingAllowed && (
                <svg className="w-3 h-3 mr-1 inline" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" />
                </svg>
              )}
              Tier {tier}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-wide text-slate-500" htmlFor="new-tier">
              Add tier label ({maxTierNameLength} char{maxTierNameLength > 1 ? 's' : ''} max)
            </label>
            <div className="flex flex-col gap-1">
              <input
                id="new-tier"
                maxLength={maxTierNameLength}
                className={`w-32 rounded-md border ${
                  tierNameError ? "border-red-500" : "border-slate-700"
                } bg-slate-900 px-3 py-2 text-sm uppercase text-slate-100 focus:border-create-primary/70 focus:outline-none focus:ring-2 focus:ring-create-primary/30`}
                value={newTierKey}
                onChange={(event) => {
                  setNewTierKey(event.target.value);
                  setTierNameError("");
                }}
                placeholder={maxTierNameLength === 1 ? "S" : maxTierNameLength === 2 ? "SS" : "SSR"}
              />
              {tierNameError && (
                <span className="text-xs text-red-400">{tierNameError}</span>
              )}
            </div>
          </div>
          <button 
            type="button" 
            disabled={!canAddMoreTiers}
            className={`transition-all ${
              canAddMoreTiers
                ? "bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white hover:shadow-md"
                : "bg-slate-800/50 text-slate-500 cursor-not-allowed"
            }`}
            onClick={handleAddTier}
          >
            {canAddMoreTiers ? "Add tier" : "🔒 Upgrade to add more"}
          </button>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {COLOR_PALETTE.map((palette) => {
            const isAvailable = availableColors.some(c => c.id === palette.id);
            const isSelected = tierColors[activeTier] === palette.id;
            return (
              <button
                key={palette.id}
                type="button"
                onClick={() => isAvailable && handleTierColorChange(palette.id)}
                disabled={!isAvailable}
                className={`relative flex items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm font-semibold transition-all ${
                  isSelected
                    ? "border-create-primary bg-create-primary/20 text-white shadow-lg shadow-create-primary/20"
                    : isAvailable
                    ? "border-slate-700 bg-slate-900 text-slate-200 hover:border-create-primary/60 hover:bg-slate-800 hover:text-white hover:shadow-md"
                    : "border-slate-800 bg-slate-900/50 text-slate-500 cursor-not-allowed"
                }`}
              >
                <span className={`h-4 w-4 rounded-full ${tierSwatchClass(palette.id)} ${!isAvailable ? "opacity-40" : ""}`} />
                <span className="flex flex-col flex-1">
                  <span>{palette.label}</span>
                  <span className={`text-xs font-mono ${
                    isSelected ? "text-slate-300" : isAvailable ? "text-slate-500" : "text-slate-600"
                  }`}>{palette.hex}</span>
                </span>
                {!isAvailable && (
                  <span className="text-xs text-slate-500">🔒</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      <div className="space-y-3">
        <h3 className="text-xl font-semibold text-white">Maintenance</h3>
        <p className="text-sm text-slate-400">
          Export your data regularly so you can restore sessions after resets.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <button 
            type="button" 
            className="bg-emerald-600/80 text-white hover:bg-emerald-600 hover:shadow-lg transition-all" 
            onClick={handleImportAllClick}
          >
            Import All Data
          </button>
          <button 
            type="button" 
            className="bg-create-primary/80 text-white hover:bg-create-primary hover:shadow-lg transition-all" 
            onClick={handleExportAll}
          >
            Export All Data
          </button>
          <button 
            type="button" 
            className="bg-red-600/80 text-white hover:bg-red-600 hover:shadow-lg transition-all" 
            onClick={handleResetClick}
          >
            Reset Session Data
          </button>
          <button 
            type="button" 
            className="bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white hover:shadow-md transition-all" 
            onClick={handleResetCounter}
          >
            Reset Session Counter
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={handleImportAll}
        />
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

