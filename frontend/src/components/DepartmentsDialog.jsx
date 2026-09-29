import { useState } from 'react';
import { Building2, Plus, Pencil, Trash2, Check, X, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';
import { departmentService } from '../services/api';
import { useToast } from './Toast';
import { Button, IconButton, Modal, Select, inputClass } from './ui';

/**
 * Admin-only department manager: add, rename and delete. Deleting a
 * department that still has people asks where to move them first.
 * `onChanged` lets the parent refresh its department list and employee table.
 */
export default function DepartmentsDialog({ departments, loading, onClose, onChanged }) {
  const toast = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null); // { id, name, description }
  const [confirmDelete, setConfirmDelete] = useState(null); // department id
  const [moveTo, setMoveTo] = useState('');
  const [busy, setBusy] = useState(false);

  const fail = (err, fallback) => setError(err.response?.data?.error || fallback);

  const add = async (e) => {
    e.preventDefault();
    setAdding(true);
    setError('');
    try {
      await departmentService.create({ name: name.trim(), description: description.trim() || undefined });
      toast.success(`${name.trim()} department created.`);
      setName('');
      setDescription('');
      onChanged();
    } catch (err) {
      fail(err, 'Could not create the department.');
    } finally {
      setAdding(false);
    }
  };

  const saveEdit = async () => {
    setBusy(true);
    setError('');
    try {
      await departmentService.update(editing.id, { name: editing.name.trim(), description: editing.description.trim() });
      toast.success('Department updated.');
      setEditing(null);
      onChanged();
    } catch (err) {
      fail(err, 'Could not update the department.');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (dept) => {
    setBusy(true);
    setError('');
    try {
      const res = await departmentService.delete(dept._id, dept.employee_count ? moveTo : undefined);
      toast.success(res.data.moved
        ? `${dept.name} deleted. ${res.data.moved} ${res.data.moved === 1 ? 'person' : 'people'} moved to ${moveTo}.`
        : `${dept.name} deleted.`);
      setConfirmDelete(null);
      onChanged();
    } catch (err) {
      fail(err, 'Could not delete the department.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      size="lg"
      onClose={onClose}
      title="Departments"
      subtitle={loading ? 'Loading…' : `${departments.length} departments · employees are assigned from this list`}
      icon={<div className="w-12 h-12 rounded-full bg-primary-soft text-primary-fg flex items-center justify-center"><Building2 size={20} /></div>}
      footer={<div className="flex justify-end"><Button variant="secondary" onClick={onClose}>Done</Button></div>}
    >
      <div className="px-6 py-6 space-y-5">
        {/* Add */}
        <form onSubmit={add} className="rounded-xl border border-line bg-surface-2/40 p-4">
          <div className="text-[15px] font-bold text-fg mb-3">New department</div>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <input
              className={clsx(inputClass, 'sm:w-[200px] shrink-0')}
              placeholder="Name, e.g. Legal"
              value={name}
              maxLength={40}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              className={inputClass}
              placeholder="Description (optional)"
              value={description}
              maxLength={200}
              onChange={(e) => setDescription(e.target.value)}
            />
            <Button type="submit" icon={Plus} disabled={adding || !name.trim()} className="shrink-0">
              {adding ? 'Adding…' : 'Add'}
            </Button>
          </div>
        </form>

        {error && (
          <div className="flex items-start gap-2 rounded-lg bg-danger-soft text-danger-fg px-3.5 py-2.5 text-[14.5px] font-medium">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" /> {error}
          </div>
        )}

        {/* List */}
        <ul className="divide-y divide-line border border-line rounded-xl">
          {loading && departments.length === 0 && (
            <li className="px-4 py-4"><div className="skeleton h-4 w-40" /></li>
          )}
          {departments.map((d) => {
            const isEditing = editing?.id === d._id;
            const isConfirming = confirmDelete === d._id;
            const empty = d.employee_count === 0;
            const others = departments.filter((o) => o._id !== d._id);
            return (
              <li key={d._id} className="px-4 py-3">
                {isEditing ? (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      className={clsx(inputClass, 'sm:w-[200px] shrink-0')}
                      value={editing.name}
                      maxLength={40}
                      autoFocus
                      onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                    />
                    <input
                      className={inputClass}
                      placeholder="Description"
                      value={editing.description}
                      maxLength={200}
                      onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                    />
                    <div className="flex gap-1 shrink-0">
                      <IconButton label="Save" onClick={saveEdit} disabled={busy || !editing.name.trim()} className="text-good-fg">
                        <Check size={17} />
                      </IconButton>
                      <IconButton label="Cancel" onClick={() => setEditing(null)}>
                        <X size={17} />
                      </IconButton>
                    </div>
                  </div>
                ) : isConfirming ? (
                  <div className="rounded-lg bg-danger-soft/40 -mx-1 px-3 py-3 space-y-3">
                    <div className="text-[14.5px] text-fg">
                      Delete <strong>{d.name}</strong>?
                      {empty
                        ? ' This cannot be undone.'
                        : <> Its {d.employee_count} {d.employee_count === 1 ? 'employee' : 'employees'} will be moved first.</>}
                    </div>
                    {!empty && (
                      <label className="flex flex-wrap items-center gap-2.5 text-[14.5px] text-fg-2">
                        Move them to
                        <div className="w-[200px]">
                          <Select value={moveTo} onChange={(e) => setMoveTo(e.target.value)} aria-label="Move employees to">
                            <option value="" disabled>Choose department</option>
                            {others.map((o) => <option key={o._id} value={o.name}>{o.name}</option>)}
                          </Select>
                        </div>
                      </label>
                    )}
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(null)}>Cancel</Button>
                      <Button size="sm" variant="danger" icon={Trash2} onClick={() => remove(d)} disabled={busy || (!empty && !moveTo)}>
                        {busy ? 'Deleting…' : empty ? 'Delete' : 'Move & delete'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-[15px] font-semibold text-fg truncate">{d.name}</div>
                      <div className="text-[13.5px] text-fg-3 truncate">
                        {d.active_count} active{d.employee_count !== d.active_count && ` · ${d.employee_count - d.active_count} inactive`}
                        {d.description && ` · ${d.description}`}
                      </div>
                    </div>
                    <IconButton
                      label="Rename"
                      className="w-8 h-8"
                      onClick={() => { setError(''); setConfirmDelete(null); setEditing({ id: d._id, name: d.name, description: d.description || '' }); }}
                    >
                      <Pencil size={15} />
                    </IconButton>
                    <IconButton
                      label="Delete"
                      className="w-8 h-8 hover:!text-danger-fg hover:!bg-danger-soft"
                      disabled={others.length === 0}
                      onClick={() => { setError(''); setEditing(null); setMoveTo(''); setConfirmDelete(d._id); }}
                    >
                      <Trash2 size={15} />
                    </IconButton>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
        <p className="text-[13.5px] text-fg-3">
          Renaming moves every employee with it. Deleting a department with people in it moves them to the department you choose.
        </p>
      </div>
    </Modal>
  );
}
