import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import useLocalStorageDAO from "../../hooks/useLocalStorageDAO.js";
import { PRIZE_HEADERS, exportToCsv, parsePrizesCsv, exportCsvTemplate, downloadCsv } from "../../utils/csvUtils.js";
import { sortTierEntries, tierBadgeClass, tierChipClass, tierInputClass, getTierColorHex } from "../../utils/tierColors.js";
import { calculateProbabilities, tierInfluence } from "../../utils/randomDraw.js";
import { useAuth } from "../../utils/AuthContext.jsx";
import { syncUserData } from "../../services/syncService.js";
import { isTierSortingAllowed, validateTierName, canCreateTier } from "../../utils/subscriptionPlans.js";
import { COLOR_PALETTE } from "../../utils/colorPalette.js";

const EMPTY_PRIZE = {
  tier: "",
  prize_name: "",
  quantity: 0,
  weight: 1,
  sku: "",
  notes: ""
};

async function fetchSamplePrizes() {
  const response = await fetch("/assets/prizes.sample.csv");
  if (!response.ok) {
    throw new Error("Unable to load sample prizes CSV");
  }
  return response.text();
}

const toPercent = (value) => `${(Math.round(value * 1000) / 10).toFixed(1)}%`;

const WEIGHT_MODE_LABEL = {
  basic: "Basic weight system (weight only)",
  advanced: "Advanced weight system (weight × quantity × tier priority)"
};

