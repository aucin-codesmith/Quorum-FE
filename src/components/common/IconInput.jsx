import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// shadcn Input with a decorative leading icon and an optional trailing slot (e.g. a show-password button).
export default function IconInput({ icon: Icon, suffix, className, wrapperClassName, ...props }) {
  return (
    <div className={cn("relative", wrapperClassName)}>
      {Icon && (
        <Icon
          size={18}
          strokeWidth={2}
          className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-primary-soft"
        />
      )}
      <Input className={cn(Icon && "pl-11", suffix && "pr-12", className)} {...props} />
      {suffix && <div className="absolute top-1/2 right-2 -translate-y-1/2">{suffix}</div>}
    </div>
  );
}
