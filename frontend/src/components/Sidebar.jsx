import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, Calendar, CreditCard, Package, Shield, LogOut, Menu, X
} from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';

const NAV_ITEMS = [
  { to: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/employees',  icon: Users,           label: 'Employees' },
  { to: '/attendance', icon: Calendar,        label: 'Attendance' },
  { to: '/payroll',    icon: CreditCard,      label: 'Payroll' },
  { to: '/inventory',  icon: Package,         label: 'Inventory' },
  { to: '/risk',       icon: Shield,          label: 'Risk Scoring', badge: 'ML' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || '?';

  const content = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="h-16 px-6 flex items-center gap-3 border-b border-border shrink-0">
        <div className="w-9 h-9 rounded-lg bg-accent-blue flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.35)] shrink-0">
          <span className="text-white font-heading font-bold text-sm">N</span>
        </div>
        <div className="min-w-0">
          <div className="text-white font-heading font-bold text-[15px] leading-tight truncate">NEXUS ERP</div>
          <div className="text-text-muted font-mono text-[10px] uppercase tracking-[0.15em] mt-0.5">Enterprise Portal</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-5 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) => clsx(
              'group relative flex items-center gap-3 h-10 px-3 rounded-lg text-sm font-heading font-medium transition-all duration-150',
              isActive
                ? 'bg-surface-3 text-white'
                : 'text-text-secondary hover:bg-white/[0.04] hover:text-white'
            )}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-[2px] bg-accent-blue rounded-r" />
                )}
                <item.icon size={17} strokeWidth={1.75} className="shrink-0" />
                <span className="truncate">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto bg-accent-purple/20 text-accent-purple font-heading font-semibold text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded border border-accent-purple/30">
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-border shrink-0">
        <div className="flex items-center gap-3 px-2 py-1.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center text-white text-xs font-heading font-semibold shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-[13px] font-medium truncate leading-tight">{user?.name}</div>
            <div className="text-text-muted text-[11px] capitalize truncate mt-0.5">{user?.role?.replace('_', ' ')}</div>
          </div>
          <button
            onClick={logout}
            className="text-text-muted hover:text-accent-red transition-colors shrink-0 p-1.5 rounded hover:bg-white/[0.04]"
            title="Sign out"
          >
            <LogOut size={15} strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 text-text-secondary hover:text-white bg-surface-1 p-2 rounded-lg border border-border"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setMobileOpen(false)} />
      )}

      {/* Desktop */}
      <aside className="hidden lg:flex flex-col h-screen w-[240px] shrink-0 bg-surface-1 border-r border-border">
        {content}
      </aside>

      {/* Mobile */}
      <aside className={clsx(
        'lg:hidden fixed left-0 top-0 h-screen w-[260px] bg-surface-1 border-r border-border z-50 transition-transform duration-300',
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {content}
      </aside>
    </>
  );
}
