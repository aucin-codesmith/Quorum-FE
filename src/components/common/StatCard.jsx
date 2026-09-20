export default function StatCard({ label, value, icon: Icon, tone = "default", trend }) {
  const iconWrap = {
    default: "bg-mist-100 text-slate-600",
    accent: "bg-slate-600 text-white",
    success: "bg-success-100 text-success-600",
  }[tone];

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-mist-200 bg-white p-5 shadow-card">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconWrap}`}>
        <Icon size={20} strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-slate-500">{label}</p>
        <div className="flex items-baseline gap-2">
          <p className="font-display text-[26px] leading-none text-ink-800">{value}</p>
          {trend && <span className="text-[12px] font-semibold text-success-600">{trend}</span>}
        </div>
      </div>
    </div>
  );
}
