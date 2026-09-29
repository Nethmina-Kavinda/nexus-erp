import { useState, useEffect, createContext, useContext, useCallback, useMemo } from 'react';
import { X, CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';
import clsx from 'clsx';

const ToastContext = createContext(null);

const STYLES = {
  success: { icon: CheckCircle2,  tone: 'bg-good-soft text-good-fg' },
  warning: { icon: AlertTriangle, tone: 'bg-warn-soft text-warn-fg' },
  error:   { icon: XCircle,       tone: 'bg-danger-soft text-danger-fg' },
  info:    { icon: Info,          tone: 'bg-primary-soft text-primary-fg' },
};

function ToastItem({ toast, onRemove }) {
  const { icon: Icon, tone } = STYLES[toast.type] || STYLES.info;

  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  return (
    <div className="bg-surface border border-line rounded-xl px-4 py-3.5 shadow-pop flex items-start gap-3 w-[min(380px,calc(100vw-2.5rem))] pop-in">
      <div className={clsx('w-8 h-8 rounded-full flex items-center justify-center shrink-0', tone)}>
        <Icon size={16} strokeWidth={2.25} />
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        {toast.title && <div className="text-[15px] font-bold text-fg leading-tight">{toast.title}</div>}
        <div className={clsx('text-[14.5px] text-fg-2 leading-snug', toast.title && 'mt-0.5')}>{toast.message}</div>
      </div>
      <button onClick={() => onRemove(toast.id)} className="text-fg-3 hover:text-fg shrink-0 p-1 -mr-1" aria-label="Dismiss">
        <X size={15} />
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((type, message, title) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, message, title }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useMemo(() => ({
    success: (msg, title) => addToast('success', msg, title),
    error:   (msg, title) => addToast('error',   msg, title),
    warning: (msg, title) => addToast('warning', msg, title),
    info:    (msg, title) => addToast('info',    msg, title),
  }), [addToast]);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-5 right-5 z-[60] flex flex-col gap-2.5" aria-live="polite">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};
