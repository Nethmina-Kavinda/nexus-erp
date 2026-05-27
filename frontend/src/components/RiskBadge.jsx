import clsx from 'clsx';

const VARIANTS = {
  Low:      { bg: 'bg-accent-teal/15',  text: 'text-accent-teal',  border: 'border-accent-teal/30',  dot: 'bg-accent-teal'  },
  Medium:   { bg: 'bg-accent-amber/15', text: 'text-accent-amber', border: 'border-accent-amber/30', dot: 'bg-accent-amber' },
  High:     { bg: 'bg-accent-blue/15',  text: 'text-accent-blue',  border: 'border-accent-blue/30',  dot: 'bg-accent-blue'  },
  Critical: { bg: 'bg-accent-red/15',   text: 'text-accent-red',   border: 'border-accent-red/30',   dot: 'bg-accent-red'   },
};

export default function RiskBadge({ level, className, size = 'md' }) {
  const v = VARIANTS[level] || VARIANTS.Low;

  return (
    <span className={clsx(
      'inline-flex items-center gap-1.5 rounded-full font-heading font-semibold border',
      size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-[11px]',
      v.bg, v.text, v.border,
      level === 'Critical' && 'pulse-critical',
      className
    )}>
      <span className={clsx('w-1.5 h-1.5 rounded-full', v.dot)} />
      {level}
    </span>
  );
}
