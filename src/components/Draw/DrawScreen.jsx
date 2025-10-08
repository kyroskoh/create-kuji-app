import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import useLocalStorageDAO from "../../hooks/useLocalStorageDAO.js";
import { executeDraw } from "../../utils/randomDraw.js";
import { tierChipClass, sortTierEntries } from "../../utils/tierColors.js";
import { isTierSortingAllowed } from "../../utils/subscriptionPlans.js";
import ResultCard from "./ResultCard.jsx";
import HistoryPanel from "./HistoryPanel.jsx";
import ScratchCard from "./ScratchCard.jsx";
import { useAuth } from "../../utils/AuthContext.jsx";
import { syncUserData } from "../../services/syncService.js";
import BrandingHeader from "../Branding/BrandingHeader.jsx";
import BrandingFooter from "../Branding/BrandingFooter.jsx";
import BrandingWrapper from "../Branding/BrandingWrapper.jsx";

const createId = () => (globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2));

const LOCALE_MAP = {
  MYR: "ms-MY",
  SGD: "en-SG",
  USD: "en-US",
  GBP: "en-GB",
  JPY: "ja-JP",
  AUD: "en-AU",
  IDR: "id-ID",
  PHP: "en-PH",
  THB: "th-TH",
  VND: "vi-VN"
};

const normalisePresets = (list) =>
  list.map((preset) => {
    const priceSource =
      preset.price ??
      (preset.price_minor !== undefined && preset.price_minor !== null
        ? Number(preset.price_minor) / 100
        : undefined);
    const price = Math.max(0, Math.round(Number.parseFloat(priceSource ?? 0) || 0));
    return { ...preset, price };
  });

