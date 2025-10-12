import { useEffect, useMemo, useRef, useState } from "react";
import useLocalStorageDAO from "../../hooks/useLocalStorageDAO.js";
import { PRICING_HEADERS, exportToCsv, parsePricingCsv, exportCsvTemplate, downloadCsv } from "../../utils/csvUtils.js";
import { useAuth } from "../../utils/AuthContext.jsx";
import { syncUserData } from "../../services/syncService.js";

const EMPTY_PRESET = {
  preset_id: "",
  label: "",
  draw_count: 1,
  price: 0,
  bonus_draws: 0,
  active: true
};

const normalisePreset = (preset, fallbackId) => {
  const rawPrice =
    preset.price ??
    (preset.price_minor ? Number(preset.price_minor) / 100 : undefined) ??
    preset.price_minor ??
    0;

  return {
    preset_id: preset.preset_id ?? fallbackId,
    label: preset.label ?? "",
    draw_count: Number.parseInt(preset.draw_count, 10) || 0,
    price: Math.max(0, Math.round(Number.parseFloat(rawPrice) || 0)),
    bonus_draws: Number.parseInt(preset.bonus_draws, 10) || 0,
    active: typeof preset.active === "boolean" ? preset.active : String(preset.active).toLowerCase() !== "false"
  };
};

const normalisePresetList = (list) =>
  list.map((preset, index) => normalisePreset(preset, `p${index + 1}`));

async function fetchSamplePricing() {
  const response = await fetch("/assets/pricing.sample.csv");
  if (!response.ok) {
    throw new Error("Unable to load sample pricing CSV");
  }
  return response.text();
}

