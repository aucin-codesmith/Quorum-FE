import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarPlus, CalendarClock, CheckCircle2, Activity, ArrowRight } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import StatCard from "@/components/common/StatCard";
import EmptyState from "@/components/common/EmptyState";
import RoomCard from "@/components/rooms/RoomCard";
import ReservationCard from "@/components/reservations/ReservationCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { activityFeed } from "@/data/mockData";
import { useAuth } from "@/hooks/useAuth";
import { useReservations } from "@/hooks/useReservations";
import { useRooms } from "@/hooks/useRooms";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { rooms } = useRooms();
  const { myReservations } = useReservations();

  const upcoming = useMemo(
    () => myReservations.filter((r) => r.status === "upcoming").sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime)),
    [myReservations]
  );
  const completed = useMemo(
    () => myReservations.filter((r) => r.status === "completed").length,
    [myReservations]
  );

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

          <section>
            <h2 className="mb-6 text-xl font-semibold">Recent activity</h2>
            <Card className="gap-0 divide-y py-0">
              {activityFeed.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4 px-6 py-4">
                  <p className="text-[15px] text-foreground/80">{item.text}</p>
                  <span className="shrink-0 text-sm text-muted-foreground">{item.time}</span>
                </div>
              ))}
            </Card>
          </section>
        </div>

        <section>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Available now</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate("/rooms")}>
              Browse <ArrowRight />
            </Button>
          </div>
          <div className="space-y-6">
            {rooms
              .filter((r) => r.status === "available")
              .slice(0, 2)
              .map((room) => (
                <RoomCard key={room.id} room={room} />
              ))}
          </div>
        </section>
      </div>
    </div>
  );
}
