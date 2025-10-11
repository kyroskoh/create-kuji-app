import { useMemo, useState } from "react";
import { tierChipClass } from "../../utils/tierColors.js";

const formatTimestamp = (timestamp) =>
  timestamp ? new Date(timestamp).toLocaleString() : "";

const openEntryInNewTab = (username, entry) => {
  // Open an in-app route so the same CSS, branding, and tier colors apply
  const url = `/${encodeURIComponent(username)}/draw/history/${encodeURIComponent(entry.id)}`;
  window.open(url, "_blank", "noopener,noreferrer");
};

export default function HistoryPanel({ history, tierColors, onClose, username }) {
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
onClick={() => openEntryInNewTab(username, entry)}
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