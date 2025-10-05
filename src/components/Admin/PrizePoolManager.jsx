import { useEffect, useMemo, useRef, useState } from "react";
import useLocalStorageDAO from "../../hooks/useLocalStorageDAO.js";
import { PRIZE_HEADERS, exportToCsv, parsePrizesCsv } from "../../utils/csvUtils.js";
import { compareTierLabels, tierBadgeClass, tierChipClass, tierInputClass } from "../../utils/tierColors.js";
import { calculateProbabilities, tierInfluence } from "../../utils/randomDraw.js";

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
  const { getPrizes, setPrizes, getSettings } = useLocalStorageDAO();
  const [prizes, setPrizeRows] = useState([]);
  const [tierColors, setTierColors] = useState({});
  const [weightMode, setWeightMode] = useState("basic");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const [storedPrizes, storedSettings] = await Promise.all([getPrizes(), getSettings()]);
      if (mounted) {
        setPrizeRows(storedPrizes.length ? storedPrizes : []);
        setTierColors(storedSettings.tierColors ?? {});
        setWeightMode(storedSettings.weightMode ?? "basic");
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [getPrizes, getSettings]);

  const tierTotals = useMemo(() => {
    const totals = prizes.reduce((acc, prize) => {
      const tier = String(prize.tier || "?").trim().toUpperCase();
      acc[tier] = (acc[tier] || 0) + (Number(prize.quantity) || 0);
      return acc;
    }, {});
    return Object.entries(totals).sort(([tierA], [tierB]) => compareTierLabels(tierA, tierB));
  }, [prizes]);

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

  const handleAddRow = () => {
    setPrizeRows((rows) => [...rows, { ...EMPTY_PRIZE }]);
  };

  const handleCellChange = (index, key, value) => {
    setPrizeRows((rows) =>
      rows.map((row, rowIndex) =>
        rowIndex === index
          ? {
              ...row,
              [key]: key === "quantity" || key === "weight" ? Number.parseInt(value, 10) || 0 : value
            }
          : row
      )
    );
  };

  const handleDelete = (index) => {
    setPrizeRows((rows) => rows.filter((_, rowIndex) => rowIndex !== index));
  };

  const handleSave = async () => {
    await setPrizes(prizes);
    setStatus({ type: "success", message: "Prize pool saved to storage." });
  };

  const applySuggestedWeights = () => {
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
    setStatus({ type: "success", message: "Suggested weights applied for advanced mode." });
  };

  if (loading) {
    return <p className="text-sm text-slate-400">Loading prize pool...</p>;
  }

  return (
    <div className="space-y-4">
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
            {prizes.map((row, index) => {
              const tierValue = row.tier;
              return (
                <tr key={`${row.sku || "row"}-${index}`} className="hover:bg-slate-900/40">
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className={tierBadgeClass(tierValue, tierColors)}>{(tierValue || "?").toString().toUpperCase()}</span>
                      <input
                        className={`w-16 rounded-md bg-slate-900 px-2 py-1 text-slate-100 ${tierInputClass(tierValue, tierColors)}`}
                        value={tierValue}
                        onChange={(event) => handleCellChange(index, "tier", event.target.value)}
                      />
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <input
                      className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-slate-100 focus:border-create-primary/70 focus:outline-none focus:ring-2 focus:ring-create-primary/30"
                      value={row.prize_name}
                      onChange={(event) => handleCellChange(index, "prize_name", event.target.value)}
                    />
                  </td>
                  <td className="px-3 py-2 text-right">
                    <input
                      type="number"
                      min="0"
                      className="w-20 rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-right text-slate-100 focus;border-create-primary/70 focus:outline-none focus:ring-2 focus:ring-create-primary/30"
                      value={row.quantity}
                      onChange={(event) => handleCellChange(index, "quantity", event.target.value)}
                    />
                  </td>
                  <td className="px-3 py-2 text-right">
                    <input
                      type="number"
                      min="1"
                      className="w-16 rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-right text-slate-100 focus;border-create-primary/70 focus:outline-none focus:ring-2 focus:ring-create-primary/30"
                      value={row.weight}
                      onChange={(event) => handleCellChange(index, "weight", event.target.value)}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      className="w-28 rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-slate-100 focus;border-create-primary/70 focus:outline-none focus:ring-2 focus:ring-create-primary/30"
                      value={row.sku}
                      placeholder="Optional"
                      onChange={(event) => handleCellChange(index, "sku", event.target.value)}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-slate-100 focus;border-create-primary/70 focus:outline-none focus:ring-2 focus:ring-create-primary/30"
                      value={row.notes}
                      onChange={(event) => handleCellChange(index, "notes", event.target.value)}
                    />
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      className="rounded-md bg-red-600 px-3 py-1 text-xs font-semibold text-white"
                      onClick={() => handleDelete(index)}
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
        <button type="button" onClick={handleSave}>
          Save
        </button>
        <button
          type="button"
          className="bg-slate-800 text-slate-200"
          onClick={() => setPrizeRows([])}
        >
          Clear
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
    </div>
  );
}