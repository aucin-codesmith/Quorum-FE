import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback(
    (message, { variant = "success", description } = {}) => {
      const id = ++toastId;
      setToasts((current) => [...current, { id, message, description, variant }]);
      setTimeout(() => dismiss(id), 4500);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex w-full max-w-sm flex-col gap-2.5 sm:right-6 sm:bottom-6">
        {toasts.map((t) => (
          <ToastCard key={t.id} toast={t} onClose={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({ toast, onClose }) {
  const styles = {
    success: { icon: CheckCircle2, iconClass: "text-success-600", bar: "bg-success-600" },
    warning: { icon: AlertTriangle, iconClass: "text-warning-600", bar: "bg-warning-600" },
    danger: { icon: AlertTriangle, iconClass: "text-danger-600", bar: "bg-danger-600" },
    info: { icon: Info, iconClass: "text-accent-500", bar: "bg-accent-500" },
  }[toast.variant] ?? { icon: Info, iconClass: "text-accent-500", bar: "bg-accent-500" };

  const Icon = styles.icon;

  return (
    <div className="animate-toast-in relative overflow-hidden rounded-xl border border-mist-200 bg-white pl-4 pr-3 py-3.5 shadow-panel">
      <div className={`absolute inset-y-0 left-0 w-1 ${styles.bar}`} />
      <div className="flex items-start gap-3">
        <Icon size={18} className={`mt-0.5 shrink-0 ${styles.iconClass}`} strokeWidth={2} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-ink-800">{toast.message}</p>
          {toast.description && (
            <p className="mt-0.5 text-[13px] leading-snug text-slate-500">{toast.description}</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="shrink-0 rounded-md p-1 text-mist-300 transition-colors hover:bg-mist-50 hover:text-ink-700"
          aria-label="Dismiss notification"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
