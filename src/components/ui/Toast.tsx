import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/cn';

type ToastVariant = 'success' | 'error' | 'info';

export interface ToastData {
  id: string;
  variant: ToastVariant;
  title: string;
  message?: string;
}

interface ToastProps {
  toasts: ToastData[];
  onDismiss: (id: string) => void;
}

const iconMap: Record<ToastVariant, ReactNode> = {
  success: <CheckCircle2 size={20} className="text-emerald-500" />,
  error: <AlertCircle size={20} className="text-rose-500" />,
  info: <Info size={20} className="text-blue-500" />,
};

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastData;
  onDismiss: (id: string) => void;
}) {
  useEffect(() => {
    const t = setTimeout(() => onDismiss(toast.id), 4500);
    return () => clearTimeout(t);
  }, [toast.id, onDismiss]);

  return (
    <div
      className={cn(
        'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border bg-white p-4 shadow-lg',
        toast.variant === 'success' && 'border-emerald-200',
        toast.variant === 'error' && 'border-rose-200',
        toast.variant === 'info' && 'border-blue-200'
      )}
      role="status"
    >
      <div className="mt-0.5 shrink-0">{iconMap[toast.variant]}</div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-gray-900">{toast.title}</p>
        {toast.message && (
          <p className="mt-0.5 text-sm text-gray-600">{toast.message}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export function ToastViewport({ toasts, onDismiss }: ToastProps) {
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex flex-col gap-2">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
