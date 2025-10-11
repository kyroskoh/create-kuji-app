import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useLocalStorageDAO from "../hooks/useLocalStorageDAO.js";
import { tierChipClass } from "../utils/tierColors.js";
import BrandingHeader from "../components/Branding/BrandingHeader.jsx";
import BrandingFooter from "../components/Branding/BrandingFooter.jsx";
import BrandingWrapper from "../components/Branding/BrandingWrapper.jsx";

const formatTimestamp = (timestamp) =>
  timestamp ? new Date(timestamp).toLocaleString() : "";

export default function DrawHistory() {
  const { username, entryId } = useParams();
  const navigate = useNavigate();
  const { getHistory, getSettings } = useLocalStorageDAO();
  const [entry, setEntry] = useState(null);
  const [tierColors, setTierColors] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const [history, settings] = await Promise.all([getHistory(), getSettings()]);
        
        if (!mounted) return;

        // Find the entry by ID
        const foundEntry = history.find((item) => item.id === entryId);
        
        if (!foundEntry) {
          setError("Draw history entry not found.");
          setLoading(false);
          return;
        }

        setEntry(foundEntry);
        setTierColors(settings.tierColors || {});
        setLoading(false);
      } catch (err) {
        if (!mounted) return;
        console.error("Failed to load draw history entry:", err);
        setError("Failed to load draw history entry.");
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [entryId, getHistory, getSettings]);

  const handleGoBack = () => {
    navigate(`/${username}/draw`);
  };

  if (loading) {
    return (
      <BrandingWrapper className="min-h-screen">
        <div className="flex items-center justify-center p-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-create-primary mx-auto"></div>
            <p className="mt-4 text-slate-400">Loading history...</p>
          </div>
        </div>
      </BrandingWrapper>
    );
  }

  if (error || !entry) {
    return (
      <BrandingWrapper className="min-h-screen">
        <div className="space-y-6">
          <BrandingHeader />
          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Error</h2>
            <p className="text-slate-300 mb-4">{error || "Entry not found."}</p>
            <button
              type="button"
              onClick={handleGoBack}
              className="bg-create-primary text-white px-4 py-2 rounded-lg hover:bg-create-primary/80 transition-colors"
            >
              Back to Draw
            </button>
          </section>
          <BrandingFooter />
        </div>
      </BrandingWrapper>
    );
  }

  return (
    <BrandingWrapper className="min-h-screen">
      <div className="space-y-6">
        <BrandingHeader />

        {/* Session Info */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-lg">
          <div className="flex items-start justify-between mb-4">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold text-white">
                Session #{entry.sessionNumber ?? "?"}
              </h1>
              <p className="text-xl text-slate-200">
                {entry.fanName || "Unknown fan"}
                {entry.queueNumber ? ` (Queue ${entry.queueNumber})` : ""}
              </p>
              <p className="text-sm text-slate-400">
                {entry.label || "Custom"} • {formatTimestamp(entry.timestamp)}
              </p>
              {entry.eventName && (
                <p className="text-sm text-slate-400">
                  Event: {entry.eventName}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={handleGoBack}
              className="bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white px-4 py-2 rounded-lg transition-colors text-sm font-semibold"
            >
              ← Back to Draw
            </button>
          </div>
        </section>

        {/* Draw Results */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-lg">
          <h2 className="text-2xl font-semibold text-white mb-4">
            Draws ({entry.draws?.length || 0})
          </h2>
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {(entry.draws || []).map((draw, index) => (
              <article
                key={`${draw.sku || draw.prize || index}-${index}`}
                className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 shadow hover:bg-slate-900 transition-colors"
              >
                <header className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-400 mb-3">
                  <span>Draw #{index + 1}</span>
                  <span className={tierChipClass(draw.tier, tierColors)}>
                    Tier {String(draw.tier || "?").toUpperCase()}
                  </span>
                </header>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {draw.prize || "Unknown prize"}
                </h3>
                {draw.sku && (
                  <p className="text-xs text-slate-500">SKU: {draw.sku}</p>
                )}
              </article>
            ))}
          </div>
          {(!entry.draws || entry.draws.length === 0) && (
            <p className="text-sm text-slate-500 text-center">
              No draws recorded for this session.
            </p>
          )}
        </section>

        <BrandingFooter />
      </div>
    </BrandingWrapper>
  );
}
