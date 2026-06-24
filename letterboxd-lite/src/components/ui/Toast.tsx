import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import type { Toast as ToastType } from '@/types';

const icons = {
  success: <CheckCircle size={16} className="text-emerald-400 shrink-0" />,
  error: <XCircle size={16} className="text-red-400 shrink-0" />,
  info: <Info size={16} className="text-sky-400 shrink-0" />,
  warning: <AlertTriangle size={16} className="text-amber-400 shrink-0" />,
};

const barColors = {
  success: 'bg-emerald-400',
  error: 'bg-red-400',
  info: 'bg-sky-400',
  warning: 'bg-amber-400',
};

function ToastItem({ toast }: { toast: ToastType }) {
  const { removeToast } = useUIStore();

  return (
    <div
      className="relative flex items-start gap-3 glass rounded-xl p-4 pr-10 shadow-xl shadow-black/40 overflow-hidden min-w-[280px] max-w-sm animate-in slide-in-from-right-full duration-300"
      role="alert"
    >
      <div className={`absolute bottom-0 left-0 h-0.5 w-full ${barColors[toast.type]} opacity-60`} />
      {icons[toast.type]}
      <p className="text-sm text-slate-200 leading-snug">{toast.message}</p>
      <button
        onClick={() => removeToast(toast.id)}
        className="absolute top-3 right-3 p-0.5 rounded text-slate-500 hover:text-white transition-colors cursor-pointer"
        aria-label="Dismiss notification"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const { toasts } = useUIStore();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map(toast => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} />
        </div>
      ))}
    </div>
  );
}
