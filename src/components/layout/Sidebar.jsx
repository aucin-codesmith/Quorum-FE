import { NavLink, useNavigate } from "react-router-dom";
import { LayoutGrid, DoorOpen, CalendarCheck2, LogOut, X } from "lucide-react";
import Logo from "./Logo";
import { currentUser } from "../../data/mockData";
import { getInitials } from "../../utils/format";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { to: "/rooms", label: "Find a Room", icon: DoorOpen },
  { to: "/my-reservations", label: "My Reservations", icon: CalendarCheck2 },
];

export default function Sidebar({ onNavigate }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onNavigate?.();
    navigate("/login");
  };

  return (
    <div className="flex h-full flex-col bg-ink-800">
      <div className="flex items-center justify-between px-6 py-6">
        <Logo variant="light" />
        <button
          onClick={onNavigate}
          className="rounded-lg p-1.5 text-white/50 hover:bg-white/5 hover:text-white lg:hidden"
          aria-label="Close menu"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-4 pt-2">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-[14px] font-medium transition-colors ${
                isActive
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <Icon size={18} strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 px-4 py-4">
        <div className="mb-1 flex items-center gap-3 rounded-lg px-2 py-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-500/25 text-[12.5px] font-bold text-white">
            {getInitials(currentUser.name)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[13.5px] font-semibold text-white">{currentUser.name}</p>
            <p className="truncate text-[12px] text-white/45">{currentUser.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="mt-1 flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-[13.5px] font-medium text-white/60 transition-colors hover:bg-white/5 hover:text-white"
        >
          <LogOut size={17} strokeWidth={2} />
          Log out
        </button>
      </div>
    </div>
  );
}
