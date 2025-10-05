import { useMemo, useState } from "react";
import { tierChipClass } from "../../utils/tierColors.js";

const formatTimestamp = (timestamp) =>
  timestamp ? new Date(timestamp).toLocaleString() : "";

const openEntryInNewTab = (entry) => {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Session #${entry.sessionNumber ?? "?"} � ${entry.fanName || "Fan"}</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@3.4.4/dist/tailwind.min.css" />
        <style>
          body { background: #0f172a; color: #e2e8f0; }
          .tier-badge {
            display: inline-flex;
            align-items: center;
            border-radius: 9999px;
            padding: 0.25rem 0.75rem;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            border: 1px solid #38bdf8;
            background: rgba(56, 189, 248, 0.16);
            color: #bae6fd;
          }
        </style>
      </head>
      <body class="p-6">
        <main class="mx-auto max-w-3xl space-y-6">
          <section class="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-lg">
            <header class="space-y-1">
              <h1 class="text-2xl font-bold">Session #${entry.sessionNumber ?? "?"}</h1>
              <p class="text-lg text-slate-200">${entry.fanName || "Unknown fan"}${
                entry.queueNumber ? ` (Queue ${entry.queueNumber})` : ""
              }</p>
              <p class="text-sm text-slate-400">${entry.label || "Custom"} � ${formatTimestamp(entry.timestamp)}</p>
            </header>
          </section>
          <section class="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-lg">
            <h2 class="text-xl font-semibold">Draws (${entry.draws?.length || 0})</h2>
            <div class="mt-4 grid gap-4 md:grid-cols-2">
              ${(entry.draws || [])
                .map((draw, index) => `
                  <article class="rounded-xl border border-slate-800 bg-slate-900/80 p-4 shadow">
                    <header class="flex items-center justify-between text-xs uppercase tracking-wide text-slate-400">
                      <span>Draw #${index + 1}</span>
                      <span class="tier-badge">Tier ${String(draw.tier || "?").toUpperCase()}</span>
                    </header>
                    <h3 class="mt-3 text-lg font-semibold text-white">${draw.prize || "Unknown prize"}</h3>
                    ${draw.sku ? `<p class="mt-2 text-xs text-slate-500">SKU: ${draw.sku}</p>` : ""}
                  </article>
                `)
                .join("")}
            </div>
          </section>
        </main>
      </body>
    </html>
  `;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank", "noopener,noreferrer");
};

export default function HistoryPanel({ history, tierColors, onClose }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("all");

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
      <div className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h4 className="text-xl font-semibold text-white">Draw History</h4>
            <p className="text-sm text-slate-400">Search past sessions by fan, tier, prize, or queue number.</p>
          </div>
          <button
            type="button"
            className="rounded-md bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-200"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs uppercase tracking-wide text-slate-400" htmlFor="history-search">
              Search
            </label>
            <input
              id="history-search"
              className="w-48 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-create-primary/70 focus:outline-none focus:ring-2 focus:ring-create-primary/30"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Fan, tier, prize�"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs uppercase tracking-wide text-slate-400" htmlFor="search-type">
              Filter
            </label>
            <select
              id="search-type"
              className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-create-primary/70 focus:outline-none focus:ring-2 focus:ring-create-primary/30"
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
                    </div>
                    <div className="flex items-center gap-2">
                      <time className="text-xs text-slate-500">{formatTimestamp(entry.timestamp)}</time>
                      <button
                        type="button"
                        onClick={() => openEntryInNewTab(entry)}
                        className="ml-2 rounded-md bg-slate-800 px-2 py-1 text-xs text-slate-200 hover:bg-slate-700"
                      >
                        Open
                      </button>
                    </div>
                  </header>
                  <p className="mt-2 text-xs uppercase tracking-wide text-slate-500">
                    {entry.label || "Custom"} � {entry.draws?.length || 0} pulls
                  </p>
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
                </article>
              ))
          ) : (
            <p className="text-sm text-slate-500">No matching history entries.</p>
          )}
        </div>
      </div>
    </div>
  );
}