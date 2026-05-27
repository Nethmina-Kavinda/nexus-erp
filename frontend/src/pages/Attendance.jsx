import { useState } from 'react';
import { Calendar, ChevronDown, ChevronRight, Clock, UserCheck, UserX, AlertCircle } from 'lucide-react';
import { attendanceService, employeeService } from '../services/api';
import { useFetch } from '../hooks/useFetch';
import ErrorBanner from '../components/ErrorBanner';
import Panel from '../components/Panel';
import clsx from 'clsx';

export default function Attendance() {
  const [month] = useState('2026-03');
  const [expandedId, setExpandedId] = useState(null);
  const { data: employees, loading, error, refetch } = useFetch(() => employeeService.getAll({ limit: 100 }), []);

  const empList = employees || [];

  const toggle = (id) => setExpandedId((prev) => (prev === id ? null : id));

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
          {loading ? 'Loading…' : `${empList.length} employees — click a row to expand`}
        </span>
      </div>

      {/* Table */}
      <Panel noPadding>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-surface-2/30">
                <Th className="pl-6 w-8"></Th>
                <Th>Employee</Th>
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
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-6 py-4"><div className="skeleton h-5 w-20 ml-auto" /></td>
                    ))}
                  </tr>
                ))
              ) : (
                empList.map((emp) => (
                  <AttendanceRow
                    key={emp._id}
                    employee={emp}
                    month={month}
                    expanded={expandedId === emp._id}
                    onToggle={() => toggle(emp._id)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

function AttendanceRow({ employee, month, expanded, onToggle }) {
  const { data, loading } = useFetch(
    () => attendanceService.getMonthlySummary(employee._id, month),
    [employee._id, month]
  );
  const initials = employee.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || '??';

  if (loading) {
    return (
      <tr className="border-b border-border/40">
        <td className="px-6 py-4 w-8" />
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
  const records = d.records || [];

  return (
    <>
      <tr
        onClick={onToggle}
        className={clsx(
          'border-b border-border/40 cursor-pointer transition-colors',
          expanded ? 'bg-accent-blue/5 border-accent-blue/20' : 'hover:bg-surface-2/50'
        )}
      >
        <td className="pl-6 py-4 w-8 text-text-muted">
          {expanded
            ? <ChevronDown size={14} className="text-accent-blue" />
            : <ChevronRight size={14} />}
        </td>
        <td className="px-4 py-4">
          <div className="flex items-center gap-3">
            <div className={clsx(
              'w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-heading font-semibold shrink-0',
              expanded ? 'bg-accent-blue/30 text-accent-blue' : 'bg-accent-blue/20 text-accent-blue'
            )}>
              {initials}
            </div>
            <span className="text-[13.5px] text-white font-medium truncate">{employee.name}</span>
          </div>
        </td>
        <td className="px-6 py-4 text-[13px] text-text-secondary">{employee.department}</td>
        <td className="px-6 py-4 text-right font-mono text-[13.5px] text-accent-teal tabular-nums font-medium">{d.present_days ?? 0}</td>
        <td className="px-6 py-4 text-right font-mono text-[13.5px] tabular-nums font-medium"
            style={{ color: (d.absent_days || 0) > 0 ? '#EF4444' : '#64748B' }}>
          {d.absent_days ?? 0}
        </td>
        <td className="px-6 py-4 text-right font-mono text-[13.5px] tabular-nums font-medium"
            style={{ color: (d.late_days || 0) > 0 ? '#F59E0B' : '#64748B' }}>
          {d.late_days ?? 0}
        </td>
        <td className="px-6 py-4 pr-6 text-right font-mono text-[13.5px] text-text-secondary tabular-nums">
          {(d.total_overtime_hours || 0).toFixed(1)}
        </td>
      </tr>

      {expanded && (
        <tr className="border-b border-border/40 bg-surface-2/20">
          <td colSpan={7} className="px-6 py-5">
            {/* Summary cards */}
            <div className="flex flex-wrap gap-3 mb-5">
              <StatCard icon={<UserCheck size={14} className="text-accent-teal" />} label="Present" value={d.present_days ?? 0} color="text-accent-teal" />
              <StatCard icon={<UserX size={14} className="text-red-400" />} label="Absent" value={d.absent_days ?? 0} color="text-red-400" />
              <StatCard icon={<AlertCircle size={14} className="text-amber-400" />} label="Late Days" value={d.late_days ?? 0} color="text-amber-400" />
              <StatCard icon={<Clock size={14} className="text-accent-blue" />} label="OT Hours" value={(d.total_overtime_hours || 0).toFixed(1)} color="text-accent-blue" />
              <StatCard icon={<Clock size={14} className="text-text-secondary" />} label="Late Minutes" value={d.total_late_minutes ?? 0} color="text-text-secondary" />
              <StatCard icon={<Calendar size={14} className="text-text-secondary" />} label="Working Days" value={d.total_working_days ?? 0} color="text-text-secondary" />
            </div>

            {/* Daily records table */}
            {records.length > 0 && (
              <div className="rounded-lg border border-border/60 overflow-hidden">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="bg-surface-2/50 border-b border-border/40">
                      <th className="text-left px-4 py-2 text-text-muted font-heading font-semibold uppercase tracking-wide">Date</th>
                      <th className="text-left px-4 py-2 text-text-muted font-heading font-semibold uppercase tracking-wide">Status</th>
                      <th className="text-left px-4 py-2 text-text-muted font-heading font-semibold uppercase tracking-wide">Check In</th>
                      <th className="text-left px-4 py-2 text-text-muted font-heading font-semibold uppercase tracking-wide">Check Out</th>
                      <th className="text-right px-4 py-2 text-text-muted font-heading font-semibold uppercase tracking-wide">Late (min)</th>
                      <th className="text-right px-4 py-2 text-text-muted font-heading font-semibold uppercase tracking-wide pr-4">OT (hrs)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((rec, i) => {
                      const date = new Date(rec.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
                      const checkIn = rec.check_in ? new Date(rec.check_in).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '—';
                      const checkOut = rec.check_out ? new Date(rec.check_out).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '—';
                      const statusColor = rec.status === 'present' ? 'text-accent-teal' : rec.status === 'late' ? 'text-amber-400' : 'text-red-400';
                      return (
                        <tr key={i} className={clsx('border-b border-border/20', i % 2 === 0 ? 'bg-surface-1/30' : '')}>
                          <td className="px-4 py-2 font-mono text-text-secondary">{date}</td>
                          <td className={clsx('px-4 py-2 font-medium capitalize', statusColor)}>{rec.status}</td>
                          <td className="px-4 py-2 font-mono text-text-secondary">{checkIn}</td>
                          <td className="px-4 py-2 font-mono text-text-secondary">{checkOut}</td>
                          <td className="px-4 py-2 text-right font-mono" style={{ color: rec.late_minutes > 0 ? '#F59E0B' : '#64748B' }}>{rec.late_minutes}</td>
                          <td className="px-4 py-2 pr-4 text-right font-mono" style={{ color: rec.overtime_hours > 0 ? '#60A5FA' : '#64748B' }}>{rec.overtime_hours.toFixed(1)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className="flex items-center gap-2 bg-surface-1 border border-border rounded-lg px-4 py-2.5 min-w-[110px]">
      {icon}
      <div>
        <div className={clsx('text-[15px] font-semibold font-mono tabular-nums', color)}>{value}</div>
        <div className="text-[10px] text-text-muted uppercase tracking-wide font-heading">{label}</div>
      </div>
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
