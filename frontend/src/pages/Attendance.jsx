import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { attendanceService, employeeService } from '../services/api';
import { useFetch } from '../hooks/useFetch';
import ErrorBanner from '../components/ErrorBanner';
import Panel from '../components/Panel';
import clsx from 'clsx';

export default function Attendance() {
  const [month] = useState('2026-03');
  const { data: employees, loading, error, refetch } = useFetch(() => employeeService.getAll({ limit: 50 }), []);

  const empList = employees || [];

  return (
    <div className="space-y-7 max-w-[1600px] mx-auto">
      <ErrorBanner error={error} onRetry={refetch} />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 bg-surface-1 border border-border rounded-lg px-3 py-2">
          <Calendar size={13} className="text-text-secondary" strokeWidth={2} />
          <span className="text-[12px] text-text-muted font-medium">Month:</span>
          <span className="text-[13px] text-white font-mono tabular-nums font-semibold">{month}</span>
        </div>
        <div className="flex-1" />
        <span className="text-[12px] text-text-muted font-mono">
          {loading ? 'Loading…' : `${empList.length} employees`}
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
                <Th align="right">Present</Th>
                <Th align="right">Absent</Th>
                <Th align="right">Late</Th>
                <Th align="right" className="pr-6">OT Hours</Th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/40">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-6 py-4"><div className="skeleton h-5 w-20 ml-auto" /></td>
                    ))}
                  </tr>
                ))
              ) : (
                empList.map((emp) => (
                  <AttendanceRow key={emp._id} employee={emp} month={month} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

function AttendanceRow({ employee, month }) {
  const { data, loading } = useFetch(
    () => attendanceService.getMonthlySummary(employee._id, month),
    [employee._id, month]
  );
  const initials = employee.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || '??';

  if (loading) {
    return (
      <tr className="border-b border-border/40">
        <td className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-accent-blue/20 flex items-center justify-center text-accent-blue text-[11px] font-heading font-semibold">
              {initials}
            </div>
            <span className="text-[13.5px] text-white font-medium">{employee.name}</span>
          </div>
        </td>
        <td className="px-6 py-4 text-[13px] text-text-secondary">{employee.department}</td>
        {Array.from({ length: 4 }).map((_, i) => (
          <td key={i} className="px-6 py-4 text-right"><div className="skeleton h-5 w-10 ml-auto" /></td>
        ))}
      </tr>
    );
  }

  const d = data || {};

  return (
    <tr className="border-b border-border/40 hover:bg-surface-2/50 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-accent-blue/20 flex items-center justify-center text-accent-blue text-[11px] font-heading font-semibold shrink-0">
            {initials}
          </div>
          <span className="text-[13.5px] text-white font-medium truncate">{employee.name}</span>
        </div>
      </td>
      <td className="px-6 py-4 text-[13px] text-text-secondary">{employee.department}</td>
      <td className="px-6 py-4 text-right font-mono text-[13.5px] text-accent-teal tabular-nums font-medium">{d.present_days || 0}</td>
      <td className="px-6 py-4 text-right font-mono text-[13.5px] tabular-nums font-medium"
          style={{ color: (d.absent_days || 0) > 0 ? '#EF4444' : '#64748B' }}>
        {d.absent_days || 0}
      </td>
      <td className="px-6 py-4 text-right font-mono text-[13.5px] tabular-nums font-medium"
          style={{ color: (d.late_days || 0) > 0 ? '#F59E0B' : '#64748B' }}>
        {d.late_days || 0}
      </td>
      <td className="px-6 py-4 pr-6 text-right font-mono text-[13.5px] text-text-secondary tabular-nums">
        {(d.total_overtime_hours || 0).toFixed(1)}
      </td>
    </tr>
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
