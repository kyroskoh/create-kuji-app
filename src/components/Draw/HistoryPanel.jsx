import { useMemo, useState } from "react";
import QRCode from "qrcode";
import { tierChipClass } from "../../utils/tierColors.js";
import { isFeatureAvailable, hasCustomBranding } from "../../utils/subscriptionPlans.js";
import { useBranding } from "../../contexts/BrandingContext.jsx";
import { useAuth } from "../../utils/AuthContext.jsx";

const formatTimestamp = (timestamp) =>
  timestamp ? new Date(timestamp).toLocaleString() : "";

const openEntryInNewTab = (username, entry) => {
  // Open an in-app route so the same CSS, branding, and tier colors apply
  const url = `/${encodeURIComponent(username)}/draw/history/${encodeURIComponent(entry.id)}`;
  window.open(url, "_blank", "noopener,noreferrer");
};

// Helper function to generate QR code with embedded logo (same as DrawScreen)
const generateQRCodeWithLogo = async (url, logoDataUrl, brandColors) => {
  try {
    const canvas = document.createElement('canvas');
    const primaryColor = brandColors?.primaryColor || '#1e293b';
    
    await QRCode.toCanvas(canvas, url, {
      width: 400,
      margin: 2,
      color: {
        dark: primaryColor,
        light: '#ffffff'
      },
      errorCorrectionLevel: 'H'
    });
    
    if (!logoDataUrl) {
      return canvas.toDataURL('image/png');
    }
    
    const ctx = canvas.getContext('2d');
    const logoImage = new Image();
    
    return new Promise((resolve, reject) => {
      logoImage.onload = () => {
        const logoSize = canvas.width * 0.2;
        const logoX = (canvas.width - logoSize) / 2;
        const logoY = (canvas.height - logoSize) / 2;
        
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, logoSize / 2 + 8, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.save();
        const radius = 8;
        ctx.beginPath();
        ctx.moveTo(logoX + radius, logoY);
        ctx.lineTo(logoX + logoSize - radius, logoY);
        ctx.quadraticCurveTo(logoX + logoSize, logoY, logoX + logoSize, logoY + radius);
        ctx.lineTo(logoX + logoSize, logoY + logoSize - radius);
        ctx.quadraticCurveTo(logoX + logoSize, logoY + logoSize, logoX + logoSize - radius, logoY + logoSize);
        ctx.lineTo(logoX + radius, logoY + logoSize);
        ctx.quadraticCurveTo(logoX, logoY + logoSize, logoX, logoY + logoSize - radius);
        ctx.lineTo(logoX, logoY + radius);
        ctx.quadraticCurveTo(logoX, logoY, logoX + radius, logoY);
        ctx.closePath();
        ctx.clip();
        
        ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize);
        ctx.restore();
        
        resolve(canvas.toDataURL('image/png'));
      };
      
      logoImage.onerror = () => {
        console.warn('Failed to load logo for QR code');
        resolve(canvas.toDataURL('image/png'));
      };
      
      logoImage.src = logoDataUrl;
    });
  } catch (err) {
    console.error('Failed to generate QR code with logo:', err);
    throw err;
  }
};

