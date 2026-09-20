const toneClasses = {
  success: "bg-success-100 text-success-600",
  warning: "bg-warning-100 text-warning-600",
  danger: "bg-danger-100 text-danger-600",
  accent: "bg-accent-500/12 text-slate-600",
  neutral: "bg-mist-100 text-slate-600",
};

const dotClasses = {
  success: "bg-success-600",
  warning: "bg-warning-600",
  danger: "bg-danger-600",
  accent: "bg-accent-500",
  neutral: "bg-mist-300",
};

export default function Badge({ tone = "neutral", dot = true, children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold tracking-[-0.01em] ${toneClasses[tone]} ${className}`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${dotClasses[tone]}`} />}
      {children}
    </span>
  );
}
