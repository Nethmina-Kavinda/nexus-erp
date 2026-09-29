import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  RefreshCw, Check, X, Eye, Pencil, Sparkles, Info, CheckCircle2, Loader2, BarChart3, AlertTriangle, ShieldCheck,
} from 'lucide-react';
import clsx from 'clsx';
import { riskService, decisionService } from '../services/api';
import { useFetch } from '../hooks/useFetch';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import RiskBadge from '../components/RiskBadge';
import ScoreBar from '../components/ScoreBar';
import ErrorBanner from '../components/ErrorBanner';
import Panel from '../components/Panel';
import { Avatar, Button, EmptyState, Modal, Pill, Segmented, Select, SkeletonRows, Th } from '../components/ui';
import { useDepartments } from '../hooks/useDepartments';
import { RISK_COLORS, RISK_TIERS, formatMonth, humanize } from '../lib/format';

const RISK_CLASSES = ['All', ...RISK_TIERS];
const WRL_THRESHOLD = 30;
const REVIEW_FILTERS = ['all', 'awaiting', 'reviewed'];

export default function RiskScoring() {
  const [month] = useState('2026-03');
  const [searchParams] = useSearchParams();
  // Dashboard links here with ?dept=<name> / ?tier=<tier> to pre-filter the table
  const [department, setDepartment] = useState(() => {
    const dept = searchParams.get('dept');
    return dept || 'All';
  });
  const [riskClass, setRiskClass] = useState(() => {
    const t = searchParams.get('tier');
    return RISK_CLASSES.includes(t) ? t : 'All';
  });
  // Review status is filtered client-side so tier counts and WRL still cover every row.
  const [review, setReview] = useState(() => {
    const r = searchParams.get('review');
    return REVIEW_FILTERS.includes(r) ? r : 'all';
  });
  const [selected, setSelected] = useState(null);
  const [submitting, setSubmitting] = useState(null); // score _id while a decision is in flight
  const [retraining, setRetraining] = useState(false);
  const [retrainModal, setRetrainModal] = useState(null); // null | 'running' | { result }
  const { hasRole } = useAuth();
  const { names: departmentNames } = useDepartments();
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
  const awaitingCount = scores.filter((s) => !s.review).length;
  const rows = review === 'all' ? scores
    : scores.filter((s) => (review === 'awaiting' ? !s.review : !!s.review));
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

  const handleSelectScore = async (score) => {
    if (score.ml_status === 'predicted') {
      setSelected(score);
      return;
    }

    setSelected(score);
    try {
      const res = await riskService.predict(score.employee_id?._id, score.month);
      const prediction = res.data?.data || res.data;
      if (prediction) {
        prediction.employee_id = score.employee_id;
        prediction.review = score.review;
        setSelected(prediction);
        refetch();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to load SHAP details');
    }
  };

  const handleDecision = async (score, decision, correctedClass) => {
    if (score.review || submitting) return;
    setSubmitting(score._id);
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
      if (err.response?.status === 409) { setSelected(null); refetch(); }
    } finally {
      setSubmitting(null);
    }
  };

  const canDecide = hasRole('admin', 'hr_manager');
  const aboveThreshold = parseFloat(wrl) >= WRL_THRESHOLD;
  const filtered = department !== 'All' || riskClass !== 'All';

  return (
    <div className="space-y-6">
      <ErrorBanner error={error} onRetry={refetch} />

      {/* Summary row */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr_1fr] gap-5">
        {/* WRL */}
        <div className="bg-surface border border-line rounded-2xl shadow-card p-6 flex flex-col">
          <div className="text-[15px] font-semibold text-fg-2">Workforce risk level</div>
          <div className="flex items-baseline gap-1 mt-3">
            <span className="text-[46px] font-extrabold text-fg leading-none tracking-tight">{wrl}</span>
            <span className="text-[23.5px] font-bold text-fg-3">%</span>
          </div>
          <p className="text-[14.5px] text-fg-3 mt-2">
            of {filtered ? 'filtered' : 'scored'} employees are High or Critical
          </p>
          <div className="mt-auto pt-4">
            {aboveThreshold
              ? <Pill tone="danger" icon={AlertTriangle}>Above the {WRL_THRESHOLD}% alert line</Pill>
              : <Pill tone="good" icon={CheckCircle2}>Below the {WRL_THRESHOLD}% alert line</Pill>}
          </div>
        </div>

        {/* Distribution */}
        <div className="bg-surface border border-line rounded-2xl shadow-card p-6">
          <div className="flex items-center justify-between">
            <div className="text-[15px] font-semibold text-fg-2">Distribution by tier</div>
            <span className="text-[14.5px] text-fg-3">{total} {total === 1 ? 'employee' : 'employees'}</span>
          </div>
          <div className="h-3 rounded-full overflow-hidden flex gap-[2px] bg-surface-2 mt-5">
            {RISK_TIERS.map((cls) => {
              const pct = total > 0 ? (dist[cls] / total) * 100 : 0;
              return pct > 0 ? (
                <div key={cls} title={`${cls}: ${dist[cls]}`} style={{ width: `${pct}%`, backgroundColor: RISK_COLORS[cls] }} className="transition-all duration-500" />
              ) : null;
            })}
          </div>
          <div className="grid grid-cols-4 gap-3 mt-5">
            {RISK_TIERS.map((cls) => (
              <button
                key={cls}
                onClick={() => setRiskClass(riskClass === cls ? 'All' : cls)}
                className={clsx(
                  'text-left rounded-xl px-3 py-2.5 transition-colors',
                  riskClass === cls ? 'bg-surface-2 ring-1 ring-line-strong' : 'hover:bg-surface-2'
                )}
                title={`Show ${cls} only`}
              >
                <div className="flex items-center gap-1.5 text-[14px] text-fg-3 font-medium">
                  <span className="w-2 h-2 rounded-sm shrink-0" style={{ backgroundColor: RISK_COLORS[cls] }} />
                  {cls}
                </div>
                <div className="text-[23.5px] font-extrabold text-fg mt-0.5 tnum">{dist[cls]}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Model */}
        <div className="bg-surface border border-line rounded-2xl shadow-card p-6 flex flex-col">
          <div className="flex items-center justify-between">
            <div className="text-[15px] font-semibold text-fg-2">Prediction model</div>
            {mlStatus?.model_loaded
              ? <Pill tone="good" dot>Online</Pill>
              : <Pill tone="danger" dot>Offline</Pill>}
          </div>
          <dl className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <dt className="text-[14px] text-fg-3">Stage</dt>
              <dd className="text-[17.5px] font-bold text-fg mt-0.5">{mlStatus?.model_stage ? mlStatus.model_stage.replace('_', ' ').replace(/^./, (c) => c.toUpperCase()) : '—'}</dd>
            </div>
            <div>
              <dt className="text-[14px] text-fg-3">Accuracy</dt>
              <dd className="text-[17.5px] font-bold text-fg mt-0.5">{mlStatus?.accuracy ? `${(mlStatus.accuracy * 100).toFixed(0)}%` : '—'}</dd>
            </div>
          </dl>
          <p className="text-[14px] text-fg-3 mt-3">
            Random Forest with SHAP explanations
            {mlStatus?.trained_at && <> · last trained {timeAgo(mlStatus.trained_at)}</>}
          </p>
          {canDecide && (
            <RetrainControl
              running={retraining}
              disabled={!mlStatus?.model_loaded}
              onConfirm={handleRetrain}
            />
          )}
        </div>
      </div>

      {/* Table */}
      <Panel
        noPadding
        title="Employee risk"
        subtitle={loading ? 'Loading…' : `${rows.length === total ? total : `${rows.length} of ${total}`} ${total === 1 ? 'record' : 'records'} · select a row to see why`}
        action={
          <div className="w-[180px]">
            <Select value={department} onChange={(e) => setDepartment(e.target.value)} aria-label="Department">
              {['All', ...departmentNames].map((d) => <option key={d} value={d}>{d === 'All' ? 'All departments' : d}</option>)}
            </Select>
          </div>
        }
      >
        <div className="px-6 pb-4 flex flex-wrap items-center gap-3">
          <Segmented value={riskClass} options={RISK_CLASSES.map((c) => ({ value: c, label: c === 'All' ? 'All tiers' : c }))} onChange={setRiskClass} />
          <Segmented
            className="sm:ml-auto"
            value={review}
            onChange={setReview}
            options={[
              { value: 'all', label: 'Any status' },
              { value: 'awaiting', label: <CountLabel text="Awaiting review" count={loading ? null : awaitingCount} tone={awaitingCount ? 'warn' : 'good'} /> },
              { value: 'reviewed', label: <CountLabel text="Reviewed" count={loading ? null : total - awaitingCount} tone="neutral" /> },
            ]}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <Th className="pl-6">Employee</Th>
                <Th className="w-44">Score</Th>
                <Th>Tier</Th>
                <Th className="hidden min-[1400px]:table-cell">Source</Th>
                <Th>Main driver</Th>
                <Th align="right" className="pr-6">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {loading ? <SkeletonRows rows={8} cols={6} /> : rows.map((score) => (
                <tr
                  key={score._id}
                  onClick={() => handleSelectScore(score)}
                  className="border-t border-line hover:bg-surface-2/50 transition-colors cursor-pointer"
                >
                  <td className="pl-6 pr-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar name={score.employee_id?.name} />
                      <div className="min-w-0">
                        <div className="text-[15px] text-fg font-semibold truncate">{score.employee_id?.name || 'Unknown'}</div>
                        <div className="text-[14px] text-fg-3 mt-0.5 truncate">{score.employee_id?.department}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5"><ScoreBar score={score.risk_score} tier={score.risk_class} /></td>
                  <td className="px-5 py-3.5"><RiskBadge level={score.risk_class} size="sm" /></td>
                  <td className="px-5 py-3.5 whitespace-nowrap hidden min-[1400px]:table-cell">
                    {score.ml_status === 'predicted'
                      ? <Pill tone="primary" icon={Sparkles}>ML{score.confidence_label ? ` · ${score.confidence_label}` : ''}</Pill>
                      : <Pill>Formula</Pill>}
                  </td>
                  <td className="px-5 py-3.5">
                    {score.top_drivers?.[0] ? (
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[14.5px] text-fg font-medium truncate">{humanize(score.top_drivers[0].feature)}</span>
                        <span className="hidden min-[1400px]:inline-flex"><ImpactPill impact={score.top_drivers[0].impact} /></span>
                      </div>
                    ) : (
                      <span className="text-[14.5px] text-fg-3">—</span>
                    )}
                  </td>
                  <td className="pl-5 pr-6 py-3.5" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <ActionBtn onClick={() => setSelected(score)} label="View details">
                        <Eye size={16} strokeWidth={2} />
                      </ActionBtn>
                      {score.review ? (
                        <ReviewPill review={score.review} />
                      ) : canDecide && (
                        <>
                          <ActionBtn onClick={() => handleDecision(score, 'accept')} label="Accept prediction" tone="good" disabled={!!submitting}>
                            {submitting === score._id ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} strokeWidth={2.25} />}
                          </ActionBtn>
                          <ActionBtn onClick={() => setSelected({ ...score, rejecting: true })} label="Reject and correct" tone="danger" disabled={!!submitting}>
                            <X size={16} strokeWidth={2.25} />
                          </ActionBtn>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && rows.length === 0 && (
            review === 'awaiting' && scores.length > 0
              ? <EmptyState icon={CheckCircle2} title="Nothing awaiting review" text="Every prediction in this view has an HR decision." className="border-t border-line" />
              : <EmptyState icon={ShieldCheck} title="No employees in this view" text="Try another department, tier or review status." className="border-t border-line" />
          )}
        </div>
      </Panel>

      {selected && (
        <DetailModal
          score={selected}
          onClose={() => setSelected(null)}
          onDecision={handleDecision}
          canDecide={canDecide}
          submitting={submitting === selected._id}
        />
      )}

      {retrainModal && (
        <RetrainModal state={retrainModal} onClose={() => setRetrainModal(null)} />
      )}
    </div>
  );
}

/* ─── helpers ─── */

/** '2026-09-26T10:00:00' → '3 days ago' (falls back to the date). */
function timeAgo(iso) {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return '';
  const mins = Math.round((Date.now() - t) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} h ago`;
  const days = Math.round(hrs / 24);
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
  return new Date(t).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

/**
 * Retrain button with a confirm step, since retraining replaces the live model.
 * Idle → soft primary button · click → inline "are you sure?" · confirm → runs.
 */
function RetrainControl({ running, disabled, onConfirm }) {
  const [confirming, setConfirming] = useState(false);

  if (running) {
    return (
      <div className="mt-auto pt-4" aria-live="polite">
        <div className="w-full h-11 rounded-xl bg-primary-soft text-primary-fg font-semibold text-[15px] flex items-center justify-center gap-2.5">
          <Loader2 size={17} className="animate-spin" /> Retraining the model…
        </div>
      </div>
    );
  }

  if (confirming) {
    return (
      <div className="mt-auto pt-4 fade-in" role="group" aria-label="Confirm retrain">
        <p className="text-[14px] text-fg-2 mb-2.5">
          Retrain on the latest HR feedback? The new model replaces the current one.
        </p>
        <div className="flex gap-2.5">
          <Button variant="secondary" className="flex-1" onClick={() => setConfirming(false)} autoFocus>Cancel</Button>
          <Button className="flex-1" icon={RefreshCw} onClick={() => { setConfirming(false); onConfirm(); }}>Yes, retrain</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-auto pt-4">
      <button
        type="button"
        onClick={() => setConfirming(true)}
        disabled={disabled}
        title={disabled ? 'The ML service is offline' : 'Retrain with HR corrections'}
        className="group w-full h-11 rounded-xl bg-primary-soft text-primary-fg font-semibold text-[15px] flex items-center justify-center gap-2.5 transition-colors hover:bg-primary hover:text-on-primary focus-visible:bg-primary focus-visible:text-on-primary disabled:opacity-50 disabled:hover:bg-primary-soft disabled:hover:text-primary-fg"
      >
        <RefreshCw size={17} strokeWidth={2.2} className="transition-transform duration-500 group-hover:rotate-180" />
        Retrain model
      </button>
    </div>
  );
}

// Impact is deliberately neutral so it never reads as a risk tier.
function ImpactPill({ impact }) {
  const label = impact ? impact.charAt(0).toUpperCase() + impact.slice(1) : '';
  return (
    <Pill className="shrink-0">
      <span className="flex gap-[2px]" aria-hidden>
        {[0, 1, 2].map((i) => (
          <span key={i} className={clsx('w-1 h-2.5 rounded-[1px]',
            i < (impact === 'high' ? 3 : impact === 'moderate' ? 2 : 1) ? 'bg-fg-2' : 'bg-line-strong')} />
        ))}
      </span>
      {label} impact
    </Pill>
  );
}

function ActionBtn({ onClick, label, tone, disabled, children }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={clsx(
        'w-8 h-8 rounded-lg text-fg-3 transition-colors flex items-center justify-center disabled:opacity-40 disabled:pointer-events-none',
        tone === 'good' ? 'hover:text-good-fg hover:bg-good-soft'
          : tone === 'danger' ? 'hover:text-danger-fg hover:bg-danger-soft'
          : 'hover:text-primary-fg hover:bg-primary-soft'
      )}
    >
      {children}
    </button>
  );
}

/** Segmented-control label with a small count badge. */
function CountLabel({ text, count, tone }) {
  const tones = { warn: 'bg-warn-soft text-warn-fg', good: 'bg-good-soft text-good-fg', neutral: 'bg-surface-3 text-fg-2' };
  return (
    <span className="inline-flex items-center gap-1.5">
      {text}
      {count != null && (
        <span className={clsx('min-w-[20px] px-1.5 rounded-full text-[12px] font-bold leading-5 tnum', tones[tone])}>{count}</span>
      )}
    </span>
  );
}

/** Replaces the accept/reject buttons once HR has reviewed a prediction. */
function ReviewPill({ review }) {
  const who = [review.decided_by, review.decided_at && new Date(review.decided_at).toLocaleDateString()].filter(Boolean).join(' · ');
  return (
    <span title={who ? `Reviewed by ${who}` : 'Reviewed'} className="ml-1">
      {review.decision === 'accept'
        ? <Pill tone="good" icon={Check}>Accepted</Pill>
        : <Pill tone="warn" icon={Pencil}>Corrected</Pill>}
    </span>
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
    <Modal
      onClose={onClose}
      dismissable={!running}
      title={running ? 'Retraining the model…' : 'Model updated'}
      subtitle="Stage 2 · trained on HR-corrected labels"
      icon={
        <div className={clsx(
          'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
          running ? 'bg-primary-soft text-primary-fg' : 'bg-good-soft text-good-fg'
        )}>
          {running ? <Loader2 size={19} className="animate-spin" strokeWidth={2} /> : <CheckCircle2 size={19} strokeWidth={2} />}
        </div>
      }
    >
      <div className="px-6 pb-6 space-y-5">
        <ol className="space-y-3">
          {TRAIN_STEPS.map((step, i) => {
            const done = !running || i < visibleSteps - 1;
            const active = running && i === visibleSteps - 1;
            const pending = running && i >= visibleSteps;
            return (
              <li key={i} className={clsx('flex items-center gap-3 transition-opacity duration-500', pending && 'opacity-40')}>
                <span className="w-5 h-5 shrink-0 flex items-center justify-center">
                  {done && <CheckCircle2 size={18} className="text-good-fg" strokeWidth={2} />}
                  {active && <Loader2 size={18} className="text-primary-fg animate-spin" strokeWidth={2} />}
                  {pending && <span className="w-4 h-4 rounded-full border-2 border-line-strong" />}
                </span>
                <span className={clsx('text-[15px]', done ? 'text-fg font-medium' : active ? 'text-primary-fg font-semibold' : 'text-fg-3')}>
                  {step}
                </span>
              </li>
            );
          })}
        </ol>

        {!running && state?.accuracy_test !== undefined && (
          <div className="pt-5 border-t border-line">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 size={15} className="text-primary-fg" strokeWidth={2} />
              <span className="text-[15px] font-bold text-fg">Results</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <ResultCard label="Test accuracy" value={`${(state.accuracy_test * 100).toFixed(1)}%`} />
              {state.accuracy_validation && (
                <ResultCard label="Validation accuracy" value={`${(state.accuracy_validation * 100).toFixed(1)}%`} />
              )}
              {state.f1_macro && <ResultCard label="F1 (macro)" value={state.f1_macro.toFixed(3)} />}
              {state.samples_used && <ResultCard label="Samples used" value={state.samples_used.toLocaleString()} />}
            </div>
            <p className="text-[14px] text-fg-3 leading-relaxed mt-3">
              The updated model is live — new predictions will use it.
            </p>
          </div>
        )}

        {!running && (
          <Button variant="secondary" className="w-full" onClick={onClose}>Close</Button>
        )}
      </div>
    </Modal>
  );
}

function ResultCard({ label, value }) {
  return (
    <div className="bg-surface-2 rounded-xl px-4 py-3">
      <div className="text-[13.5px] text-fg-3 font-medium">{label}</div>
      <div className="text-[21.5px] font-extrabold text-fg tnum mt-0.5">{value}</div>
    </div>
  );
}

/* ─── Detail / SHAP modal ─── */

const TIER_RANGES = { Low: '0–25', Medium: '26–50', High: '51–75', Critical: '76–100' };
const IMPACT_ACCENT = { high: 'var(--danger)', moderate: 'var(--warn)', low: 'var(--fg-3)' };

function DetailModal({ score, onClose, onDecision, canDecide, submitting }) {
  const [correcting, setCorrecting] = useState(!!score.rejecting);
  // Default the correction to the adjacent tier above (most HR corrections raise risk).
  const tierIdx = RISK_TIERS.indexOf(score.risk_class);
  const [correctedClass, setCorrectedClass] = useState(RISK_TIERS[tierIdx + 1] || RISK_TIERS[tierIdx - 1]);
  const decidable = canDecide && !score.review;
  const isML = score.ml_status === 'predicted';
  const pct = Math.max(0, Math.min(100, score.risk_score || 0));

  const shapEntries = score.shap_values
    ? Object.entries(score.shap_values).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
    : [];
  const maxAbs = Math.max(0.01, ...shapEntries.map(([, v]) => Math.abs(v)));

  let footer;
  if (score.review) {
    footer = (
      <div className="flex items-center gap-3">
        <ReviewSummary review={score.review} month={score.month} />
        <Button variant="secondary" className="ml-auto shrink-0" onClick={onClose}>Close</Button>
      </div>
    );
  } else if (!decidable) {
    footer = <div className="flex justify-end"><Button variant="secondary" onClick={onClose}>Close</Button></div>;
  } else if (correcting) {
    footer = (
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="inline-flex items-center gap-1.5 mr-auto">
          <RiskBadge level={score.risk_class} size="sm" />
          <span className="text-fg-3">→</span>
          <RiskBadge level={correctedClass} size="sm" />
        </span>
        <Button variant="ghost" onClick={() => setCorrecting(false)} disabled={submitting}>Cancel</Button>
        <Button variant="danger" icon={Pencil} disabled={submitting} onClick={() => onDecision(score, 'reject', correctedClass)}>
          {submitting ? 'Submitting…' : 'Submit correction'}
        </Button>
      </div>
    );
  } else {
    footer = (
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="text-[14px] text-fg-3 mr-auto">
          Is <strong className="text-fg font-semibold">{score.risk_class}</strong> right for this employee?
        </span>
        <Button variant="secondary" icon={Pencil} onClick={() => setCorrecting(true)} disabled={submitting}>Correct tier</Button>
        <Button icon={Check} onClick={() => onDecision(score, 'accept')} disabled={submitting}>
          {submitting ? 'Submitting…' : 'Accept prediction'}
        </Button>
      </div>
    );
  }

  return (
    <Modal
      size="xl"
      onClose={onClose}
      title={score.employee_id?.name}
      subtitle={[score.employee_id?.department, score.employee_id?.position, formatMonth(score.month, 'long')].filter(Boolean).join(' · ')}
      icon={<Avatar name={score.employee_id?.name} size="lg" />}
      footer={footer}
    >
      <div className="px-6 py-6 space-y-7">
        {/* Summary tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-xl border border-line p-4">
            <div className="text-[13.5px] font-semibold text-fg-3">Risk score</div>
            <div className="text-[30px] font-extrabold text-fg leading-none mt-2 tnum">
              {Math.round(score.risk_score)}<span className="text-[15px] text-fg-3 font-bold"> / 100</span>
            </div>
            <div className="relative h-1.5 rounded-full bg-surface-2 mt-3 overflow-hidden">
              <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${pct}%`, background: RISK_COLORS[score.risk_class] }} />
            </div>
          </div>
          <div className="rounded-xl border border-line p-4">
            <div className="text-[13.5px] font-semibold text-fg-3">Risk tier</div>
            <div className="mt-2.5"><RiskBadge level={score.risk_class} /></div>
            <div className="text-[13.5px] text-fg-3 mt-2.5">Score band {TIER_RANGES[score.risk_class] || '—'}</div>
          </div>
          <div className="rounded-xl border border-line p-4">
            <div className="text-[13.5px] font-semibold text-fg-3">Prediction source</div>
            {isML ? (
              <>
                <div className="flex items-center gap-1.5 mt-2 text-[16px] font-bold text-fg">
                  <Sparkles size={16} className="text-primary-fg" /> Random Forest
                </div>
                <div className="text-[13.5px] text-fg-3 mt-1.5">
                  {score.confidence_label} confidence{score.confidence != null && ` · ${(score.confidence * 100).toFixed(0)}%`}
                </div>
              </>
            ) : (
              <>
                <div className="mt-2 text-[16px] font-bold text-fg">Weighted formula</div>
                <div className="text-[13.5px] text-fg-3 mt-1.5">ML service unavailable for this score</div>
              </>
            )}
          </div>
        </div>

        {/* Plain-language drivers first: this is what HR acts on */}
        {score.top_drivers?.length > 0 && (
          <section>
            <SectionTitle icon={Info} title="Why this employee is flagged" hint="Top drivers, in plain language" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {score.top_drivers.map((td, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-line bg-surface-2/40 p-4 border-l-[3px] flex flex-col"
                  style={{ borderLeftColor: IMPACT_ACCENT[td.impact] || 'var(--line-strong)' }}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-surface-3 text-[12px] font-bold text-fg-2 flex items-center justify-center shrink-0">{i + 1}</span>
                    <span className="text-[15px] text-fg font-semibold truncate">{humanize(td.feature)}</span>
                  </div>
                  <p className="text-[14px] text-fg-2 leading-relaxed mt-2 flex-1">{td.explanation}</p>
                  <div className="mt-3"><ImpactPill impact={td.impact} /></div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SHAP chart */}
        {shapEntries.length > 0 && (
          <section>
            <SectionTitle
              icon={BarChart3}
              title="What moved this score"
              hint={<>SHAP contributions · base value <span className="tnum">{score.shap_base_value?.toFixed(3)}</span></>}
            />
            <div className="rounded-xl border border-line p-4">
              <div className="flex items-center gap-3 mb-2 text-[12.5px] font-semibold">
                <span className="w-[140px] shrink-0" />
                <div className="flex-1 flex">
                  <span className="flex-1 text-right pr-3 text-good-fg">← Lowers risk</span>
                  <span className="flex-1 pl-3 text-danger-fg">Raises risk →</span>
                </div>
                <span className="w-[52px] shrink-0" />
              </div>
              <div className="space-y-0.5">
                {shapEntries.map(([feature, value]) => {
                  const w = (Math.abs(value) / maxAbs) * 50;
                  const positive = value > 0;
                  return (
                    <div key={feature} className="flex items-center gap-3 rounded-lg px-2 -mx-2 py-1 hover:bg-surface-2/60">
                      <span className="text-[14.5px] text-fg-2 w-[140px] shrink-0 truncate">{humanize(feature)}</span>
                      <div className="flex-1 h-6 relative">
                        <div className="absolute left-1/2 inset-y-0 w-px bg-line-strong" />
                        <div
                          className="absolute top-1/2 -translate-y-1/2 h-3 rounded"
                          style={{
                            left: positive ? '50%' : `calc(${50 - w}% - ${w < 1 ? 3 : 0}px)`,
                            width: `max(${w}%, 3px)`,
                            background: positive ? 'var(--danger)' : 'var(--good)',
                            opacity: 0.85,
                          }}
                        />
                      </div>
                      <span className={clsx('text-[14px] font-semibold tnum w-[52px] shrink-0 text-right', positive ? 'text-danger-fg' : 'text-good-fg')}>
                        {positive ? '+' : ''}{value.toFixed(3)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Correction picker */}
        {decidable && correcting && (
          <section className="rounded-xl border border-line-strong bg-surface-2/50 p-4">
            <h4 className="text-[15.5px] font-bold text-fg">Choose the correct tier</h4>
            <p className="text-[14px] text-fg-3 mt-0.5 mb-3.5">Your correction is saved as a training label for the next Stage 2 retrain.</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" role="radiogroup" aria-label="Correct tier">
              {RISK_TIERS.map((t) => {
                const current = t === score.risk_class;
                const active = t === correctedClass;
                return (
                  <button
                    key={t}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    disabled={current}
                    onClick={() => setCorrectedClass(t)}
                    className={clsx(
                      'rounded-lg border px-3 py-2.5 text-left transition-colors disabled:opacity-45 disabled:cursor-not-allowed',
                      active ? 'border-primary bg-primary-soft' : 'border-line bg-surface hover:bg-surface-2'
                    )}
                  >
                    <RiskBadge level={t} size="sm" />
                    <div className="text-[12.5px] text-fg-3 mt-1.5">{current ? 'Current prediction' : `Score ${TIER_RANGES[t]}`}</div>
                  </button>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </Modal>
  );
}

function SectionTitle({ icon: Icon, title, hint }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 mb-3">
      <h4 className="flex items-center gap-2 text-[16px] font-bold text-fg">
        {Icon && <Icon size={16} className="text-primary-fg" strokeWidth={2} />} {title}
      </h4>
      {hint && <span className="text-[13.5px] text-fg-3">{hint}</span>}
    </div>
  );
}

function ReviewSummary({ review, month }) {
  const accepted = review.decision === 'accept';
  return (
    <div className="flex items-center gap-3 min-w-0">
      <span className={clsx(
        'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
        accepted ? 'bg-good-soft text-good-fg' : 'bg-warn-soft text-warn-fg'
      )}>
        {accepted ? <Check size={16} strokeWidth={2.25} /> : <Pencil size={15} strokeWidth={2.25} />}
      </span>
      <div className="min-w-0">
        <div className="text-[14.5px] font-semibold text-fg truncate">
          {accepted ? `Accepted as ${review.original_class}` : `Corrected ${review.original_class} → ${review.corrected_class}`}
        </div>
        <div className="text-[13px] text-fg-3 truncate">
          {review.decided_by ? `By ${review.decided_by}` : 'Reviewed'}
          {review.decided_at && ` · ${new Date(review.decided_at).toLocaleDateString()}`} · final for {formatMonth(month)}
        </div>
      </div>
    </div>
  );
}
