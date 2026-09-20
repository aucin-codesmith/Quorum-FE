import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

const titles = {
  "/dashboard": "Dashboard",
  "/rooms": "Find a Room",
  "/booking": "New Reservation",
  "/my-reservations": "My Reservations",
};

function resolveTitle(pathname) {
  if (titles[pathname]) return titles[pathname];
  if (pathname.startsWith("/rooms/")) return "Room Details";
  if (pathname.startsWith("/my-reservations/")) return "Reservation Details";
  return "QUORUM";
}

export default function AppLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <div className="flex min-h-screen bg-mist-50">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="fixed h-screen w-64">
          <Sidebar />
        </div>
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-ink-900/50"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="animate-drawer-in absolute inset-y-0 left-0 w-72 max-w-[80vw]">
            <Sidebar onNavigate={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <Header title={resolveTitle(pathname)} onOpenMenu={() => setDrawerOpen(true)} />
        <main className="flex-1 px-5 py-6 sm:px-8 sm:py-8">
          <div className="mx-auto w-full max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
