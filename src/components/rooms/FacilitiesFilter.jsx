export default function FacilitiesFilter({ options, selected, onToggle }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((facility) => {
        const active = selected.includes(facility);
        return (
          <button
            key={facility}
            onClick={() => onToggle(facility)}
            className={`rounded-full border px-3.5 py-1.5 text-[12.5px] font-medium transition-colors ${
              active
                ? "border-slate-600 bg-slate-600 text-white"
                : "border-mist-200 bg-white text-slate-600 hover:border-mist-300"
            }`}
          >
            {facility}
          </button>
        );
      })}
    </div>
  );
}
