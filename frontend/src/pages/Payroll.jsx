import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SearchX } from 'lucide-react';
import { employeeService, payrollService } from '../services/api';
import { useFetch } from '../hooks/useFetch';
import ErrorBanner from '../components/ErrorBanner';
import Panel from '../components/Panel';
import { Avatar, EmptyState, Pill, SkeletonRows, Th } from '../components/ui';
import { countLabel, formatLKR, formatMonth, matchesQuery } from '../lib/format';

export default function Payroll() {
  const [month] = useState('2026-03');
  const { data: employees, loading, error, refetch } = useFetch(() => employeeService.getAll({ limit: 100 }), []);

  const empList = employees || [];
  const q = useSearchParams()[0].get('q') || '';  // from the top-bar search
  const isMatch = (emp) => matchesQuery(q, emp.name, emp.department);
  const shown = empList.filter(isMatch).length;

  return (
    <div className="space-y-6">
      <ErrorBanner error={error} onRetry={refetch} />

      <Panel
        noPadding
        title={`Payroll for ${formatMonth(month, 'long')}`}
        subtitle={loading ? 'Loading…' : `${countLabel(shown, empList.length, 'employees', q)} · amounts in LKR`}
        action={
          <div className="hidden md:flex items-center gap-2 text-[14px] text-fg-3">
            <span>EPF 8% · ETF 3% · overtime at 1.5×</span>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <Th className="pl-6">Employee</Th>
                <Th align="right">Work hours</Th>
                <Th align="right">Overtime (h)</Th>
                <Th align="right">Gross</Th>
                <Th align="right">EPF + ETF</Th>
                <Th align="right">Late penalty</Th>
                <Th align="right" className="pr-6">Net salary</Th>
              </tr>
            </thead>
            <tbody>
              {loading ? <SkeletonRows cols={7} /> : empList.map((emp) => (
                <PayrollRow key={emp._id} employee={emp} month={month} hidden={!isMatch(emp)} />
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

function PayrollRow({ employee, month, hidden }) {
  const { data, loading } = useFetch(
    () => payrollService.getRecords(employee._id, month),
    [employee._id, month]
  );
  // Filtered-out rows stay mounted (keeping their fetched data) but render nothing.
  if (hidden) return null;
  const p = (data || [])[0];

  const who = (
    <td className="pl-6 pr-5 py-3.5">
      <div className="flex items-center gap-3">
        <Avatar name={employee.name} size="sm" />
        <div className="min-w-0">
          <div className="text-[15px] text-fg font-semibold truncate">{employee.name}</div>
          <div className="text-[14px] text-fg-3 mt-0.5 truncate">{employee.department}</div>
        </div>
      </div>
    </td>
  );

  if (loading) {
    return (
      <tr className="border-t border-line">
        {who}
        {Array.from({ length: 6 }).map((_, i) => (
          <td key={i} className="px-5 py-3.5"><div className="skeleton h-4 w-16 ml-auto" /></td>
        ))}
      </tr>
    );
  }

  if (!p) {
    return (
      <tr className="border-t border-line">
        {who}
        <td colSpan={6} className="pl-5 pr-6 py-3.5 text-right"><Pill>No payroll record</Pill></td>
      </tr>
    );
  }

  const statutory = (p.deductions?.epf || 0) + (p.deductions?.etf || 0);
  const late = p.late_penalty || 0;

  return (
    <tr className="border-t border-line hover:bg-surface-2/50 transition-colors">
      {who}
      <td className="px-5 py-3.5 text-right text-[15px] text-fg-2 tnum">{p.working_hours}</td>
      <td className="px-5 py-3.5 text-right text-[15px] text-fg-2 tnum">{(p.overtime_hours || 0).toFixed(1)}</td>
      <td className="px-5 py-3.5 text-right text-[15px] text-fg font-semibold tnum">{formatLKR(p.gross_salary)}</td>
      <td className="px-5 py-3.5 text-right text-[15px] text-fg-2 tnum">−{formatLKR(statutory)}</td>
      {/* light highlight: small status dot + semibold amount. The amount sits in a
          fixed-width, right-aligned slot so every dot lines up in one column. */}
      <td className="px-5 py-3.5 text-right text-[15px] tnum">
        <span className="inline-flex items-center gap-2.5">
          <span className={`w-2 h-2 rounded-full shrink-0 ${late > 0 ? 'bg-serious' : 'bg-transparent'}`} aria-hidden />
          <span className={`inline-block min-w-[6ch] text-right ${late > 0 ? 'font-semibold text-fg' : 'text-fg-3'}`}>
            {late > 0 ? `−${formatLKR(late)}` : 'None'}
          </span>
        </span>
      </td>
      <td className="pl-5 pr-6 py-3.5 text-right text-[15.5px] text-fg font-extrabold tnum">{formatLKR(p.final_salary)}</td>
    </tr>
  );
}
