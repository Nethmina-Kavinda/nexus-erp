import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, CalendarCheck, CreditCard, Package, AlertTriangle, Activity, ArrowRight } from 'lucide-react';
import { dashboardService } from '../services/api';
import { useFetch } from '../hooks/useFetch';
import KPICard from '../components/KPICard';
import RiskBadge from '../components/RiskBadge';
import ErrorBanner from '../components/ErrorBanner';
import Panel from '../components/Panel';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  BarChart, Bar,
} from 'recharts';

const RISK_COLORS = { Low: '#14B8A6', Medium: '#F59E0B', High: '#3B82F6', Critical: '#EF4444' };

export default function Dashboard() {
  const [month] = useState('2026-03'); // Latest seed month
  const { data, loading, error, refetch } = useFetch(() => dashboardService.getSummary(month), [month]);
  const navigate = useNavigate();

  const d = data;

  const riskData = d?.riskDistribution
    ? Object.entries(d.riskDistribution).map(([name, value]) => ({ name, value })).filter((r) => r.value > 0)
    : [];
  const totalRisk = riskData.reduce((sum, r) => sum + r.value, 0);

  const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-surface-3 border border-border-hover rounded-lg px-3 py-2 shadow-xl">
        <div className="text-[11px] text-text-secondary mb-1 font-medium">{label}</div>
        {payload.map((p, i) => (
          <div key={i} className="text-[12px] text-white flex items-center gap-2 font-mono tabular-nums">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-text-secondary">{p.name}</span>
            <span className="ml-auto text-white font-medium">{p.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-7 max-w-[1600px] mx-auto">
      <ErrorBanner error={error} onRetry={refetch} />

      {/* KPI grid — uniform cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-5">
        <KPICard icon={Users}         label="Total Employees"      value={d?.totalEmployees}       color="blue"   loading={loading} />
        <KPICard icon={CalendarCheck} label="Attendance Rate"      value={d?.attendanceRate}       format="percent" color="teal"   loading={loading} />
        <KPICard icon={CreditCard}    label="Monthly Payroll"      value={d?.monthlyPayrollTotal}  format="currency" color="purple" loading={loading} />
        <KPICard icon={Package}       label="Inventory Alerts"     value={d?.inventoryAlerts}      color="amber"  accentBorder={d?.inventoryAlerts ? 'amber' : undefined} loading={loading} />
        <KPICard icon={AlertTriangle} label="High + Critical Risk" value={d ? (d.riskDistribution?.High || 0) + (d.riskDistribution?.Critical || 0) : 0} color="red" accentBorder="red" loading={loading} />
        <KPICard icon={Activity}      label="Workforce Risk Level" value={d?.wrl}                  format="percent" color="blue"   loading={loading} />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
        <Panel className="xl:col-span-3" title="Attendance Trend" subtitle="Last 6 months">
          {d?.attendanceTrend && (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={d.attendanceTrend} margin={{ top: 10, right: 10, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="gPresent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#14B8A6" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#14B8A6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gAbsent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#EF4444" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gLate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#F59E0B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748B', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
                <Area type="monotone" dataKey="present" name="Present" stroke="#14B8A6" fill="url(#gPresent)" strokeWidth={2} />
                <Area type="monotone" dataKey="late" name="Late" stroke="#F59E0B" fill="url(#gLate)" strokeWidth={2} />
                <Area type="monotone" dataKey="absent" name="Absent" stroke="#EF4444" fill="url(#gAbsent)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
          <div className="flex items-center gap-5 mt-3 pt-3 border-t border-border">
            <Legend color="#14B8A6" label="Present" />
            <Legend color="#F59E0B" label="Late" />
            <Legend color="#EF4444" label="Absent" />
          </div>
        </Panel>

        <Panel className="xl:col-span-2" title="Risk Distribution" subtitle={`${month} · ${totalRisk} employees`}>
          {riskData.length > 0 ? (
            <div className="flex flex-col items-center">
              <div className="relative w-full">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={riskData} cx="50%" cy="50%" innerRadius={58} outerRadius={84} dataKey="value" strokeWidth={0}>
                      {riskData.map((entry) => (
                        <Cell key={entry.name} fill={RISK_COLORS[entry.name]} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[26px] font-heading font-extrabold text-white leading-none tabular-nums">{totalRisk}</span>
                  <span className="text-[11px] text-text-secondary mt-1">Employees</span>
                </div>
              </div>
              <div className="w-full mt-4 space-y-2">
                {['Low', 'Medium', 'High', 'Critical'].map((cls) => {
                  const count = d?.riskDistribution?.[cls] ?? 0;
                  return (
                    <div key={cls} className="flex items-center text-[13px]">
                      <span className="w-2.5 h-2.5 rounded-full mr-2.5" style={{ backgroundColor: RISK_COLORS[cls] }} />
                      <span className="text-text-secondary">{cls}</span>
                      <span className="ml-auto font-mono text-white tabular-nums">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-text-muted text-sm">No data</div>
          )}
        </Panel>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <Panel
          title="Payroll Overview"
          subtitle="Last 6 months (LKR)"
          action={<span className="text-[11px] font-mono text-text-muted bg-surface-2 px-2 py-1 rounded">LKR</span>}
        >
          {d?.payrollTrend && (
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={d.payrollTrend} margin={{ top: 10, right: 10, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748B', fontSize: 11, fontFamily: 'JetBrains Mono' }} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(59,130,246,0.05)' }} />
                <Bar dataKey="total" name="Payroll" fill="#3B82F6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Panel>

        <Panel
          title="High Risk Employees"
          subtitle="Top 5 by composite score"
          action={
            <button
              onClick={() => navigate('/risk')}
              className="flex items-center gap-1 text-[12px] font-heading font-semibold text-accent-blue hover:text-white transition-colors"
            >
              View all <ArrowRight size={12} />
            </button>
          }
        >
          <div className="space-y-1">
            {d?.recentPredictions?.slice(0, 5).map((pred) => {
              const initials = pred.employee_id?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || '??';
              return (
                <div key={pred._id} className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-surface-2 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-accent-blue/20 flex items-center justify-center text-accent-blue text-[11px] font-heading font-semibold shrink-0">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13.5px] text-white font-medium truncate">{pred.employee_id?.name || 'Unknown'}</div>
                    <div className="text-[11.5px] text-text-muted mt-0.5">{pred.employee_id?.department}</div>
                  </div>
                  <span className="text-[13px] font-mono text-white tabular-nums w-8 text-right">{Math.round(pred.risk_score)}</span>
                  <RiskBadge level={pred.risk_class} size="sm" />
                </div>
              );
            })}
            {!loading && !d?.recentPredictions?.length && (
              <div className="py-8 text-center text-[13px] text-text-muted">No predictions yet</div>
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function Legend({ color, label }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-[12px] text-text-secondary font-medium">{label}</span>
    </div>
  );
}
