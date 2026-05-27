import { useState } from 'react';
import { Search } from 'lucide-react';
import { employeeService } from '../services/api';
import { useFetch } from '../hooks/useFetch';
import ErrorBanner from '../components/ErrorBanner';
import Panel from '../components/Panel';
import clsx from 'clsx';

const DEPARTMENTS = ['All', 'Engineering', 'Marketing', 'Finance', 'Operations', 'HR'];

export default function Employees() {
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');

  const { data, loading, error, refetch } = useFetch(
    () => employeeService.getAll({
      search: search || undefined,
      department: department === 'All' ? undefined : department,
      limit: 50,
    }),
    [search, department]
  );

  const employees = data || [];

  return (
    <div className="space-y-7 max-w-[1600px] mx-auto">
      <ErrorBanner error={error} onRetry={refetch} />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" strokeWidth={2} />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-1 border border-border rounded-lg pl-10 pr-4 py-2.5 text-[13.5px] text-white placeholder-text-muted focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 transition-all"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {DEPARTMENTS.map((dept) => (
            <button
              key={dept}
              onClick={() => setDepartment(dept)}
              className={clsx(
                'text-[12px] font-heading font-medium px-3 py-2 rounded-lg transition-colors',
                department === dept
                  ? 'bg-accent-blue text-white'
                  : 'bg-surface-1 text-text-secondary border border-border hover:text-white hover:bg-surface-2'
              )}
            >
              {dept}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <span className="text-[12px] text-text-muted font-mono">
          {loading ? 'Loading…' : `${employees.length} employees`}
        </span>
      </div>

      {/* Table */}
      <Panel noPadding>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-surface-2/30">
                <Th className="pl-6">Employee</Th>
                <Th>Department</Th>
                <Th>Role</Th>
                <Th>Position</Th>
                <Th>Hire Date</Th>
                <Th align="right" className="pr-6">Status</Th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/40">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-6 py-4"><div className="skeleton h-5 w-32" /></td>
                    ))}
                  </tr>
                ))
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-[13px] text-text-muted">
                    No employees match the current filter
                  </td>
                </tr>
              ) : (
                employees.map((emp) => {
                  const initials = emp.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || '??';
                  return (
                    <tr key={emp._id} className="border-b border-border/40 hover:bg-surface-2/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-accent-blue/20 flex items-center justify-center text-accent-blue text-[11px] font-heading font-semibold shrink-0">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <div className="text-[13.5px] text-white font-medium truncate">{emp.name}</div>
                            <div className="text-[11.5px] text-text-muted font-mono mt-0.5 truncate">{emp.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[13px] text-text-secondary">{emp.department}</td>
                      <td className="px-6 py-4">
                        <span className="text-[11.5px] bg-surface-3 text-text-secondary px-2 py-1 rounded capitalize font-medium">
                          {emp.role?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[13px] text-text-secondary">{emp.position}</td>
                      <td className="px-6 py-4 text-[12.5px] text-text-secondary font-mono tabular-nums">
                        {new Date(emp.hire_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 pr-6 text-right">
                        <span className={clsx(
                          'inline-flex items-center gap-1.5 text-[11.5px] font-heading font-semibold',
                          emp.is_active ? 'text-accent-teal' : 'text-text-muted'
                        )}>
                          <span className={clsx('w-1.5 h-1.5 rounded-full', emp.is_active ? 'bg-accent-teal' : 'bg-text-muted')} />
                          {emp.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

function Th({ children, align = 'left', className }) {
  return (
    <th className={clsx(
      'text-[11px] font-heading font-semibold text-text-secondary uppercase tracking-[0.1em] px-6 py-3',
      align === 'right' && 'text-right',
      className
    )}>
      {children}
    </th>
  );
}
