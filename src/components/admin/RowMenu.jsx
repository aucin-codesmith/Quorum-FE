import { Fragment } from "react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// items: [{ label, icon, onSelect, destructive?, hidden?, separatorBefore? }]
export default function RowMenu({ items, label = "Row actions" }) {
  const visible = items.filter((i) => !i.hidden);
  if (visible.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={label}>
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        {visible.map(({ label: text, icon: Icon, onSelect, destructive, separatorBefore }) => (
          <Fragment key={text}>
            {separatorBefore && <DropdownMenuSeparator />}
            <DropdownMenuItem variant={destructive ? "destructive" : "default"} onSelect={onSelect}>
              {Icon && <Icon />} {text}
            </DropdownMenuItem>
          </Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
