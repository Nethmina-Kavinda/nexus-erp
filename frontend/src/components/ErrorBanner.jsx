import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ErrorBanner({ error, onRetry }) {
  if (!error) return null;
  return (
    <div className="flex items-start gap-3 bg-accent-red/10 border border-accent-red/30 rounded-lg px-4 py-3 fade-in">
      <AlertCircle size={17} className="text-accent-red shrink-0 mt-0.5" strokeWidth={2} />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-heading font-semibold text-white">Failed to load data</div>
        <div className="text-[12px] text-text-secondary mt-0.5 break-words">{String(error)}</div>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1.5 text-[11px] font-heading font-semibold text-accent-red hover:text-white transition-colors shrink-0 px-2.5 py-1 rounded border border-accent-red/30 hover:border-accent-red hover:bg-accent-red/10"
        >
          <RefreshCw size={11} strokeWidth={2} /> Retry
        </button>
      )}
    </div>
  );
}
