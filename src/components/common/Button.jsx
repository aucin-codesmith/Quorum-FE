import { Loader2 } from "lucide-react";

const variants = {
  primary:
    "bg-slate-600 text-white hover:bg-ink-800 focus-visible:outline-ink-800 shadow-[0_1px_0_rgba(255,255,255,0.08)_inset]",
  secondary:
    "bg-white text-ink-800 border border-mist-200 hover:border-mist-300 hover:bg-mist-50 focus-visible:outline-slate-500",
  ghost: "text-slate-600 hover:bg-mist-100 focus-visible:outline-slate-500",
  danger: "bg-danger-600 text-white hover:bg-[#9c352d] focus-visible:outline-danger-600",
};

const sizes = {
  sm: "h-9 px-3.5 text-[13px] gap-1.5",
  md: "h-11 px-4.5 text-sm gap-2",
  lg: "h-12 px-6 text-[15px] gap-2",
};

export default function Button({
  variant = "primary",
  size = "md",
  icon: Icon,
  iconPosition = "left",
  loading = false,
  fullWidth = false,
  className = "",
  children,
  disabled,
  ...props
}) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg font-semibold tracking-[-0.01em] transition-all duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98] ${variants[variant]} ${sizes[size]} ${fullWidth ? "w-full" : ""} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        Icon && iconPosition === "left" && <Icon size={16} strokeWidth={2.25} />
      )}
      {children}
      {!loading && Icon && iconPosition === "right" && <Icon size={16} strokeWidth={2.25} />}
    </button>
  );
}
