import clsx from 'clsx';

/**
 * Panel — the card container used for charts, tables and grouped content.
 */
export default function Panel({ title, subtitle, action, children, className, bodyClassName, noPadding = false }) {
  return (
    <section className={clsx('bg-surface border border-line rounded-2xl shadow-card min-w-0', className)}>
      {(title || action) && (
        <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 px-6 pt-5 pb-4">
          <div className="min-w-0">
            {title && <h3 className="text-[16.5px] font-bold text-fg leading-tight">{title}</h3>}
            {subtitle && <p className="text-[14.5px] text-fg-3 mt-1">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0 flex items-center gap-2">{action}</div>}
        </header>
      )}
      <div className={clsx(noPadding ? '' : (title || action) ? 'px-6 pb-6' : 'p-6', bodyClassName)}>
        {children}
      </div>
    </section>
  );
}

export function SectionHeader({ title, subtitle, action, className }) {
  return (
    <header className={clsx('flex flex-wrap items-end justify-between gap-4', className)}>
      <div className="min-w-0">
        {title && <h2 className="text-lg font-bold text-fg leading-tight">{title}</h2>}
        {subtitle && <p className="text-[14.5px] text-fg-2 mt-1 max-w-2xl">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}
