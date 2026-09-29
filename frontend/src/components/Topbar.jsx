import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Menu, Moon, Search, Sun, CornerDownLeft, X } from 'lucide-react';
import clsx from 'clsx';
import { useTheme } from '../context/ThemeContext';
import { NAV_ITEMS, EXTRA_PAGES } from '../lib/nav';
import { IconButton } from './ui';

export default function Topbar({ onMenu }) {
  const { pathname } = useLocation();
  const { isDark, toggleTheme } = useTheme();
  const page = [...NAV_ITEMS, ...EXTRA_PAGES].find((i) => i.to === pathname) || { label: 'Nexus', subtitle: '' };

  return (
    <header className="shrink-0 bg-bg">
      <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-10 h-[84px] flex items-center gap-4">
        <button
          onClick={onMenu}
          className="lg:hidden w-10 h-10 -ml-1 rounded-lg flex items-center justify-center text-fg-2 hover:bg-surface-2"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        <div className="min-w-0 flex-1">
          <h1 className="text-[23.5px] sm:text-[26px] font-bold text-fg leading-tight tracking-tight truncate">{page.label}</h1>
          {page.subtitle && <p className="text-[14.5px] text-fg-3 truncate hidden sm:block mt-0.5">{page.subtitle}</p>}
        </div>

        {DATA_SEARCH[pathname]
          ? <DataSearch key={pathname} placeholder={DATA_SEARCH[pathname]} />
          : <PageSearch />}

        <IconButton
          label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          onClick={toggleTheme}
          className="w-10 h-10 bg-surface border border-line text-fg-2"
        >
          {isDark ? <Sun size={18} strokeWidth={1.9} /> : <Moon size={18} strokeWidth={1.9} />}
        </IconButton>
      </div>
    </header>
  );
}

/* Pages whose top-bar search filters their own data (via ?q=) instead of jumping pages. */
const DATA_SEARCH = {
  '/attendance': 'Search name or department',
  '/payroll':    'Search name or department',
  '/inventory':  'Search items',
};

/** Focus the given input when "/" is pressed outside another field. */
function useSlashFocus(ref) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
        e.preventDefault();
        ref.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [ref]);
}

/**
 * Filters the current page's table. The page reads the query from ?q=.
 * The box keeps its own value so typing is never slowed or dropped by a
 * heavy page re-render; the URL follows a moment after typing pauses.
 */
function DataSearch({ placeholder }) {
  const [params, setParams] = useSearchParams();
  const urlQ = params.get('q') || '';
  const [q, setLocalQ] = useState(urlQ);
  const pushed = useRef(urlQ);
  const inputRef = useRef(null);
  useSlashFocus(inputRef);

  // Push to the URL after a short pause.
  useEffect(() => {
    if (q === pushed.current) return;
    const t = setTimeout(() => {
      pushed.current = q;
      setParams((prev) => {
        const next = new URLSearchParams(prev);
        if (q) next.set('q', q); else next.delete('q');
        return next;
      }, { replace: true });
    }, 150);
    return () => clearTimeout(t);
  }, [q, setParams]);

  // Follow the URL only when it changed from elsewhere (back button, links).
  useEffect(() => {
    if (urlQ !== pushed.current) {
      pushed.current = urlQ;
      setLocalQ(urlQ);
    }
  }, [urlQ]);

  const setQ = setLocalQ;

  return (
    <div className="relative w-full max-w-[280px] sm:w-[280px]" role="search">
      <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-fg-3 pointer-events-none" />
      <input
        ref={inputRef}
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => e.key === 'Escape' && (q ? setQ('') : inputRef.current?.blur())}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full h-10 bg-surface border border-line rounded-lg pl-10 pr-9 text-[15px] text-fg placeholder:text-fg-3 focus:border-primary focus:ring-3 focus:ring-primary/15 transition-colors"
      />
      {q ? (
        <button
          onClick={() => { setQ(''); inputRef.current?.focus(); }}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-md flex items-center justify-center text-fg-3 hover:text-fg hover:bg-surface-2"
          aria-label="Clear search"
        >
          <X size={15} />
        </button>
      ) : (
        <kbd className="hidden md:block absolute right-3 top-1/2 -translate-y-1/2 text-[12px] font-semibold text-fg-3 border border-line rounded px-1.5 leading-5">/</kbd>
      )}
    </div>
  );
}

/** Jump-to-page search. Press "/" to focus. */
function PageSearch() {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const results = NAV_ITEMS.filter((i) =>
    `${i.label} ${i.subtitle}`.toLowerCase().includes(q.trim().toLowerCase())
  );

  useSlashFocus(inputRef);

  const go = (item) => {
    navigate(item.to);
    setQ('');
    setOpen(false);
    inputRef.current?.blur();
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setCursor((c) => Math.min(c + 1, results.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setCursor((c) => Math.max(c - 1, 0)); }
    if (e.key === 'Enter' && results[cursor]) go(results[cursor]);
    if (e.key === 'Escape') inputRef.current?.blur();
  };

  return (
    <div className="relative hidden md:block w-[280px]">
      <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-fg-3 pointer-events-none" />
      <input
        ref={inputRef}
        value={q}
        onChange={(e) => { setQ(e.target.value); setCursor(0); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        onKeyDown={onKeyDown}
        placeholder="Go to page…"
        className="w-full h-10 bg-surface border border-line rounded-lg pl-10 pr-9 text-[15px] text-fg placeholder:text-fg-3 focus:border-primary focus:ring-3 focus:ring-primary/15 transition-colors"
      />
      <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] font-semibold text-fg-3 border border-line rounded px-1.5 leading-5">/</kbd>

      {open && (
        <div className="absolute right-0 left-0 top-12 z-30 bg-surface border border-line rounded-xl shadow-pop p-1.5 pop-in">
          {results.length === 0 ? (
            <div className="px-3 py-3 text-[14.5px] text-fg-3">No pages match "{q}"</div>
          ) : results.map((item, i) => (
            <button
              key={item.to}
              onMouseDown={(e) => { e.preventDefault(); go(item); }}
              onMouseEnter={() => setCursor(i)}
              className={clsx(
                'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left',
                i === cursor ? 'bg-surface-2' : ''
              )}
            >
              <item.icon size={16} className="text-fg-3 shrink-0" />
              <span className="text-[15px] font-semibold text-fg">{item.label}</span>
              {i === cursor && <CornerDownLeft size={13} className="ml-auto text-fg-3" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
