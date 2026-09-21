import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { CalendarPlus, CalendarClock, CheckCircle2, Activity, ArrowRight } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import StatCard from "@/components/common/StatCard";
import EmptyState from "@/components/common/EmptyState";
import { ErrorState, PageSkeleton } from "@/components/common/QueryState";
import RoomCard from "@/components/rooms/RoomCard";
import ReservationCard from "@/components/reservations/ReservationCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useReservations } from "@/hooks/useReservations";
import { useRooms } from "@/hooks/useRooms";

// Recent activity is derived from the user's own reservations rather than a separate feed.
function buildActivity(reservations) {
  const events = [];
  for (const r of reservations) {
    events.push({ id: `${r.id}-booked`, at: r.createdAt, text: `You booked ${r.roomName} for \u201C${r.title}\u201D` });
    if (r.status === "cancelled") {
      events.push({ id: `${r.id}-cancelled`, at: r.updatedAt, text: `You cancelled \u201C${r.title}\u201D in ${r.roomName}` });
    } else if (r.status === "completed") {
      events.push({ id: `${r.id}-done`, at: r.updatedAt, text: `Your ${r.roomName} reservation \u201C${r.title}\u201D was completed` });
    }
  }
  return events.sort((a, b) => b.at.localeCompare(a.at)).slice(0, 4);
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { rooms } = useRooms({ status: "available", limit: 2 });
  const { reservations, isLoading, isError, error, refetch } = useReservations();

  const upcoming = useMemo(
    () =>
      reservations
        .filter((r) => r.status === "upcoming")
        .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime)),
    [reservations]
  );
  const completed = useMemo(() => reservations.filter((r) => r.status === "completed").length, [reservations]);
  const activity = useMemo(() => buildActivity(reservations), [reservations]);

  if (isLoading) return <PageSkeleton />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  const firstName = user.name.split(" ")[0];
  const active = upcoming.length;

  return (
    <div className="space-y-12">
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description={`You have ${active} upcoming ${active === 1 ? "reservation" : "reservations"}.`}
        actions={
          <Button size="lg" onClick={() => navigate("/booking")}>
            <CalendarPlus /> Book a room
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Upcoming reservations" value={upcoming.length} icon={CalendarClock} />
        <StatCard label="Active reservations" value={active} icon={Activity} />
        <StatCard label="Completed meetings" value={completed} icon={CheckCircle2} tone="success" />
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        <div className="space-y-12 lg:col-span-2">
          <section>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Upcoming reservations</h2>
              <Button variant="ghost" size="sm" onClick={() => navigate("/my-reservations")}>
                View all <ArrowRight />
              </Button>
            </div>

            {upcoming.length === 0 ? (
              <EmptyState
                icon={CalendarClock}
                title="Nothing booked yet"
                description="Start by choosing a room, and your next meeting will show up here."
                action={
                  <Button variant="outline" size="sm" onClick={() => navigate("/rooms")}>
                    <CalendarPlus /> Choose a room
                  </Button>
                }
              />
            ) : (
              <div className="space-y-4">
                {upcoming.slice(0, 3).map((r) => (
                  <ReservationCard key={r.id} reservation={r} />
                ))}
              </div>
            )}
          </section>

          {activity.length > 0 && (
            <section>
              <h2 className="mb-6 text-xl font-semibold">Recent activity</h2>
              <Card className="gap-0 divide-y py-0">
                {activity.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-4 px-6 py-4">
                    <p className="text-[15px] text-foreground/80">{item.text}</p>
                    <span className="shrink-0 text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(item.at), { addSuffix: true })}
                    </span>
                  </div>
                ))}
              </Card>
            </section>
          )}
        </div>

        <section>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Available now</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate("/rooms")}>
              Browse <ArrowRight />
            </Button>
          </div>
          <div className="space-y-6">
            {rooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
