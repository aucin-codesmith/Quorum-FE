import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Convenience wrapper: <SimpleSelect value onValueChange options={[{ value, label, disabled?, warning? }]} />
// aria-* props go on the trigger so labels and error state reach assistive tech.
// `warning` reuses the same danger token the rest of the app already uses for a conflict (see
// ReservationForm's blocked-room banner), so a disabled option reads as "taken", not just "unpickable".
export default function SimpleSelect({
  value,
  onValueChange,
  options,
  placeholder,
  className,
  id,
  "aria-label": ariaLabel,
  "aria-invalid": ariaInvalid,
  ...props
}) {
  return (
    <Select value={value} onValueChange={onValueChange} {...props}>
      <SelectTrigger id={id} className={className} aria-label={ariaLabel} aria-invalid={ariaInvalid}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem
            key={o.value}
            value={o.value}
            disabled={o.disabled}
            className={o.warning ? "data-disabled:text-danger data-disabled:opacity-100" : undefined}
          >
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
