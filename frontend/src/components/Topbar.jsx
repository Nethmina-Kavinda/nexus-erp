import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bell, Search } from 'lucide-react';

const PAGES = {
  '/dashboard':  { title: 'Dashboard',     subtitle: 'Workforce overview'          },
  '/employees':  { title: 'Employees',     subtitle: 'Directory and profiles'      },
  '/attendance': { title: 'Attendance',    subtitle: 'Monthly attendance summary'  },
  '/payroll':    { title: 'Payroll',       subtitle: 'Compensation records'        },
  '/inventory':  { title: 'Inventory',     subtitle: 'Stock management'            },
  '/risk':       { title: 'Risk Scoring',  subtitle: 'ML-powered attrition risk'   },
};

export default function Topbar() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const p = PAGES[pathname] || { title: 'NEXUS', subtitle: '' };
  const initials = user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || '?';

  return (
    <header className="h-16 bg-bg/70 backdrop-blur-md border-b border-border flex items-center px-8 lg:px-12 gap-4 shrink-0">
      <div className="pl-12 lg:pl-0 min-w-0 flex-1">
        <h1 className="text-xl font-heading font-bold text-white leading-tight truncate">{p.title}</h1>
        <p className="text-[12px] text-text-muted truncate hidden md:block">{p.subtitle}</p>
      </div>

      {/* Right cluster */}
      <div className="flex items-center gap-2">
        <button
          className="relative p-2 text-text-secondary hover:text-white hover:bg-white/[0.04] rounded-lg transition-all"
          title="Notifications"
        >
          <Bell size={17} strokeWidth={1.75} />
        </button>

        <div className="w-px h-6 bg-border mx-1" />

        <div
          className="w-9 h-9 rounded-full bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center text-white text-xs font-heading font-semibold cursor-pointer shadow-[0_0_14px_rgba(59,130,246,0.25)]"
          title={user?.name}
        >
          {initials}
        </div>
      </div>
    </header>
  );
}
