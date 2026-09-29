import { NavLink } from 'react-router-dom';
import { LogOut, X } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../context/AuthContext';
import { NAV_GROUPS } from '../lib/nav';
import { formatRole, initials } from '../lib/format';
import Logo from './Logo';

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();

  const content = (
    <div className="flex flex-col h-full">
      <div className="h-[72px] px-6 flex items-center justify-between shrink-0">
        <Logo />
        <button onClick={onClose} className="lg:hidden text-side-fg-muted hover:text-white p-1" aria-label="Close menu">
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 px-4 pt-2 pb-4 overflow-y-auto space-y-6">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <div className="px-3 mb-2 text-[13px] font-semibold text-side-fg-muted">{group.label}</div>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) => clsx(
                    'flex items-center gap-3 h-10 px-3 rounded-lg text-[15px] font-semibold transition-colors',
                    isActive
                      ? 'bg-side-active text-white'
                      : 'text-side-fg hover:bg-side-hover hover:text-white'
                  )}
                >
                  {({ isActive }) => (
                    <>
                      <item.icon size={18} strokeWidth={isActive ? 2.1 : 1.8} className="shrink-0" />
                      <span className="truncate">{item.label}</span>
                      {item.badge && (
                        <span className="ml-auto text-[12px] font-bold px-1.5 py-0.5 rounded-md bg-primary text-white">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 shrink-0">
        <div className="flex items-center gap-1 p-1.5 rounded-xl bg-side-hover border border-side-line">
          <NavLink
            to="/profile"
            onClick={onClose}
            title="View your profile"
            className={({ isActive }) => clsx(
              'flex-1 min-w-0 flex items-center gap-3 p-1.5 rounded-lg transition-colors',
              isActive ? 'bg-side-active' : 'hover:bg-side-active'
            )}
          >
            <div className="w-9 h-9 rounded-full bg-primary text-white text-[13.5px] font-bold flex items-center justify-center shrink-0">
              {initials(user?.name)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-[14.5px] font-semibold truncate leading-tight">{user?.name}</div>
              <div className="text-side-fg-muted text-[13.5px] truncate mt-0.5">{formatRole(user?.role)}</div>
            </div>
          </NavLink>
          <button
            onClick={logout}
            className="text-side-fg-muted hover:text-white transition-colors shrink-0 p-1.5 rounded-md hover:bg-side-hover"
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut size={16} strokeWidth={1.9} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex flex-col h-screen w-[256px] shrink-0 bg-side-bg">
        {content}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40 fade-in" style={{ background: 'var(--overlay)' }} onClick={onClose} />
      )}
      <aside className={clsx(
        'lg:hidden fixed left-0 top-0 h-screen w-[272px] bg-side-bg z-50 transition-transform duration-300',
        open ? 'translate-x-0' : '-translate-x-full'
      )}>
        {content}
      </aside>
    </>
  );
}
