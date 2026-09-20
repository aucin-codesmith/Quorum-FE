import { ChevronDown } from "lucide-react";

export default function Select({ label, className = "", children, ...props }) {
  return (
    <div className={className}>
      {label && (
        <label className="mb-1.5 block text-[13px] font-semibold text-ink-700">{label}</label>
      )}
      <div className="relative">
        <select
          className="h-11 w-full appearance-none rounded-lg border border-mist-200 bg-white pl-3.5 pr-9 text-[14px] text-ink-800 transition-colors focus:border-slate-500 focus:ring-3 focus:ring-slate-500/10 focus:outline-none"
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          size={16}
          className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-mist-300"
        />
      </div>
    </div>
  );
}
