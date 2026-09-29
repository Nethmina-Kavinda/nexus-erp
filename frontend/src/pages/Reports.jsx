import { useState } from 'react';
import { FileDown, CalendarRange, CalendarDays, Loader2, Lock, Check } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { reportService } from '../services/api';
import Panel from '../components/Panel';
import { Button, Field, inputClass } from '../components/ui';

const TYPES = [
  { value: 'monthly', icon: CalendarRange, label: 'Monthly report', desc: 'Attendance, payroll, risk and HR decisions for a month' },
  { value: 'daily',   icon: CalendarDays,  label: 'Daily report',   desc: 'Headcount for one day plus inventory alerts' },
];

const CONTENTS = {
  monthly: [
    ['Executive summary', 'Total employees, attendance rate, payroll total and workforce risk level'],
    ['Risk distribution', 'Employee counts in each tier: Low, Medium, High and Critical'],
    ['Department breakdown', 'Headcount, average risk score and dominant tier per department'],
    ['Employee details', 'Attendance, payroll and risk tier for every employee in one table'],
    ['HR decisions', 'Every accept or reject decision recorded during the month'],
  ],
  daily: [
    ['Daily summary', 'Present, absent and late counts for the day'],
    ['Attendance details', 'Check-in and check-out times, late minutes and overtime per employee'],
    ['Inventory alerts', 'Items at or below their reorder level'],
  ],
};

export default function Reports() {
  const { hasRole } = useAuth();
  const toast = useToast();

  const [reportType, setReportType]       = useState('monthly');
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
      toast.success('Your PDF has been downloaded.', 'Report ready');
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Failed to generate report.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 items-start">
      <Panel className="lg:col-span-3" title="Create a report" subtitle="Choose a report type and period, then download it as a PDF.">
        <div className="space-y-6">
          <div role="radiogroup" aria-label="Report type" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {TYPES.map(({ value, icon: Icon, label, desc }) => {
              const active = reportType === value;
              return (
                <button
                  key={value}
                  role="radio"
                  aria-checked={active}
                  onClick={() => setReportType(value)}
                  className={clsx(
                    'relative text-left p-4 rounded-xl border-2 transition-colors',
                    active ? 'border-primary bg-primary-soft/50' : 'border-line hover:border-line-strong'
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={clsx(
                      'w-9 h-9 rounded-lg flex items-center justify-center',
                      active ? 'bg-primary text-on-primary' : 'bg-surface-2 text-fg-2'
                    )}>
                      <Icon size={17} strokeWidth={2} />
                    </div>
                    <span className="text-[15.5px] font-bold text-fg">{label}</span>
                  </div>
                  <p className="text-[14.5px] text-fg-3 mt-2.5 leading-snug">{desc}</p>
                  {active && (
                    <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center">
                      <Check size={12} strokeWidth={3} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <Field label={reportType === 'monthly' ? 'Month' : 'Date'}>
            {reportType === 'monthly' ? (
              <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className={clsx(inputClass, 'tnum')} />
            ) : (
              <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className={clsx(inputClass, 'tnum')} />
            )}
          </Field>

          {!canGenerate && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-warn-soft">
              <Lock size={16} className="text-warn-fg shrink-0" />
              <p className="text-[14.5px] text-warn-fg font-medium">
                Only HR managers and admins can generate reports.
              </p>
            </div>
          )}

          <Button onClick={handleGenerate} disabled={loading || !canGenerate} className="w-full h-11">
            {loading
              ? <><Loader2 size={16} className="animate-spin" /> Generating…</>
              : <><FileDown size={16} /> Download PDF</>}
          </Button>
        </div>
      </Panel>

      <Panel className="lg:col-span-2" title="What's in it" subtitle={reportType === 'monthly' ? 'Monthly report sections' : 'Daily report sections'}>
        <ol className="space-y-4">
          {CONTENTS[reportType].map(([title, desc], i) => (
            <li key={title} className="flex gap-3.5">
              <span className="w-6 h-6 rounded-full bg-primary-soft text-primary-fg text-[13.5px] font-bold flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              <div>
                <div className="text-[15px] font-semibold text-fg">{title}</div>
                <div className="text-[14.5px] text-fg-3 mt-0.5 leading-snug">{desc}</div>
              </div>
            </li>
          ))}
        </ol>
      </Panel>
    </div>
  );
}
