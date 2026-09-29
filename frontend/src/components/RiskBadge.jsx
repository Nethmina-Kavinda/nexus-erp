import clsx from 'clsx';

const VARIANTS = {
  Low:      'bg-good-soft text-good-fg',
  Medium:   'bg-warn-soft text-warn-fg',
  High:     'bg-serious-soft text-serious-fg',
  Critical: 'bg-danger-soft text-danger-fg',
};

const DOTS = {
  Low: 'bg-good', Medium: 'bg-warn', High: 'bg-serious', Critical: 'bg-danger',
};

export default function RiskBadge({ level, className, size = 'md' }) {
  return (
    <span className={clsx(
      'inline-flex items-center gap-1.5 rounded-full font-semibold whitespace-nowrap',
      size === 'sm' ? 'px-2 py-0.5 text-[13px]' : 'px-2.5 py-1 text-[13.5px]',
      VARIANTS[level] || VARIANTS.Low,
      className
    )}>
      <span className={clsx('w-1.5 h-1.5 rounded-full', DOTS[level] || DOTS.Low)} />
      {level}
    </span>
  );
}
