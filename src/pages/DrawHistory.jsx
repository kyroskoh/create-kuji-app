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
  const [copied, setCopied] = useState(false);

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

  const handleCopyShareLink = () => {
    const shareUrl = `${window.location.origin}/${encodeURIComponent(username)}/fan/draw/${encodeURIComponent(entryId)}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy link:', err);
      alert('Failed to copy link to clipboard');
    });
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
                  Event: <span className="text-slate-300 font-semibold">{username}'s {entry.eventName}</span>
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCopyShareLink}
                className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors text-sm font-semibold flex items-center gap-2"
                title="Copy shareable link for fan"
              >
                {copied ? (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    Share Link
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleGoBack}
                className="bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white px-4 py-2 rounded-lg transition-colors text-sm font-semibold"
              >
                ← Back to Draw
              </button>
            </div>
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
