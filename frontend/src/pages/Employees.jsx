import { useState } from 'react';
import {
  Search, UsersRound, UserPlus, Pencil, KeyRound, UserX, UserCheck, AlertTriangle, Building2,
} from 'lucide-react';
import clsx from 'clsx';
import { employeeService } from '../services/api';
import { useFetch } from '../hooks/useFetch';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { useDepartments } from '../hooks/useDepartments';
import DepartmentsDialog from '../components/DepartmentsDialog';
import ErrorBanner from '../components/ErrorBanner';
import Panel from '../components/Panel';
import {
  Avatar, Button, EmptyState, Field, IconButton, Modal, Pill, Segmented, Select, SkeletonRows, Th, inputClass,
} from '../components/ui';
import { formatRole } from '../lib/format';

const ROLES = ['admin', 'hr_manager', 'manager', 'employee'];
const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
];
const ROLE_TONES = { admin: 'danger', hr_manager: 'primary', manager: 'warn', employee: 'neutral' };

export default function Employees() {
  const { user, hasRole } = useAuth();
  const toast = useToast();
  const isAdmin = hasRole('admin');
  const canEdit = hasRole('admin', 'hr_manager');

  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const [role, setRole] = useState('all');
  const [status, setStatus] = useState('all');
  const depts = useDepartments();
  // null | { mode: 'departments' } | { mode: 'create' } | { mode: 'edit', emp } | { mode: 'password', emp } | { mode: 'status', emp }
  const [dialog, setDialog] = useState(null);

  const { data, loading, error, refetch } = useFetch(
    () => employeeService.getAll({
      search: search || undefined,
      department: department === 'All' ? undefined : department,
      role: role === 'all' ? undefined : role,
      is_active: status === 'all' ? undefined : status,
      limit: 500,
    }),
    [search, department, role, status]
  );

  const employees = data || [];
  const close = () => setDialog(null);
  const done = (message) => { toast.success(message); close(); refetch(); };

  return (
    <div className="space-y-6">
      <ErrorBanner error={error} onRetry={refetch} />

      <Panel
        noPadding
        title={isAdmin ? 'Users & employees' : 'All employees'}
        subtitle={loading ? 'Loading…' : `${employees.length} ${employees.length === 1 ? 'person' : 'people'}${department !== 'All' ? ` in ${department}` : ''}`}
        action={
          <>
            <div className="relative w-full sm:w-[260px]">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-fg-3 pointer-events-none" />
              <input
                type="search"
                placeholder="Search name or email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`${inputClass} pl-10`}
              />
            </div>
            {isAdmin && (
              <>
                <Button variant="secondary" icon={Building2} onClick={() => setDialog({ mode: 'departments' })}>Departments</Button>
                <Button icon={UserPlus} onClick={() => setDialog({ mode: 'create' })}>Add employee</Button>
              </>
            )}
          </>
        }
      >
        <div className="px-6 pb-4 flex flex-wrap items-center gap-3">
          <Segmented value={department} options={['All', ...depts.names]} onChange={setDepartment} />
          <div className="flex flex-wrap items-center gap-3 sm:ml-auto">
            <div className="w-[170px]">
              <Select value={role} onChange={(e) => setRole(e.target.value)} aria-label="Role">
                <option value="all">All roles</option>
                {ROLES.map((r) => <option key={r} value={r}>{formatRole(r)}</option>)}
              </Select>
            </div>
            <Segmented value={status} options={STATUS_FILTERS} onChange={setStatus} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <Th className="pl-6">Employee</Th>
                <Th>Department</Th>
                <Th>Position</Th>
                <Th>Role</Th>
                <Th>Joined</Th>
                <Th>Status</Th>
                {canEdit && <Th align="right" className="pr-6">Actions</Th>}
              </tr>
            </thead>
            <tbody>
              {loading ? <SkeletonRows cols={canEdit ? 7 : 6} /> : employees.map((emp) => {
                const isSelf = String(emp._id) === String(user?.id);
                return (
                  <tr key={emp._id} className={clsx('border-t border-line hover:bg-surface-2/50 transition-colors', !emp.is_active && 'opacity-60')}>
                    <td className="pl-6 pr-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={emp.name} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[15px] text-fg font-semibold truncate">{emp.name}</span>
                            {isSelf && <Pill tone="primary" className="!py-0 !text-[12px]">You</Pill>}
                          </div>
                          <div className="text-[14px] text-fg-3 mt-0.5 truncate">{emp.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-[15px] text-fg-2">{emp.department}</td>
                    <td className="px-5 py-3.5 text-[15px] text-fg-2">{emp.position || '—'}</td>
                    <td className="px-5 py-3.5"><Pill tone={ROLE_TONES[emp.role]}>{formatRole(emp.role)}</Pill></td>
                    <td className="px-5 py-3.5 text-[15px] text-fg-2 tnum whitespace-nowrap">
                      {new Date(emp.hire_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3.5">
                      {emp.is_active ? <Pill tone="good" dot>Active</Pill> : <Pill dot>Inactive</Pill>}
                    </td>
                    {canEdit && (
                      <td className="pl-5 pr-6 py-3.5">
                        <div className="flex items-center justify-end gap-0.5">
                          <IconButton label="Edit" className="w-8 h-8" onClick={() => setDialog({ mode: 'edit', emp })}>
                            <Pencil size={15} />
                          </IconButton>
                          {isAdmin && (
                            <>
                              <IconButton label="Reset password" className="w-8 h-8" onClick={() => setDialog({ mode: 'password', emp })}>
                                <KeyRound size={15} />
                              </IconButton>
                              <IconButton
                                label={isSelf ? 'You cannot deactivate yourself' : emp.is_active ? 'Deactivate' : 'Reactivate'}
                                className={clsx('w-8 h-8', emp.is_active ? 'hover:!text-danger-fg hover:!bg-danger-soft' : 'hover:!text-good-fg hover:!bg-good-soft', isSelf && 'opacity-30 pointer-events-none')}
                                disabled={isSelf}
                                onClick={() => setDialog({ mode: 'status', emp })}
                              >
                                {emp.is_active ? <UserX size={15} /> : <UserCheck size={15} />}
                              </IconButton>
                            </>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!loading && employees.length === 0 && (
            <EmptyState
              icon={UsersRound}
              title="No employees found"
              text="Try a different name, department, role or status."
              className="border-t border-line"
            />
          )}
        </div>
      </Panel>

      {(dialog?.mode === 'create' || dialog?.mode === 'edit') && (
        <EmployeeForm
          emp={dialog.emp}
          departments={depts.names}
          isAdmin={isAdmin}
          isSelf={String(dialog.emp?._id) === String(user?.id)}
          onClose={close}
          onDone={done}
        />
      )}
      {dialog?.mode === 'departments' && (
        <DepartmentsDialog
          departments={depts.departments}
          loading={depts.loading}
          onClose={close}
          onChanged={() => { depts.refetch(); refetch(); }}
        />
      )}
      {dialog?.mode === 'password' && <ResetPasswordDialog emp={dialog.emp} onClose={close} onDone={done} />}
      {dialog?.mode === 'status' && <StatusDialog emp={dialog.emp} onClose={close} onDone={done} />}
    </div>
  );
}

/* ─── Create / edit ─── */

function toDateInput(d) {
  return d ? new Date(d).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);
}

function EmployeeForm({ emp, departments, isAdmin, isSelf, onClose, onDone }) {
  const creating = !emp;
  const [form, setForm] = useState({
    name: emp?.name || '',
    email: emp?.email || '',
    department: emp?.department || departments[0] || '',
    position: emp?.position || '',
    role: emp?.role || 'employee',
    hourly_rate: emp?.hourly_rate ?? '',
    allowances: emp?.allowances ?? 0,
    hire_date: toDateInput(emp?.hire_date),
    password: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      department: form.department,
      position: form.position.trim(),
      hourly_rate: Number(form.hourly_rate),
      allowances: Number(form.allowances) || 0,
      hire_date: form.hire_date,
    };
    if (isAdmin && !isSelf) payload.role = form.role;
    if (creating && form.password) payload.password = form.password;

    try {
      if (creating) {
        await employeeService.create(payload);
        onDone(`${payload.name} was added.`);
      } else {
        await employeeService.update(emp._id, payload);
        onDone(`${payload.name} was updated.`);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Could not save this employee.');
      setSaving(false);
    }
  };

  return (
    <Modal
      size="lg"
      onClose={onClose}
      title={creating ? 'Add employee' : `Edit ${emp.name}`}
      subtitle={creating ? 'Creates a sign-in account and an employee record.' : emp.email}
      icon={creating
        ? <div className="w-12 h-12 rounded-full bg-primary-soft text-primary-fg flex items-center justify-center"><UserPlus size={20} /></div>
        : <Avatar name={emp.name} size="lg" />}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} type="button">Cancel</Button>
          <Button type="submit" form="employee-form" disabled={saving}>
            {saving ? 'Saving…' : creating ? 'Add employee' : 'Save changes'}
          </Button>
        </div>
      }
    >
      <form id="employee-form" onSubmit={submit} className="px-6 py-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {error && (
          <div className="sm:col-span-2 flex items-center gap-2 rounded-lg bg-danger-soft text-danger-fg px-3.5 py-2.5 text-[14.5px] font-medium">
            <AlertTriangle size={16} /> {error}
          </div>
        )}
        <Field label="Full name">
          <input className={inputClass} value={form.name} onChange={set('name')} required />
        </Field>
        <Field label="Email">
          <input type="email" className={inputClass} value={form.email} onChange={set('email')} required />
        </Field>
        <Field label="Department">
          <Select value={form.department} onChange={set('department')}>
            {departments.map((d) => <option key={d} value={d}>{d}</option>)}
          </Select>
        </Field>
        <Field label="Position">
          <input className={inputClass} value={form.position} onChange={set('position')} placeholder="e.g. Software Developer" />
        </Field>
        <Field
          label="Role"
          hint={!isAdmin ? 'Only an admin can change roles.' : isSelf ? 'You cannot change your own role.' : undefined}
        >
          <Select value={form.role} onChange={set('role')} disabled={!isAdmin || isSelf}>
            {ROLES.map((r) => <option key={r} value={r}>{formatRole(r)}</option>)}
          </Select>
        </Field>
        <Field label="Hire date">
          <input type="date" className={inputClass} value={form.hire_date} onChange={set('hire_date')} required />
        </Field>
        <Field label="Hourly rate (LKR)">
          <input type="number" min="0" step="1" className={inputClass} value={form.hourly_rate} onChange={set('hourly_rate')} required />
        </Field>
        <Field label="Monthly allowances (LKR)">
          <input type="number" min="0" step="1" className={inputClass} value={form.allowances} onChange={set('allowances')} />
        </Field>
        {creating && (
          <div className="sm:col-span-2">
            <Field label="Initial password" hint="Leave blank to use the default password nexus123. Ask the user to change it from My Profile.">
              <input type="text" minLength={6} className={inputClass} value={form.password} onChange={set('password')} autoComplete="off" />
            </Field>
          </div>
        )}
      </form>
    </Modal>
  );
}

/* ─── Reset password ─── */

function ResetPasswordDialog({ emp, onClose, onDone }) {
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await employeeService.resetPassword(emp._id, password);
      onDone(`Password reset for ${emp.name}.`);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not reset the password.');
      setSaving(false);
    }
  };

  return (
    <Modal
      onClose={onClose}
      title="Reset password"
      subtitle={`${emp.name} · ${emp.email}`}
      icon={<div className="w-10 h-10 rounded-xl bg-primary-soft text-primary-fg flex items-center justify-center"><KeyRound size={18} /></div>}
    >
      <form onSubmit={submit} className="px-6 pb-6 space-y-4">
        <Field label="New password" hint={error || 'At least 6 characters. Share it with the user securely.'}>
          <input type="text" minLength={6} required autoFocus className={clsx(inputClass, error && '!border-danger')} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="off" />
        </Field>
        <div className="flex gap-2">
          <Button variant="secondary" type="button" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button type="submit" className="flex-1" disabled={saving}>{saving ? 'Resetting…' : 'Reset password'}</Button>
        </div>
      </form>
    </Modal>
  );
}

/* ─── Deactivate / reactivate ─── */

function StatusDialog({ emp, onClose, onDone }) {
  const deactivating = emp.is_active;
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const confirm = async () => {
    setSaving(true);
    try {
      if (deactivating) await employeeService.delete(emp._id);
      else await employeeService.update(emp._id, { is_active: true });
      onDone(`${emp.name} was ${deactivating ? 'deactivated' : 'reactivated'}.`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not change account status.');
      setSaving(false);
    }
  };

  return (
    <Modal
      onClose={onClose}
      title={deactivating ? `Deactivate ${emp.name}?` : `Reactivate ${emp.name}?`}
      subtitle={emp.email}
      icon={
        <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center', deactivating ? 'bg-danger-soft text-danger-fg' : 'bg-good-soft text-good-fg')}>
          {deactivating ? <UserX size={18} /> : <UserCheck size={18} />}
        </div>
      }
    >
      <div className="px-6 pb-6 space-y-5">
        <p className="text-[14.5px] text-fg-2 leading-relaxed">
          {deactivating
            ? 'They will be signed out and can no longer sign in. Their attendance, payroll and risk history is kept, and you can reactivate them at any time.'
            : 'They will be able to sign in again with their existing password.'}
        </p>
        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button variant={deactivating ? 'danger' : 'primary'} className="flex-1" onClick={confirm} disabled={saving}>
            {saving ? 'Saving…' : deactivating ? 'Deactivate' : 'Reactivate'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
