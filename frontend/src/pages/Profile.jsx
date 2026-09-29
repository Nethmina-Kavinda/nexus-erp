import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail, Building2, Briefcase, CalendarDays, KeyRound, LogOut, Moon, Sun, ShieldCheck,
  Check, Users, UserCheck, UserX, Brain, ClipboardCheck, ArrowRight, Package,
  Wallet, CalendarCheck, Pencil, Lock,
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../components/Toast';
import { useFetch } from '../hooks/useFetch';
import { authService } from '../services/api';
import Panel from '../components/Panel';
import RiskBadge from '../components/RiskBadge';
import ErrorBanner from '../components/ErrorBanner';
import { Avatar, Button, Field, Pill, EmptyState, inputClass } from '../components/ui';
import { formatRole, formatMonth, formatLKR } from '../lib/format';

/** What each role can do, mirroring the backend `authorize()` guards. */
const ROLE_ACCESS = {
  admin: [
    'Full access to every module',
    'Create, edit and deactivate employee accounts',
    'Assign any role, including Admin',
    'Accept or correct risk predictions and retrain the model',
    'Generate all reports',
  ],
  hr_manager: [
    'View and edit employee records',
    'Run attrition risk predictions with SHAP explanations',
    'Accept or correct predictions (human-in-the-loop)',
    'Retrain the model on HR-corrected labels (Stage 2)',
    'Generate payroll and workforce reports',
  ],
  manager: [
    'View the employee directory and dashboard',
    'Track attendance for the workforce',
    'Manage inventory stock and movements',
  ],
  employee: [
    'View your own attendance records',
    'View your own payslips',
    'Update your display name and password',
  ],
};

export default function Profile() {
  const { user } = useAuth();
  const { data: me, loading, error, refetch } = useFetch(() => authService.getMe(), []);
  const profile = me?.user || me;

  return (
    <div className="space-y-6">
      {error && <ErrorBanner error={error} onRetry={refetch} />}

      <ProfileHeader profile={profile} fallback={user} loading={loading} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6 min-w-0">
          <RoleWorkspace role={user?.role} />
          <DetailsPanel profile={profile} loading={loading} onSaved={refetch} />
        </div>
        <div className="space-y-6 min-w-0">
          <AccessPanel role={user?.role} />
          <SecurityPanel />
          <PreferencesPanel />
        </div>
      </div>
    </div>
  );
}

/* ─── Header ─── */