export default function HistoryPanel({ history, tierColors, onClose, username, subscriptionPlan, settings }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("all");
  const [copiedEntryId, setCopiedEntryId] = useState(null);
  const [qrModalEntry, setQrModalEntry] = useState(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState(null);
  const [generatingQR, setGeneratingQR] = useState(false);
  const [showSpoilers, setShowSpoilers] = useState(false);
  
  const { user } = useAuth();
  const { branding } = useBranding();

  // Check if scratch cards are enabled for sharing
  const hasScratchCards = isFeatureAvailable('scratchCards', subscriptionPlan || 'free');

  const copyShareLink = (entry) => {
    const shareUrl = `${window.location.origin}/${encodeURIComponent(username)}/fan/draw/${encodeURIComponent(entry.id)}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedEntryId(entry.id);
      setTimeout(() => setCopiedEntryId(null), 2000);
    }).catch(err => {
      console.error('Failed to copy link:', err);
      alert('Failed to copy link to clipboard');
    });
  };
  
  const showQRCode = async (entry) => {
    setQrModalEntry(entry);
    setGeneratingQR(true);
    setQrCodeDataUrl(null);
    
    try {
      const shareUrl = `${window.location.origin}/${encodeURIComponent(username)}/fan/draw/${encodeURIComponent(entry.id)}`;
      
      // Check if user has Pro plan with custom branding
      const hasBrandingAccess = hasCustomBranding(user?.subscriptionPlan || 'free');
      const logoUrl = hasBrandingAccess && branding?.logoUrl ? branding.logoUrl : null;
      
      // Get custom QR code color from settings (if available)
      const qrCodeColor = settings?.qrCodeColor || branding?.primaryColor || '#1e293b';
      
      let qrDataUrl;
      if (logoUrl) {
        qrDataUrl = await generateQRCodeWithLogo(shareUrl, logoUrl, {
          primaryColor: qrCodeColor
        });
      } else {
        qrDataUrl = await QRCode.toDataURL(shareUrl, {
          width: 400,
          margin: 2,
          color: {
            dark: qrCodeColor,
            light: '#ffffff'
          }
        });
      }
      
      setQrCodeDataUrl(qrDataUrl);
    } catch (err) {
      console.error('Failed to generate QR code:', err);
      alert('Failed to generate QR code');
    } finally {
      setGeneratingQR(false);
    }
  };
  
  const downloadQRCode = () => {
    if (!qrCodeDataUrl || !qrModalEntry) return;
    
    const link = document.createElement('a');
    link.download = `kuji-session-${qrModalEntry.sessionNumber}-${qrModalEntry.fanName.replace(/\s+/g, '-')}.png`;
    link.href = qrCodeDataUrl;
    link.click();
  };
  
  const closeQRModal = () => {
    setQrModalEntry(null);
    setQrCodeDataUrl(null);
  };

  const filteredHistory = useMemo(() => {
    if (!searchQuery.trim()) {
      return history;
    }

    const query = searchQuery.trim().toLowerCase();

    return history.filter((entry) => {
      const fanMatch = (entry.fanName || "").toLowerCase().includes(query);
      const queueMatch = (entry.queueNumber || "").toLowerCase().includes(query);
      const tierMatch = (entry.draws || []).some((draw) => String(draw.tier || "").toLowerCase().includes(query));
      const prizeMatch = (entry.draws || []).some((draw) => String(draw.prize || "").toLowerCase().includes(query));

      switch (searchType) {
        case "fan":
          return fanMatch;
        case "tier":
          return tierMatch;
        case "prize":
          return prizeMatch;
        case "queue":
          return queueMatch;
        default:
          return fanMatch || queueMatch || tierMatch || prizeMatch;
      }
    });
  }, [history, searchQuery, searchType]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
      <div className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1">
            <h4 className="text-xl font-semibold text-white">Draw History</h4>
            <p className="text-sm text-slate-400">Search past sessions by fan, tier, prize, or queue number.</p>
            {hasScratchCards && (
              <p className="text-xs text-blue-400 mt-2 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Scratch card mode enabled for shared links
              </p>
            )}
          </div>
          <div className="flex items-start gap-2">
            <button
              type="button"
              onClick={() => setShowSpoilers(!showSpoilers)}
              className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                showSpoilers
                  ? 'bg-amber-600 text-white hover:bg-amber-700'
                  : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
              }`}
              title={showSpoilers ? 'Hide prize spoilers' : 'Show prize spoilers'}
            >
              {showSpoilers ? (
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                  Hide Prizes
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Show Prizes
                </span>
              )}
            </button>
            <button
              type="button"
              className="rounded-md bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-200 hover:bg-slate-700"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs uppercase tracking-wide text-slate-400" htmlFor="history-search">
              Search
            </label>
            <input
              id="history-search"
              className="w-full sm:w-48 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-create-primary/70 focus:outline-none focus:ring-2 focus:ring-create-primary/30"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Fan, tier, prize..."
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs uppercase tracking-wide text-slate-400" htmlFor="search-type">
              Filter
            </label>
            <select
              id="search-type"
              className="w-full sm:w-auto rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-create-primary/70 focus:outline-none focus:ring-2 focus:ring-create-primary/30"
              value={searchType}
              onChange={(event) => setSearchType(event.target.value)}
            >
              <option value="all">All</option>
              <option value="fan">Fan</option>
              <option value="tier">Tier</option>
              <option value="prize">Prize</option>
              <option value="queue">Queue</option>
            </select>
          </div>
          <div className="text-xs uppercase tracking-wide text-slate-500">
            {filteredHistory.length} {filteredHistory.length === 1 ? "session" : "sessions"}
          </div>
        </div>

        <div className="mt-4 max-h-[60vh] flex-1 space-y-4 overflow-y-auto pr-2" role="log">
          {filteredHistory.length ? (
            [...filteredHistory]
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .map((entry) => (
                <article key={entry.id} className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                  <header className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-300">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-white">Session #{entry.sessionNumber ?? "?"}</span>
                      <span>{entry.fanName || "Unknown fan"}</span>
                      {entry.queueNumber ? <span className="text-xs text-slate-400">Queue {entry.queueNumber}</span> : null}
                      {entry.fanRevealed && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-300 border border-green-500/30" title={`Revealed at ${entry.fanRevealedAt ? new Date(entry.fanRevealedAt).toLocaleString() : 'unknown'}`}>
                          ✓ Viewed
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <time className="text-xs text-slate-500">{formatTimestamp(entry.timestamp)}</time>
                      <button
                        type="button"
onClick={() => openEntryInNewTab(username, entry)}
                        className="rounded-md bg-slate-800 px-2 py-1 text-xs text-slate-200 hover:bg-slate-700"
                      >
                        Open
                      </button>
                      <button
                        type="button"
                        onClick={() => copyShareLink(entry)}
                        className="rounded-md bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700"
                        title="Copy shareable link for fan"
                      >
                        {copiedEntryId === entry.id ? '✓ Copied!' : '🔗 Share'}
                      </button>
                      <button
                        type="button"
                        onClick={() => showQRCode(entry)}
                        className="rounded-md bg-purple-600 px-2 py-1 text-xs text-white hover:bg-purple-700 flex items-center gap-1"
                        title="Show QR code"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                        </svg>
                        QR
                      </button>
                    </div>
                  </header>
                  <p className="mt-2 text-xs uppercase tracking-wide text-slate-500">
                    {entry.label || "Custom"} • {entry.draws?.length || 0} pulls
                  </p>
                  {showSpoilers ? (
                    <ul className="mt-3 flex flex-wrap gap-2 text-xs text-slate-300">
                      {(entry.draws || []).map((draw, index) => (
                        <li
                          key={`${draw.sku || draw.prize || index}-${index}`}
                          className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-1"
                        >
                          <span className={tierChipClass(draw.tier, tierColors)}>{String(draw.tier || "?").toUpperCase()}</span>
                          <span>{draw.prize}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="mt-3 flex items-center gap-2 text-sm text-slate-500 bg-slate-900/60 border border-slate-800 rounded-lg px-4 py-3">
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                      <div>
                        <p className="font-medium text-slate-400">Prizes Hidden</p>
                        <p className="text-xs text-slate-600">Click "Show Prizes" above to reveal</p>
                      </div>
                    </div>
                  )}
                </article>
              ))
          ) : (
            <p className="text-sm text-slate-500">No matching history entries.</p>
          )}
        </div>
      </div>
      
      {/* QR Code Modal */}
      {qrModalEntry && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/90 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-white">QR Code</h3>
                <p className="text-sm text-slate-300 mt-1">
                  Session #{qrModalEntry.sessionNumber} - {qrModalEntry.fanName}
                </p>
              </div>
              <button
                onClick={closeQRModal}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {generatingQR ? (
              <div className="bg-white rounded-lg p-8 mb-4 flex flex-col items-center justify-center min-h-[300px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
                <p className="text-slate-600 text-sm">Generating QR code...</p>
              </div>
            ) : qrCodeDataUrl ? (() => {
              const hasBrandingAccess = hasCustomBranding(user?.subscriptionPlan || 'free');
              const hasLogo = hasBrandingAccess && branding?.logoUrl;
              
              return (
                <>
                  <div className="bg-white rounded-lg p-4 mb-4 flex flex-col items-center">
                    <div className="flex items-center gap-2 mb-3">
                      <p className="text-sm text-slate-800 font-semibold">Scan to View Prizes:</p>
                      {hasLogo && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                          </svg>
                          Branded
                        </span>
                      )}
                    </div>
                    <img 
                      src={qrCodeDataUrl} 
                      alt="QR Code" 
                      className="w-64 h-64 border-4 border-slate-200 rounded-lg shadow-lg"
                    />
                    <p className="text-xs text-slate-600 mt-3 text-center">
                      {hasLogo 
                        ? 'Branded QR code with your logo 🎉'
                        : 'Fan can scan this to view their prizes'}
                    </p>
                  </div>
                  
                  <div className="text-xs text-slate-400 mb-4">
                    <p>✨ Share this QR code with {qrModalEntry.fanName}</p>
                    <p className="mt-1">📱 They can scan it to see their prizes</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={downloadQRCode}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download
                    </button>
                    <button
                      onClick={closeQRModal}
                      className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </>
              );
            })() : null}
          </div>
        </div>
      )}
    </div>
  );
}
