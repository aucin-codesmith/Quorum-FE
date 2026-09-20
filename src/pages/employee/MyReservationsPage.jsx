import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, CalendarPlus, CalendarX2 } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import ReservationCard from "../../components/reservations/ReservationCard";
import EmptyState from "../../components/common/EmptyState";
import { useReservations } from "../../hooks/useReservations";

const tabs = [
  { key: "all", label: "All" },
  { key: "upcoming", label: "Upcoming" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

export default function MyReservationsPage() {
  const navigate = useNavigate();
  const { reservations } = useReservations();
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");

  const counts = useMemo(
    () => ({
      all: reservations.length,
      upcoming: reservations.filter((r) => r.status === "upcoming").length,
      completed: reservations.filter((r) => r.status === "completed").length,
      cancelled: reservations.filter((r) => r.status === "cancelled").length,
    }),
    [reservations]
  );

  const filtered = useMemo(() => {
    return reservations
      .filter((r) => tab === "all" || r.status === tab)
      .filter(
        (r) =>
          r.title.toLowerCase().includes(query.toLowerCase()) ||
          r.roomName.toLowerCase().includes(query.toLowerCase())
      )
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [reservations, tab, query]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Reservations"
        title="My Reservations"
        description={`You have ${counts.upcoming} upcoming and ${counts.all} total reservations.`}
        actions={
          <Button icon={CalendarPlus} onClick={() => navigate("/rooms")}>
            New Reservation
          </Button>
        }
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1.5 overflow-x-auto rounded-xl bg-mist-100 p-1 sm:overflow-visible">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`shrink-0 rounded-lg px-3.5 py-2 text-[13px] font-semibold transition-colors ${
                tab === t.key
                  ? "bg-white text-ink-800 shadow-sm"
                  : "text-slate-500 hover:text-ink-700"
              }`}
            >
              {t.label}
              <span
                className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[11px] ${
                  tab === t.key ? "bg-mist-100 text-slate-600" : "bg-white/60 text-slate-500"
                }`}
              >
                {counts[t.key]}
              </span>
            </button>
          ))}
        </div>
        <Input
          icon={Search}
          placeholder="Search reservations…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="sm:w-64"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={CalendarX2}
          title="No reservations here"
          description="Reservations matching this filter will show up here."
          action={
            <Button size="sm" icon={CalendarPlus} onClick={() => navigate("/rooms")}>
              Book a Room
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <ReservationCard key={r.id} reservation={r} />
          ))}
        </div>
      )}
    </div>
  );
}
