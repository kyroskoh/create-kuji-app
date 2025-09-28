import { tierBadgeClass } from "../../utils/tierColors.js";

export default function ResultCard({ drawIndex, prize, tierColors }) {
  const tierLabel = (prize.tier || "?").toString().toUpperCase();
  return (
    <article className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 shadow-md">
      <header className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-400">
        <span>Draw #{drawIndex}</span>
        <span className={tierBadgeClass(tierLabel, tierColors)}>Tier {tierLabel}</span>
      </header>
      <h4 className="mt-3 text-lg font-semibold text-white">{prize.prize_name || "Unknown prize"}</h4>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-400">
        <div>
          <dt>SKU</dt>
          <dd className="font-mono text-sm text-slate-200">{prize.sku || "n/a"}</dd>
        </div>
        <div>
          <dt>Weight</dt>
          <dd>{Number(prize.weight) || 0}</dd>
        </div>
        <div>
          <dt>Remaining Qty</dt>
          <dd>{Number(prize.quantity) || 0}</dd>
        </div>
        <div className="col-span-2">
          <dt>Notes</dt>
          <dd className="text-slate-300">{prize.notes || "No additional notes"}</dd>
        </div>
      </dl>
    </article>
  );
}