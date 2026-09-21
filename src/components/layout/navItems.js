import {
  LayoutGrid,
  DoorOpen,
  CalendarCheck2,
  CalendarPlus,
  Building2,
  Users,
  CalendarRange,
} from "lucide-react";

export const employeeNav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { to: "/rooms", label: "Find a room", icon: DoorOpen },
  { to: "/booking", label: "New reservation", icon: CalendarPlus },
  { to: "/my-reservations", label: "My reservations", icon: CalendarCheck2 },
];

export const adminNav = [
  { to: "/admin", label: "Overview", icon: LayoutGrid, end: true },
  { to: "/admin/rooms", label: "Rooms", icon: Building2 },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/reservations", label: "Reservations", icon: CalendarRange },
];

// Longest matching prefix wins, so /admin/reservations/new resolves before /admin.
const titles = [
  ["/dashboard", "Dashboard"],
  ["/rooms/", "Room details"],
  ["/rooms", "Find a room"],
  ["/booking", "New reservation"],
  ["/my-reservations/", "Reservation details"],
  ["/my-reservations", "My reservations"],
  ["/admin/reservations/new", "New reservation"],
  ["/admin/reservations", "Reservations"],
  ["/admin/rooms", "Rooms"],
  ["/admin/users", "Users"],
  ["/admin", "Overview"],
];

export function resolveTitle(pathname) {
  const hit = titles.find(([prefix]) =>
    prefix.endsWith("/") ? pathname.startsWith(prefix) : pathname === prefix
  );
  return hit ? hit[1] : "QUORUM";
}
