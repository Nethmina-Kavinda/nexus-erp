import clsx from 'clsx';

/**
 * Panel — consistent card container for charts and grouped content.
 * Matches KPICard spacing so everything aligns on the same rhythm.
 */
export default function Panel({ title, subtitle, action, children, className, bodyClassName, noPadding = false }) {
  return (
    <section className={clsx('bg-surface-1 border border-border rounded-xl overflow-hidden', className)}>
      {(title || action) && (
        <header className="flex items-center justify-between gap-4 px-6 py-5 border-b border-border">
          <div className="min-w-0">
            {title && <h3 className="text-[15px] font-heading font-semibold text-white leading-tight truncate">{title}</h3>}
            {subtitle && <p className="text-[12px] text-text-muted mt-0.5 truncate">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>
      )}
      <div className={clsx(noPadding ? '' : 'p-6', bodyClassName)}>
        {children}
      </div>
    </section>
  );
}

export function SectionHeader({ title, subtitle, action, className }) {
  return (
    <header className={clsx('flex items-end justify-between gap-4', className)}>
      <div className="min-w-0">
        {title && <h2 className="text-xl font-heading font-bold text-white leading-tight">{title}</h2>}
        {subtitle && <p className="text-[13px] text-text-secondary mt-1 max-w-2xl">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}
