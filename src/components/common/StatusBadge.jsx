import { Badge } from "@/components/ui/badge";
import { statusMeta } from "@/utils/format";

const dotClasses = {
  success: "bg-success",
  danger: "bg-danger",
  accent: "bg-primary",
  neutral: "bg-primary-soft",
};

export default function StatusBadge({ status, className }) {
  const { label, variant } = statusMeta(status);
  return (
    <Badge variant={variant} className={className}>
      <span aria-hidden="true" className={`size-1.5 rounded-full ${dotClasses[variant]}`} />
      {label}
    </Badge>
  );
}
