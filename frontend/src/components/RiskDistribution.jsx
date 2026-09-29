import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import clsx from 'clsx';
import { RISK_COLORS, RISK_TIERS } from '../lib/format';

/**
 * Compact risk distribution: donut beside a linked tier list, plus a
 * one-line workforce-risk gauge. Hover links donut ⇄ list; click opens
 * Risk Scoring filtered to the tier.
 */
export default function RiskDistribution({ distribution = {}, wrl = 0, threshold = 30 }) {
  const [active, setActive] = useState(null);
  const navigate = useNavigate();

  const total = RISK_TIERS.reduce((s, t) => s + (distribution[t] || 0), 0);
  const segments = RISK_TIERS
    .map((name) => ({ name, value: distribution[name] || 0 }))
    .filter((s) => s.value > 0);
  const pct = (n) => (total ? Math.round((n / total) * 100) : 0);
  const open = (tier) => navigate(`/risk?tier=${tier}`);
  const over = wrl >= threshold;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-5 flex-1" onMouseLeave={() => setActive(null)}>
        {/* Donut */}
        <div className="relative w-[168px] h-[168px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={[{ value: 1 }]} dataKey="value" innerRadius={64} outerRadius={80}
                fill="var(--surface-2)" stroke="none" isAnimationActive={false}
              />
              <Pie
                data={segments} dataKey="value" nameKey="name"
                innerRadius={64} outerRadius={80}
                paddingAngle={segments.length > 1 ? 3 : 0} cornerRadius={5}
                startAngle={90} endAngle={-270} stroke="none"
                onMouseEnter={(_, i) => setActive(segments[i]?.name)}
                onClick={(_, i) => segments[i] && open(segments[i].name)}
                style={{ cursor: 'pointer', outline: 'none' }}
              >
                {segments.map((s) => (
                  <Cell
                    key={s.name}
                    fill={RISK_COLORS[s.name]}
                    opacity={!active || active === s.name ? 1 : 0.25}
                    style={{ transition: 'opacity 150ms ease', outline: 'none' }}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" aria-live="polite">
            <span className="text-[26px] font-extrabold text-fg leading-none tnum">
              {active ? `${pct(distribution[active] || 0)}%` : total}
            </span>
            <span className="text-[13px] text-fg-3 mt-1">{active || 'employees'}</span>
          </div>
        </div>

        {/* Tier list */}
        <ul className="flex-1 min-w-0 -my-1">
          {RISK_TIERS.map((tier) => {
            const count = distribution[tier] || 0;
            return (
              <li key={tier}>
                <button
                  type="button"
                  onMouseEnter={() => setActive(tier)}
                  onFocus={() => setActive(tier)}
                  onBlur={() => setActive(null)}
                  onClick={() => open(tier)}
                  aria-label={`${tier}: ${count} employees, ${pct(count)} percent. Open in Risk Scoring`}
                  className={clsx(
                    'w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left transition-all',
                    active === tier ? 'bg-surface-2' : 'hover:bg-surface-2',
                    active && active !== tier && 'opacity-45'
                  )}
                >
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: RISK_COLORS[tier], opacity: count ? 1 : 0.35 }} />
                  <span className={clsx('text-[15px] font-medium flex-1', count ? 'text-fg-2' : 'text-fg-3')}>{tier}</span>
                  <span className={clsx('text-[15px] font-bold tnum', count ? 'text-fg' : 'text-fg-3')}>{count}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Workforce risk level — one line */}
      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-line" title={`Alert when ${threshold}% or more are High or Critical`}>
        <span className="text-[14px] text-fg-2 font-medium whitespace-nowrap">Risk level</span>
        <div className="relative flex-1 h-2 rounded-full bg-surface-2">
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(wrl, 100)}%`, backgroundColor: over ? 'var(--danger)' : 'var(--primary)' }}
          />
          <div className="absolute -top-1 -bottom-1 w-0.5 rounded-full bg-fg-2" style={{ left: `${threshold}%` }} />
        </div>
        <span className="text-[14px] tnum whitespace-nowrap">
          <span className={clsx('font-bold', over ? 'text-danger-fg' : 'text-good-fg')}>{wrl}%</span>
          <span className="text-fg-3"> / {threshold}% alert</span>
        </span>
      </div>
    </div>
  );
}
