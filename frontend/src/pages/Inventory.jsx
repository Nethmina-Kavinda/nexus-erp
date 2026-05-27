import { useState } from 'react';
import { Plus, AlertTriangle, X, ChevronDown } from 'lucide-react';
import { inventoryService } from '../services/api';
import { useFetch } from '../hooks/useFetch';
import { useToast } from '../components/Toast';
import ErrorBanner from '../components/ErrorBanner';
import Panel from '../components/Panel';
import clsx from 'clsx';

const CATEGORIES = [
  { val: '',              label: 'All' },
  { val: 'raw_material',  label: 'Raw Materials' },
  { val: 'finished_good', label: 'Finished Goods' },
];

export default function Inventory() {
  const [category, setCategory] = useState('');
  const { data, loading, error, refetch } = useFetch(
    () => inventoryService.getAll({ category: category || undefined }),
    [category]
  );
  const [showModal, setShowModal] = useState(false);
  const toast = useToast();

  const items = data || [];

  const handleTransaction = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    try {
      await inventoryService.createTransaction({
        inventory_id: form.get('inventory_id'),
        type: form.get('type'),
        quantity: parseInt(form.get('quantity')),
        notes: form.get('notes'),
      });
      toast.success('Stock movement recorded');
      setShowModal(false);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Transaction failed');
    }
  };

  return (
    <div className="space-y-7 max-w-[1600px] mx-auto">
      <ErrorBanner error={error} onRetry={refetch} />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((c) => (
            <button
              key={c.val}
              onClick={() => setCategory(c.val)}
              className={clsx(
                'text-[12px] font-heading font-medium px-3 py-2 rounded-lg transition-colors',
                category === c.val
                  ? 'bg-accent-blue text-white'
                  : 'bg-surface-1 text-text-secondary border border-border hover:text-white hover:bg-surface-2'
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <span className="text-[12px] text-text-muted font-mono">
          {loading ? 'Loading…' : `${items.length} items`}
        </span>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-accent-blue hover:bg-accent-blue/90 text-white text-[13px] font-heading font-semibold px-4 py-2 rounded-lg transition-all shadow-[0_0_14px_rgba(59,130,246,0.25)]"
        >
          <Plus size={14} strokeWidth={2} /> Add Transaction
        </button>
      </div>

      {/* Table */}
      <Panel noPadding>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-surface-2/30">
                <Th className="pl-6">Item</Th>
                <Th>Category</Th>
                <Th align="right">Quantity</Th>
                <Th align="right">Reorder Level</Th>
                <Th align="right">Unit Price (LKR)</Th>
                <Th align="right" className="pr-6">Status</Th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/40">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-6 py-4"><div className="skeleton h-5 w-24" /></td>
                    ))}
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-[13px] text-text-muted">
                    No inventory items
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr
                    key={item._id}
                    className={clsx(
                      'border-b border-border/40 hover:bg-surface-2/50 transition-colors',
                      item.needs_reorder && 'border-l-[3px] border-l-accent-amber bg-accent-amber/[0.03]'
                    )}
                  >
                    <td className="px-6 py-4">
                      <div className="text-[13.5px] text-white font-medium">{item.name}</div>
                      <div className="text-[11.5px] text-text-muted mt-0.5 truncate max-w-md">{item.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[11.5px] bg-surface-3 text-text-secondary px-2 py-1 rounded font-medium">
                        {item.category === 'raw_material' ? 'Raw' : 'Finished'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-[13.5px] text-white tabular-nums font-medium">{item.quantity}</td>
                    <td className="px-6 py-4 text-right font-mono text-[12.5px] text-text-secondary tabular-nums">{item.reorder_level}</td>
                    <td className="px-6 py-4 text-right font-mono text-[12.5px] text-text-secondary tabular-nums">
                      {item.unit_price?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 pr-6 text-right">
                      {item.needs_reorder ? (
                        <span className="inline-flex items-center gap-1.5 text-[11.5px] font-heading font-semibold text-accent-amber">
                          <AlertTriangle size={12} strokeWidth={2} /> Reorder
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[11.5px] font-heading font-semibold text-accent-teal">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent-teal" /> In Stock
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* Transaction Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 fade-in"
          onClick={() => setShowModal(false)}
        >
          <div
            className="relative w-full max-w-md bg-surface-1 border border-border rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-md text-text-muted hover:text-white hover:bg-surface-2 flex items-center justify-center transition-colors"
            >
              <X size={15} strokeWidth={2} />
            </button>
            <div className="px-7 pt-7 pb-6 border-b border-border">
              <h3 className="text-lg font-heading font-bold text-white">Add Transaction</h3>
              <p className="text-[12.5px] text-text-muted mt-1">Record stock addition or shipment</p>
            </div>

            <form onSubmit={handleTransaction} className="px-7 py-6 space-y-5">
              <Field label="Item">
                <div className="relative">
                  <select
                    name="inventory_id"
                    required
                    className="w-full bg-surface-2 border border-border rounded-lg px-3.5 py-2.5 text-[13.5px] text-white appearance-none pr-9 focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 transition-all"
                  >
                    {items.map((item) => (
                      <option key={item._id} value={item._id}>{item.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                </div>
              </Field>

              <Field label="Type">
                <div className="relative">
                  <select
                    name="type"
                    required
                    className="w-full bg-surface-2 border border-border rounded-lg px-3.5 py-2.5 text-[13.5px] text-white appearance-none pr-9 focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 transition-all"
                  >
                    <option value="addition">Addition (Stock In)</option>
                    <option value="shipment">Shipment (Stock Out)</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                </div>
              </Field>

              <Field label="Quantity">
                <input
                  name="quantity"
                  type="number"
                  min="1"
                  required
                  className="w-full bg-surface-2 border border-border rounded-lg px-3.5 py-2.5 text-[13.5px] text-white font-mono tabular-nums focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 transition-all"
                />
              </Field>

              <Field label="Notes (optional)">
                <input
                  name="notes"
                  type="text"
                  placeholder="PO reference, supplier, memo…"
                  className="w-full bg-surface-2 border border-border rounded-lg px-3.5 py-2.5 text-[13.5px] text-white placeholder-text-muted focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 transition-all"
                />
              </Field>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-surface-2 hover:bg-surface-3 text-text-secondary hover:text-white text-[13px] font-heading font-semibold py-2.5 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-accent-blue hover:bg-accent-blue/90 text-white text-[13px] font-heading font-semibold py-2.5 rounded-lg transition-colors shadow-[0_0_14px_rgba(59,130,246,0.25)]"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-[11px] text-text-secondary mb-1.5 uppercase tracking-wider font-medium">{label}</label>
      {children}
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
