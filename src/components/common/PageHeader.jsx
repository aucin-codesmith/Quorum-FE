export default function PageHeader({ title, description, actions }) {
  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-3xl leading-tight font-bold sm:text-4xl">{title}</h1>
        {description && (
          <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-3">{actions}</div>}
    </div>
  );
}
