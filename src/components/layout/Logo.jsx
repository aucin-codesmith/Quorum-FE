export default function Logo({ size = "md" }) {
  const dims = size === "lg" ? "size-10 text-base" : "size-8 text-sm";
  const textSize = size === "lg" ? "text-2xl" : "text-lg";

  return (
    <div className="flex items-center gap-3">
      <div className={`flex ${dims} shrink-0 items-center justify-center rounded-xl bg-ink font-semibold text-canvas`}>
        Q
      </div>
      <span className={`${textSize} font-semibold text-ink`}>QUORUM</span>
    </div>
  );
}
