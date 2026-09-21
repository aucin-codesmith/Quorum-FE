import { Suspense, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { adminNav, employeeNav, resolveTitle } from "./navItems";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";

export default function AppLayout({ area = "employee" }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { pathname } = useLocation();
  const items = area === "admin" ? adminNav : employeeNav;

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="fixed h-screen w-64">
          <Sidebar items={items} area={area} />
        </div>
      </aside>

      {/* Mobile drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="left" className="w-72 max-w-[80vw] gap-0 p-0 lg:hidden" showCloseButton>
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SheetDescription className="sr-only">Main navigation menu</SheetDescription>
          <Sidebar items={items} area={area} onNavigate={() => setDrawerOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <Header title={resolveTitle(pathname)} onOpenMenu={() => setDrawerOpen(true)} />
        <main className="flex-1 px-6 py-8 sm:px-8 sm:py-12">
          <div className="mx-auto w-full max-w-6xl">
            <Suspense fallback={null}>
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}
