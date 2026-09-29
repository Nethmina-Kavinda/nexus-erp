import {
  LayoutGrid, Users, CalendarCheck, Wallet, Package, ShieldAlert, FileText,
} from 'lucide-react';

export const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { to: '/dashboard', icon: LayoutGrid, label: 'Dashboard', subtitle: 'How the workforce is doing this month' },
    ],
  },
  {
    label: 'People',
    items: [
      { to: '/employees',  icon: Users,         label: 'Employees',  subtitle: 'Directory and profiles' },
      { to: '/attendance', icon: CalendarCheck, label: 'Attendance', subtitle: 'Monthly attendance by employee' },
      { to: '/payroll',    icon: Wallet,        label: 'Payroll',    subtitle: 'Salaries, deductions and overtime' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { to: '/inventory', icon: Package, label: 'Inventory', subtitle: 'Stock levels and movements' },
    ],
  },
  {
    label: 'Insights',
    items: [
      { to: '/risk',    icon: ShieldAlert, label: 'Risk Scoring', subtitle: 'Attrition risk with explainable predictions', badge: 'ML' },
      { to: '/reports', icon: FileText,    label: 'Reports',      subtitle: 'Download monthly and daily PDF reports' },
    ],
  },
];

export const NAV_ITEMS = NAV_GROUPS.flatMap((g) => g.items);

// Routed pages that are reached from elsewhere (not the sidebar or page search).
export const EXTRA_PAGES = [
  { to: '/profile', label: 'My Profile', subtitle: 'Your account, security and role tools' },
];