export default function PricingManager() {
  const { getPricing, setPricing, getSettings, setDirtyFlag, clearDirtyFlag, getDirtyState } = useLocalStorageDAO();
  const { user } = useAuth();
  const [presets, setPresets] = useState([]);
  const [status, setStatus] = useState(null);
  const [currency, setCurrency] = useState("MYR");
  const [locale, setLocale] = useState("ms-MY");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const [storedPresets, storedSettings, dirtyState] = await Promise.all([
        getPricing(),
        getSettings(),
        getDirtyState()
      ]);
      if (!mounted) return;
      const cleanPresets = storedPresets.length ? normalisePresetList(storedPresets) : [];
      setPresets(cleanPresets);
      setCurrency(storedSettings.currency ?? "MYR");
      setLocale(storedSettings.locale ?? "ms-MY");
      setHasUnsavedChanges(dirtyState.pricing === true);
    })();
    return () => {
      mounted = false;
    };
  }, [getPricing, getSettings, getDirtyState]);

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale || "ms-MY", {
        style: "currency",
        currency: currency || "MYR",
        maximumFractionDigits: 0
      }),
    [currency, locale]
  );

  const formatPrice = (value) => currencyFormatter.format(Number.isFinite(value) ? value : 0);

  const totalActivePresets = useMemo(() => presets.filter((preset) => preset.active).length, [presets]);

  const handleImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const { data, errors } = parsePricingCsv(text);
    if (errors.length) {
      setStatus({ type: "error", message: errors[0].message });
      return;
    }
    setPresets(normalisePresetList(data));
    await setDirtyFlag('pricing', true);
    setHasUnsavedChanges(true);
    setStatus({ type: "success", message: `${data.length} pricing presets imported.` });
  };

  const handleLoadSample = async () => {
    try {
      const csvText = await fetchSamplePricing();
      const { data, errors } = parsePricingCsv(csvText);
      if (errors.length) {
        setStatus({ type: "error", message: errors[0].message });
        return;
      }
      setPresets(normalisePresetList(data));
      await setDirtyFlag('pricing', true);
      setHasUnsavedChanges(true);
      setStatus({ type: "success", message: "Sample pricing presets loaded." });
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    }
  };

  const handleExport = () => {
    const csv = exportToCsv(presets, PRICING_HEADERS);
    downloadCsv(csv, 'pricing.csv');
    setStatus({ type: "success", message: "Pricing exported successfully!" });
  };

  const handleExportTemplate = () => {
    const csv = exportCsvTemplate(PRICING_HEADERS);
    downloadCsv(csv, 'pricing-template.csv');
    setStatus({ type: "success", message: "Template downloaded! Fill it out and import it back." });
  };

  const handleSave = async () => {
    try {
      // Save to LocalForage first
      await setPricing(presets);
      
      // Clear dirty flag - changes are now saved
      await clearDirtyFlag('pricing');
      setHasUnsavedChanges(false);
      
      setStatus({ type: "success", message: "Pricing presets saved to storage." });
      
      // Sync to backend if user is authenticated
      if (user?.username) {
        setTimeout(async () => {
          try {
            await syncUserData(user.username, 'presets', presets);
            console.log('✅ Pricing presets synced to backend after save');
          } catch (syncError) {
            console.warn('⚠️ Failed to sync pricing presets to backend:', syncError);
            // Don't show error to user as LocalForage save succeeded
          }
        }, 500); // Small delay to let UI update first
      }
    } catch (error) {
      setStatus({ type: "error", message: "Failed to save pricing presets." });
      console.error('Error saving pricing presets:', error);
    }
  };

  const handleChange = async (index, key, value) => {
    setPresets((rows) =>
      rows.map((row, rowIndex) => {
        if (rowIndex !== index) return row;
        if (key === "price") {
          const dollars = Math.max(0, Math.round(Number.parseFloat(value) || 0));
          return { ...row, price: dollars };
        }
        if (key === "draw_count" || key === "bonus_draws") {
          return { ...row, [key]: Math.max(0, Number.parseInt(value, 10) || 0) };
        }
        return { ...row, [key]: value };
      })
    );
    await setDirtyFlag('pricing', true);
    setHasUnsavedChanges(true);
  };

  const toggleActive = async (index) => {
    setPresets((rows) =>
      rows.map((row, rowIndex) =>
        rowIndex === index
          ? {
              ...row,
              active: !row.active
            }
          : row
      )
    );
    await setDirtyFlag('pricing', true);
    setHasUnsavedChanges(true);
  };

  const handleAddPreset = async () => {
    setPresets((rows) => [
      ...rows,
      {
        ...EMPTY_PRESET,
        preset_id: `p${rows.length + 1}`
      }
    ]);
    await setDirtyFlag('pricing', true);
    setHasUnsavedChanges(true);
  };

  const handleDelete = async (index) => {
    setPresets((rows) => rows.filter((_, rowIndex) => rowIndex !== index));
    await setDirtyFlag('pricing', true);
    setHasUnsavedChanges(true);
  };

  return (
    <div className="space-y-4">
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
          Import Pricing CSV
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
        <button type="button" onClick={handleAddPreset} className="bg-slate-800 text-slate-200">
          Add Preset
        </button>
        <button type="button" onClick={handleExport} className="bg-slate-800 text-slate-200">
          Export CSV
        </button>
        <span className="ml-auto text-xs uppercase tracking-wide text-slate-400">
          Active presets: {totalActivePresets}
        </span>
      </div>
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-xs text-slate-400">
        Prices are tracked in whole dollars. Current currency: {currency || "N/A"} | Locale: {locale || "N/A"}.
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-800 text-sm">
          <thead className="bg-slate-900/60 uppercase text-xs tracking-wide text-slate-400">
            <tr>
              <th className="px-3 py-2 text-left">Preset ID</th>
              <th className="px-3 py-2 text-left">Label</th>
              <th className="px-3 py-2 text-right">Draw Count</th>
              <th className="px-3 py-2 text-right">Price ({currency || "Currency"})</th>
              <th className="px-3 py-2 text-right">Bonus Draws</th>
              <th className="px-3 py-2 text-center">Active</th>
              <th className="px-3 py-2" aria-label="actions" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {presets.map((row, index) => (
              <tr key={row.preset_id || index} className="hover:bg-slate-900/40">
                <td className="px-3 py-2">
                  <input
                    className="w-24 rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-slate-100 focus:border-create-primary/70 focus:outline-none focus:ring-2 focus:ring-create-primary/30"
                    value={row.preset_id}
                    onChange={(event) => handleChange(index, "preset_id", event.target.value)}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-slate-100 focus:border-create-primary/70 focus:outline-none focus:ring-2 focus:ring-create-primary/30"
                    value={row.label}
                    onChange={(event) => handleChange(index, "label", event.target.value)}
                  />
                </td>
                <td className="px-3 py-2 text-right">
                  <input
                    type="number"
                    min="1"
                    className="w-20 rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-right text-slate-100 focus:border-create-primary/70 focus:outline-none focus:ring-2 focus:ring-create-primary/30"
                    value={row.draw_count}
                    onChange={(event) => handleChange(index, "draw_count", event.target.value)}
                  />
                </td>
                <td className="px-3 py-2 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-xs text-slate-500">{formatPrice(row.price || 0)}</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      className="w-24 rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-right text-slate-100 focus:border-create-primary/70 focus:outline-none focus:ring-2 focus:ring-create-primary/30"
                      value={row.price}
                      onChange={(event) => handleChange(index, "price", event.target.value)}
                    />
                  </div>
                </td>
                <td className="px-3 py-2 text-right">
                  <input
                    type="number"
                    min="0"
                    className="w-20 rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-right text-slate-100 focus:border-create-primary/70 focus:outline-none focus:ring-2 focus:ring-create-primary/30"
                    value={row.bonus_draws}
                    onChange={(event) => handleChange(index, "bonus_draws", event.target.value)}
                  />
                </td>
                <td className="px-3 py-2 text-center">
                  <button
                    type="button"
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                      row.active ? "bg-emerald-600/80" : "bg-slate-800"
                    }`}
                    onClick={() => toggleActive(index)}
                  >
                    {row.active ? "Active" : "Hidden"}
                  </button>
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
            ))}
            {!presets.length && (
              <tr>
                <td colSpan="7" className="px-3 py-6 text-center text-slate-500">
                  No pricing presets yet. Import a CSV, load sample data, or add presets manually.
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
            setPresets([]);
            await setDirtyFlag('pricing', true);
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
