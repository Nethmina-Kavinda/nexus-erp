import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, AlertTriangle, Boxes, PackageX, Coins, ArrowLeftRight, PackageSearch, SearchX } from 'lucide-react';
import { inventoryService } from '../services/api';
import { useFetch } from '../hooks/useFetch';
import { useToast } from '../components/Toast';
import ErrorBanner from '../components/ErrorBanner';
import Panel from '../components/Panel';
import StatCard from '../components/StatCard';
import { Button, EmptyState, Field, Modal, Pill, Segmented, Select, SkeletonRows, Th, inputClass } from '../components/ui';
import { compact, countLabel, matchesQuery } from '../lib/format';

const CATEGORIES = [
  { value: '',              label: 'All items' },
  { value: 'raw_material',  label: 'Raw materials' },
  { value: 'finished_good', label: 'Finished goods' },
];

export default function Inventory() {
  const [category, setCategory] = useState('');
  const { data, loading, error, refetch } = useFetch(
    () => inventoryService.getAll({ category: category || undefined }),
    [category]
  );
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const items = data || [];
  const q = useSearchParams()[0].get('q') || '';  // from the top-bar search
  const visible = items.filter((i) => matchesQuery(q, i.name, i.description, i.category?.replace('_', ' ')));
  const reorderCount = items.filter((i) => i.needs_reorder).length;
  const stockValue = items.reduce((s, i) => s + (i.quantity || 0) * (i.unit_price || 0), 0);

  const handleTransaction = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    setSubmitting(true);
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
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <ErrorBanner error={error} onRetry={refetch} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard loading={loading} icon={Boxes} label="Items tracked" value={items.length} note={category ? 'in this category' : 'across all categories'} />
        <StatCard loading={loading} icon={PackageX} label="Need reorder" value={reorderCount} note={reorderCount ? 'at or below reorder level' : 'nothing to reorder'} />
        <StatCard loading={loading} icon={Coins} label="Stock value" value={compact(stockValue)} suffix=" LKR" note="quantity × unit price" />
      </div>

      <Panel
        noPadding
        title="Stock"
        subtitle={loading ? 'Loading…' : countLabel(visible.length, items.length, 'items', q)}
        action={<Button icon={Plus} onClick={() => setShowModal(true)}>Record movement</Button>}
      >
        <div className="px-6 pb-4">
          <Segmented value={category} options={CATEGORIES} onChange={setCategory} />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <Th className="pl-6">Item</Th>
                <Th>Category</Th>
                <Th align="right">In stock</Th>
                <Th align="right">Reorder at</Th>
                <Th align="right">Unit price (LKR)</Th>
                <Th align="right" className="pr-6">Status</Th>
              </tr>
            </thead>
            <tbody>
              {loading ? <SkeletonRows rows={5} cols={6} /> : visible.map((item) => (
                <tr key={item._id} className="border-t border-line hover:bg-surface-2/50 transition-colors">
                  <td className="pl-6 pr-5 py-3.5">
                    <div className="text-[15px] text-fg font-semibold">{item.name}</div>
                    <div className="text-[14px] text-fg-3 mt-0.5 truncate max-w-md">{item.description}</div>
                  </td>
                  <td className="px-5 py-3.5">
                    <Pill>{item.category === 'raw_material' ? 'Raw material' : 'Finished good'}</Pill>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <StockLevel qty={item.quantity} reorder={item.reorder_level} low={item.needs_reorder} />
                  </td>
                  <td className="px-5 py-3.5 text-right text-[15px] text-fg-2 tnum">{item.reorder_level}</td>
                  <td className="px-5 py-3.5 text-right text-[15px] text-fg-2 tnum">{item.unit_price?.toLocaleString()}</td>
                  <td className="pl-5 pr-6 py-3.5 text-right">
                    {item.needs_reorder
                      ? <Pill tone="warn" icon={AlertTriangle}>Reorder</Pill>
                      : <Pill tone="good" dot>In stock</Pill>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && items.length === 0 && (
            <EmptyState icon={PackageSearch} title="No inventory items" text="Nothing is stocked in this category yet." className="border-t border-line" />
          )}
          {!loading && items.length > 0 && visible.length === 0 && (
            <EmptyState icon={SearchX} title="No matches" text={`No item matches “${q.trim()}”. Try another name.`} className="border-t border-line" />
          )}
        </div>
      </Panel>

      {showModal && (
        <Modal
          onClose={() => setShowModal(false)}
          title="Record stock movement"
          subtitle="Add incoming stock or log a shipment"
          icon={
            <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary-fg flex items-center justify-center shrink-0">
              <ArrowLeftRight size={18} strokeWidth={2} />
            </div>
          }
        >
          <form onSubmit={handleTransaction} className="px-6 pb-6 space-y-4">
            <Field label="Item">
              <Select name="inventory_id" required>
                {items.map((item) => (
                  <option key={item._id} value={item._id}>{item.name}</option>
                ))}
              </Select>
            </Field>

            <Field label="Movement">
              <Select name="type" required>
                <option value="addition">Stock in (addition)</option>
                <option value="shipment">Stock out (shipment)</option>
              </Select>
            </Field>

            <Field label="Quantity">
              <input name="quantity" type="number" min="1" required className={`${inputClass} tnum`} />
            </Field>

            <Field label="Notes" hint="Optional — PO number, supplier or a short memo.">
              <input name="notes" type="text" className={inputClass} />
            </Field>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button type="submit" className="flex-1" disabled={submitting}>{submitting ? 'Saving…' : 'Save movement'}</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function StockLevel({ qty, reorder, low }) {
  // bar shows stock relative to twice the reorder level
  const pct = reorder > 0 ? Math.min((qty / (reorder * 2)) * 100, 100) : 100;
  return (
    <div className="inline-flex items-center gap-3 justify-end">
      <div className="hidden sm:block w-16 h-1.5 bg-surface-2 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: low ? 'var(--warn)' : 'var(--primary)' }} />
      </div>
      <span className="text-[15px] text-fg font-bold tnum min-w-[3ch]">{qty}</span>
    </div>
  );
}
