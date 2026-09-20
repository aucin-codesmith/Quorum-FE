import { useState } from "react";
import { Menu, Bell, ChevronDown, LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { currentUser } from "../../data/mockData";
import { getInitials } from "../../utils/format";

export default function Header({ title, onOpenMenu }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-mist-200 bg-paper/90 px-5 backdrop-blur-sm sm:px-8">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMenu}
          className="rounded-lg p-2 text-ink-700 hover:bg-mist-100 lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <h2 className="text-[15px] font-bold tracking-[-0.01em] text-ink-800 sm:text-[16px]">
          {title}
        </h2>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-3">
        <button
          className="relative rounded-lg p-2.5 text-ink-700 transition-colors hover:bg-mist-100"
          aria-label="Notifications"
        >
          <Bell size={18} strokeWidth={2} />
          <span className="absolute top-2 right-2.5 h-1.5 w-1.5 rounded-full bg-danger-600" />
        </button>

        <div className="relative">
          <button
            onClick={() => setProfileOpen((v) => !v)}
            className="flex items-center gap-2 rounded-lg py-1.5 pl-1.5 pr-2 transition-colors hover:bg-mist-100"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-600 text-[11.5px] font-bold text-white">
              {getInitials(currentUser.name)}
            </div>
            <ChevronDown size={15} className="hidden text-mist-300 sm:block" />
          </button>

          {profileOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
              <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-xl border border-mist-200 bg-white py-1.5 shadow-panel">
                <div className="border-b border-mist-100 px-4 py-3">
                  <p className="text-[13.5px] font-semibold text-ink-800">{currentUser.name}</p>
                  <p className="truncate text-[12px] text-slate-500">{currentUser.email}</p>
                </div>
                <button className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[13.5px] text-ink-700 hover:bg-mist-50">
                  <User size={15} /> View profile
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[13.5px] text-danger-600 hover:bg-mist-50"
                >
                  <LogOut size={15} /> Log out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