export default function PrizePoolManager() {
  const location = useLocation();
  const { getPrizes, setPrizes, getSettings, setSettings, setDirtyFlag, clearDirtyFlag, getDirtyState } = useLocalStorageDAO();
  const { user } = useAuth();
  
  // Get username from URL path (e.g., /demo/manage/prizes -> demo)
  const username = location.pathname.split('/')[1] || user?.username || 'demo';
  const [prizes, setPrizeRows] = useState([]);
  const [tierColors, setTierColors] = useState({});
  const [weightMode, setWeightMode] = useState("basic");
  const [subscriptionPlan, setSubscriptionPlan] = useState("free");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [availableTiers, setAvailableTiers] = useState([]);
  const [draggedTierIndex, setDraggedTierIndex] = useState(null);
  const [dropTargetIndex, setDropTargetIndex] = useState(null);
  const fileInputRef = useRef(null);

  // Load initial data
  useEffect(() => {
    let mounted = true;
    (async () => {
      const [storedPrizes, storedSettings, dirtyState] = await Promise.all([
        getPrizes(), 
        getSettings(), 
        getDirtyState()
      ]);
      if (mounted) {
        setPrizeRows(storedPrizes.length ? storedPrizes : []);
        setTierColors(storedSettings.tierColors ?? {});
        setWeightMode(storedSettings.weightMode ?? "basic");
        setSubscriptionPlan(storedSettings.subscriptionPlan ?? "free");
        setAvailableTiers(Object.keys(storedSettings.tierColors ?? {}));
        setHasUnsavedChanges(dirtyState.prizes === true);
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [getPrizes, getSettings, getDirtyState]);

  // Refresh settings when navigating to this page (to pick up tier order changes)
  useEffect(() => {
    let mounted = true;
    (async () => {
      const storedSettings = await getSettings();
      if (mounted) {
        setTierColors(storedSettings.tierColors ?? {});
        setWeightMode(storedSettings.weightMode ?? "basic");
        setSubscriptionPlan(storedSettings.subscriptionPlan ?? "free");
        setAvailableTiers(Object.keys(storedSettings.tierColors ?? {}));
      }
    })();
    return () => {
      mounted = false;
    };
  }, [location.pathname, getSettings]); // Re-run when route changes
  
  // Real-time sync: Listen for settings changes from Settings page
  useEffect(() => {
    const handleSettingsUpdate = async (event) => {
      const updatedSettings = event.detail?.settings;
      if (updatedSettings?.tierColors) {
        const currentTierColorsStr = JSON.stringify(tierColors);
        const newTierColorsStr = JSON.stringify(updatedSettings.tierColors);
        
        if (currentTierColorsStr !== newTierColorsStr) {
          console.log('✨ Instant sync: Tier colors updated from Settings!');
          setTierColors(updatedSettings.tierColors);
          setAvailableTiers(Object.keys(updatedSettings.tierColors));
          setStatus({ type: "success", message: "Tier colors synced from Settings!" });
          setTimeout(() => setStatus(null), 2000);
        }
      }
    };
    
    // Listen for custom settings-updated event
    window.addEventListener('settings-updated', handleSettingsUpdate);
    
    return () => {
      window.removeEventListener('settings-updated', handleSettingsUpdate);
    };
  }, [tierColors]); // Re-run when tierColors change

  const tierTotals = useMemo(() => {
    const totals = prizes.reduce((acc, prize) => {
      const tier = String(prize.tier || "?").trim().toUpperCase();
      acc[tier] = (acc[tier] || 0) + (Number(prize.quantity) || 0);
      return acc;
    }, {});
    // Sort tiers using custom order from settings if allowed
    const allowCustomOrder = isTierSortingAllowed(subscriptionPlan);
    return sortTierEntries(Object.entries(totals), tierColors, allowCustomOrder);
  }, [prizes, tierColors, subscriptionPlan]);

  // Sort prizes by tier order for display
  // Keep original indices for editing
  const sortedPrizesWithIndices = useMemo(() => {
    const tierOrder = tierTotals.map(([tier]) => tier); // Get tier order from tierTotals
    const tierIndexMap = new Map(tierOrder.map((tier, index) => [tier, index]));
    
    return prizes
      .map((prize, originalIndex) => ({ prize, originalIndex }))
      .sort((a, b) => {
        const tierA = String(a.prize.tier || "?").trim().toUpperCase();
        const tierB = String(b.prize.tier || "?").trim().toUpperCase();
        
        const indexA = tierIndexMap.has(tierA) ? tierIndexMap.get(tierA) : Number.MAX_SAFE_INTEGER;
        const indexB = tierIndexMap.has(tierB) ? tierIndexMap.get(tierB) : Number.MAX_SAFE_INTEGER;
        
        return indexA - indexB;
      });
  }, [prizes, tierTotals]);

  const advancedGuidance = useMemo(() => {
    if (weightMode !== "advanced" || !prizes.length) {
      return [];
    }
    const probabilities = calculateProbabilities(prizes, "advanced");
    const quantityTotal = prizes.reduce((sum, prize) => sum + (Number(prize.quantity) || 0), 0);
    return probabilities.map(({ prize, probability }) => {
      const quantityShare = quantityTotal > 0 ? (Number(prize.quantity) || 0) / quantityTotal : 0;
      const variance = probability - quantityShare;
      return {
        prize,
        probability,
        quantityShare,
        variance
      };
    });
  }, [prizes, weightMode]);

  const handleImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const { data, errors } = parsePrizesCsv(text);
    if (errors.length) {
      setStatus({ type: "error", message: errors[0].message });
      return;
    }
    setPrizeRows(data);
    await setDirtyFlag('prizes', true);
    setHasUnsavedChanges(true);
    setStatus({ type: "success", message: `${data.length} prizes imported.` });
  };

  const handleLoadSample = async () => {
    try {
      const csvText = await fetchSamplePrizes();
      const { data, errors } = parsePrizesCsv(csvText);
      if (errors.length) {
        setStatus({ type: "error", message: errors[0].message });
        return;
      }
      setPrizeRows(data);
      await setDirtyFlag('prizes', true);
      setHasUnsavedChanges(true);
      setStatus({ type: "success", message: "Sample prize pool loaded." });
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    }
  };

  const handleExport = () => {
    const csv = exportToCsv(prizes, PRIZE_HEADERS);
    downloadCsv(csv, 'prizes.csv');
    setStatus({ type: "success", message: "Prizes exported successfully!" });
  };

  const handleExportTemplate = () => {
    const csv = exportCsvTemplate(PRIZE_HEADERS);
    downloadCsv(csv, 'prizes-template.csv');
    setStatus({ type: "success", message: "Template downloaded! Fill it out and import it back." });
  };

  const handleAddRow = async () => {
    setPrizeRows((rows) => [...rows, { ...EMPTY_PRIZE }]);
    await setDirtyFlag('prizes', true);
    setHasUnsavedChanges(true);
  };

  const handleCellChange = async (index, key, value) => {
    setPrizeRows((rows) =>
      rows.map((row, rowIndex) => {
        if (rowIndex !== index) return row;
        
        // Special handling for tier field to validate against available tiers
        if (key === "tier") {
          const normalizedInput = value.trim().toUpperCase();
          
          // If input matches an available tier exactly, use it
          if (availableTiers.includes(normalizedInput)) {
            return { ...row, tier: normalizedInput };
          }
          
          // If input is empty, allow it
          if (normalizedInput === "") {
            return { ...row, tier: "" };
          }
          
          // Check if input partially matches any available tier (for autocomplete)
          const partialMatch = availableTiers.find(tier => 
            tier.toUpperCase().startsWith(normalizedInput)
          );
          
          if (partialMatch && normalizedInput.length === partialMatch.length) {
            // Complete match found
            return { ...row, tier: partialMatch };
          }
          
          // Allow partial input for typing (will be normalized on blur/save)
          return { ...row, tier: normalizedInput };
        }
        
        // Handle other fields
        if (key === "quantity" || key === "weight") {
          return { ...row, [key]: Number.parseInt(value, 10) || 0 };
        }
        
        return { ...row, [key]: value };
      })
    );
    await setDirtyFlag('prizes', true);
    setHasUnsavedChanges(true);
  };
  
  // Handle tier input blur to validate/normalize and auto-create if needed
  const handleTierBlur = async (index, currentValue) => {
    const normalizedInput = currentValue.trim().toUpperCase();
    
    // If empty, do nothing
    if (normalizedInput === "") {
      return;
    }
    
    // If already valid, do nothing
    if (availableTiers.includes(normalizedInput)) {
      return;
    }
    
    // Try to find closest match
    const match = availableTiers.find(tier => 
      tier.toUpperCase() === normalizedInput
    );
    
    if (match) {
      // Update to exact match
      setPrizeRows((rows) =>
        rows.map((row, rowIndex) =>
          rowIndex === index ? { ...row, tier: match } : row
        )
      );
      await setDirtyFlag('prizes', true);
      setHasUnsavedChanges(true);
      return;
    }
    
    // New tier - validate and auto-create
    const validation = validateTierName(normalizedInput, subscriptionPlan);
    
    if (!validation.valid) {
      // Show error and revert
      setStatus({ type: "error", message: `Invalid tier name: ${validation.error}` });
      setPrizeRows((rows) =>
        rows.map((row, rowIndex) =>
          rowIndex === index ? { ...row, tier: "" } : row
        )
      );
      return;
    }
    
    // Check if we can create more tiers
    const canCreate = canCreateTier(availableTiers.length, subscriptionPlan);
    
    if (!canCreate) {
      setStatus({ 
        type: "error", 
        message: `Tier limit reached for your plan. Upgrade to add more tiers or use existing tiers: ${availableTiers.join(', ')}` 
      });
      setPrizeRows((rows) =>
        rows.map((row, rowIndex) =>
          rowIndex === index ? { ...row, tier: "" } : row
        )
      );
      return;
    }
    
    // Auto-create the tier with a default color
    const newTier = validation.value;
    await createNewTier(newTier);
    
    // Update the prize row with normalized tier name
    setPrizeRows((rows) =>
      rows.map((row, rowIndex) =>
        rowIndex === index ? { ...row, tier: newTier } : row
      )
    );
    await setDirtyFlag('prizes', true);
    setHasUnsavedChanges(true);
  };
  
  // Create a new tier with default color
  const createNewTier = async (tierName) => {
    try {
      console.log('🎯 Starting tier creation for:', tierName);
      
      // Get current settings
      const currentSettings = await getSettings();
      const currentTierColors = currentSettings.tierColors || {};
      console.log('📋 Current tier colors:', currentTierColors);
      
      // Assign next available color from palette (cycle through colors)
      const existingTierCount = Object.keys(currentTierColors).length;
      const defaultColor = COLOR_PALETTE[existingTierCount % COLOR_PALETTE.length].id;
      console.log('🎨 Assigned color:', defaultColor, 'to tier:', tierName);
      
      // Add new tier
      const updatedTierColors = {
        ...currentTierColors,
        [tierName]: defaultColor
      };
      console.log('✅ Updated tier colors:', updatedTierColors);
      
      // Save to settings (setSettings will automatically dispatch event)
      const updatedSettings = { ...currentSettings, tierColors: updatedTierColors };
      await setSettings(updatedSettings);
      
      // Update local state
      setTierColors(updatedTierColors);
      setAvailableTiers(Object.keys(updatedTierColors));
      
      console.log('✨ New tier created:', tierName, '- Event auto-dispatched by setSettings');
      
      // Show success message with link to customize
      const colorLabel = COLOR_PALETTE.find(p => p.id === defaultColor)?.label || defaultColor;
      setStatus({ 
        type: "success", 
        message: `✨ New tier "${tierName}" created with ${colorLabel} color! Customize it in Settings.` 
      });
      
      // Sync to backend if authenticated
      if (user?.username) {
        setTimeout(async () => {
          try {
            await syncUserData(user.username, 'settings', { ...currentSettings, tierColors: updatedTierColors });
            console.log('✅ Tier colors synced to backend');
          } catch (syncError) {
            console.warn('⚠️ Failed to sync tier colors:', syncError);
          }
        }, 500);
      }
    } catch (error) {
      console.error('Failed to create tier:', error);
      setStatus({ type: "error", message: "Failed to create new tier. Please try again." });
    }
  };

  const handleDelete = async (index) => {
    setPrizeRows((rows) => rows.filter((_, rowIndex) => rowIndex !== index));
    await setDirtyFlag('prizes', true);
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    try {
      // Save to LocalForage first
      await setPrizes(prizes);
      
      // Clear dirty flag - changes are now saved
      await clearDirtyFlag('prizes');
      setHasUnsavedChanges(false);
      
      setStatus({ type: "success", message: "Prize pool saved to storage." });
      
      // Sync to backend if user is authenticated
      if (user?.username) {
        setTimeout(async () => {
          try {
            await syncUserData(user.username, 'prizes', prizes);
            console.log('✅ Prizes synced to backend after save');
          } catch (syncError) {
            console.warn('⚠️ Failed to sync prizes to backend:', syncError);
            // Don't show error to user as LocalForage save succeeded
          }
        }, 500); // Small delay to let UI update first
      }
    } catch (error) {
      setStatus({ type: "error", message: "Failed to save prize pool." });
      console.error('Error saving prizes:', error);
    }
  };

  const applySuggestedWeights = async () => {
    if (weightMode !== "advanced") {
      setStatus({ type: "error", message: "Suggestions only available in advanced weight mode." });
      return;
    }
    const next = prizes.map((prize) => {
      const influence = tierInfluence(prize.tier);
      const suggested = influence > 0 ? Math.max(1, Math.round(1 / influence)) : 1;
      return {
        ...prize,
        weight: suggested
      };
    });
    setPrizeRows(next);
    await setDirtyFlag('prizes', true);
    setHasUnsavedChanges(true);
    setStatus({ type: "success", message: "Suggested weights applied for advanced mode." });
  };

  const handleTierReorder = async (fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;
    
    // Get current tier order
    const currentTierOrder = tierTotals.map(([tier]) => tier);
    
    // Reorder
    const newOrder = [...currentTierOrder];
    const [movedTier] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, movedTier);
    
    // Update tierColors object with new order
    const reorderedColors = {};
    newOrder.forEach(tier => {
      reorderedColors[tier] = tierColors[tier];
    });
    
    // Update settings
    const currentSettings = await getSettings();
    const updatedSettings = {
      ...currentSettings,
      tierColors: reorderedColors
    };
    
    await setSettings(updatedSettings);
    setTierColors(reorderedColors);
    setAvailableTiers(Object.keys(reorderedColors));
    
    setStatus({ type: "success", message: "Tier order updated!" });
    
    // Dispatch event for Settings page sync
    window.dispatchEvent(new CustomEvent('settings-updated', { 
      detail: { settings: updatedSettings } 
    }));
    
    // Sync to backend if user is authenticated
    if (user?.username) {
      setTimeout(async () => {
        try {
          await syncUserData(user.username, 'settings', updatedSettings);
          console.log('✅ Tier order synced to backend');
        } catch (syncError) {
          console.warn('⚠️ Failed to sync tier order to backend:', syncError);
        }
      }, 500);
    }
  };

  if (loading) {
    return <p className="text-sm text-slate-400">Loading prize pool...</p>;
  }

  return (
    <div className="space-y-4">
      {/* Available Tiers Info */}
      {availableTiers.length > 0 ? (
        <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 px-4 py-3 text-xs text-slate-300">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <span className="font-semibold text-white">Available Tiers:</span>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {availableTiers.map(tier => {
                  const hex = getTierColorHex(tier, tierColors);
                  const isCustomHex = typeof (tierColors?.[tier]) === 'string' && tierColors[tier]?.startsWith('#');
                  return (
                    <span 
                      key={tier} 
                      className={tierChipClass(tier, tierColors)}
                      style={isCustomHex ? { backgroundColor: hex, borderColor: hex } : undefined}
                    >
                      {tier}
                    </span>
                  );
                })}
              </div>
              <div className="mt-2 space-y-1">
                <p className="text-slate-400">• Type these tier names in the tier column - they'll auto-suggest</p>
                <p className="text-slate-400">• Type a <span className="text-white font-semibold">new tier name</span> and press Tab/Enter to <span className="text-emerald-400 font-semibold">create it instantly!</span></p>
                <p className="text-slate-500 text-[10px]">→ New tiers get default colors. Customize in <Link to={`/${username}/manage/settings`} className="text-blue-400 hover:text-blue-300 underline">Settings</Link>.</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-xs text-slate-300">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <div className="flex-1">
              <span className="font-semibold text-emerald-400">Ready to create tiers!</span>
              <div className="mt-2 space-y-1.5">
                <p className="text-slate-300">✨ <span className="font-semibold">Quick Start:</span> Just type a tier name (like "S", "SS", "SSR") in the tier column below!</p>
                <p className="text-slate-400">• Tiers will be created automatically with default colors</p>
                <p className="text-slate-400">• Customize colors anytime in <Link to={`/${username}/manage/settings`} className="text-blue-400 hover:text-blue-300 underline">Settings</Link></p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-xs text-slate-300">
        <span className="font-semibold text-white">Weight system:</span> {WEIGHT_MODE_LABEL[weightMode]}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button 
          type="button" 
          onClick={handleExportTemplate} 
          className="bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
          title="Download empty CSV template with headers"
        >
          📋 Download Template
        </button>
        <button type="button" onClick={() => fileInputRef.current?.click()}>
          Import Prizes CSV
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleImport}
        />
        <button type="button" onClick={handleLoadSample} className="bg-slate-800 text-slate-200">
          Load Sample Data
        </button>
        <button type="button" onClick={handleAddRow} className="bg-slate-800 text-slate-200">
          Add Row
        </button>
        <button type="button" onClick={handleExport} className="bg-slate-800 text-slate-200">
          Export CSV
        </button>
        <div className="ml-auto flex items-center gap-2">
          {isTierSortingAllowed(subscriptionPlan) && tierTotals.length > 1 && (
            <div className="text-[10px] uppercase tracking-wide text-emerald-400 flex items-center gap-1 mr-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
              Drag
            </div>
          )}
          <div className="flex flex-wrap gap-2 text-xs uppercase tracking-wide text-slate-400">
            {tierTotals.length ? (
              tierTotals.map(([tier, qty], index) => {
                const hex = getTierColorHex(tier, tierColors);
                const isCustomHex = typeof (tierColors?.[String(tier).toUpperCase()]) === 'string' && tierColors[String(tier).toUpperCase()].startsWith('#');
                const canDrag = isTierSortingAllowed(subscriptionPlan);
                const isBeingDragged = draggedTierIndex === index;
                const showDropIndicator = dropTargetIndex === index && draggedTierIndex !== null && draggedTierIndex !== index;
                
                return (
                  <div key={tier} className="relative flex items-center gap-1">
                    {/* Drop indicator line - shows before this tier */}
                    {showDropIndicator && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-create-primary rounded-full shadow-lg shadow-create-primary/50 -ml-1.5 z-10 animate-pulse" />
                    )}
                    
                    <span
                      draggable={canDrag}
                      onDragStart={(e) => {
                        if (!canDrag) return;
                        setDraggedTierIndex(index);
                        e.dataTransfer.effectAllowed = 'move';
                      }}
                      onDragOver={(e) => {
                        if (!canDrag || draggedTierIndex === null) return;
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'move';
                        setDropTargetIndex(index);
                      }}
                      onDragLeave={(e) => {
                        if (!canDrag) return;
                        setDropTargetIndex(null);
                      }}
                      onDrop={(e) => {
                        if (!canDrag || draggedTierIndex === null) return;
                        e.preventDefault();
                        handleTierReorder(draggedTierIndex, index);
                        setDraggedTierIndex(null);
                        setDropTargetIndex(null);
                      }}
                      onDragEnd={() => {
                        setDraggedTierIndex(null);
                        setDropTargetIndex(null);
                      }}
                      className={`${tierChipClass(tier, tierColors)} ${
                        canDrag ? 'cursor-move' : ''
                      } ${isBeingDragged ? 'opacity-30 scale-95' : ''} transition-all duration-150`}
                      style={isCustomHex ? { backgroundColor: hex, borderColor: hex } : undefined}
                      title={canDrag ? 'Drag to reorder' : undefined}
                    >
                      {canDrag && (
                        <svg className="w-3 h-3 mr-1 inline" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" />
                        </svg>
                      )}
                      {tier}:{qty}
                    </span>
                  </div>
                );
              })
            ) : (
              <span className="rounded-full border border-slate-700 bg-slate-800/60 px-3 py-1 text-slate-300">
                No stock
              </span>
            )}
          </div>
        </div>
      </div>
      {weightMode === "advanced" && (
        <div className="flex flex-col gap-3 rounded-xl border border-create-primary/30 bg-slate-900/70 p-4 text-xs text-slate-300">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h4 className="font-semibold text-white">Probability guidance (advanced)</h4>
              <p className="mt-1 text-slate-400">
                Actual probability is compared to the share of total quantity. Use the variance to tune weights toward inventory ratios.
              </p>
            </div>
            <button
              type="button"
              className="rounded-md bg-create-primary px-3 py-2 text-xs font-semibold text-white hover:bg-create-primary/80"
              onClick={applySuggestedWeights}
            >
              Apply Suggested Weights
            </button>
          </div>
          {advancedGuidance.length ? (
            <ul className="space-y-1">
              {advancedGuidance.map(({ prize, probability, quantityShare, variance }) => (
                <li key={`${prize.sku || prize.prize_name || prize.tier}`}>
                  Tier {String(prize.tier || "?").toUpperCase()} - {prize.prize_name || "Unknown"}: actual {toPercent(probability)} vs quantity share {toPercent(quantityShare)} (diff {toPercent(variance)}).
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500">Adjust weights or quantities to generate guidance.</p>
          )}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-800 text-sm">
          <thead className="bg-slate-900/60 uppercase text-xs tracking-wide text-slate-400">
            <tr>
              <th className="px-3 py-2 text-left">Tier</th>
              <th className="px-3 py-2 text-left">Prize</th>
              <th className="px-3 py-2 text-right">Qty Rem</th>
              <th className="px-3 py-2 text-right">Weight</th>
              <th className="px-3 py-2 text-left">SKU (optional)</th>
              <th className="px-3 py-2 text-left">Notes</th>
              <th className="px-3 py-2" aria-label="actions" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {sortedPrizesWithIndices.map(({ prize: row, originalIndex }) => {
              const tierValue = row.tier;
              const isNewTier = tierValue && !availableTiers.includes(tierValue.toUpperCase());
              const validation = tierValue ? validateTierName(tierValue, subscriptionPlan) : { valid: true };
              
              // Calculate tier color for this row
              const hex = getTierColorHex(tierValue, tierColors);
              const key = String(tierValue || '').toUpperCase();
              const isCustomHex = typeof (tierColors?.[key]) === 'string' && tierColors[key]?.startsWith('#');
              const rowBorderStyle = (tierValue && validation.valid && !isNewTier) ? (
                isCustomHex ? {
                  borderColor: hex,
                  boxShadow: `0 0 0 1px ${hex}`
                } : {
                  borderColor: hex
                }
              ) : undefined;
              
              return (
                <tr key={`${row.sku || "row"}-${originalIndex}`} className="hover:bg-slate-900/40">
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={tierBadgeClass(tierValue, tierColors)}
                        style={isCustomHex ? { backgroundColor: hex, borderColor: hex } : undefined}
                      >
                        {(tierValue || "?").toString().toUpperCase()}
                      </span>
                      <div className="relative flex-1">
                        <input
                          list={`tier-suggestions-${originalIndex}`}
                          className={`w-full rounded-md bg-slate-900 px-2 py-1 text-slate-100 uppercase ${
                            isNewTier && validation.valid
                              ? 'border-2 border-emerald-500 ring-2 ring-emerald-500/20'
                              : !validation.valid && tierValue
                              ? 'border-2 border-red-500 ring-2 ring-red-500/20'
                              : rowBorderStyle
                              ? 'border'
                              : tierInputClass(tierValue, tierColors)
                          }`}
                          style={(!isNewTier && validation.valid) ? rowBorderStyle : undefined}
                          value={tierValue}
                          onChange={(event) => handleCellChange(originalIndex, "tier", event.target.value)}
                          onBlur={(event) => handleTierBlur(originalIndex, event.target.value)}
                          placeholder={availableTiers[0] || "S"}
                          title={`Available tiers: ${availableTiers.join(', ') || 'Type to create new tier'}`}
                        />
                        {isNewTier && validation.valid && (
                          <div className="absolute -right-6 top-1/2 -translate-y-1/2">
                            <svg className="w-4 h-4 text-emerald-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <datalist id={`tier-suggestions-${originalIndex}`}>
                        {availableTiers.map(tier => (
                          <option key={tier} value={tier} />
                        ))}
                      </datalist>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <input
                      className={`w-full rounded-md bg-slate-900 px-2 py-1 text-slate-100 focus:outline-none focus:ring-2 ${
                        rowBorderStyle ? 'border' : 'border border-slate-700 focus:border-create-primary/70 focus:ring-create-primary/30'
                      }`}
                      style={rowBorderStyle}
                      value={row.prize_name}
                      onChange={(event) => handleCellChange(originalIndex, "prize_name", event.target.value)}
                    />
                  </td>
                  <td className="px-3 py-2 text-right">
                    <input
                      type="number"
                      min="0"
                      className={`w-20 rounded-md bg-slate-900 px-2 py-1 text-right text-slate-100 focus:outline-none focus:ring-2 ${
                        rowBorderStyle ? 'border' : 'border border-slate-700 focus:border-create-primary/70 focus:ring-create-primary/30'
                      }`}
                      style={rowBorderStyle}
                      value={row.quantity}
                      onChange={(event) => handleCellChange(originalIndex, "quantity", event.target.value)}
                    />
                  </td>
                  <td className="px-3 py-2 text-right">
                    <input
                      type="number"
                      min="1"
                      className={`w-16 rounded-md bg-slate-900 px-2 py-1 text-right text-slate-100 focus:outline-none focus:ring-2 ${
                        rowBorderStyle ? 'border' : 'border border-slate-700 focus:border-create-primary/70 focus:ring-create-primary/30'
                      }`}
                      style={rowBorderStyle}
                      value={row.weight}
                      onChange={(event) => handleCellChange(originalIndex, "weight", event.target.value)}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      className={`w-28 rounded-md bg-slate-900 px-2 py-1 text-slate-100 focus:outline-none focus:ring-2 ${
                        rowBorderStyle ? 'border' : 'border border-slate-700 focus:border-create-primary/70 focus:ring-create-primary/30'
                      }`}
                      style={rowBorderStyle}
                      value={row.sku}
                      placeholder="Optional"
                      onChange={(event) => handleCellChange(originalIndex, "sku", event.target.value)}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      className={`w-full rounded-md bg-slate-900 px-2 py-1 text-slate-100 focus:outline-none focus:ring-2 ${
                        rowBorderStyle ? 'border' : 'border border-slate-700 focus:border-create-primary/70 focus:ring-create-primary/30'
                      }`}
                      style={rowBorderStyle}
                      value={row.notes}
                      onChange={(event) => handleCellChange(originalIndex, "notes", event.target.value)}
                    />
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      className="rounded-md bg-red-600 px-3 py-1 text-xs font-semibold text-white"
                      onClick={() => handleDelete(originalIndex)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
            {!prizes.length && (
              <tr>
                <td colSpan="7" className="px-3 py-6 text-center text-slate-500">
                  No prize data yet. Import a CSV, load sample data, or add rows manually.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button 
          type="button" 
          onClick={handleSave}
          className={hasUnsavedChanges ? "bg-amber-600 hover:bg-amber-700" : ""}
        >
          Save {hasUnsavedChanges && "*"}
        </button>
        <button
          type="button"
          className="bg-slate-800 text-slate-200"
          onClick={async () => {
            setPrizeRows([]);
            await setDirtyFlag('prizes', true);
            setHasUnsavedChanges(true);
          }}
        >
          Clear
        </button>
        {hasUnsavedChanges && (
          <span className="text-sm font-medium text-amber-400">
            ⚠️ Unsaved changes
          </span>
        )}
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
    </div>
  );
}