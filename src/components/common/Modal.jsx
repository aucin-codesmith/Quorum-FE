import { useEffect } from "react";
import { X } from "lucide-react";

export default function Modal({ open, onClose, title, description, children, width = "max-w-md" }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="animate-fade-in absolute inset-0 bg-ink-900/45 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        className={`animate-modal-in relative w-full ${width} rounded-2xl bg-white shadow-pop`}
        role="dialog"
        aria-modal="true"
      >
        {(title || onClose) && (
          <div className="flex items-start justify-between gap-4 border-b border-mist-100 px-6 py-5">
            <div>
              {title && (
                <h3 className="text-[17px] font-bold tracking-[-0.01em] text-ink-800">{title}</h3>
              )}
              {description && <p className="mt-1 text-[13.5px] text-slate-500">{description}</p>}
            </div>
            <button
              onClick={onClose}
              className="shrink-0 rounded-lg p-1.5 text-mist-300 transition-colors hover:bg-mist-50 hover:text-ink-700"
              aria-label="Close dialog"
            >
              <X size={18} />
            </button>
          </div>
        )}
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
