export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-mist-200 bg-white/60 px-6 py-14 text-center">
      {Icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-mist-100 text-slate-500">
          <Icon size={22} strokeWidth={1.75} />
        </div>
      )}
      <h3 className="text-[15px] font-bold text-ink-800">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-[13.5px] text-slate-500">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
