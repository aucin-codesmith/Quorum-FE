import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, CalendarPlus, CalendarX2 } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import IconInput from "@/components/common/IconInput";
import EmptyState from "@/components/common/EmptyState";
import { ErrorState, ListSkeleton } from "@/components/common/QueryState";
import ReservationCard from "@/components/reservations/ReservationCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useReservations } from "@/hooks/useReservations";

const tabs = [
  { key: "all", label: "All" },
  { key: "upcoming", label: "Upcoming" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

export default function MyReservationsPage() {
  const navigate = useNavigate();
  const { reservations, isLoading, isError, error, refetch } = useReservations();
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
    <div className="space-y-8">
      <PageHeader
        title="My reservations"
        description={`You have ${counts.upcoming} upcoming and ${counts.all} total reservations.`}
        actions={
          <Button onClick={() => navigate("/booking")}>
            <CalendarPlus /> New reservation
          </Button>
        }
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={tab} onValueChange={setTab} className="overflow-x-auto">
          <TabsList>
            {tabs.map((t) => (
              <TabsTrigger key={t.key} value={t.key}>
                {t.label}
                <span className="ml-2 font-medium text-muted-foreground">{counts[t.key]}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <IconInput
          icon={Search}
          placeholder="Search reservations…"
          aria-label="Search reservations"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          wrapperClassName="sm:w-72"
        />
      </div>

      {isLoading ? (
        <ListSkeleton />
      ) : isError ? (
        <ErrorState error={error} onRetry={refetch} title="We couldn't load your reservations" />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={CalendarX2}
          title="Nothing here yet"
          description="Reservations that match this filter will appear here. Start by choosing a room."
          action={
            <Button variant="outline" size="sm" onClick={() => navigate("/rooms")}>
              <CalendarPlus /> Choose a room
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((r) => (
            <ReservationCard key={r.id} reservation={r} />
          ))}
        </div>
      )}
    </div>
  );
}
