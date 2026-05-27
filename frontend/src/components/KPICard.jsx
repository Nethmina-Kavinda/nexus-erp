import clsx from 'clsx';
import { useEffect, useState } from 'react';

const COLOR_MAP = {
  blue:   { bg: 'bg-accent-blue',   glow: 'shadow-[0_0_14px_rgba(59,130,246,0.3)]'   },
  teal:   { bg: 'bg-accent-teal',   glow: 'shadow-[0_0_14px_rgba(20,184,166,0.3)]'   },
  purple: { bg: 'bg-accent-purple', glow: 'shadow-[0_0_14px_rgba(139,92,246,0.3)]'   },
  amber:  { bg: 'bg-accent-amber',  glow: 'shadow-[0_0_14px_rgba(245,158,11,0.3)]'   },
  red:    { bg: 'bg-accent-red',    glow: 'shadow-[0_0_14px_rgba(239,68,68,0.3)]'    },
  gold:   { bg: 'bg-accent-amber',  glow: 'shadow-[0_0_14px_rgba(245,158,11,0.3)]'   }, // legacy alias
  sage:   { bg: 'bg-accent-teal',   glow: 'shadow-[0_0_14px_rgba(20,184,166,0.3)]'   },
  crimson:{ bg: 'bg-accent-red',    glow: 'shadow-[0_0_14px_rgba(239,68,68,0.3)]'    },
  azure:  { bg: 'bg-accent-blue',   glow: 'shadow-[0_0_14px_rgba(59,130,246,0.3)]'   },
};

const BORDER_MAP = {
  amber: 'border-l-[3px] border-l-accent-amber',
  red:   'border-l-[3px] border-l-accent-red',
  teal:  'border-l-[3px] border-l-accent-teal',
  sage:  'border-l-[3px] border-l-accent-teal',
  blue:  'border-l-[3px] border-l-accent-blue',
};

export default function KPICard({ icon: Icon, label, value, trend, trendUp, color = 'blue', accentBorder, format = 'number', loading }) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    if (loading || value == null) return;
    const numValue = typeof value === 'number' ? value : parseFloat(value) || 0;
    const duration = 600;
    const steps = 30;
    const increment = numValue / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if ((increment >= 0 && current >= numValue) || (increment < 0 && current <= numValue)) {
        setDisplayed(numValue);
        clearInterval(timer);
      } else {
        setDisplayed(Number.isInteger(numValue) ? Math.round(current) : +current.toFixed(1));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value, loading]);

  const formatValue = (val) => {
    if (val == null) return '—';
    if (format === 'currency') return `LKR ${Math.round(val).toLocaleString()}`;
    if (format === 'percent')  return `${val}%`;
    if (typeof val === 'number' && val >= 1000) return val.toLocaleString();
    return val;
  };

  if (loading) {
    return (
      <div className="bg-surface-1 border border-border rounded-xl p-6 min-h-[136px]">
        <div className="skeleton h-8 w-8 mb-4" />
        <div className="skeleton h-8 w-28 mb-2" />
        <div className="skeleton h-4 w-32" />
      </div>
    );
  }

  const c = COLOR_MAP[color] || COLOR_MAP.blue;

  return (
    <div className={clsx(
      'group bg-surface-1 border border-border rounded-xl p-6 min-h-[136px] transition-all hover:border-border-hover hover:bg-surface-2/40',
      accentBorder && BORDER_MAP[accentBorder]
    )}>
      <div className="flex items-start justify-between mb-4">
        <div className={clsx('w-9 h-9 rounded-lg flex items-center justify-center', c.bg, c.glow)}>
          {Icon && <Icon size={16} strokeWidth={2} className="text-white" />}
        </div>
        {trend != null && (
          <span className={clsx(
            'text-[11px] font-mono tabular-nums font-medium',
            trendUp ? 'text-accent-teal' : 'text-accent-red'
          )}>
            {trendUp ? '↑' : '↓'} {trend}%
          </span>
        )}
      </div>
      <div className="text-[28px] font-heading font-bold text-white leading-none tracking-tight tabular-nums">
        {formatValue(displayed)}
      </div>
      <div className="text-[13px] text-text-secondary mt-1.5 font-medium">{label}</div>
    </div>
  );
}
