import { RISK_COLORS } from '../lib/format';

/**
 * Risk score 0–100. The fill is a soft tint of the tier colour so a column
 * of bars stays calm on the eye; a small solid dot marks the exact score.
 */
export default function ScoreBar({ score, tier }) {
  const color = RISK_COLORS[tier] || 'var(--primary)';
  const pct = `${Math.max(0, Math.min(score, 100))}%`;
  return (
    <div className="flex items-center gap-3.5">
      <div className="relative flex-1 max-w-[200px] min-w-[72px] h-2 rounded-full bg-surface-2" aria-hidden>
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ width: pct, background: `color-mix(in oklab, ${color} 38%, var(--surface-2))` }}
        />
        <span
          className="absolute top-1/2 w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full ring-[2.5px] ring-surface"
          style={{ left: pct, backgroundColor: color }}
        />
      </div>
      <span className="text-[15px] font-bold text-fg tnum w-7 text-right">{Math.round(score)}</span>
    </div>
  );
}