export default function DrawScreen() {
  const location = useLocation();
  const { getPrizes, setPrizes, getPricing, saveHistory, getHistory, getSettings, setSettings } = useLocalStorageDAO();
  const { user } = useAuth();
  const [prizes, setPrizePool] = useState([]);
  const [presets, setPresets] = useState([]);
  const [sessionSettings, setSessionSettings] = useState({
    currency: "MYR",
    locale: "ms-MY",
    tierColors: {},
    nextSessionNumber: 1,
    weightMode: "basic"
  });
  const [drawCount, setDrawCount] = useState(1);
  const [drawLabel, setDrawLabel] = useState("Custom");
  const [results, setResults] = useState([]);
  const [history, setHistory] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [error, setError] = useState(null);
  const [resultSearch, setResultSearch] = useState("");
  const [sortMode, setSortMode] = useState("recent");
  const [fanName, setFanName] = useState("");
  const [queueNumber, setQueueNumber] = useState("");
  const [sessionNumber, setSessionNumber] = useState(1);
  const [lastDrawInfo, setLastDrawInfo] = useState(null);
  const [isHistoryOpen, setHistoryOpen] = useState(false);
  const [useScratchMode, setUseScratchMode] = useState(false);
  const [revealedResults, setRevealedResults] = useState(new Set());

  // Load initial data
  useEffect(() => {
    let mounted = true;
    (async () => {
      const [storedPrizes, storedPresets, storedHistory, storedSettings] = await Promise.all([
        getPrizes(),
        getPricing(),
        getHistory(),
        getSettings()
      ]);
      if (!mounted) return;
      setPrizePool(storedPrizes);
      setPresets(normalisePresets(storedPresets));
      setHistory(storedHistory);
      setSessionSettings(storedSettings);
      setSessionNumber(storedSettings.nextSessionNumber ?? 1);
    })();
    return () => {
      mounted = false;
    };
  }, [getHistory, getPrizes, getPricing, getSettings]);

  // Refresh settings when navigating to this page (to pick up tier order changes)
  useEffect(() => {
    let mounted = true;
    (async () => {
      const storedSettings = await getSettings();
      if (mounted) {
        setSessionSettings(prevSettings => ({
          ...prevSettings,
          ...storedSettings
        }));
      }
    })();
    return () => {
      mounted = false;
    };
  }, [location.pathname, getSettings]); // Re-run when route changes

  const currencyFormatter = useMemo(() => {
    const currency = sessionSettings.currency || "MYR";
    const locale = sessionSettings.locale || LOCALE_MAP[currency] || navigator.language || "ms-MY";
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 0
    });
  }, [sessionSettings.currency, sessionSettings.locale]);

  const formatCurrency = useCallback(
    (value) => currencyFormatter.format(Math.max(0, Number.isFinite(value) ? value : 0)),
    [currencyFormatter]
  );

  const stockSnapshot = useMemo(() => {
    const grouped = prizes.reduce((acc, prize) => {
      if (!prize.tier) return acc;
      const tier = String(prize.tier).toUpperCase();
      acc[tier] = (acc[tier] || 0) + (Number(prize.quantity) || 0);
      return acc;
    }, {});
    // Sort tiers using custom order from settings if allowed
    const allowCustomOrder = isTierSortingAllowed(sessionSettings.subscriptionPlan || "free");
    const sortedEntries = sortTierEntries(Object.entries(grouped), sessionSettings.tierColors || {}, allowCustomOrder);
    return sortedEntries
      .map(([tier, qty]) => `${tier}:${qty}`)
      .join(" | ");
  }, [prizes, sessionSettings.tierColors, sessionSettings.subscriptionPlan]);

  const handlePresetClick = (preset) => {
    const totalDraws = Number(preset.draw_count || 0) + Number(preset.bonus_draws || 0);
    setDrawCount(totalDraws || 1);
    setDrawLabel(`${preset.label}${preset.bonus_draws ? ` (+${preset.bonus_draws})` : ""}`);
  };

  const handleDraw = async () => {
    const trimmedName = fanName.trim();
    if (!trimmedName) {
      setError("Fan name is required before drawing.");
      return;
    }
    if (!drawCount || drawCount <= 0) {
      setError("Enter a valid draw count.");
      return;
    }
    if (!prizes.length) {
      setError("No prizes available. Load prize pool in admin first.");
      return;
    }
    
    // Check event session status
    const eventStatus = sessionSettings.sessionStatus || 'INACTIVE';
    if (eventStatus === 'INACTIVE') {
      setError("No active event session. Start an event in Settings to accept draws.");
      return;
    }
    if (eventStatus === 'PAUSED') {
      setError("Event is paused. Resume the event in Settings to continue draws.");
      return;
    }

    setIsDrawing(true);
    setError(null);

    await new Promise((resolve) => setTimeout(resolve, 350));

    const { results: pulled, remaining } = executeDraw(prizes, drawCount, sessionSettings.weightMode);
    if (!pulled.length) {
      setError("All prize stock is exhausted.");
      setIsDrawing(false);
      return;
    }

    const sessionMeta = {
      id: createId(),
      sessionNumber,
      fanName: trimmedName,
      queueNumber: queueNumber.trim() || null,
      timestamp: new Date().toISOString(),
      label: drawLabel,
      eventId: sessionSettings.activeEventId, // Link to active event session
      eventName: sessionSettings.activeEventName
    };

    const resultItems = pulled.map((prize, index) => ({
      id: `${createId()}-${index}`,
      prize,
      drawIndex: index + 1
    }));

    setPrizePool(remaining);
    setResults(resultItems);
    setLastDrawInfo(sessionMeta);

    const nextHistory = [
      ...history,
      {
        ...sessionMeta,
        draws: pulled.map((prize) => ({ tier: prize.tier, prize: prize.prize_name, sku: prize.sku }))
      }
    ];

    const nextSessionNumber = sessionNumber + 1;
    const updatedSettings = {
      ...sessionSettings,
      nextSessionNumber
    };

    setHistory(nextHistory);
    setSessionNumber(nextSessionNumber);
    setSessionSettings(updatedSettings);

    await Promise.all([
      setPrizes(remaining),
      saveHistory(nextHistory),
      setSettings(updatedSettings)
    ]);
    
    // Sync updated data to backend if user is authenticated
    if (user?.username) {
      setTimeout(async () => {
        try {
          await Promise.allSettled([
            syncUserData(user.username, 'prizes', remaining),
            syncUserData(user.username, 'history', nextHistory),
            syncUserData(user.username, 'settings', updatedSettings)
          ]);
          console.log('✅ Draw results synced to backend');
        } catch (syncError) {
          console.warn('⚠️ Failed to sync draw results to backend:', syncError);
        }
      }, 1000); // Longer delay to let UI animations complete
    }

    setIsDrawing(false);
  };

  const processedResults = useMemo(() => {
    const query = resultSearch.trim().toLowerCase();
    let filtered = [...results];
    if (query) {
      filtered = filtered.filter(({ prize }) => {
        const tier = String(prize.tier || "").toLowerCase();
        const name = String(prize.prize_name || "").toLowerCase();
        const sku = String(prize.sku || "").toLowerCase();
        return tier.includes(query) || name.includes(query) || sku.includes(query);
      });
    }
    if (sortMode === "tier-asc" || sortMode === "tier-desc") {
      const direction = sortMode === "tier-asc" ? 1 : -1;
      filtered.sort((a, b) => {
        const tierA = String(a.prize.tier || "").toUpperCase();
        const tierB = String(b.prize.tier || "").toUpperCase();
        if (tierA === tierB) {
          return a.drawIndex - b.drawIndex;
        }
        return tierA.localeCompare(tierB) * direction;
      });
    }
    return filtered;
  }, [resultSearch, results, sortMode]);

  const tierCounts = useMemo(() => {
    const counts = processedResults.reduce((acc, item) => {
      const tier = String(item.prize.tier || "?").toUpperCase();
      acc[tier] = (acc[tier] || 0) + 1;
      return acc;
    }, {});
    // Sort tiers using custom order from settings if allowed
    const allowCustomOrder = isTierSortingAllowed(sessionSettings.subscriptionPlan || "free");
    return sortTierEntries(Object.entries(counts), sessionSettings.tierColors || {}, allowCustomOrder);
  }, [processedResults, sessionSettings.tierColors, sessionSettings.subscriptionPlan]);

  const unrevealedScratchCards = useMemo(() => {
    return processedResults.filter(item => useScratchMode && !revealedResults.has(item.id)).length;
  }, [processedResults, useScratchMode, revealedResults]);

  const openHistory = () => {
    setHistoryOpen(true);
  };

  const closeHistory = () => {
    setHistoryOpen(false);
  };

  const tierColors = sessionSettings.tierColors ?? {};

  return (
    <BrandingWrapper className="min-h-screen">
      <div className="space-y-6">
        {/* Custom Branding Header */}
        <BrandingHeader />
      
      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {presets
              .filter((preset) => preset.active)
              .map((preset) => (
                <button
                  key={preset.preset_id}
                  type="button"
                  onClick={() => handlePresetClick(preset)}
                  className="bg-slate-800 text-slate-200"
                >
                  {preset.label} | {formatCurrency(preset.price)}
                  {preset.bonus_draws ? ` (+${preset.bonus_draws})` : ""}
                </button>
              ))}
          </div>
          <div className="flex items-center gap-3">
            <label className="text-xs uppercase tracking-wide text-slate-400">Custom draws</label>
            <input
              type="number"
              min="1"
              className="w-24 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-right text-slate-100 focus:border-create-primary/70 focus:outline-none focus:ring-2 focus:ring-create-primary/30"
              value={drawCount}
              onChange={(event) => {
                setDrawLabel("Custom");
                setDrawCount(Number.parseInt(event.target.value, 10) || 1);
              }}
            />
          </div>
          <div className="ml-auto text-xs uppercase tracking-wide text-slate-400">
            Stock | {stockSnapshot || "N/A"}
          </div>
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase tracking-wide text-slate-400" htmlFor="fan-name">
              Fan name
            </label>
            <input
              id="fan-name"
              className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-create-primary/70 focus:outline-none focus:ring-2 focus:ring-create-primary/30"
              value={fanName}
              onChange={(event) => setFanName(event.target.value)}
              placeholder="e.g. Hana"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase tracking-wide text-slate-400" htmlFor="session-number">
              Session #
            </label>
            <input
              id="session-number"
              type="number"
              min="1"
              className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-create-primary/70 focus:outline-none focus:ring-2 focus:ring-create-primary/30"
              value={sessionNumber}
              onChange={(event) => setSessionNumber(Math.max(1, Number.parseInt(event.target.value, 10) || 1))}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase tracking-wide text-slate-400" htmlFor="queue-number">
              Queue (optional)
            </label>
            <input
              id="queue-number"
              className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-create-primary/70 focus:outline-none focus:ring-2 focus:ring-create-primary/30"
              value={queueNumber}
              onChange={(event) => setQueueNumber(event.target.value)}
              placeholder="e.g. Q15"
            />
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" onClick={handleDraw} disabled={isDrawing}>
            {isDrawing ? "Drawing..." : "Start Draw"}
          </button>
          <button
            type="button"
            className="bg-slate-800 text-slate-200"
            onClick={() => {
              setResults([]);
              setRevealedResults(new Set());
            }}
          >
            Clear Results
          </button>
          <button
            type="button"
            className="bg-slate-800 text-slate-200"
            onClick={openHistory}
          >
            History ({history.length})
          </button>
          <button
            type="button"
            className={useScratchMode ? "bg-purple-600 text-white" : "bg-slate-800 text-slate-200"}
            onClick={() => setUseScratchMode(!useScratchMode)}
            title="Toggle scratch card mode"
          >
            {useScratchMode ? "🪙 Scratch Mode ON" : "⚡ Instant Reveal"}
          </button>
        </div>
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      </section>
      <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-lg">
        <div className="mb-4 flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-2xl font-semibold text-white">Results</h3>
            <span className="text-sm text-slate-400">{drawLabel} | {processedResults.length} pulls</span>
          </div>
          <div className="text-sm text-slate-300">
            {lastDrawInfo ? (
              <span>
                Session #{lastDrawInfo.sessionNumber} - {lastDrawInfo.fanName}
                {lastDrawInfo.queueNumber ? ` (Queue ${lastDrawInfo.queueNumber})` : ""} | {new Date(lastDrawInfo.timestamp).toLocaleString()}
              </span>
            ) : (
              <span>No draws recorded yet.</span>
            )}
          </div>
        </div>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs uppercase tracking-wide text-slate-400" htmlFor="result-search">
              Search
            </label>
            <input
              id="result-search"
              className="w-48 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-create-primary/70 focus:outline-none focus:ring-2 focus:ring-create-primary/30"
              value={resultSearch}
              onChange={(event) => setResultSearch(event.target.value)}
              placeholder="Tier or prize name"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs uppercase tracking-wide text-slate-400" htmlFor="result-sort">
              Sort
            </label>
            <select
              id="result-sort"
              className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-create-primary/70 focus:outline-none focus:ring-2 focus:ring-create-primary/30"
              value={sortMode}
              onChange={(event) => setSortMode(event.target.value)}
            >
              <option value="recent">Most recent</option>
              <option value="tier-asc">Tier A-Z</option>
              <option value="tier-desc">Tier Z-A</option>
            </select>
          </div>
        </div>
        <div className="mb-4 flex flex-wrap gap-2">
          {(unrevealedScratchCards === 0) ? (
            tierCounts.length ? (
              tierCounts.map(([tier, qty]) => (
                <span key={tier} className={tierChipClass(tier, tierColors)}>
                  {tier}:{qty}
                </span>
              ))
            ) : (
              <span className="rounded-full border border-slate-700 bg-slate-800/60 px-3 py-1 text-xs uppercase tracking-wide text-slate-400">
                No matching draws
              </span>
            )
          ) : (
            <span className="rounded-full border border-slate-700 bg-slate-800/60 px-3 py-1 text-xs uppercase tracking-wide text-slate-400">
              🪙 Scratch all cards to reveal tier counts
            </span>
          )}
        </div>
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence>
            {processedResults.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 12, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 320, damping: 26 }}
                className="flex justify-center"
              >
                <div className="w-full">
                  {useScratchMode && !revealedResults.has(item.id) ? (
                    <ScratchCard
                      prizeContent={
                        <ResultCard drawIndex={item.drawIndex} prize={item.prize} tierColors={tierColors} />
                      }
                      onComplete={() => {
                        setRevealedResults(new Set(revealedResults.add(item.id)));
                      }}
                      enabled={true}
                    />
                  ) : (
                    <ResultCard drawIndex={item.drawIndex} prize={item.prize} tierColors={tierColors} />
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {!processedResults.length && (
            <p className="col-span-full text-center text-sm text-slate-500">
              Draw results will appear here once you start a session.
            </p>
          )}
        </div>
      </section>

      {isHistoryOpen && (
        <HistoryPanel history={history} tierColors={tierColors} onClose={closeHistory} />
      )}
      
      {/* Custom Branding Footer */}
      <BrandingFooter />
      </div>
    </BrandingWrapper>
  );
}

