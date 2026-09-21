import { NavLink, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import Logo from "./Logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { getInitials, roleLabel } from "@/utils/format";

export default function Sidebar({ items, area, onNavigate }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    onNavigate?.();
    logout();
    navigate("/login");
  };

  return (
    <div className="flex h-full flex-col border-r bg-background">
      <div className="flex items-center gap-3 px-6 py-6">
        <Logo />
        {area === "admin" && <Badge variant="accent">Admin</Badge>}
      </div>

      <nav className="flex-1 space-y-2 px-4 pt-4" aria-label="Main">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-4 py-3 text-[15px] transition-colors ${
                isActive
                  ? "bg-sidebar-accent font-semibold text-sidebar-accent-foreground"
                  : "font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
              }`
            }
          >
            <Icon size={18} strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </nav>

      <Separator />
      <div className="px-4 py-4">
        <div className="mb-2 flex items-center gap-3 px-2 py-2">
          <Avatar className="size-10">
            <AvatarFallback className="bg-tint text-sm font-semibold text-foreground">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
            <p className="truncate text-sm text-muted-foreground">{roleLabel(user.role)}</p>
          </div>
        </div>
        <Button variant="ghost" className="w-full justify-start px-4" onClick={handleLogout}>
          <LogOut /> Log out
        </Button>
      </div>
    </div>
  );
}
