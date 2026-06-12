import { useState } from 'react';
import { FileDown, FileText, Calendar, BarChart3, Loader2, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { reportService } from '../services/api';

export default function Reports() {
  const { hasRole } = useAuth();
  const toast = useToast();

  const [reportType, setReportType]     = useState('monthly');
  const [selectedMonth, setSelectedMonth] = useState('2026-03');
  const [selectedDate, setSelectedDate]   = useState('2026-03-15');
  const [loading, setLoading]             = useState(false);

  const canGenerate = hasRole('admin', 'hr_manager');

  async function handleGenerate() {
    if (!canGenerate) return;
    setLoading(true);
    try {
      const res = await reportService.generate(
        reportType,
        reportType === 'daily' ? selectedDate : undefined,
        reportType === 'monthly' ? selectedMonth : undefined,
      );
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = reportType === 'monthly'
        ? `NEXUS_Monthly_Report_${selectedMonth}.pdf`
        : `NEXUS_Daily_Report_${selectedDate}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Report downloaded successfully.');
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Failed to generate report.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 lg:p-10 space-y-6 max-w-2xl">

      {/* Page intro */}
      <div>
        <h2 className="text-lg font-heading font-bold text-white">Generate PDF Report</h2>
        <p className="text-[13px] text-text-muted mt-1">
          Select a report type and date range, then download a formatted PDF.
        </p>
      </div>

      {/* Card */}
      <div className="bg-surface-1 border border-border rounded-xl p-8 space-y-7">

        {/* Report type toggle */}
        <div className="space-y-2">
          <label className="text-[12px] font-heading font-semibold text-text-secondary uppercase tracking-wider">
            Report Type
          </label>
          <div className="flex gap-3">
            {[
              { value: 'monthly', icon: BarChart3, label: 'Monthly',
                desc: 'Attendance · Payroll · Risk · HR Decisions' },
              { value: 'daily',   icon: Calendar,  label: 'Daily',
                desc: 'Attendance headcount · Inventory alerts' },
            ].map(({ value, icon: Icon, label, desc }) => (
              <button
                key={value}
                onClick={() => setReportType(value)}
                className={[
                  'flex-1 flex flex-col items-start gap-1.5 px-5 py-4 rounded-xl border text-left transition-all duration-150',
                  reportType === value
                    ? 'border-accent-blue bg-accent-blue/10 text-white'
                    : 'border-border bg-surface-2 text-text-secondary hover:border-border/60 hover:text-white',
                ].join(' ')}
              >
                <div className="flex items-center gap-2">
                  <Icon size={15} strokeWidth={1.75} />
                  <span className="text-[13px] font-heading font-semibold">{label}</span>
                </div>
                <span className="text-[11px] text-text-muted leading-tight">{desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Date / Month picker */}
        <div className="space-y-2">
          <label className="text-[12px] font-heading font-semibold text-text-secondary uppercase tracking-wider">
            {reportType === 'monthly' ? 'Month' : 'Date'}
          </label>
          {reportType === 'monthly' ? (
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full bg-surface-2 border border-border rounded-lg px-4 py-2.5 text-[13px] text-white font-mono focus:outline-none focus:border-accent-blue/60 transition-colors"
            />
          ) : (
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-surface-2 border border-border rounded-lg px-4 py-2.5 text-[13px] text-white font-mono focus:outline-none focus:border-accent-blue/60 transition-colors"
            />
          )}
        </div>

        {/* Access denied notice for non-HR roles */}
        {!canGenerate && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-accent-amber/10 border border-accent-amber/30">
            <Lock size={15} className="text-accent-amber shrink-0" />
            <p className="text-[12px] text-accent-amber">
              Report generation is restricted to HR Managers and Admins.
            </p>
          </div>
        )}

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={loading || !canGenerate}
          className={[
            'w-full flex items-center justify-center gap-2.5 h-11 rounded-lg text-[13px] font-heading font-semibold transition-all duration-150',
            canGenerate && !loading
              ? 'bg-accent-blue hover:bg-accent-blue/90 text-white shadow-[0_0_20px_rgba(59,130,246,0.25)] hover:shadow-[0_0_28px_rgba(59,130,246,0.4)]'
              : 'bg-surface-3 text-text-muted cursor-not-allowed',
          ].join(' ')}
        >
          {loading
            ? <><Loader2 size={15} className="animate-spin" /> Generating…</>
            : <><FileDown size={15} /> Generate &amp; Download PDF</>
          }
        </button>
      </div>

      {/* What's included info */}
      <div className="bg-surface-1 border border-border rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-text-secondary">
          <FileText size={14} strokeWidth={1.75} />
          <span className="text-[12px] font-heading font-semibold uppercase tracking-wider">What's Included</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {(reportType === 'monthly' ? [
            ['Executive Summary', 'Total employees, attendance rate, payroll total, workforce risk level'],
            ['Risk Distribution', 'Breakdown of Low / Medium / High / Critical employee counts'],
            ['Department Breakdown', 'Per-department employee count, average risk score, dominant class'],
            ['Employee Details', 'Per-employee attendance, payroll, and risk class in one table'],
            ['HR Decisions', 'All accept/reject decisions made during the month'],
          ] : [
            ['Daily Summary', 'Present, absent, and late employee counts for the day'],
            ['Attendance Details', 'Per-employee check-in/out times, late minutes, and overtime hours'],
            ['Inventory Alerts', 'All items at or below their reorder level'],
          ]).map(([title, desc]) => (
            <div key={title} className="flex gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-accent-blue mt-1.5 shrink-0" />
              <div>
                <div className="text-[12px] font-medium text-white">{title}</div>
                <div className="text-[11px] text-text-muted mt-0.5 leading-snug">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
