import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertTriangle, SearchX, ChevronDown, ChevronRight, Clock, UserCheck, UserX, AlarmClock, Timer, CalendarDays } from 'lucide-react';
import clsx from 'clsx';
import { attendanceService, employeeService } from '../services/api';
import { useFetch } from '../hooks/useFetch';
import ErrorBanner from '../components/ErrorBanner';
import Panel from '../components/Panel';
import { Avatar, EmptyState, MonthPicker, Pill, SkeletonRows, Th } from '../components/ui';
import { DATA_MONTHS, LATEST_MONTH, countLabel, formatMonth, matchesQuery } from '../lib/format';

export default function Attendance() {
  const [params, setParams] = useSearchParams();
  // ?month=YYYY-MM, defaulting to the latest month with data
  const month = DATA_MONTHS.includes(params.get('month')) ? params.get('month') : LATEST_MONTH;
  const [expandedId, setExpandedId] = useState(null);
  const { data: employees, loading, error, refetch } = useFetch(() => employeeService.getAll({ limit: 100 }), []);

  const setMonth = (m) => {
    setExpandedId(null);
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      if (m === LATEST_MONTH) next.delete('month'); else next.set('month', m);
      return next;
    }, { replace: true });
  };

  const empList = employees || [];
  const q = params.get('q') || '';  // from the top-bar search
  const isMatch = (emp) => matchesQuery(q, emp.name, emp.department);
  const shown = empList.filter(isMatch).length;
  const toggle = (id) => setExpandedId((prev) => (prev === id ? null : id));

  return (
    <div className="space-y-6">
      <ErrorBanner error={error} onRetry={refetch} />

      <Panel
        noPadding
        title={`Attendance for ${formatMonth(month, 'long')}`}
        subtitle={loading ? 'Loading…' : `${countLabel(shown, empList.length, 'employees', q)} · ⚠ marks ${FLAG_AT} or more days · select a row for daily records`}
        action={
          <MonthPicker
            value={month}
            months={DATA_MONTHS}
            onChange={setMonth}
            format={(m) => formatMonth(m, 'long')}
          />
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <Th className="pl-6 w-10"><span className="sr-only">Expand</span></Th>
                <Th>Employee</Th>
                <Th>Department</Th>
                <Th className={VALUE_COL}>Present</Th>
                <Th className={VALUE_COL}>Absent</Th>
                <Th className={VALUE_COL}>Late</Th>
                <Th className={clsx(VALUE_COL, 'pr-6')}>Overtime</Th>
              </tr>
            </thead>
            <tbody>
              {loading ? <SkeletonRows cols={7} /> : empList.map((emp) => (
                <AttendanceRow
                  key={emp._id}
                  employee={emp}
                  month={month}
                  expanded={expandedId === emp._id}
                  onToggle={() => toggle(emp._id)}
                  hidden={!isMatch(emp)}
                />
              ))}
              {!loading && q && shown === 0 && (
                <tr><td colSpan={7}>
                  <EmptyState icon={SearchX} title="No matches" text={`Nothing matches “${q.trim()}”. Try another name or department.`} className="border-t border-line" />
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

function AttendanceRow({ employee, month, expanded, onToggle, hidden }) {
  const { data, loading } = useFetch(
    () => attendanceService.getMonthlySummary(employee._id, month),
    [employee._id, month]
  );
  // Filtered-out rows stay mounted (keeping their fetched data) but render nothing.
  if (hidden) return null;

  const d = data || {};
  const records = d.records || [];

  return (
    <>
      <tr
        onClick={onToggle}
        className={clsx(
          'border-t border-line cursor-pointer transition-colors',
          expanded ? 'bg-primary-soft/60' : 'hover:bg-surface-2/50'
        )}
      >
        <td className="pl-6 py-3.5 w-10 text-fg-3">
          {expanded ? <ChevronDown size={16} className="text-primary-fg" /> : <ChevronRight size={16} />}
        </td>
        <td className="px-5 py-3.5">
          <div className="flex items-center gap-3">
            <Avatar name={employee.name} size="sm" />
            <span className="text-[15px] text-fg font-semibold truncate">{employee.name}</span>
          </div>
        </td>
        <td className="px-5 py-3.5 text-[15px] text-fg-2">{employee.department}</td>
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <td key={i} className="pl-[46px] pr-5 py-3.5"><div className="skeleton h-4 w-14" /></td>
          ))
        ) : (
          <>
            <ValueCell>{d.present_days ?? 0} days</ValueCell>
            <CountCell value={d.absent_days || 0} tone="danger" label="absent days" />
            <CountCell value={d.late_days || 0} tone="warn" label="late days" />
            <ValueCell className="pr-6" muted={!d.total_overtime_hours}>
              {d.total_overtime_hours ? `${d.total_overtime_hours.toFixed(1)} h` : 'None'}
            </ValueCell>
          </>
        )}
      </tr>

      {expanded && !loading && (
        <tr className="bg-surface-2/40">
          <td colSpan={7} className="px-6 py-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 mb-5">
              <MiniStat icon={UserCheck}    label="Present"       value={d.present_days ?? 0} />
              <MiniStat icon={UserX}        label="Absent"        value={d.absent_days ?? 0} />
              <MiniStat icon={AlarmClock}   label="Late days"     value={d.late_days ?? 0} />
              <MiniStat icon={Clock}        label="Late minutes"  value={d.total_late_minutes ?? 0} />
              <MiniStat icon={Timer}        label="Overtime hours" value={(d.total_overtime_hours || 0).toFixed(1)} />
              <MiniStat icon={CalendarDays} label="Working days"  value={d.total_working_days ?? 0} />
            </div>

            {records.length > 0 && (
              <div className="rounded-xl border border-line bg-surface overflow-hidden">
                <div className="max-h-[360px] overflow-y-auto">
                  <table className="w-full text-[14.5px]">
                    <thead className="sticky top-0">
                      <tr>
                        <Th>Date</Th>
                        <Th>Status</Th>
                        <Th>Check in</Th>
                        <Th>Check out</Th>
                        <Th align="right">Late (min)</Th>
                        <Th align="right">Overtime (h)</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.map((rec, i) => (
                        <tr key={i} className="border-t border-line">
                          <td className="px-5 py-2.5 text-fg font-medium tnum whitespace-nowrap">
                            {new Date(rec.date).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' })}
                          </td>
                          <td className="px-5 py-2.5"><StatusPill status={rec.status} /></td>
                          <td className="px-5 py-2.5 text-fg-2 tnum">{fmtTime(rec.check_in)}</td>
                          <td className="px-5 py-2.5 text-fg-2 tnum">{fmtTime(rec.check_out)}</td>
                          <td className={clsx('px-5 py-2.5 text-right tnum', rec.late_minutes > 0 ? 'text-warn-fg font-semibold' : 'text-fg-3')}>
                            {rec.late_minutes}
                          </td>
                          <td className={clsx('px-5 py-2.5 text-right tnum', rec.overtime_hours > 0 ? 'text-fg font-semibold' : 'text-fg-3')}>
                            {rec.overtime_hours.toFixed(1)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  );
}

function fmtTime(t) {
  return t ? new Date(t).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '—';
}

/*
 * Present / Absent / Late / Overtime share one fixed width and one text
 * start (cell padding + an 18px icon slot + gap = 46px), so the gaps
 * between them are even and every value lines up under its heading.
 */
const VALUE_COL = 'w-[150px] pl-[46px]';

function IconSlot({ children }) {
  return <span className="w-[18px] shrink-0 flex justify-center">{children}</span>;
}

function ValueCell({ children, muted, className }) {
  return (
    <td className={clsx('pl-5 pr-5 py-3.5', className)}>
      <span className="flex items-center gap-2 whitespace-nowrap">
        <IconSlot />
        <span className={clsx('text-[15px] tnum', muted ? 'text-fg-3' : 'font-semibold text-fg')}>{children}</span>
      </span>
    </td>
  );
}

/** Absent / late days at or above this count get a warning sign. */
const FLAG_AT = 3;

/**
 * Absent / late count written out in words ("None", "1 day", "4 days").
 * Counts at or above FLAG_AT get a warning icon and bold text. The icon
 * has its own fixed slot so every line in the column starts at the same place.
 */
function CountCell({ value, tone, label }) {
  const flagged = value >= FLAG_AT;
  return (
    <td className="pl-5 pr-5 py-3.5" aria-label={`${value} ${label}${flagged ? ', needs attention' : ''}`}>
      <span className="flex items-center gap-2 whitespace-nowrap">
        <IconSlot>
          {flagged && (
            <AlertTriangle
              size={18}
              strokeWidth={2.25}
              className={tone === 'danger' ? 'text-danger-fg' : 'text-warn-fg'}
            />
          )}
        </IconSlot>
        {value === 0 ? (
          <span className="text-[15px] text-fg-3">None</span>
        ) : (
          <span className={clsx('text-[15px] tnum', flagged ? 'font-bold text-fg' : 'text-fg-2')}>
            {value} {value === 1 ? 'day' : 'days'}
          </span>
        )}
      </span>
    </td>
  );
}

function StatusPill({ status }) {
  if (status === 'present') return <Pill tone="good" dot>Present</Pill>;
  if (status === 'late') return <Pill tone="warn" dot>Late</Pill>;
  return <Pill tone="danger" dot className="capitalize">{status}</Pill>;
}

function MiniStat({ icon: Icon, label, value }) {
  return (
    <div className="bg-surface border border-line rounded-xl px-4 py-3">
      <div className="flex items-center gap-1.5 text-fg-3 text-[13.5px] font-medium">
        <Icon size={13} strokeWidth={2} /> {label}
      </div>
      <div className="text-[20.5px] font-extrabold text-fg mt-1 tnum">{value}</div>
    </div>
  );
}
