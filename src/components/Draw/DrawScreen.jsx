import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import QRCode from "qrcode";
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
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [shareLinkCopied, setShareLinkCopied] = useState(false);
  const [showShareLinkImmediately, setShowShareLinkImmediately] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState(null);
  const shareMenuRef = useRef(null);

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

  // Close share menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target)) {
        setShowShareMenu(false);
      }
    };

    if (showShareMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showShareMenu]);

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
    // Use exact preset label for revenue tracking (don't add bonus suffix)
    setDrawLabel(preset.label);
  };

  const handleDraw = async (skipReveal = false) => {
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
    
    // If skipReveal is true, don't show results on screen (for share link workflow)
    if (!skipReveal) {
      setResults(resultItems);
    }
    
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
    // For skipReveal (share link workflow), wait for sync to complete
    if (user?.username) {
      if (skipReveal) {
        // Wait for sync before showing share modal
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
      } else {
        // For regular draw, sync in background
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
        }, 1000);
      }
    }

    setIsDrawing(false);
    
    // If skipReveal, show share link immediately (after sync completes)
    if (skipReveal) {
      setShowShareLinkImmediately(true);
      // Generate QR code for the share link
      const shareUrl = `${window.location.origin}/${encodeURIComponent(user?.username || '')}/fan/draw/${encodeURIComponent(sessionMeta.id)}`;
      QRCode.toDataURL(shareUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#1e293b',
          light: '#ffffff'
        }
      }).then(url => {
        setQrCodeDataUrl(url);
      }).catch(err => {
        console.error('Failed to generate QR code:', err);
      });
      // Auto-copy the link
      setTimeout(() => {
        handleCopyShareLink();
      }, 100);
    }
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

  const handleCopyShareLink = () => {
    if (!lastDrawInfo) return;
    
    const shareUrl = `${window.location.origin}/${encodeURIComponent(user?.username || '')}/fan/draw/${encodeURIComponent(lastDrawInfo.id)}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setShareLinkCopied(true);
      setTimeout(() => setShareLinkCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy link:', err);
      alert('Failed to copy link to clipboard');
    });
  };

  const handleGenerateQRCode = async () => {
    if (!lastDrawInfo) return;
    
    const shareUrl = `${window.location.origin}/${encodeURIComponent(user?.username || '')}/fan/draw/${encodeURIComponent(lastDrawInfo.id)}`;
    try {
      const qrDataUrl = await QRCode.toDataURL(shareUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#1e293b',
          light: '#ffffff'
        }
      });
      setQrCodeDataUrl(qrDataUrl);
    } catch (err) {
      console.error('Failed to generate QR code:', err);
      alert('Failed to generate QR code');
    }
  };

  const handleDownloadQRCode = () => {
    if (!qrCodeDataUrl || !lastDrawInfo) return;
    
    const link = document.createElement('a');
    link.download = `kuji-session-${lastDrawInfo.sessionNumber}-${lastDrawInfo.fanName.replace(/\s+/g, '-')}.png`;
    link.href = qrCodeDataUrl;
    link.click();
  };

  const handleOpenFanLink = () => {
    if (!lastDrawInfo) return;
    const shareUrl = `/${encodeURIComponent(user?.username || '')}/fan/draw/${encodeURIComponent(lastDrawInfo.id)}`;
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
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
        <div className="mt-6 flex flex-wrap gap-3 items-center">
          <div className="flex flex-col gap-2">
            <button type="button" onClick={() => handleDraw(false)} disabled={isDrawing}>
              {isDrawing ? "Drawing..." : "Start Draw"}
            </button>
            <button 
              type="button" 
              onClick={() => handleDraw(true)} 
              disabled={isDrawing}
              className="bg-purple-600 text-white hover:bg-purple-700 px-4 py-2 rounded-md font-semibold text-xs transition-colors flex items-center gap-2 justify-center"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              {isDrawing ? "Drawing..." : "Draw & Share Link"}
            </button>
          </div>
          
          {/* Share Link Modal - Shows immediately after draw with share link */}
          {showShareLinkImmediately && lastDrawInfo && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-lg w-full shadow-2xl">
                <div className="text-center mb-4">
                  <div className="text-5xl mb-3">🎉</div>
                  <h3 className="text-2xl font-bold text-white mb-2">Draw Complete!</h3>
                  <p className="text-slate-300">Session #{lastDrawInfo.sessionNumber} for {lastDrawInfo.fanName}</p>
                </div>
                
                <div className="bg-slate-900 rounded-lg p-4 mb-4">
                  <label className="text-xs text-slate-400 mb-2 block">Share this link with the fan:</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`${window.location.origin}/${encodeURIComponent(user?.username || '')}/fan/draw/${encodeURIComponent(lastDrawInfo.id)}`}
                      className="flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 font-mono"
                      onClick={(e) => e.target.select()}
                    />
                    <button
                      type="button"
                      onClick={() => handleCopyShareLink()}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold text-sm transition-colors"
                    >
                      {shareLinkCopied ? '✓' : 'Copy'}
                    </button>
                  </div>
                  {shareLinkCopied && (
                    <p className="text-xs text-green-400 mt-2">✓ Link copied to clipboard!</p>
                  )}
                </div>

                {/* QR Code Display */}
                {qrCodeDataUrl && (
                  <div className="bg-white rounded-lg p-4 mb-4 flex flex-col items-center">
                    <p className="text-sm text-slate-800 font-semibold mb-3">Scan QR Code:</p>
                    <img 
                      src={qrCodeDataUrl} 
                      alt="QR Code for share link" 
                      className="w-48 h-48 border-4 border-slate-200 rounded-lg"
                    />
                    <p className="text-xs text-slate-600 mt-3 text-center">Fan can scan this to access their prizes</p>
                  </div>
                )}
                
                <div className="text-xs text-slate-400 mb-4">
                  <p>✨ The prizes are hidden - fan will scratch to reveal!</p>
                  <p className="mt-1">📱 Send this link via SMS, email, or messaging app</p>
                  <p className="mt-1">📷 Or show the QR code for the fan to scan</p>
                </div>
                
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      handleOpenFanLink();
                    }}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded font-semibold text-sm transition-colors"
                  >
                    Preview Fan Page
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowShareLinkImmediately(false);
                      setShareLinkCopied(false);
                      setQrCodeDataUrl(null);
                    }}
                    className="flex-1 bg-create-primary hover:bg-create-primary/80 text-white px-4 py-2 rounded font-semibold text-sm transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Share Link Dropdown - Only visible after a draw */}
          {lastDrawInfo && results.length > 0 && (
            <div className="relative" ref={shareMenuRef}>
              <button
                type="button"
                className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md font-semibold text-sm transition-colors flex items-center gap-2"
                onClick={() => setShowShareMenu(!showShareMenu)}
              >
                {shareLinkCopied ? (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Link Copied!
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    <span className="flex flex-col items-start">
                      <span className="text-xs font-normal opacity-75">Share Session #{lastDrawInfo.sessionNumber}</span>
                      <span>Share Link</span>
                    </span>
                    <svg className={`w-4 h-4 transition-transform ${showShareMenu ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </>
                )}
              </button>
              
              {showShareMenu && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => {
                      handleCopyShareLink();
                      setShowShareMenu(false);
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-slate-200 hover:bg-slate-700 transition-colors flex items-center gap-3"
                  >
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <div className="font-semibold">Copy Fan Link</div>
                      <div className="text-xs text-slate-400">Share with {lastDrawInfo.fanName}</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleGenerateQRCode();
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-slate-200 hover:bg-slate-700 transition-colors flex items-center gap-3 border-t border-slate-700"
                  >
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                    <div>
                      <div className="font-semibold">{qrCodeDataUrl ? 'QR Code Generated ✓' : 'Generate QR Code'}</div>
                      <div className="text-xs text-slate-400">For easy scanning</div>
                    </div>
                  </button>
                  {qrCodeDataUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        handleDownloadQRCode();
                        setShowShareMenu(false);
                      }}
                      className="w-full px-4 py-3 text-left text-sm text-slate-200 hover:bg-slate-700 transition-colors flex items-center gap-3 border-t border-slate-700"
                    >
                      <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      <div>
                        <div className="font-semibold">Download QR Code</div>
                        <div className="text-xs text-slate-400">Save as PNG image</div>
                      </div>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      handleOpenFanLink();
                      setShowShareMenu(false);
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-slate-200 hover:bg-slate-700 transition-colors flex items-center gap-3 border-t border-slate-700"
                  >
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    <div>
                      <div className="font-semibold">Preview Fan Page</div>
                      <div className="text-xs text-slate-400">Open in new tab</div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          )}
          
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
        <HistoryPanel 
          history={history} 
          tierColors={tierColors} 
          onClose={closeHistory} 
          username={user?.username || ""}
          subscriptionPlan={sessionSettings.subscriptionPlan || 'free'}
        />
      )}
      
      {/* Custom Branding Footer */}
      <BrandingFooter />
      </div>
    </BrandingWrapper>
  );
}

