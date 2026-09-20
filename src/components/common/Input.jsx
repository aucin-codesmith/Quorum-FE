export default function Input({
  label,
  hint,
  error,
  icon: Icon,
  suffix,
  className = "",
  id,
  ...props
}) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-[13px] font-semibold text-ink-700">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon
            size={17}
            strokeWidth={2}
            className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-mist-300"
          />
        )}
        <input
          id={inputId}
          className={`h-11 w-full rounded-lg border bg-white text-[14px] text-ink-800 placeholder:text-mist-300 transition-colors focus:outline-none focus:ring-3 ${
            error
              ? "border-danger-600/60 focus:border-danger-600 focus:ring-danger-600/10"
              : "border-mist-200 focus:border-slate-500 focus:ring-slate-500/10"
          } ${Icon ? "pl-10.5" : "pl-3.5"} ${suffix ? "pr-11" : "pr-3.5"}`}
          {...props}
        />
        {suffix && (
          <div className="absolute top-1/2 right-2 -translate-y-1/2">{suffix}</div>
        )}
      </div>
      {error ? (
        <p className="mt-1.5 text-[12.5px] font-medium text-danger-600">{error}</p>
      ) : (
        hint && <p className="mt-1.5 text-[12.5px] text-slate-500">{hint}</p>
      )}
    </div>
  );
}
