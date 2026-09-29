import { useEffect } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, X } from 'lucide-react';
import clsx from 'clsx';
import { initials } from '../lib/format';

/* ─── Avatar ─── */

const AVATAR_SIZES = {
  sm: 'w-8 h-8 text-[13px]',
  md: 'w-9 h-9 text-[13.5px]',
  lg: 'w-12 h-12 text-[16.5px]',
};

export function Avatar({ name, size = 'md', className }) {
  return (
    <div
      className={clsx(
        'rounded-full bg-primary-soft text-primary-fg font-semibold flex items-center justify-center shrink-0',
        AVATAR_SIZES[size],
        className
      )}
      aria-hidden
    >
      {initials(name)}
    </div>
  );
}

/* ─── Button ─── */

const BUTTON_VARIANTS = {
  primary:   'bg-primary text-on-primary hover:bg-primary-hover',
  secondary: 'bg-surface border border-line text-fg hover:bg-surface-2 hover:border-line-strong',
  ghost:     'text-fg-2 hover:text-fg hover:bg-surface-2',
  danger:    'bg-danger text-white hover:brightness-110',
};

const BUTTON_SIZES = {
  sm: 'h-8 px-3 text-[14.5px] gap-1.5',
  md: 'h-10 px-4 text-[15px] gap-2',
};

export function Button({ variant = 'primary', size = 'md', icon: Icon, className, children, ...props }) {
  return (
    <button
      {...props}
      className={clsx(
        'inline-flex items-center justify-center rounded-lg font-semibold whitespace-nowrap transition-colors disabled:opacity-55',
        BUTTON_VARIANTS[variant],
        BUTTON_SIZES[size],
        className
      )}
    >
      {Icon && <Icon size={size === 'sm' ? 14 : 16} strokeWidth={2} />}
      {children}
    </button>
  );
}

export function IconButton({ label, className, children, ...props }) {
  return (
    <button
      {...props}
      title={label}
      aria-label={label}
      className={clsx(
        'w-9 h-9 rounded-lg inline-flex items-center justify-center text-fg-3 hover:text-fg hover:bg-surface-2 transition-colors',
        className
      )}
    >
      {children}
    </button>
  );
}

/* ─── Month picker: ‹ [March 2026 ▾] › ─── */

export function MonthPicker({ value, months, onChange, format = (m) => m }) {
  const i = months.indexOf(value);
  const step = (d) => { const next = months[i + d]; if (next) onChange(next); };
  const arrow = 'w-9 h-9 rounded-md inline-flex items-center justify-center text-fg-2 hover:text-fg hover:bg-surface-2 transition-colors disabled:opacity-35 disabled:hover:bg-transparent';
  return (
    <div className="inline-flex items-center gap-0.5 rounded-lg border border-line bg-surface p-0.5" role="group" aria-label="Choose month">
      <button type="button" className={arrow} onClick={() => step(-1)} disabled={i <= 0} aria-label="Previous month" title="Previous month">
        <ChevronLeft size={18} strokeWidth={2.2} />
      </button>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label="Month"
          className="appearance-none h-9 pl-3 pr-8 rounded-md bg-transparent text-[15px] font-semibold text-fg cursor-pointer hover:bg-surface-2 focus:bg-surface-2 transition-colors"
        >
          {months.map((m) => <option key={m} value={m}>{format(m)}</option>)}
        </select>
        <ChevronDown size={15} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-fg-3 pointer-events-none" />
      </div>
      <button type="button" className={arrow} onClick={() => step(1)} disabled={i < 0 || i >= months.length - 1} aria-label="Next month" title="Next month">
        <ChevronRight size={18} strokeWidth={2.2} />
      </button>
    </div>
  );
}

/* ─── Segmented control (tabs / filter pills) ─── */

