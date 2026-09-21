import { createContext, useCallback, useContext, useMemo } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

// Thin wrapper so pages keep calling notify(message, { variant, description }).
// Rendering and stacking are handled by shadcn's Sonner toaster.

const ToastContext = createContext(null);

const methods = { success: toast.success, danger: toast.error, info: toast.info };

export function ToastProvider({ children }) {
  // `id` lets repeated notifications (e.g. React StrictMode re-runs) collapse into one toast.
  const notify = useCallback((message, { variant = "success", description, id } = {}) => {
    (methods[variant] ?? toast)(message, { description, id });
  }, []);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toaster position="bottom-right" />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
