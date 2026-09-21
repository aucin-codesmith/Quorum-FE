import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export default function FacilitiesFilter({ options, selected, onToggle }) {
  return (
    <ToggleGroup
      type="multiple"
      value={selected}
      onValueChange={(next) => {
        // onToggle flips a single facility; find the one that changed.
        const changed = [...options].find((o) => next.includes(o) !== selected.includes(o));
        if (changed) onToggle(changed);
      }}
      spacing={2}
      className="flex w-full flex-wrap justify-start gap-2"
      aria-label="Filter by facilities"
    >
      {options.map((facility) => (
        <ToggleGroupItem
          key={facility}
          value={facility}
          variant="outline"
          className="h-10 rounded-full px-4 text-sm font-medium text-muted-foreground data-[state=on]:border-primary data-[state=on]:bg-tint data-[state=on]:text-foreground"
        >
          {facility}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
