import { useState, useMemo } from "react";
import { tierChipClass } from "../../utils/tierColors.js";
import { useTranslation } from "../../utils/TranslationContext.jsx";

export default function HistoryPanel({ history, tierColors, onClose }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("all");
  const { t, currentLang } = useTranslation();
  
  const filteredHistory = useMemo(() => {
    if (!searchQuery.trim()) {
      return history;
    }
    
    const query = searchQuery.trim().toLowerCase();
    
    return history.filter(entry => {
      // Search by fan name
      if (searchType === "fan" || searchType === "all") {
        if ((entry.fanName || "").toLowerCase().includes(query)) {
          return true;
        }
      }
      
      // Search by tier
      if (searchType === "tier" || searchType === "all") {
        if ((entry.draws || []).some(draw => 
          String(draw.tier || "").toLowerCase().includes(query)
        )) {
          return true;
        }
      }
      
      // Search by prize name
      if (searchType === "prize" || searchType === "all") {
        if ((entry.draws || []).some(draw => 
          String(draw.prize || "").toLowerCase().includes(query)
        )) {
          return true;
        }
      }
      
      // Search by queue number
      if (searchType === "queue" || searchType === "all") {
        if ((entry.queueNumber || "").toLowerCase().includes(query)) {
          return true;
        }
      }
      
      return false;
    });
  }, [history, searchQuery, searchType]);

  const openInNewTab = (entry) => {
    // Create a temporary HTML document with the entry details
    const html = `
      <!DOCTYPE html>
      <html lang="${currentLang}">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${t("history.session")} #${entry.sessionNumber} - ${entry.fanName}</title>
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
        <style>
          body { background-color: #0f172a; color: #e2e8f0; }
          .tier-badge { 
            display: inline-flex;
            align-items: center;
            border-radius: 9999px;
            padding: 0.25rem 0.75rem;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          .tier-S { border: 1px solid #fbbf24; background-color: rgba(251, 191, 36, 0.2); color: #fef3c7; }
          .tier-A { border: 1px solid #38bdf8; background-color: rgba(56, 189, 248, 0.2); color: #e0f2fe; }
          .tier-B { border: 1px solid #34d399; background-color: rgba(52, 211, 153, 0.2); color: #d1fae5; }
          .tier-C { border: 1px solid #a78bfa; background-color: rgba(167, 139, 250, 0.2); color: #ede9fe; }
          .prize-card {
            border: 1px solid #1e293b;
            border-radius: 0.5rem;
            padding: 1rem;
            margin-bottom: 0.5rem;
            background-color: rgba(15, 23, 42, 0.8);
          }
        </style>
      </head>
      <body class="p-6">
        <div class="max-w-3xl mx-auto">
          <header class="mb-6">
            <h1 class="text-2xl font-bold">${t("history.session")} #${entry.sessionNumber}</h1>
            <div class="text-lg">${entry.fanName}${entry.queueNumber ? ` (${t("history.queue")} ${entry.queueNumber})` : ""}</div>
            <div class="text-sm text-gray-400">${entry.label || t("history.custom")} • ${new Date(entry.timestamp).toLocaleString(currentLang)}</div>
          </header>
          
          <div class="mb-4">
            <h2 class="text-xl font-semibold mb-2">${t("history.draws")} (${entry.draws?.length || 0})</h2>
            <div class="grid gap-4 md:grid-cols-2">
              ${(entry.draws || []).map((draw, index) => `
                <div class="prize-card">
                  <div class="flex justify-between items-center mb-2">
                    <span>${t("draw.draw")} #${index + 1}</span>
                    <span class="tier-badge tier-${draw.tier}">${t("draw.tier")} ${draw.tier || "?"}</span>
                  </div>
                  <div class="text-lg font-medium">${draw.prize || t("draw.unknownPrize")}</div>
                  ${draw.sku ? `<div class="text-sm text-gray-400">${t("draw.sku")}: ${draw.sku}</div>` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
    
    // Create a blob and open it in a new tab
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
      <div className="relative max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <button
          type="button"
          className="absolute right-4 top-4 rounded-md bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-200"
          onClick={onClose}
        >
          {t("app.close")}
        </button>
        <h4 className="text-xl font-semibold text-white">{t("history.title")}</h4>
        <p className="text-sm text-slate-400">{t("history.subtitle")}</p>
        
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs uppercase tracking-wide text-slate-400" htmlFor="history-search">
              {t("app.search")}
            </label>
            <input
              id="history-search"
              className="w-48 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-caris-primary/70 focus:outline-none focus:ring-2 focus:ring-caris-primary/30"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={t("history.searchPlaceholder")}
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs uppercase tracking-wide text-slate-400" htmlFor="search-type">
              {t("app.filter")}
            </label>
            <select
              id="search-type"
              className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-caris-primary/70 focus:outline-none focus:ring-2 focus:ring-caris-primary/30"
              value={searchType}
              onChange={(event) => setSearchType(event.target.value)}
            >
              <option value="all">{t("history.filterAll")}</option>
              <option value="fan">{t("history.filterFan")}</option>
              <option value="tier">{t("history.filterTier")}</option>
              <option value="prize">{t("history.filterPrize")}</option>
              <option value="queue">{t("history.filterQueue")}</option>
            </select>
          </div>
          <div className="text-sm text-slate-400">
            {filteredHistory.length} {filteredHistory.length === 1 
              ? t("history.entryFound") 
              : t("history.entriesFound")}
          </div>
        </div>
        
        <div className="mt-4 max-h-[60vh] space-y-4 overflow-y-auto pr-2" role="log">
          {filteredHistory.length ? (
            [...filteredHistory]
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .map((entry) => (
                <article key={entry.id} className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                  <header className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-300">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-white">{t("history.session")} #{entry.sessionNumber ?? "?"}</span>
                      <span>{entry.fanName || t("history.unknownFan")}</span>
                      {entry.queueNumber ? <span className="text-xs text-slate-400">{t("history.queue")} {entry.queueNumber}</span> : null}
                    </div>
                    <div className="flex items-center gap-2">
                      <time className="text-xs text-slate-500">
                        {entry.timestamp ? new Date(entry.timestamp).toLocaleString(currentLang) : ""}
                      </time>
                      <button
                        onClick={() => openInNewTab(entry)}
                        className="ml-2 rounded-md bg-slate-800 px-2 py-1 text-xs text-slate-200 hover:bg-slate-700"
                        title={t("history.openInNewTab")}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </button>
                    </div>
                  </header>
                  <p className="mt-2 text-xs uppercase tracking-wide text-slate-500">
                    {entry.label || t("history.custom")} • {entry.draws?.length || 0} {t("draw.pulls")}
                  </p>
                  <ul className="mt-3 flex flex-wrap gap-2 text-xs text-slate-300">
                    {(entry.draws || []).map((draw, index) => (
                      <li key={`${draw.sku || draw.prize || index}-${index}`} className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-1">
                        <span className={tierChipClass(draw.tier, tierColors)}>{String(draw.tier || "?").toUpperCase()}</span>
                        <span>{draw.prize}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))
          ) : (
            <p className="text-sm text-slate-500">{t("history.noEntries")}</p>
          )}
        </div>
      </div>
    </div>
  );
}