function ProfileHeader({ profile, fallback, loading }) {
  const p = profile || fallback || {};
  const since = p.hire_date ? new Date(p.hire_date) : null;
  const tenure = since ? monthsBetween(since, new Date()) : null;

  return (
    <section className="bg-surface border border-line rounded-2xl shadow-card p-6 flex flex-col sm:flex-row sm:items-center gap-5">
      <Avatar name={p.name} size="lg" className="!w-16 !h-16 !text-[22px]" />
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2.5">
          <h2 className="text-[22px] font-bold text-fg leading-tight truncate">{p.name || '—'}</h2>
          <Pill tone="primary" icon={ShieldCheck}>{formatRole(p.role)}</Pill>
          {profile && !profile.is_active && <Pill tone="danger">Inactive</Pill>}
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-2 text-[14.5px] text-fg-2">
          <Meta icon={Mail}>{p.email}</Meta>
          {p.department && <Meta icon={Building2}>{p.department}</Meta>}
          {loading ? <div className="skeleton h-4 w-32" /> : p.position && <Meta icon={Briefcase}>{p.position}</Meta>}
          {since && (
            <Meta icon={CalendarDays}>
              Joined {since.toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
              {tenure != null && <span className="text-fg-3"> · {formatTenure(tenure)}</span>}
            </Meta>
          )}
        </div>
      </div>
    </section>
  );
}

function Meta({ icon: Icon, children }) {
  return (
    <span className="inline-flex items-center gap-1.5 min-w-0">
      <Icon size={15} className="text-fg-3 shrink-0" />
      <span className="truncate">{children}</span>
    </span>
  );
}

/* ─── Editable details ─── */

function DetailsPanel({ profile, loading, onSaved }) {
  const { updateUser } = useAuth();
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', position: '' });
  const [saving, setSaving] = useState(false);

  const startEdit = () => {
    setForm({ name: profile?.name || '', position: profile?.position || '' });
    setEditing(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await authService.updateMe(form);
      updateUser(res.data.user);
      toast.success('Your profile was updated.');
      setEditing(false);
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not save your profile.');
    } finally {
      setSaving(false);
    }
  };

  const rows = [
    ['Full name', profile?.name],
    ['Email', profile?.email],
    ['Role', formatRole(profile?.role)],
    ['Department', profile?.department],
    ['Position', profile?.position || '—'],
    ['Hire date', profile?.hire_date ? new Date(profile.hire_date).toLocaleDateString() : '—'],
  ];

  return (
    <Panel
      title="Personal details"
      subtitle="Role, department and pay are managed by an administrator."
      action={!editing && (
        <Button variant="secondary" size="sm" icon={Pencil} onClick={startEdit} disabled={loading || !profile}>Edit</Button>
      )}
    >
      {editing ? (
        <form onSubmit={save} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Full name">
            <input className={inputClass} value={form.name} required
              onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Position">
            <input className={inputClass} value={form.position}
              onChange={(e) => setForm({ ...form, position: e.target.value })} />
          </Field>
          <div className="sm:col-span-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
            <Button type="submit" icon={Check} disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</Button>
          </div>
        </form>
      ) : (
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          {rows.map(([label, value]) => (
            <div key={label} className="min-w-0">
              <dt className="text-[13.5px] font-semibold text-fg-3">{label}</dt>
              <dd className="text-[15px] font-semibold text-fg mt-0.5 truncate">
                {loading ? <div className="skeleton h-4 w-32 mt-1" /> : (value || '—')}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </Panel>
  );
}

/* ─── Role access summary ─── */

function AccessPanel({ role }) {
  const items = ROLE_ACCESS[role] || [];
  return (
    <Panel title="Your access" subtitle={`What the ${formatRole(role)} role can do`}>
      <ul className="space-y-2.5">
        {items.map((text) => (
          <li key={text} className="flex items-start gap-2.5 text-[14.5px] text-fg-2">
            <span className="w-5 h-5 rounded-full bg-good-soft text-good-fg flex items-center justify-center shrink-0 mt-px">
              <Check size={12} strokeWidth={2.75} />
            </span>
            {text}
          </li>
        ))}
      </ul>
    </Panel>
  );
}

/* ─── Password ─── */

function SecurityPanel() {
  const toast = useToast();
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const mismatch = form.confirm && form.next !== form.confirm;

  const submit = async (e) => {
    e.preventDefault();
    if (mismatch) return;
    setSaving(true);
    try {
      await authService.changePassword(form.current, form.next);
      toast.success('Use your new password next time you sign in.', 'Password changed');
      setForm({ current: '', next: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not change your password.');
    } finally {
      setSaving(false);
    }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <Panel title="Security" subtitle="Change your sign-in password">
      <form onSubmit={submit} className="space-y-3.5">
        <Field label="Current password">
          <input type="password" autoComplete="current-password" className={inputClass} value={form.current} onChange={set('current')} required />
        </Field>
        <Field label="New password" hint="At least 6 characters">
          <input type="password" autoComplete="new-password" minLength={6} className={inputClass} value={form.next} onChange={set('next')} required />
        </Field>
        <Field label="Confirm new password" hint={mismatch ? 'Passwords do not match' : undefined}>
          <input type="password" autoComplete="new-password" className={clsx(inputClass, mismatch && '!border-danger')} value={form.confirm} onChange={set('confirm')} required />
        </Field>
        <Button type="submit" icon={KeyRound} className="w-full" disabled={saving || mismatch}>
          {saving ? 'Updating…' : 'Update password'}
        </Button>
      </form>
    </Panel>
  );
}

/* ─── Preferences ─── */

function PreferencesPanel() {
  const { isDark, toggleTheme } = useTheme();
  const { logout } = useAuth();
  return (
    <Panel title="Preferences">
      <div className="space-y-3">
        <button
          type="button"
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 p-3 rounded-xl border border-line hover:bg-surface-2 transition-colors text-left"
        >
          <span className="w-9 h-9 rounded-lg bg-primary-soft text-primary-fg flex items-center justify-center">
            {isDark ? <Moon size={17} /> : <Sun size={17} />}
          </span>
          <span className="flex-1">
            <span className="block text-[15px] font-semibold text-fg">Appearance</span>
            <span className="block text-[13.5px] text-fg-3">{isDark ? 'Dark' : 'Light'} mode · click to switch</span>
          </span>
        </button>
        <Button variant="secondary" icon={LogOut} className="w-full" onClick={logout}>Sign out</Button>
      </div>
    </Panel>
  );
}

/* ─── Role-specific workspace ─── */

function RoleWorkspace({ role }) {
  const { data, loading, error, refetch } = useFetch(() => authService.getActivity(), []);

  if (error) return <ErrorBanner error={error} onRetry={refetch} />;
  if (loading || !data) {
    return (
      <Panel title="Your workspace">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[0, 1, 2, 3].map((i) => <div key={i} className="skeleton h-20 rounded-xl" />)}
        </div>
      </Panel>
    );
  }

  if (role === 'admin') return <AdminWorkspace data={data} />;
  if (role === 'hr_manager') return <HrWorkspace data={data} />;
  if (role === 'manager') return <ManagerWorkspace data={data} />;
  return <EmployeeWorkspace data={data} />;
}

function Metric({ icon: Icon, label, value, tone = 'primary' }) {
  const tones = {
    primary: 'bg-primary-soft text-primary-fg',
    good: 'bg-good-soft text-good-fg',
    warn: 'bg-warn-soft text-warn-fg',
    danger: 'bg-danger-soft text-danger-fg',
  };
  return (
    <div className="rounded-xl border border-line p-4 min-w-0">
      <div className="flex items-center gap-2">
        <span className={clsx('w-7 h-7 rounded-lg flex items-center justify-center shrink-0', tones[tone])}>
          <Icon size={14} strokeWidth={2.1} />
        </span>
        <span className="text-[13.5px] font-semibold text-fg-3 truncate">{label}</span>
      </div>
      <div className="text-[24px] font-extrabold text-fg mt-2 leading-none tnum">{value ?? '—'}</div>
    </div>
  );
}

function QuickLink({ to, icon: Icon, children }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-2.5 px-3.5 h-10 rounded-lg border border-line text-[14.5px] font-semibold text-fg hover:bg-surface-2 transition-colors"
    >
      <Icon size={16} className="text-fg-3" />
      {children}
      <ArrowRight size={14} className="ml-auto text-fg-3" />
    </Link>
  );
}

function MlStatusRow({ ml }) {
  const online = ml?.model_loaded;
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 p-4 rounded-xl bg-surface-2/60">
      <span className="w-9 h-9 rounded-lg bg-primary-soft text-primary-fg flex items-center justify-center">
        <Brain size={17} />
      </span>
      <div className="flex-1 min-w-[160px]">
        <div className="text-[15px] font-semibold text-fg">Attrition model</div>
        <div className="text-[13.5px] text-fg-3">
          {online
            ? <>{(ml.model_stage || '').replace('_', ' ').replace(/^./, (c) => c.toUpperCase())}{ml.accuracy ? ` · ${(ml.accuracy * 100).toFixed(0)}% accuracy` : ''}</>
            : 'ML service offline — formula scoring only'}
        </div>
      </div>
      <Pill tone={online ? 'good' : 'warn'} dot>{online ? 'Online' : 'Formula only'}</Pill>
    </div>
  );
}

function AdminWorkspace({ data }) {
  const roles = ['admin', 'hr_manager', 'manager', 'employee'];
  const total = roles.reduce((s, r) => s + (data.users_by_role?.[r] || 0), 0);
  return (
    <Panel title="System administration" subtitle="Accounts, access and model health across Nexus">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Metric icon={Users} label="All accounts" value={total} />
        <Metric icon={UserCheck} label="Active" value={data.active} tone="good" />
        <Metric icon={UserX} label="Deactivated" value={data.inactive} tone="danger" />
        <Metric icon={ClipboardCheck} label="HR corrections" value={data.corrections} tone="warn" />
      </div>

      <div className="mt-5">
        <div className="text-[14.5px] font-semibold text-fg mb-2.5">Accounts by role</div>
        <div className="space-y-2">
          {roles.map((r) => {
            const n = data.users_by_role?.[r] || 0;
            return (
              <div key={r} className="flex items-center gap-3 text-[14.5px]">
                <span className="w-28 shrink-0 text-fg-2">{formatRole(r)}</span>
                <div className="flex-1 h-2 rounded-full bg-surface-2 overflow-hidden">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${total ? Math.max((n / total) * 100, n ? 2 : 0) : 0}%` }} />
                </div>
                <span className="w-10 text-right font-bold text-fg tnum">{n}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-5"><MlStatusRow ml={data.ml} /></div>
      <p className="text-[13.5px] text-fg-3 mt-2">{data.decisions} HR decisions recorded in total, {data.corrections} of them corrections used for Stage 2 training.</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-5">
        <QuickLink to="/employees" icon={Users}>Manage users</QuickLink>
        <QuickLink to="/risk" icon={Brain}>Model &amp; risk</QuickLink>
        <QuickLink to="/reports" icon={ClipboardCheck}>Reports</QuickLink>
      </div>
    </Panel>
  );
}

function HrWorkspace({ data }) {
  const made = data.decisions.accept + data.decisions.reject;
  return (
    <Panel
      title="HR review workspace"
      subtitle={data.month ? `Human-in-the-loop review for ${formatMonth(data.month, 'long')}` : 'Human-in-the-loop review'}
      action={(
        <Link to="/risk?review=awaiting" className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-primary text-on-primary hover:bg-primary-hover text-[14.5px] font-semibold">
          Open Risk Scoring <ArrowRight size={14} />
        </Link>
      )}
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Metric icon={ClipboardCheck} label="Awaiting review" value={data.queue_count} tone={data.queue_count ? 'danger' : 'good'} />
        <Metric icon={Check} label="You accepted" value={data.decisions.accept} tone="good" />
        <Metric icon={Pencil} label="You corrected" value={data.decisions.reject} tone="warn" />
        <Metric icon={Brain} label="Training labels" value={data.corrections} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">
        <div className="min-w-0">
          <div className="text-[14.5px] font-semibold text-fg mb-2">Highest risk, not yet reviewed</div>
          {data.queue.length === 0 ? (
            <EmptyState icon={Check} title="Queue is clear" text="Every prediction this month has an HR decision." className="!py-8" />
          ) : (
            <ul className="divide-y divide-line border border-line rounded-xl">
              {data.queue.map((q) => (
                <li key={q.employee._id} className="flex items-center gap-3 px-3.5 py-2.5">
                  <Avatar name={q.employee.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[14.5px] font-semibold text-fg truncate">{q.employee.name}</div>
                    <div className="text-[13px] text-fg-3">{q.employee.department} · score {Math.round(q.risk_score)}</div>
                  </div>
                  <RiskBadge level={q.risk_class} size="sm" />
                </li>
              ))}
            </ul>
          )}
          {data.queue_count > data.queue.length && (
            <p className="text-[13.5px] text-fg-3 mt-2">+{data.queue_count - data.queue.length} more on the Risk Scoring page</p>
          )}
        </div>

        <div className="min-w-0">
          <div className="text-[14.5px] font-semibold text-fg mb-2">Your recent decisions</div>
          {data.recent.length === 0 ? (
            <EmptyState icon={ClipboardCheck} title="No decisions yet" text={made ? undefined : 'Accept or correct a prediction to start the feedback loop.'} className="!py-8" />
          ) : (
            <ul className="divide-y divide-line border border-line rounded-xl">
              {data.recent.map((d) => (
                <li key={d._id} className="flex items-center gap-3 px-3.5 py-2.5">
                  <div className="flex-1 min-w-0">
                    <div className="text-[14.5px] font-semibold text-fg truncate">{d.employee_id?.name || 'Unknown'}</div>
                    <div className="text-[13px] text-fg-3">{formatMonth(d.month)}</div>
                  </div>
                  {d.decision === 'accept' ? (
                    <Pill tone="good">Accepted {d.original_class}</Pill>
                  ) : (
                    <Pill tone="warn">{d.original_class} → {d.corrected_class}</Pill>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-5"><MlStatusRow ml={data.ml} /></div>
    </Panel>
  );
}

function ManagerWorkspace({ data }) {
  return (
    <Panel title="Operations workspace" subtitle={`${data.department} department and stock alerts`}>
      <div className="grid grid-cols-2 gap-3">
        <Metric icon={Users} label={`${data.department} team`} value={data.team} />
        <Metric icon={Package} label="Items at reorder level" value={data.low_stock_count} tone={data.low_stock_count ? 'warn' : 'good'} />
      </div>

      <div className="mt-5">
        <div className="text-[14.5px] font-semibold text-fg mb-2">Lowest stock</div>
        {data.low_stock.length === 0 ? (
          <EmptyState icon={Package} title="Stock is healthy" text="No items are at or below their reorder level." className="!py-8" />
        ) : (
          <ul className="divide-y divide-line border border-line rounded-xl">
            {data.low_stock.map((item) => (
              <li key={item._id} className="flex items-center gap-3 px-3.5 py-2.5">
                <div className="flex-1 min-w-0">
                  <div className="text-[14.5px] font-semibold text-fg truncate">{item.name}</div>
                  <div className="text-[13px] text-fg-3">{item.category}</div>
                </div>
                <span className="text-[14px] text-fg-2 tnum">{item.quantity} / {item.reorder_level}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-5">
        <QuickLink to="/attendance" icon={CalendarCheck}>Attendance</QuickLink>
        <QuickLink to="/inventory" icon={Package}>Inventory</QuickLink>
      </div>
    </Panel>
  );
}

function EmployeeWorkspace({ data }) {
  const { payslip, attendance } = data;
  return (
    <Panel title="My work" subtitle="Your latest payslip and attendance">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-line p-4">
          <div className="flex items-center gap-2 text-[14.5px] font-semibold text-fg">
            <Wallet size={16} className="text-fg-3" /> Latest payslip
          </div>
          {payslip ? (
            <>
              <div className="text-[13.5px] text-fg-3 mt-1">{formatMonth(payslip.month, 'long')}</div>
              <div className="text-[26px] font-extrabold text-fg mt-2 tnum">LKR {formatLKR(payslip.final_salary)}</div>
              <div className="text-[13.5px] text-fg-3 mt-1">
                Gross {formatLKR(payslip.gross_salary)} · EPF {formatLKR(payslip.deductions?.epf)}
                {payslip.overtime_hours ? ` · ${payslip.overtime_hours} h overtime` : ''}
              </div>
            </>
          ) : <p className="text-[14.5px] text-fg-3 mt-2">No payslips yet.</p>}
        </div>

        <div className="rounded-xl border border-line p-4">
          <div className="flex items-center gap-2 text-[14.5px] font-semibold text-fg">
            <CalendarCheck size={16} className="text-fg-3" /> Attendance
          </div>
          {attendance ? (
            <>
              <div className="text-[13.5px] text-fg-3 mt-1">{formatMonth(attendance.month, 'long')}</div>
              <div className="grid grid-cols-3 gap-2 mt-3">
                <AttendanceCount label="Present" value={attendance.present} tone="good" />
                <AttendanceCount label="Late" value={attendance.late} tone="warn" />
                <AttendanceCount label="Absent" value={attendance.absent} tone="danger" />
              </div>
            </>
          ) : <p className="text-[14.5px] text-fg-3 mt-2">No attendance records yet.</p>}
        </div>
      </div>
      <p className="flex items-center gap-1.5 text-[13.5px] text-fg-3 mt-4">
        <Lock size={13} /> Only you and HR can see these records.
      </p>
    </Panel>
  );
}

function AttendanceCount({ label, value, tone }) {
  const tones = { good: 'text-good-fg', warn: 'text-warn-fg', danger: 'text-danger-fg' };
  return (
    <div className="text-center rounded-lg bg-surface-2/60 py-2">
      <div className={clsx('text-[20px] font-extrabold tnum', tones[tone])}>{value || 0}</div>
      <div className="text-[13px] text-fg-3">{label}</div>
    </div>
  );
}

/* ─── helpers ─── */

function monthsBetween(a, b) {
  return Math.max(0, (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth()));
}

function formatTenure(months) {
  if (months < 12) return `${months} mo`;
  const y = Math.floor(months / 12), m = months % 12;
  return m ? `${y} yr ${m} mo` : `${y} yr`;
}
