import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, CalendarCheck, Wallet, PackageX, ArrowRight, ShieldCheck } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar,
} from 'recharts';
import { dashboardService } from '../services/api';
import { useFetch } from '../hooks/useFetch';
import StatCard from '../components/StatCard';
import RiskBadge from '../components/RiskBadge';
import ScoreBar from '../components/ScoreBar';
import RiskDistribution from '../components/RiskDistribution';
import DepartmentRisk from '../components/DepartmentRisk';
import ErrorBanner from '../components/ErrorBanner';
import Panel from '../components/Panel';
import { Avatar, ChartTooltip, EmptyState, Pill, Th, axisTick } from '../components/ui';
import { RISK_TIERS, companyAverage, compact, formatLKR, formatMonth } from '../lib/format';

const WRL_THRESHOLD = 30;

const ATTENDANCE_SERIES = [
  { key: 'present', name: 'Present', color: 'var(--chart-base)' },
  { key: 'late',    name: 'Late',    color: 'var(--warn)' },
  { key: 'absent',  name: 'Absent',  color: 'var(--danger)' },
];

export default function Dashboard() {
  const [month] = useState('2026-03'); // Latest seed month
  const { data: d, loading, error, refetch } = useFetch(() => dashboardService.getSummary(month), [month]);
  const navigate = useNavigate();

  // Derived trends
  const payroll = d?.payrollTrend || [];
  const attendance = d?.attendanceTrend || [];
  const rateSeries = attendance.map((m) => {
    const total = m.present + m.late + m.absent;
    return total ? ((m.present + m.late) / total) * 100 : 0;
  });
  const prevMonth = payroll.length > 1 ? payroll[payroll.length - 2] : null;
  const payrollDelta = prevMonth?.total
    ? ((payroll[payroll.length - 1].total - prevMonth.total) / prevMonth.total) * 100
    : null;
  const rateDelta = rateSeries.length > 1 ? rateSeries[rateSeries.length - 1] - rateSeries[rateSeries.length - 2] : null;
  const payrollAvg = payroll.length ? payroll.reduce((s, p) => s + p.total, 0) / payroll.length : 0;

  const dist = d?.riskDistribution || {};
  const hasRisk = RISK_TIERS.some((t) => dist[t] > 0);
  const wrl = d?.wrl ?? 0;
  const prevLabel = prevMonth ? `vs ${formatMonth(prevMonth.month, 'short')}` : undefined;

  return (
    <div className="space-y-6">
      <ErrorBanner error={error} onRetry={refetch} />

      {/* First screen: period, KPIs, payroll + risk. On desktop it fills the
          window (topbar 84 + padding 8 + ~108 for the next row's titles to
          peek in), so the detail charts wait below the fold. Capped for very tall screens. */}
      <section className="flex flex-col gap-6 xl:min-h-[min(calc(100vh-200px),1100px)]">
      {/* Period line */}
      <div className="flex flex-wrap items-center gap-3">
        <Pill tone="primary">{formatMonth(month, 'long')}</Pill>
        <span className="text-[14.5px] text-fg-3">Figures refer to the latest payroll period.</span>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard
          loading={loading}
          highlight
          icon={Users}
          label="Active employees"
          value={d?.totalEmployees?.toLocaleString()}
          note={d?.departmentRisk?.length ? `across ${d.departmentRisk.length} departments` : undefined}
        />
        <StatCard
          loading={loading}
          icon={CalendarCheck}
          label="Attendance rate"
          value={d?.attendanceRate}
          suffix="%"
          delta={rateDelta}
          deltaUnit=" pt"
          note={prevLabel}
          spark={rateSeries}
        />
        <StatCard
          loading={loading}
          icon={Wallet}
          label="Monthly payroll"
          value={d ? `${compact(d.monthlyPayrollTotal)}` : null}
          suffix=" LKR"
          delta={payrollDelta}
          deltaGood="neutral"
          note={prevLabel}
          spark={payroll.map((p) => p.total)}
        />
        <StatCard
          loading={loading}
          icon={PackageX}
          label="Items to reorder"
          value={d?.inventoryAlerts}
          note={d?.inventoryAlerts ? 'at or below reorder level' : 'all stock healthy'}
        />
      </div>

      {/* Payroll + risk (3 : 2) — grows to fill the first screen */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5 xl:flex-1">
        <Panel
          className="xl:col-span-3 flex flex-col"
          bodyClassName="flex-1 flex flex-col"
          title="Payroll"
          subtitle="Net salaries paid over the last six months"
          action={
            <div className="text-right">
              <div className="text-[13.5px] text-fg-3 font-medium">Average per month</div>
              <div className="text-[20px] font-extrabold text-fg tracking-tight leading-tight tnum">
                LKR {formatLKR(payrollAvg)}
              </div>
            </div>
          }
        >
          {loading ? <div className="skeleton flex-1 min-h-[200px] w-full" /> : (
            <ChartFill>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={payroll} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gPayroll" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.22} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="var(--line)" />
                <XAxis dataKey="month" tickFormatter={(m) => formatMonth(m, 'short')} tick={axisTick} axisLine={false} tickLine={false} dy={8} />
                <YAxis tickFormatter={compact} tick={axisTick} axisLine={false} tickLine={false} width={44} />
                <Tooltip
                  content={<ChartTooltip labelFormatter={(m) => formatMonth(m, 'long')} valueFormatter={(v) => `LKR ${formatLKR(v)}`} />}
                  cursor={{ stroke: 'var(--line-strong)', strokeDasharray: '4 4' }}
                />
                <Area
                  type="monotone" dataKey="total" name="Payroll"
                  stroke="var(--primary)" strokeWidth={2.5} fill="url(#gPayroll)"
                  dot={false}
                  activeDot={{ r: 5, fill: 'var(--primary)', stroke: 'var(--surface)', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
            </ChartFill>
          )}
        </Panel>

        <Panel
          className="xl:col-span-2 flex flex-col"
          bodyClassName="flex-1"
          title="Risk distribution"
          subtitle="Click a tier to see its people"
        >
          {loading ? <div className="skeleton h-[200px] w-full" /> : !hasRisk ? (
            <EmptyState icon={ShieldCheck} title="No risk scores yet" text="Scores appear once the month has been processed." />
          ) : (
            <RiskDistribution distribution={dist} wrl={wrl} threshold={WRL_THRESHOLD} />
          )}
        </Panel>
      </div>
      </section>

      {/* Attendance + departments (3 : 2) */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
        <Panel
          className="xl:col-span-3 flex flex-col"
          bodyClassName="flex-1 flex flex-col"
          title="Attendance"
          subtitle="Daily attendance records per month"
          action={
            <div className="flex items-center gap-4">
              {ATTENDANCE_SERIES.map((s) => (
                <span key={s.key} className="flex items-center gap-1.5 text-[14px] text-fg-2 font-medium">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: s.color }} />
                  {s.name}
                </span>
              ))}
            </div>
          }
        >
          {loading ? <div className="skeleton flex-1 min-h-[200px] w-full" /> : (
            <ChartFill>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendance} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barCategoryGap="32%">
                <CartesianGrid vertical={false} stroke="var(--line)" />
                <XAxis dataKey="month" tickFormatter={(m) => formatMonth(m, 'short')} tick={axisTick} axisLine={false} tickLine={false} dy={8} />
                <YAxis tickFormatter={compact} tick={axisTick} axisLine={false} tickLine={false} width={44} />
                <Tooltip
                  content={<ChartTooltip labelFormatter={(m) => formatMonth(m, 'long')} />}
                  cursor={{ fill: 'var(--surface-2)' }}
                />
                {ATTENDANCE_SERIES.map((s, i) => (
                  <Bar
                    key={s.key} dataKey={s.key} name={s.name} stackId="a" fill={s.color}
                    stroke="var(--surface)" strokeWidth={2}
                    radius={i === ATTENDANCE_SERIES.length - 1 ? [5, 5, 0, 0] : 0}
                    maxBarSize={48}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
            </ChartFill>
          )}
        </Panel>

        <Panel
          className="xl:col-span-2"
          title="Risk by department"
          subtitle={d?.departmentRisk?.length
            ? `Company average ${companyAverage(d.departmentRisk).toFixed(1)} · click to open`
            : 'Average risk score'}
        >
          {loading ? <div className="skeleton h-[200px] w-full" /> : !d?.departmentRisk?.length ? (
            <EmptyState title="No department data" />
          ) : (
            <DepartmentRisk departments={d.departmentRisk} />
          )}
        </Panel>
      </div>

      {/* Top risk employees */}
      <Panel
        noPadding
        title="Highest risk employees"
        subtitle="Top five by composite score this month"
        action={
          <button
            onClick={() => navigate('/risk')}
            className="flex items-center gap-1.5 text-[14.5px] font-semibold text-primary-fg hover:underline"
          >
            Open risk scoring <ArrowRight size={14} />
          </button>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <Th className="pl-6">Employee</Th>
                <Th>Department</Th>
                <Th className="w-[280px]">Score</Th>
                <Th align="right" className="pr-6">Tier</Th>
              </tr>
            </thead>
            <tbody>
              {d?.recentPredictions?.slice(0, 5).map((pred) => (
                <tr key={pred._id} className="border-t border-line hover:bg-surface-2/50 transition-colors">
                  <td className="pl-6 pr-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar name={pred.employee_id?.name} size="sm" />
                      <span className="text-[15px] text-fg font-semibold truncate">{pred.employee_id?.name || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-[15px] text-fg-2">{pred.employee_id?.department}</td>
                  <td className="px-5 py-3.5">
                    <ScoreBar score={pred.risk_score} tier={pred.risk_class} />
                  </td>
                  <td className="pl-5 pr-6 py-3.5 text-right"><RiskBadge level={pred.risk_class} size="sm" /></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && !d?.recentPredictions?.length && (
            <EmptyState icon={ShieldCheck} title="No predictions yet" className="border-t border-line" />
          )}
        </div>
      </Panel>
    </div>
  );
}

/** Lets a Recharts chart grow to fill the remaining card height (never below `min`). */
function ChartFill({ min = 200, children }) {
  return (
    <div className="relative flex-1" style={{ minHeight: min }}>
      <div className="absolute inset-0">{children}</div>
    </div>
  );
}
