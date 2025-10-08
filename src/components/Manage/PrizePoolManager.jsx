import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import useLocalStorageDAO from "../../hooks/useLocalStorageDAO.js";
import { PRIZE_HEADERS, exportToCsv, parsePrizesCsv } from "../../utils/csvUtils.js";
import { sortTierEntries, tierBadgeClass, tierChipClass, tierInputClass } from "../../utils/tierColors.js";
import { calculateProbabilities, tierInfluence } from "../../utils/randomDraw.js";
import { useAuth } from "../../utils/AuthContext.jsx";
import { syncUserData } from "../../services/syncService.js";
import { isTierSortingAllowed } from "../../utils/subscriptionPlans.js";

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
  advanced: "Advanced weight system (weight � quantity � tier priority)"
};

export default function PrizePoolManager() {
  const location = useLocation();
  const { getPrizes, setPrizes, getSettings, setDirtyFlag, clearDirtyFlag, getDirtyState } = useLocalStorageDAO();
  const { user } = useAuth();
  const [prizes, setPrizeRows] = useState([]);
  const [tierColors, setTierColors] = useState({});
  const [weightMode, setWeightMode] = useState("basic");
  const [subscriptionPlan, setSubscriptionPlan] = useState("free");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [availableTiers, setAvailableTiers] = useState([]);
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
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "prizes.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
  
  // Handle tier input blur to validate/normalize
  const handleTierBlur = async (index, currentValue) => {
    const normalizedInput = currentValue.trim().toUpperCase();
    
    // If empty or already valid, do nothing
    if (normalizedInput === "" || availableTiers.includes(normalizedInput)) {
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
                {availableTiers.map(tier => (
                  <span key={tier} className={tierChipClass(tier, tierColors)}>
                    {tier}
                  </span>
                ))}
              </div>
              <p className="mt-1 text-slate-400">Type these tier names in the tier column. The input will auto-suggest and validate.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-xs text-slate-300">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <span className="font-semibold text-amber-400">No tiers defined yet</span>
              <p className="mt-1 text-slate-400">Go to <a href="#/manage/settings" className="text-blue-400 hover:text-blue-300 underline">Settings</a> to create tier names with colors before adding prizes.</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-xs text-slate-300">
        <span className="font-semibold text-white">Weight system:</span> {WEIGHT_MODE_LABEL[weightMode]}
      </div>
      <div className="flex flex-wrap items-center gap-3">
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
        <div className="ml-auto flex flex-wrap gap-2 text-xs uppercase tracking-wide text-slate-400">
          {tierTotals.length ? (
            tierTotals.map(([tier, qty]) => (
              <span key={tier} className={tierChipClass(tier, tierColors)}>
                {tier}:{qty}
              </span>
            ))
          ) : (
            <span className="rounded-full border border-slate-700 bg-slate-800/60 px-3 py-1 text-slate-300">
              No stock
            </span>
          )}
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
              return (
                <tr key={`${row.sku || "row"}-${originalIndex}`} className="hover:bg-slate-900/40">
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className={tierBadgeClass(tierValue, tierColors)}>{(tierValue || "?").toString().toUpperCase()}</span>
                      <input
                        list={`tier-suggestions-${originalIndex}`}
                        className={`w-16 rounded-md bg-slate-900 px-2 py-1 text-slate-100 uppercase ${tierInputClass(tierValue, tierColors)}`}
                        value={tierValue}
                        onChange={(event) => handleCellChange(originalIndex, "tier", event.target.value)}
                        onBlur={(event) => handleTierBlur(originalIndex, event.target.value)}
                        placeholder={availableTiers[0] || "?"}
                        title={`Available tiers: ${availableTiers.join(', ') || 'Create tiers in Settings first'}`}
                      />
                      <datalist id={`tier-suggestions-${originalIndex}`}>
                        {availableTiers.map(tier => (
                          <option key={tier} value={tier} />
                        ))}
                      </datalist>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <input
                      className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-slate-100 focus:border-create-primary/70 focus:outline-none focus:ring-2 focus:ring-create-primary/30"
                      value={row.prize_name}
                      onChange={(event) => handleCellChange(originalIndex, "prize_name", event.target.value)}
                    />
                  </td>
                  <td className="px-3 py-2 text-right">
                    <input
                      type="number"
                      min="0"
                      className="w-20 rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-right text-slate-100 focus;border-create-primary/70 focus:outline-none focus:ring-2 focus:ring-create-primary/30"
                      value={row.quantity}
                      onChange={(event) => handleCellChange(originalIndex, "quantity", event.target.value)}
                    />
                  </td>
                  <td className="px-3 py-2 text-right">
                    <input
                      type="number"
                      min="1"
                      className="w-16 rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-right text-slate-100 focus;border-create-primary/70 focus:outline-none focus:ring-2 focus:ring-create-primary/30"
                      value={row.weight}
                      onChange={(event) => handleCellChange(originalIndex, "weight", event.target.value)}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      className="w-28 rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-slate-100 focus;border-create-primary/70 focus:outline-none focus:ring-2 focus:ring-create-primary/30"
                      value={row.sku}
                      placeholder="Optional"
                      onChange={(event) => handleCellChange(originalIndex, "sku", event.target.value)}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-slate-100 focus;border-create-primary/70 focus:outline-none focus:ring-2 focus:ring-create-primary/30"
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