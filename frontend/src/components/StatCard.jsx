import clsx from 'clsx';
import { TrendingDown, TrendingUp } from 'lucide-react';

/**
 * StatCard — headline number with optional change chip and sparkline.
 * `delta` is a signed number; `deltaGood` is 'up', 'down' or 'neutral' (direction carries no judgement).
 */
export default function StatCard({
  icon: Icon, label, value, suffix, delta, deltaUnit = '%', deltaGood = 'up', note,
  spark, loading, highlight = false,
}) {
  if (loading) {
    return (
      <div className="bg-surface border border-line rounded-2xl p-5 shadow-card min-h-[148px]">
        <div className="skeleton h-4 w-28 mb-5" />
        <div className="skeleton h-8 w-32 mb-3" />
        <div className="skeleton h-4 w-24" />
      </div>
    );
  }

  const hasDelta = delta != null && Number.isFinite(delta);
  const up = hasDelta && delta >= 0;
  const good = hasDelta && (deltaGood === 'up' ? up : !up);

  return (
    <div className={clsx(
      '@container rounded-2xl p-5 min-h-[148px] flex flex-col border shadow-card',
      highlight ? 'bg-primary border-transparent text-on-primary' : 'bg-surface border-line'
    )}>
      <div className="flex items-center gap-2.5">
        {Icon && (
          <div className={clsx(
            'w-8 h-8 rounded-lg flex items-center justify-center',
            highlight ? 'bg-white/15 text-white' : 'bg-primary-soft text-primary-fg'
          )}>
            <Icon size={16} strokeWidth={2} />
          </div>
        )}
        <span className={clsx('text-[15px] font-semibold', highlight ? 'text-white/85' : 'text-fg-2')}>{label}</span>
      </div>

      <div className="flex items-end justify-between gap-3 mt-auto pt-4">
        <div className="min-w-0">
          <div className={clsx('text-[30px] font-extrabold leading-none tracking-tight whitespace-nowrap', highlight ? 'text-white' : 'text-fg')}>
            {value ?? '—'}
            {suffix && <span className={clsx('text-[18.5px] font-bold ml-0.5', highlight ? 'text-white/70' : 'text-fg-3')}>{suffix}</span>}
          </div>
          <div className="flex items-center gap-2 mt-2.5 min-h-[22px]">
            {hasDelta && (
              <span className={clsx(
                'inline-flex items-center gap-1 text-[13.5px] font-bold rounded-md px-1.5 py-0.5 tnum whitespace-nowrap shrink-0',
                highlight ? 'bg-white/15 text-white'
                  : deltaGood === 'neutral' ? 'bg-surface-2 text-fg-2'
                  : good ? 'bg-good-soft text-good-fg' : 'bg-danger-soft text-danger-fg'
              )}>
                {up ? <TrendingUp size={12} strokeWidth={2.5} /> : <TrendingDown size={12} strokeWidth={2.5} />}
                {up ? '+' : ''}{delta.toFixed(1)}{deltaUnit}
              </span>
            )}
            {note && <span className={clsx('text-[13.5px] truncate', highlight ? 'text-white/70' : 'text-fg-3')}>{note}</span>}
          </div>
        </div>
        {/* sparkline only when the card is wide enough to hold it beside the number */}
        {spark?.length > 1 && <div className="hidden @[270px]:block"><Sparkline data={spark} light={highlight} /></div>}
      </div>
    </div>
  );
}

function Sparkline({ data, light }) {
  const w = 84, h = 36, pad = 3;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => [
    pad + (i / (data.length - 1)) * (w - pad * 2),
    pad + (1 - (v - min) / range) * (h - pad * 2),
  ]);
  const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const [lx, ly] = pts[pts.length - 1];
  const stroke = light ? '#fff' : 'var(--primary)';
  return (
    <svg width={w} height={h} className="shrink-0 overflow-visible" aria-hidden>
      <path d={d} fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity={light ? 0.9 : 1} />
      <circle cx={lx} cy={ly} r="3.5" fill={stroke} stroke={light ? 'var(--primary)' : 'var(--surface)'} strokeWidth="2" />
    </svg>
  );
}
