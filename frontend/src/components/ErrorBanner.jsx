import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ErrorBanner({ error, onRetry }) {
  if (!error) return null;
  return (
    <div className="flex items-start gap-3 bg-danger-soft rounded-xl px-4 py-3.5 fade-in" role="alert">
      <AlertCircle size={18} className="text-danger-fg shrink-0 mt-0.5" strokeWidth={2} />
      <div className="flex-1 min-w-0">
        <div className="text-[15px] font-semibold text-fg">We couldn't load this data</div>
        <div className="text-[14.5px] text-fg-2 mt-0.5 break-words">{String(error)}</div>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1.5 text-[14.5px] font-semibold text-danger-fg hover:underline shrink-0 px-2 py-1"
        >
          <RefreshCw size={13} strokeWidth={2} /> Try again
        </button>
      )}
    </div>
  );
}
