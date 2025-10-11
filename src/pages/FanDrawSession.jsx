import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { tierChipClass } from "../utils/tierColors.js";
import { isFeatureAvailable, hasBetaAccess, hasCustomBranding } from "../utils/subscriptionPlans.js";
import BrandingHeader from "../components/Branding/BrandingHeader.jsx";
import BrandingFooter from "../components/Branding/BrandingFooter.jsx";
import BrandingWrapper from "../components/Branding/BrandingWrapper.jsx";
import ResultCard from "../components/Draw/ResultCard.jsx";
import ScratchCard from "../components/Draw/ScratchCard.jsx";
import CardPackAnimation from "../components/Draw/CardPackAnimation.jsx";
import { useBranding } from "../contexts/BrandingContext.jsx";

const formatTimestamp = (timestamp) =>
  timestamp ? new Date(timestamp).toLocaleString() : "";

export default function FanDrawSession() {
  const { username, entryId } = useParams();
  const { branding } = useBranding();
  const [entry, setEntry] = useState(null);
  const [settings, setSettings] = useState({});
  const [tierColors, setTierColors] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [revealedResults, setRevealedResults] = useState(new Set());
  const [scratchEnabled, setScratchEnabled] = useState(true);
  const [tradingModeEnabled, setTradingModeEnabled] = useState(false);
  const [showCardPackAnimation, setShowCardPackAnimation] = useState(false);
  const [allRevealed, setAllRevealed] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        // Fetch session data from API (public endpoint)
        const response = await fetch(`/api/users/${encodeURIComponent(username)}/sessions/${encodeURIComponent(entryId)}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError("Draw session not found or link is invalid.");
          } else {
            setError("Failed to load draw session.");
          }
          setLoading(false);
          return;
        }

        const sessionData = await response.json();
        
        if (!mounted) return;

        setEntry(sessionData);
        setSettings(sessionData.settings || {});
        setTierColors(sessionData.settings?.tierColors || {});
        
        // Check if scratch cards are enabled for this user's plan
        const planId = sessionData.settings?.subscriptionPlan || 'free';
        const hasScratchCards = isFeatureAvailable('scratchCards', planId);
        setScratchEnabled(hasScratchCards);
        
        // Check if trading card animation is available
        const hasTrading = hasBetaAccess(planId);
        setTradingModeEnabled(hasTrading);
        
        // Check if this session has been fully revealed before (localStorage or database)
        const revealedKey = `fan-revealed-${entryId}`;
        const wasRevealedLocally = localStorage.getItem(revealedKey) === 'true';
        const wasRevealedInDB = sessionData.fanRevealed === true;
        
        if (wasRevealedLocally || wasRevealedInDB) {
          setAllRevealed(true);
        } else if (hasTrading) {
          // If trading mode available and not yet revealed, show animation on load
          setShowCardPackAnimation(true);
        }
        
        setLoading(false);
      } catch (err) {
        if (!mounted) return;
        console.error("Failed to load draw session:", err);
        setError("Failed to load draw session. Please check your connection.");
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [entryId, username]);

  // Prepare results as card items
  const resultItems = useMemo(() => {
    if (!entry?.draws) return [];
    
    return entry.draws.map((draw, index) => ({
      id: `${draw.sku || draw.prize || index}-${index}`,
      prize: {
        prize_name: draw.prize,
        tier: draw.tier,
        sku: draw.sku
      },
      drawIndex: index + 1
    }));
  }, [entry]);

  const unrevealedCount = useMemo(() => {
    if (allRevealed) return 0;
    return resultItems.filter(item => scratchEnabled && !revealedResults.has(item.id)).length;
  }, [resultItems, scratchEnabled, revealedResults, allRevealed]);

  const tierCounts = useMemo(() => {
    if (unrevealedCount > 0 && !allRevealed) return []; // Don't show counts until all scratched
    
    const counts = resultItems.reduce((acc, item) => {
      const tier = String(item.prize.tier || "?").toUpperCase();
      acc[tier] = (acc[tier] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(counts).sort((a, b) => a[0].localeCompare(b[0]));
  }, [resultItems, unrevealedCount, allRevealed]);

  const markAsRevealed = async () => {
    // Save to localStorage first
    const revealedKey = `fan-revealed-${entryId}`;
    localStorage.setItem(revealedKey, 'true');
    setAllRevealed(true);
    
    // Then try to save to database (non-blocking)
    try {
      const response = await fetch(`/api/users/${encodeURIComponent(username)}/sessions/${encodeURIComponent(entryId)}/revealed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        console.log('✅ Session marked as revealed in database');
      }
    } catch (error) {
      console.warn('⚠️ Failed to mark session as revealed in database (localStorage still works):', error);
    }
  };

  const handleRevealAll = () => {
    const allIds = new Set(resultItems.map(item => item.id));
    setRevealedResults(allIds);
    markAsRevealed();
  };

  // Convert draws to prize objects for card pack animation
  // MUST be before early returns to follow React hooks rules
  const prizeObjects = useMemo(() => {
    if (!entry?.draws) return [];
    return entry.draws.map(draw => ({
      prize_name: draw.prize,
      tier: draw.tier,
      sku: draw.sku
    }));
  }, [entry]);

  if (loading) {
    return (
      <BrandingWrapper className="min-h-screen">
        <div className="flex items-center justify-center p-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-create-primary mx-auto"></div>
            <p className="mt-4 text-slate-400 text-lg">Loading your prizes...</p>
          </div>
        </div>
      </BrandingWrapper>
    );
  }

  if (error || !entry) {
    return (
      <BrandingWrapper className="min-h-screen">
        <div className="space-y-6 p-6">
          <BrandingHeader />
          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-8 shadow-lg text-center">
            <div className="text-6xl mb-4">😕</div>
            <h2 className="text-3xl font-bold text-red-400 mb-4">Session Not Found</h2>
            <p className="text-slate-300 text-lg mb-6">
              {error || "This draw session could not be found. The link may be invalid or expired."}
            </p>
            <p className="text-slate-400 text-sm">
              Please contact <span className="font-semibold text-slate-300">{username}</span> if you believe this is an error.
            </p>
          </section>
          <BrandingFooter />
        </div>
      </BrandingWrapper>
    );
  }

  return (
    <BrandingWrapper className="min-h-screen">
      <div className="space-y-6 p-6">
        <BrandingHeader />

        {/* Card Pack Animation Modal */}
        {showCardPackAnimation && !allRevealed && tradingModeEnabled && (
          <CardPackAnimation
            prizes={prizeObjects}
            tierColors={tierColors}
            tierOrder={Object.keys(tierColors)}
            effectTierCount={settings.cardPackEffectTierCount || 3}
            showLogo={settings.cardPackShowLogo && hasCustomBranding(settings.subscriptionPlan || 'free')}
            customPackImage={settings.cardPackCustomImage}
            logoUrl={branding?.logoUrl}
            onComplete={() => {
              setShowCardPackAnimation(false);
              markAsRevealed();
            }}
            onSkip={() => {
              setShowCardPackAnimation(false);
              markAsRevealed();
            }}
          />
        )}

        {/* Welcome Message */}
        <section className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900/90 to-slate-800/90 p-8 shadow-xl text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-4xl font-bold text-white mb-3">
            Welcome, {entry.fanName || "Fan"}!
          </h1>
          <p className="text-xl text-slate-300 mb-2">
            Session #{entry.sessionNumber ?? "?"}
            {entry.queueNumber ? ` • Queue ${entry.queueNumber}` : ""}
          </p>
          <p className="text-sm text-slate-400">
            {entry.label || "Custom Draw"} • {formatTimestamp(entry.timestamp)}
          </p>
          {entry.eventName && (
            <p className="text-sm text-slate-400 mt-2">
              Event: <span className="text-slate-300 font-semibold">{username}'s {entry.eventName}</span>
            </p>
          )}
        </section>

        {/* Instructions */}
        {scratchEnabled && unrevealedCount > 0 && !allRevealed && (
          <section className="rounded-2xl border border-amber-700/50 bg-amber-900/20 p-6 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="text-4xl">🪙</div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-amber-200 mb-2">
                  Scratch to Reveal Your Prizes!
                </h3>
                <p className="text-amber-100/80 mb-3">
                  You have {entry.draws?.length || 0} prize{entry.draws?.length !== 1 ? 's' : ''} waiting for you. 
                  Scratch each card with your finger or mouse to reveal what you won!
                </p>
                <button
                  type="button"
                  onClick={handleRevealAll}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors shadow-lg"
                >
                  Skip & Reveal All
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Tier Summary - Only shown after all scratched */}
        {(!scratchEnabled || unrevealedCount === 0 || allRevealed) ? (
          <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-lg">
            <h3 className="text-xl font-semibold text-white mb-4">Your Prize Summary</h3>
            <div className="flex flex-wrap gap-3">
              {tierCounts.length > 0 ? (
                tierCounts.map(([tier, qty]) => (
                  <span key={tier} className={tierChipClass(tier, tierColors)}>
                    Tier {tier}: {qty} {qty === 1 ? 'prize' : 'prizes'}
                  </span>
                ))
              ) : (
                <span className="text-slate-400 text-sm">
                  Scratch all cards to see your summary
                </span>
              )}
            </div>
          </section>
        ) : null}

        {/* Prize Cards */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-white">
              Your Prizes ({entry.draws?.length || 0})
            </h2>
            {scratchEnabled && unrevealedCount > 0 && (
              <span className="text-sm text-amber-400 font-semibold animate-pulse">
                🪙 {unrevealedCount} card{unrevealedCount !== 1 ? 's' : ''} to scratch
              </span>
            )}
          </div>
          
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {resultItems.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className="flex justify-center"
                >
                  <div className="w-full">
                    {scratchEnabled && !allRevealed && !revealedResults.has(item.id) ? (
                      <ScratchCard
                        prizeContent={
                          <ResultCard 
                            drawIndex={item.drawIndex} 
                            prize={item.prize} 
                            tierColors={tierColors} 
                          />
                        }
                        onComplete={() => {
                          const newRevealed = new Set(revealedResults.add(item.id));
                          setRevealedResults(newRevealed);
                          
                          // Check if this was the last card
                          if (newRevealed.size === resultItems.length) {
                            markAsRevealed();
                          }
                        }}
                        enabled={true}
                      />
                    ) : (
                      <ResultCard 
                        drawIndex={item.drawIndex} 
                        prize={item.prize} 
                        tierColors={tierColors} 
                      />
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {(!resultItems.length) && (
            <p className="text-center text-slate-500 py-12">
              No prizes recorded for this session.
            </p>
          )}
        </section>

        {/* Congratulations Message - Shown after all revealed */}
        {(!scratchEnabled || unrevealedCount === 0 || allRevealed) && resultItems.length > 0 && (
          <section className="rounded-2xl border border-green-700/50 bg-green-900/20 p-8 shadow-lg text-center">
            <div className="text-6xl mb-4">🎊</div>
            <h3 className="text-3xl font-bold text-green-200 mb-3">
              Congratulations!
            </h3>
            <p className="text-green-100/80 text-lg mb-2">
              You've revealed all your prizes! Thanks for participating.
            </p>
            <p className="text-green-200/60 text-sm">
              Please collect your prizes from {entry.eventName ? (
                <span className="font-semibold">{username}'s {entry.eventName}</span>
              ) : (
                <span className="font-semibold">{username}</span>
              )}.
            </p>
          </section>
        )}

        <BrandingFooter />
      </div>
    </BrandingWrapper>
  );
}