export function Segmented({ value, options, onChange, size = 'md', className }) {
  return (
    <div className={clsx('inline-flex items-center gap-0.5 p-1 bg-surface-2 rounded-lg max-w-full overflow-x-auto', className)}>
      {options.map((opt) => {
        const o = typeof opt === 'string' ? { value: opt, label: opt } : opt;
        const active = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={clsx(
              'whitespace-nowrap rounded-md font-semibold transition-all',
              size === 'sm' ? 'px-2.5 py-1 text-[13.5px]' : 'px-3 py-1.5 text-[14.5px]',
              active
                ? 'bg-surface text-fg shadow-card dark:bg-surface-3'
                : 'text-fg-3 hover:text-fg'
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/* ─── Forms ─── */

export const inputClass =
  'w-full h-10 bg-surface border border-line rounded-lg px-3.5 text-[15px] text-fg placeholder:text-fg-3 ' +
  'focus:border-primary focus:ring-3 focus:ring-primary/15 transition-colors';

export function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="block text-[14.5px] font-semibold text-fg mb-1.5">{label}</span>
      {children}
      {hint && <span className="block text-[13.5px] text-fg-3 mt-1.5">{hint}</span>}
    </label>
  );
}

export function Select({ className, children, ...props }) {
  return (
    <div className="relative">
      <select {...props} className={clsx(inputClass, 'appearance-none pr-9 cursor-pointer', className)}>
        {children}
      </select>
      <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-3 pointer-events-none" />
    </div>
  );
}

/* ─── Pill (status label) ─── */

const PILL_TONES = {
  good:    'bg-good-soft text-good-fg',
  warn:    'bg-warn-soft text-warn-fg',
  serious: 'bg-serious-soft text-serious-fg',
  danger:  'bg-danger-soft text-danger-fg',
  primary: 'bg-primary-soft text-primary-fg',
  neutral: 'bg-surface-2 text-fg-2',
};

export function Pill({ tone = 'neutral', dot, icon: Icon, className, children }) {
  return (
    <span className={clsx(
      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[13.5px] font-semibold whitespace-nowrap',
      PILL_TONES[tone],
      className
    )}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {Icon && <Icon size={12} strokeWidth={2.25} />}
      {children}
    </span>
  );
}

/* ─── Table helpers ─── */

export function Th({ children, align = 'left', className }) {
  return (
    <th className={clsx(
      'text-[13.5px] font-semibold text-fg-3 px-5 py-3 whitespace-nowrap bg-surface-2/60',
      align === 'right' ? 'text-right' : 'text-left',
      className
    )}>
      {children}
    </th>
  );
}

export function SkeletonRows({ rows = 6, cols = 5 }) {
  return Array.from({ length: rows }).map((_, i) => (
    <tr key={i} className="border-t border-line">
      {Array.from({ length: cols }).map((_, j) => (
        <td key={j} className="px-5 py-4">
          <div className={clsx('skeleton h-4', j === 0 ? 'w-40' : 'w-16')} />
        </td>
      ))}
    </tr>
  ));
}

export function EmptyState({ icon: Icon, title, text, className }) {
  return (
    <div className={clsx('flex flex-col items-center justify-center text-center py-14 px-6', className)}>
      {Icon && (
        <div className="w-11 h-11 rounded-full bg-surface-2 flex items-center justify-center mb-3">
          <Icon size={19} className="text-fg-3" strokeWidth={1.75} />
        </div>
      )}
      <div className="text-[15.5px] font-semibold text-fg">{title}</div>
      {text && <div className="text-[14.5px] text-fg-3 mt-1 max-w-xs">{text}</div>}
    </div>
  );
}

/* ─── Modal ─── */

const MODAL_WIDTHS = { md: 'max-w-md', lg: 'max-w-2xl', xl: 'max-w-3xl' };

/**
 * Dialog with a fixed header, scrolling body and optional pinned `footer`.
 * The backdrop is dimmed and blurred so the page behind never competes with it.
 */
export function Modal({ onClose, title, subtitle, icon, headerExtra, footer, size = 'md', dismissable = true, children }) {
  useEffect(() => {
    if (!dismissable) return;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, dismissable]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 fade-in backdrop-blur-[6px]"
      style={{ background: 'var(--overlay)' }}
      onClick={dismissable ? onClose : undefined}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={clsx(
          'relative w-full max-h-[92vh] flex flex-col bg-surface border border-line-strong rounded-2xl shadow-pop pop-in overflow-hidden',
          MODAL_WIDTHS[size] || MODAL_WIDTHS.md
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || icon) && (
          <div className={clsx('shrink-0 flex items-start gap-3.5 px-6 pt-6', footer ? 'pb-5 border-b border-line' : 'pb-5')}>
            {icon}
            <div className="flex-1 min-w-0">
              {title && <h3 className="text-[18.5px] font-bold text-fg leading-snug truncate">{title}</h3>}
              {subtitle && <p className="text-[14.5px] text-fg-3 mt-0.5">{subtitle}</p>}
            </div>
            {headerExtra && <div className="shrink-0 self-center">{headerExtra}</div>}
            {dismissable && (
              <IconButton label="Close" onClick={onClose} className="-mr-2 -mt-1">
                <X size={17} strokeWidth={2} />
              </IconButton>
            )}
          </div>
        )}
        <div className="flex-1 min-h-0 overflow-y-auto">{children}</div>
        {footer && (
          <div className="shrink-0 px-6 py-4 border-t border-line bg-surface-2/50">{footer}</div>
        )}
      </div>
    </div>
  );
}

/* ─── Chart tooltip (Recharts) ─── */

export function ChartTooltip({ active, payload, label, labelFormatter, valueFormatter }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface border border-line rounded-xl px-3.5 py-2.5 shadow-pop min-w-[150px]">
      {label != null && (
        <div className="text-[13.5px] text-fg-3 font-medium mb-1.5">
          {labelFormatter ? labelFormatter(label) : label}
        </div>
      )}
      <div className="space-y-1">
        {payload.map((p, i) => (
          <div key={i} className="flex items-center gap-2 text-[14.5px]">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.payload?.fill || p.color }} />
            <span className="text-fg-2">{p.name}</span>
            <span className="ml-auto pl-4 font-bold text-fg tnum">
              {valueFormatter ? valueFormatter(p.value) : Number(p.value).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export const axisTick = { fill: 'var(--fg-3)', fontSize: 13.5, fontFamily: 'inherit' };
