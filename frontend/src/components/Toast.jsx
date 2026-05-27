import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { X, CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';
import clsx from 'clsx';

const ToastContext = createContext(null);

const ICONS = {
  success: CheckCircle,
  warning: AlertTriangle,
  error:   XCircle,
  info:    Info,
};

const ACCENT = {
  success: 'border-l-accent-teal  text-accent-teal',
  warning: 'border-l-accent-amber text-accent-amber',
  error:   'border-l-accent-red   text-accent-red',
  info:    'border-l-accent-blue  text-accent-blue',
};

function ToastItem({ toast, onRemove }) {
  const Icon = ICONS[toast.type] || Info;
  const accent = ACCENT[toast.type] || ACCENT.info;

  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  return (
    <div className={clsx(
      'bg-surface-2 border border-border-hover rounded-lg px-4 py-3 shadow-xl flex items-start gap-3 min-w-[320px] max-w-[420px] border-l-4 fade-in',
      accent.split(' ')[0]
    )}>
      <Icon size={17} className={clsx('shrink-0 mt-0.5', accent.split(' ')[1])} strokeWidth={2} />
      <div className="flex-1 min-w-0">
        {toast.title && <div className="text-sm font-heading font-semibold text-white leading-tight">{toast.title}</div>}
        <div className={clsx('text-sm text-text-secondary leading-snug', toast.title && 'mt-0.5')}>{toast.message}</div>
      </div>
      <button onClick={() => onRemove(toast.id)} className="text-text-muted hover:text-white shrink-0 -mr-1">
        <X size={14} />
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

  const toast = {
    success: (msg, title) => addToast('success', msg, title),
    error:   (msg, title) => addToast('error',   msg, title),
    warning: (msg, title) => addToast('warning', msg, title),
    info:    (msg, title) => addToast('info',    msg, title),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5">
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
