export default function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <p className="mb-1.5 text-[12px] font-bold tracking-[0.08em] text-accent-500 uppercase">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-[28px] leading-tight text-ink-800 sm:text-[32px]">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 max-w-xl text-[14.5px] text-slate-500">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2.5">{actions}</div>}
    </div>
  );
}
