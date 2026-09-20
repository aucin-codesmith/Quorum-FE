export default function Logo({ variant = "dark", size = "md" }) {
  const textColor = variant === "light" ? "text-white" : "text-ink-800";
  const markBg = variant === "light" ? "bg-white text-ink-800" : "bg-ink-800 text-white";
  const dims = size === "lg" ? "h-10 w-10 text-base" : "h-8 w-8 text-[13px]";
  const textSize = size === "lg" ? "text-[22px]" : "text-[17px]";

  return (
    <div className="flex items-center gap-2.5">
      <div className={`flex ${dims} shrink-0 items-center justify-center rounded-[9px] font-display font-semibold ${markBg}`}>
        Q
      </div>
      <span className={`font-display ${textSize} font-medium tracking-[-0.01em] ${textColor}`}>
        QUORUM
      </span>
    </div>
  );
}
