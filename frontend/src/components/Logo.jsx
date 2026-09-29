import clsx from 'clsx';

/**
 * Nexus network-"N" mark. Lines and nodes follow the current text colour;
 * the top-right node carries the brand accent.
 * Cropped to the glyph and slightly heavier strokes so it stays crisp at small sizes.
 */
export function LogoMark({ size = 32, accent = 'var(--primary)', className }) {
  return (
    <svg
      viewBox="94 74 324 364"
      width={size}
      height={size}
      className={clsx('shrink-0', className)}
      aria-hidden
    >
      <g stroke="currentColor" strokeWidth="30" strokeLinecap="round">
        <line x1="156" y1="136" x2="156" y2="376" />
        <line x1="156" y1="136" x2="356" y2="376" />
        <line x1="356" y1="376" x2="356" y2="136" />
      </g>
      <circle cx="156" cy="136" r="44" fill="currentColor" />
      <circle cx="156" cy="376" r="44" fill="currentColor" />
      <circle cx="356" cy="376" r="44" fill="currentColor" />
      <circle cx="356" cy="136" r="44" fill={accent} />
    </svg>
  );
}

/** Mark + wordmark. `light` = placed on the dark indigo sidebar/brand panel. */
export default function Logo({ light = true }) {
  return (
    <div className="flex items-center gap-2.5">
      <LogoMark
        size={30}
        className={light ? 'text-white' : 'text-fg'}
        accent={light ? '#8E85F7' : 'var(--primary)'}
      />
      <div className={clsx('font-extrabold text-[18.5px] tracking-tight', light ? 'text-white' : 'text-fg')}>
        Nexus<span className={clsx('font-semibold', light ? 'text-side-fg-muted' : 'text-fg-3')}> ERP</span>
      </div>
    </div>
  );
}
