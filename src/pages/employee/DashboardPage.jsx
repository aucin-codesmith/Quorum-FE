import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarPlus,
  CalendarClock,
  CheckCircle2,
  Activity,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import StatCard from "../../components/common/StatCard";
import Button from "../../components/common/Button";
import RoomCard from "../../components/rooms/RoomCard";
import ReservationCard from "../../components/reservations/ReservationCard";
import EmptyState from "../../components/common/EmptyState";
import { rooms, currentUser, activityFeed } from "../../data/mockData";
import { useReservations } from "../../hooks/useReservations";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { reservations } = useReservations();

  const upcoming = useMemo(
    () => reservations.filter((r) => r.status === "upcoming"),
    [reservations]
  );
  const active = upcoming.length;
  const completed = useMemo(
    () => reservations.filter((r) => r.status === "completed").length,
    [reservations]
  );

  const firstName = currentUser.name.split(" ")[0];

  return (
    <div className="space-y-8">
      {/* Hero / greeting */}
      <div className="relative overflow-hidden rounded-2xl bg-ink-800 px-6 py-8 sm:px-9 sm:py-10">
        <div
          className="pointer-events-none absolute -top-20 -right-16 h-64 w-64 rounded-full bg-accent-500/25 blur-3xl"
        />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="flex items-center gap-1.5 text-[12px] font-bold tracking-[0.08em] text-accent-300 uppercase">
              <Sparkles size={13} /> Good to see you
            </p>
            <h1 className="mt-1.5 font-display text-[28px] text-white sm:text-[32px]">
              Welcome back, {firstName}
            </h1>
            <p className="mt-2 max-w-md text-[14px] text-white/55">
              You have {active} upcoming {active === 1 ? "reservation" : "reservations"} this
              week. Book a room in seconds or check what&apos;s on your calendar.
            </p>
          </div>
          <Button
            size="lg"
            icon={CalendarPlus}
            className="bg-white text-ink-800 hover:bg-mist-100 shrink-0"
            onClick={() => navigate("/rooms")}
          >
            Book a Room
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Upcoming Reservations" value={upcoming.length} icon={CalendarClock} tone="accent" />
        <StatCard label="Active Reservations" value={active} icon={Activity} />
        <StatCard label="Completed Meetings" value={completed} icon={CheckCircle2} tone="success" />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Upcoming reservations */}
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[15px] font-bold text-ink-800">Upcoming Reservations</h2>
            <button
              onClick={() => navigate("/my-reservations")}
              className="flex items-center gap-1 text-[13px] font-semibold text-slate-600 hover:text-ink-800"
            >
              View all <ArrowRight size={14} />
            </button>
          </div>

          {upcoming.length === 0 ? (
            <EmptyState
              icon={CalendarClock}
              title="No upcoming reservations"
              description="Book a meeting room to see it appear here."
              action={
                <Button size="sm" icon={CalendarPlus} onClick={() => navigate("/rooms")}>
                  Book a Room
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              {upcoming.slice(0, 3).map((r) => (
                <ReservationCard key={r.id} reservation={r} />
              ))}
            </div>
          )}

          {/* Recent activity */}
          <div className="mt-8">
            <h2 className="mb-4 text-[15px] font-bold text-ink-800">Recent Activity</h2>
            <div className="divide-y divide-mist-100 rounded-2xl border border-mist-200 bg-white">
              {activityFeed.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4 px-4.5 py-3.5">
                  <p className="text-[13.5px] text-ink-700">{item.text}</p>
                  <span className="shrink-0 text-[12px] text-mist-300">{item.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Available rooms preview */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[15px] font-bold text-ink-800">Available Now</h2>
            <button
              onClick={() => navigate("/rooms")}
              className="flex items-center gap-1 text-[13px] font-semibold text-slate-600 hover:text-ink-800"
            >
              Browse <ArrowRight size={14} />
            </button>
          </div>
          <div className="space-y-4">
            {rooms
              .filter((r) => r.status === "available")
              .slice(0, 2)
              .map((room) => (
                <RoomCard key={room.id} room={room} compact />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
