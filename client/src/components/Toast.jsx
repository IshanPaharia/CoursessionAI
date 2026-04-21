/* eslint-disable react-refresh/only-export-components */
import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { X, CheckCircle2, AlertCircle, Info, Loader2 } from 'lucide-react';
import { addToast, dismissToast, subscribeToasts } from '../lib/toastStore';

const ToastContext = createContext(null);

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  loading: Loader2,
};

const ICON_COLORS = {
  success: 'text-green-500',
  error: 'text-red-500',
  info: 'text-primary',
  loading: 'text-primary',
};

function ToastItem({ toast, onRemove }) {
  const Icon = ICONS[toast.type] || Info;
  const iconColor = ICON_COLORS[toast.type] || 'text-primary';

  useEffect(() => {
    if (!toast.duration) return undefined;
    const timer = setTimeout(() => onRemove(toast.id), toast.duration);
    return () => clearTimeout(timer);
  }, [toast, onRemove]);

  return (
    <div className="flex max-w-[calc(100vw-2rem)] items-center gap-3 rounded-md border border-outline-variant bg-surface px-4 py-3 shadow-lg slide-in-from-right sm:max-w-sm">
      <Icon className={`h-4 w-4 shrink-0 ${iconColor} ${toast.type === 'loading' ? 'animate-spin' : ''}`} />
      <p className="flex-1 text-sm font-medium text-on-surface">{toast.message}</p>
      <button
        type="button"
        onClick={() => onRemove(toast.id)}
        className="shrink-0 text-on-surface-variant hover:text-on-surface transition-colors p-1"
        aria-label="Dismiss notification"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  useEffect(() => subscribeToasts(setToasts), []);

  const notify = useCallback((message, type = 'info', duration = 4000) => {
    return addToast(message, type, duration);
  }, []);

  const removeToast = useCallback((id) => {
    dismissToast(id);
  }, []);

  return (
    <ToastContext.Provider value={notify}>
      {children}
      <div className="fixed bottom-20 right-4 z-[100] flex flex-col gap-2 sm:bottom-6 sm:right-6">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const notify = useContext(ToastContext);
  if (!notify) throw new Error('useToast must be used within ToastProvider');
  return notify;
}

export { dismissToast };
