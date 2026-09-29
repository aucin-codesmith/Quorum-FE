import { SlidersHorizontal, Search, X } from "lucide-react";
import IconInput from "@/components/common/IconInput";
import SimpleSelect from "@/components/common/SimpleSelect";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const ANY = "any";

// One search box plus a single Filter button. Every filter lives in the popover;
// active ones are echoed as removable chips so hidden state stays visible.
//
// filters: [{ key, label, value, onChange, options: [{ value, label }] }]  (value "any" = not filtering)
export default function TableFilters({ query, onQueryChange, searchPlaceholder, searchLabel, filters, summary }) {
  const active = filters.filter((f) => f.value !== ANY);
  const reset = () => filters.forEach((f) => f.onChange(ANY));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <IconInput
          icon={Search}
          placeholder={searchPlaceholder}
          aria-label={searchLabel}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          wrapperClassName="min-w-0 flex-1 sm:max-w-md"
        />

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" aria-label="Filters" className="shrink-0">
              <SlidersHorizontal className="text-primary-soft" />
              <span className="hidden sm:inline">Filters</span>
              {active.length > 0 && (
                <Badge variant="accent" className="h-6 min-w-6 justify-center px-2">
                  {active.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-80 gap-5 p-5">
            {filters.map((f) => (
              <div key={f.key} className="space-y-2">
                <Label htmlFor={`filter-${f.key}`}>{f.label}</Label>
                <SimpleSelect id={`filter-${f.key}`} value={f.value} onValueChange={f.onChange} options={f.options} />
              </div>
            ))}
            <Button variant="ghost" size="sm" className="justify-start" onClick={reset} disabled={active.length === 0}>
              Reset filters
            </Button>
          </PopoverContent>
        </Popover>

        {summary && <p className="ml-auto hidden text-sm text-muted-foreground md:block">{summary}</p>}
      </div>

      {active.length > 0 && (
        <div className="flex flex-wrap items-center gap-2" aria-label="Active filters">
          {active.map((f) => {
            // Option labels may carry a trailing count, e.g. "Upcoming (12)"; the chip only needs the name.
            const label = (f.options.find((o) => o.value === f.value)?.label ?? f.value).replace(/\s\(\d+\)$/, "");
            return (
              <Badge key={f.key} variant="accent" className="gap-1 pr-1">
                {f.label}: {label}
                <button
                  type="button"
                  onClick={() => f.onChange(ANY)}
                  aria-label={`Clear ${f.label} filter`}
                  className="grid size-5 place-items-center rounded-full outline-none hover:bg-tint focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <X size={12} />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
