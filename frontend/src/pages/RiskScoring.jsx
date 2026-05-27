import { useState, useEffect } from 'react';
import { Shield, RefreshCw, Check, X, Eye, Zap, Info, ChevronDown, CheckCircle2, Loader2, BarChart3 } from 'lucide-react';
import { riskService, decisionService } from '../services/api';
import { useFetch } from '../hooks/useFetch';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import RiskBadge from '../components/RiskBadge';
import ErrorBanner from '../components/ErrorBanner';
import Panel from '../components/Panel';
import clsx from 'clsx';

const RISK_COLORS = { Low: '#14B8A6', Medium: '#F59E0B', High: '#3B82F6', Critical: '#EF4444' };
const DEPARTMENTS = ['All', 'Engineering', 'Marketing', 'Finance', 'Operations', 'HR'];
const RISK_CLASSES = ['All', 'Low', 'Medium', 'High', 'Critical'];

export default function RiskScoring() {
  const [month] = useState('2026-03');
  const [department, setDepartment] = useState('All');
  const [riskClass, setRiskClass] = useState('All');
  const [selected, setSelected] = useState(null);
  const [retraining, setRetraining] = useState(false);
  const [retrainModal, setRetrainModal] = useState(null); // null | 'running' | { result }
  const { hasRole } = useAuth();
  const toast = useToast();

  const { data, loading, error, refetch } = useFetch(
    () => riskService.getScores({
      month,
      department: department === 'All' ? undefined : department,
      risk_class: riskClass === 'All' ? undefined : riskClass,
    }),
    [month, department, riskClass]
  );

  const { data: mlStatus, refetch: refetchMl } = useFetch(() => riskService.getMlStatus(), []);

  const scores = data || [];
  const total = scores.length;
  const dist = { Low: 0, Medium: 0, High: 0, Critical: 0 };
  scores.forEach((s) => { if (dist.hasOwnProperty(s.risk_class)) dist[s.risk_class]++; });
  const wrl = total > 0 ? ((dist.High + dist.Critical) / total * 100).toFixed(1) : '0.0';

  const handleRetrain = async () => {
    setRetraining(true);
    setRetrainModal('running');
    try {
      const res = await riskService.retrain('stage_2');
      const d = res.data.data || res.data;
      setRetrainModal({
        stage: d.stage || 'stage_2',
        accuracy_test: d.accuracy_test,
        accuracy_validation: d.accuracy_validation,
        f1_macro: d.f1_macro,
        samples_used: d.samples_used,
      });
      refetchMl();
      refetch();
    } catch (err) {
      setRetrainModal(null);
      toast.error(err.response?.data?.error || 'Retrain failed');
    } finally {
      setRetraining(false);
    }
  };

  const handleDecision = async (score, decision, correctedClass) => {
    try {
      await decisionService.submit({
        employee_id: score.employee_id?._id,
        month: score.month,
        original_class: score.risk_class,
        decision,
        corrected_class: correctedClass || score.risk_class,
        reason: decision === 'accept' ? 'HR confirmed prediction' : 'HR corrected classification',
      });
      toast.success(
        `${decision === 'accept' ? 'Accepted' : 'Corrected'} · ${score.employee_id?.name}`,
        'Decision recorded'
      );
      setSelected(null);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Decision failed');
    }
  };

  return (
    <div className="space-y-7 max-w-[1600px] mx-auto">
      <ErrorBanner error={error} onRetry={refetch} />

      {/* Header with ML status + retrain */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent-purple/15 border border-accent-purple/30 flex items-center justify-center">
            <Shield size={18} className="text-accent-purple" strokeWidth={2} />
          </div>
          <div>
            <div className="text-[15px] font-heading font-bold text-white leading-tight">Employee Risk Scoring</div>
            <div className="text-[12px] text-text-muted mt-0.5">Random Forest + SHAP · Period {month}</div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 bg-surface-1 border border-border rounded-lg px-3 py-2">
            <span className={clsx(
              'w-2 h-2 rounded-full',
              mlStatus?.model_loaded ? 'bg-accent-teal shadow-[0_0_6px_rgba(20,184,166,0.6)]' : 'bg-accent-red'
            )} />
            <span className="text-[12px] text-text-secondary font-medium">
              ML: {mlStatus?.model_loaded ? mlStatus.model_stage : 'Offline'}
            </span>
          </div>
          {hasRole('admin', 'hr_manager') && (
            <button
              onClick={handleRetrain}
              disabled={retraining}
              className="flex items-center gap-2 bg-accent-purple hover:bg-accent-purple/90 text-white text-[13px] font-heading font-semibold px-4 py-2 rounded-lg transition-all shadow-[0_0_16px_rgba(139,92,246,0.3)] hover:shadow-[0_0_24px_rgba(139,92,246,0.4)] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <RefreshCw size={14} strokeWidth={2} className={retraining ? 'animate-spin' : ''} />
              {retraining ? 'Retraining…' : 'Retrain Model'}
            </button>
          )}
        </div>
      </div>

      {/* WRL Banner */}
      <div
        className="rounded-xl p-7 border border-accent-blue/25"
        style={{
          background:
            'linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(139,92,246,0.08) 50%, rgba(20,184,166,0.06) 100%)',
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_minmax(0,1fr)] gap-6 items-center">
          {/* WRL number */}
          <div>
            <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-text-secondary mb-1.5">Workforce Risk Level</div>
            <div className="flex items-baseline gap-1">
              <span className="text-[52px] font-heading font-extrabold text-white leading-none tabular-nums">{wrl}</span>
              <span className="text-[24px] font-heading font-bold text-text-secondary leading-none">%</span>
            </div>
            <p className="text-[12px] text-text-muted mt-2">
              Share of workforce at High or Critical risk
            </p>
          </div>

          {/* Stacked bar + counts */}
          <div className="w-full">
            <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-text-secondary mb-2">Distribution</div>
            <div className="h-2 rounded-full overflow-hidden flex bg-surface-2">
              {['Low', 'Medium', 'High', 'Critical'].map((cls) => {
                const pct = total > 0 ? (dist[cls] / total) * 100 : 0;
                return pct > 0 ? (
                  <div
                    key={cls}
                    style={{ width: `${pct}%`, backgroundColor: RISK_COLORS[cls] }}
                    className="transition-all duration-500"
                  />
                ) : null;
              })}
            </div>
            <div className="grid grid-cols-4 gap-2 mt-3">
              {['Low', 'Medium', 'High', 'Critical'].map((cls) => (
                <div key={cls} className="text-center">
                  <div className="text-[22px] font-heading font-bold tabular-nums leading-none" style={{ color: RISK_COLORS[cls] }}>
                    {dist[cls]}
                  </div>
                  <div className="text-[10px] text-text-muted uppercase tracking-wider mt-1">{cls}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary stats */}
          <div className="flex md:flex-col gap-4 md:gap-3 text-sm">
            <Stat label="Under review" value={total} />
            <Stat label="Model stage" value={mlStatus?.model_stage || '—'} color="purple" />
            <Stat label="Accuracy" value={mlStatus?.accuracy ? `${(mlStatus.accuracy * 100).toFixed(0)}%` : '—'} color="teal" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <FilterPills label="Dept" value={department} options={DEPARTMENTS} onChange={setDepartment} />
        <div className="w-px h-6 bg-border" />
        <FilterPills label="Risk" value={riskClass} options={RISK_CLASSES} onChange={setRiskClass} />
        <div className="flex-1" />
        <span className="text-[12px] text-text-muted font-mono">
          {loading ? 'Loading…' : `${total} ${total === 1 ? 'record' : 'records'}`}
        </span>
      </div>

      {/* Risk Table */}
      <Panel noPadding>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-surface-2/30">
                <Th className="pl-6">Employee</Th>
                <Th className="w-52">Risk Score</Th>
                <Th>Class</Th>
                <Th>Channel</Th>
                <Th>Top Driver</Th>
                <Th align="right" className="pr-6">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/40">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-6 py-4"><div className="skeleton h-5 w-24" /></td>
                    ))}
                  </tr>
                ))
              ) : scores.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-[13px] text-text-muted">
                    No risk scores for this filter
                  </td>
                </tr>
              ) : (
                scores.map((score) => {
                  const initials = score.employee_id?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || '??';
                  const isCritical = score.risk_class === 'Critical';
                  return (
                    <tr
                      key={score._id}
                      onClick={() => setSelected(score)}
                      className={clsx(
                        'border-b border-border/40 hover:bg-surface-2/50 transition-colors cursor-pointer',
                        isCritical && 'border-l-[3px] border-l-accent-red bg-accent-red/[0.03]'
                      )}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-accent-blue/20 flex items-center justify-center text-accent-blue text-[11px] font-heading font-semibold shrink-0">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <div className="text-[13.5px] text-white font-medium truncate">{score.employee_id?.name || 'Unknown'}</div>
                            <div className="text-[11.5px] text-text-muted mt-0.5 truncate">{score.employee_id?.department}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-1.5 bg-surface-2 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${Math.min(score.risk_score, 100)}%`,
                                backgroundColor: RISK_COLORS[score.risk_class],
                              }}
                            />
                          </div>
                          <span className="text-[13px] font-mono text-white tabular-nums w-8 text-right">{Math.round(score.risk_score)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <RiskBadge level={score.risk_class} size="sm" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <span className={clsx(
                            'w-1.5 h-1.5 rounded-full',
                            score.ml_status === 'predicted' ? 'bg-accent-purple' : 'bg-text-muted'
                          )} />
                          <span className={clsx(
                            'text-[11.5px] font-mono font-medium',
                            score.ml_status === 'predicted' ? 'text-accent-purple' : 'text-text-muted'
                          )}>
                            {score.ml_status === 'predicted' ? 'ML' : 'Formula'}
                          </span>
                          {score.confidence_label && (
                            <span className="text-[11px] text-text-muted ml-1">· {score.confidence_label}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {score.top_drivers?.[0] ? (
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-[12px] text-white font-medium truncate">
                              {score.top_drivers[0].feature.replace(/_/g, ' ')}
                            </span>
                            <span className={clsx(
                              'text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0',
                              score.top_drivers[0].impact === 'high'
                                ? 'bg-accent-red/15 text-accent-red'
                                : score.top_drivers[0].impact === 'moderate'
                                ? 'bg-accent-amber/15 text-accent-amber'
                                : 'bg-surface-3 text-text-muted'
                            )}>
                              {score.top_drivers[0].impact}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[12px] text-text-muted">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <IconBtn onClick={() => setSelected(score)} title="View details" tone="blue">
                            <Eye size={14} strokeWidth={2} />
                          </IconBtn>
                          {hasRole('admin', 'hr_manager') && (
                            <>
                              <IconBtn onClick={() => handleDecision(score, 'accept')} title="Accept prediction" tone="teal">
                                <Check size={14} strokeWidth={2} />
                              </IconBtn>
                              <IconBtn onClick={() => setSelected({ ...score, rejecting: true })} title="Reject & correct" tone="red">
                                <X size={14} strokeWidth={2} />
                              </IconBtn>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      {selected && (
        <DetailModal
          score={selected}
          onClose={() => setSelected(null)}
          onDecision={handleDecision}
          canDecide={hasRole('admin', 'hr_manager')}
        />
      )}

      {retrainModal && (
        <RetrainModal
          state={retrainModal}
          onClose={() => setRetrainModal(null)}
        />
      )}
    </div>
  );
}

/* ─── helpers ─── */

function Stat({ label, value, color = 'white' }) {
  const colorClass = color === 'teal' ? 'text-accent-teal' : color === 'purple' ? 'text-accent-purple' : color === 'red' ? 'text-accent-red' : 'text-white';
  return (
    <div>
      <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-text-muted mb-1">{label}</div>
      <div className={clsx('text-[14px] font-heading font-semibold tabular-nums', colorClass)}>{value}</div>
    </div>
  );
}

function FilterPills({ label, value, options, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted">{label}:</span>
      <div className="flex gap-1">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={clsx(
              'text-[11.5px] font-heading font-medium px-2.5 py-1 rounded-md transition-colors',
              value === opt
                ? 'bg-accent-blue text-white'
                : 'text-text-secondary hover:text-white hover:bg-surface-2'
            )}
          >
            {opt}
          </button>
        ))}
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

function IconBtn({ onClick, title, tone, children }) {
  const toneClass = {
    blue: 'hover:text-accent-blue hover:bg-accent-blue/10',
    teal: 'hover:text-accent-teal hover:bg-accent-teal/10',
    red:  'hover:text-accent-red hover:bg-accent-red/10',
  }[tone];
  return (
    <button
      onClick={onClick}
      title={title}
      className={clsx('w-8 h-8 rounded-md text-text-muted transition-colors flex items-center justify-center', toneClass)}
    >
      {children}
    </button>
  );
}

/* ─── Retrain progress / results modal ─── */

const TRAIN_STEPS = [
  'Fetching HR-corrected labels from database',
  'Applying SMOTE to balance risk classes',
  'Training Random Forest (200 trees)',
  'Evaluating on held-out test month',
];

function RetrainModal({ state, onClose }) {
  const running = state === 'running';
  const [visibleSteps, setVisibleSteps] = useState(running ? 0 : TRAIN_STEPS.length);

  useEffect(() => {
    if (!running) { setVisibleSteps(TRAIN_STEPS.length); return; }
    setVisibleSteps(0);
    const timings = [0, 1800, 4000, 7000];
    const timers = timings.map((delay, i) =>
      setTimeout(() => setVisibleSteps(i + 1), delay)
    );
    return () => timers.forEach(clearTimeout);
  }, [running]);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 fade-in">
      <div className="relative w-full max-w-md bg-surface-1 border border-border rounded-xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className={clsx(
          'px-7 pt-7 pb-6 border-b border-border',
          !running && 'border-accent-teal/20'
        )}>
          <div className="flex items-center gap-3">
            <div className={clsx(
              'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
              running ? 'bg-accent-purple/15 border border-accent-purple/30' : 'bg-accent-teal/15 border border-accent-teal/30'
            )}>
              {running
                ? <Loader2 size={18} className="text-accent-purple animate-spin" strokeWidth={2} />
                : <CheckCircle2 size={18} className="text-accent-teal" strokeWidth={2} />}
            </div>
            <div>
              <div className="text-[15px] font-heading font-bold text-white leading-tight">
                {running ? 'Retraining Model…' : 'Model Updated'}
              </div>
              <div className="text-[12px] text-text-muted mt-0.5">
                Stage 2 · HR-corrected labels
              </div>
            </div>
          </div>
        </div>

        <div className="px-7 py-6 space-y-5">
          {/* Steps */}
          <div className="space-y-3">
            {TRAIN_STEPS.map((step, i) => {
              const done = !running || i < visibleSteps - 1;
              const active = running && i === visibleSteps - 1;
              const pending = running && i >= visibleSteps;
              return (
                <div key={i} className={clsx('flex items-center gap-3 transition-opacity duration-500', pending && 'opacity-30')}>
                  <div className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center">
                    {done && <CheckCircle2 size={18} className="text-accent-teal" strokeWidth={2} />}
                    {active && <Loader2 size={18} className="text-accent-purple animate-spin" strokeWidth={2} />}
                    {pending && <div className="w-4 h-4 rounded-full border-2 border-border" />}
                  </div>
                  <span className={clsx(
                    'text-[13px] font-medium',
                    done ? 'text-white' : active ? 'text-accent-purple' : 'text-text-muted'
                  )}>
                    {step}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Results — only when done */}
          {!running && state?.accuracy_test !== undefined && (
            <div className="pt-2 border-t border-border space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 size={13} className="text-accent-blue" strokeWidth={2} />
                <span className="text-[12px] font-heading font-semibold text-white uppercase tracking-wider">Training Results</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <ResultCard label="Test Accuracy" value={`${(state.accuracy_test * 100).toFixed(1)}%`} color="teal" />
                {state.accuracy_validation && (
                  <ResultCard label="Val Accuracy" value={`${(state.accuracy_validation * 100).toFixed(1)}%`} color="blue" />
                )}
                {state.f1_macro && (
                  <ResultCard label="F1 (macro)" value={state.f1_macro.toFixed(3)} color="purple" />
                )}
                {state.samples_used && (
                  <ResultCard label="Samples Used" value={state.samples_used.toLocaleString()} color="white" />
                )}
              </div>
              <p className="text-[11.5px] text-text-muted leading-relaxed pt-1">
                Model is live. New <span className="text-accent-purple font-mono">/predict</span> calls will use this updated model.
              </p>
            </div>
          )}

          {!running && (
            <button
              onClick={onClose}
              className="w-full bg-surface-2 hover:bg-surface-3 text-text-secondary hover:text-white py-2.5 rounded-lg text-[13px] font-heading font-semibold transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ResultCard({ label, value, color }) {
  const colorClass = {
    teal: 'text-accent-teal',
    blue: 'text-accent-blue',
    purple: 'text-accent-purple',
    white: 'text-white',
  }[color];
  return (
    <div className="bg-surface-2 border border-border rounded-lg px-4 py-3">
      <div className={clsx('text-[20px] font-heading font-bold tabular-nums leading-tight', colorClass)}>{value}</div>
      <div className="text-[10px] text-text-muted uppercase tracking-wider mt-1 font-heading">{label}</div>
    </div>
  );
}

/* ─── Detail / SHAP modal ─── */

function DetailModal({ score, onClose, onDecision, canDecide }) {
  const [correctedClass, setCorrectedClass] = useState(score.risk_class);
  const initials = score.employee_id?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || '??';

  const shapEntries = score.shap_values
    ? Object.entries(score.shap_values).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
    : [];
  const maxAbs = Math.max(0.01, ...shapEntries.map(([, v]) => Math.abs(v)));

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-surface-1 border border-border rounded-xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-md text-text-muted hover:text-white hover:bg-surface-2 flex items-center justify-center transition-colors z-10"
        >
          <X size={15} strokeWidth={2} />
        </button>

        {/* Header */}
        <div className="px-7 pt-7 pb-6 border-b border-border">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-accent-blue/20 flex items-center justify-center text-accent-blue text-sm font-heading font-semibold shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-heading font-bold text-white leading-tight">
                {score.employee_id?.name}
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="text-[12px] text-text-secondary">{score.employee_id?.department}</span>
                <span className="w-1 h-1 rounded-full bg-text-muted" />
                <span className="text-[12px] text-text-secondary font-mono">{score.month}</span>
                <span className="w-1 h-1 rounded-full bg-text-muted" />
                <span className="text-[12px] font-mono tabular-nums text-white">Score {Math.round(score.risk_score)}</span>
              </div>
            </div>
            <RiskBadge level={score.risk_class} />
          </div>
          {score.confidence_label && (
            <div className="flex items-center gap-2 mt-3 px-3 py-1.5 bg-accent-purple/10 border border-accent-purple/20 rounded-md w-fit">
              <Zap size={12} className="text-accent-purple" strokeWidth={2} />
              <span className="text-[11.5px] text-accent-purple font-mono">
                ML Prediction · {score.confidence_label} ({(score.confidence * 100).toFixed(0)}%)
              </span>
            </div>
          )}
        </div>

        {/* SHAP */}
        <div className="px-7 pt-6 pb-7 space-y-6">
          {shapEntries.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[13px] font-heading font-semibold text-white">Feature Contributions (SHAP)</h3>
                <span className="text-[11px] text-text-muted font-mono">
                  Base: {score.shap_base_value?.toFixed(3)}
                </span>
              </div>
              <p className="text-[12px] text-text-secondary mb-4 leading-relaxed">
                Red bars push toward higher risk. Teal bars push toward lower risk.
              </p>
              <div className="space-y-2">
                {shapEntries.map(([feature, value]) => {
                  const pct = (Math.abs(value) / maxAbs) * 48;
                  const positive = value > 0;
                  return (
                    <div key={feature} className="flex items-center gap-3">
                      <span className="text-[12px] text-text-secondary w-36 shrink-0 truncate font-mono">
                        {feature.replace(/_/g, ' ')}
                      </span>
                      <div className="flex-1 h-5 relative">
                        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border-hover" />
                        <div
                          className="absolute top-1/2 -translate-y-1/2 h-[7px] rounded-sm"
                          style={{
                            left: positive ? '50%' : `${50 - pct}%`,
                            width: `${pct}%`,
                            backgroundColor: positive ? '#EF4444' : '#14B8A6',
                          }}
                        />
                      </div>
                      <span className={clsx(
                        'text-[12px] font-mono tabular-nums w-14 text-right',
                        positive ? 'text-accent-red' : 'text-accent-teal'
                      )}>
                        {positive ? '+' : ''}{value.toFixed(3)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {score.top_drivers?.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Info size={13} className="text-accent-blue" strokeWidth={2} />
                <h3 className="text-[13px] font-heading font-semibold text-white">Top Risk Drivers</h3>
              </div>
              <div className="space-y-2">
                {score.top_drivers.map((td, i) => (
                  <div key={i} className="bg-surface-2 border border-border rounded-lg px-4 py-3">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[13px] text-white font-heading font-semibold capitalize">
                        {td.feature.replace(/_/g, ' ')}
                      </span>
                      <span className={clsx(
                        'text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded',
                        td.impact === 'high'
                          ? 'bg-accent-red/15 text-accent-red'
                          : td.impact === 'moderate'
                          ? 'bg-accent-amber/15 text-accent-amber'
                          : 'bg-surface-3 text-text-secondary'
                      )}>
                        {td.impact} impact
                      </span>
                    </div>
                    <div className="text-[12.5px] text-text-secondary leading-relaxed">{td.explanation}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Reject & correct form */}
          {score.rejecting && canDecide && (
            <section className="pt-4 border-t border-border">
              <h3 className="text-[13px] font-heading font-semibold text-accent-red mb-3">Reject & Correct</h3>
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <label className="block text-[11px] text-text-secondary mb-1.5 uppercase tracking-wider font-medium">
                    Corrected class
                  </label>
                  <div className="relative">
                    <select
                      value={correctedClass}
                      onChange={(e) => setCorrectedClass(e.target.value)}
                      className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-[13.5px] text-white appearance-none pr-9 focus:border-accent-red focus:ring-2 focus:ring-accent-red/20 transition-all"
                    >
                      {['Low', 'Medium', 'High', 'Critical'].map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                  </div>
                </div>
                <button
                  onClick={() => onDecision(score, 'reject', correctedClass)}
                  className="bg-accent-red hover:bg-accent-red/90 text-white text-[13px] font-heading font-semibold px-5 py-2.5 rounded-lg transition-colors"
                >
                  Submit correction
                </button>
              </div>
              <p className="text-[11.5px] text-text-muted mt-3 leading-relaxed">
                This decision becomes a label for stage-2 retraining.
              </p>
            </section>
          )}

          <button
            onClick={onClose}
            className="w-full bg-surface-2 hover:bg-surface-3 text-text-secondary hover:text-white py-2.5 rounded-lg text-[13px] font-heading font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
