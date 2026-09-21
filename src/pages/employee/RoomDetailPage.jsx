import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Users, MapPin, CheckCircle2, Clock, CalendarDays } from "lucide-react";
import StatusBadge from "@/components/common/StatusBadge";
import MockNotice from "@/components/common/MockNotice";
import EmptyState from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useReservations } from "@/hooks/useReservations";
import { useRooms } from "@/hooks/useRooms";
import { formatTime } from "@/utils/format";
import { todayISO } from "@/utils/date";

export default function RoomDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getRoom } = useRooms();
  const { reservations } = useReservations();
  const room = getRoom(id);

  // Today's schedule comes straight from reservations, so new bookings show up here.
  const schedule = useMemo(() => {
    const today = todayISO();
    return reservations
      .filter((r) => r.roomId === id && r.date === today && r.status === "upcoming")
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [reservations, id]);

  if (!room) {
    return (
      <EmptyState
        icon={MapPin}
        title="Room not found"
        description="This room may have been removed or renamed."
        action={
          <Button variant="outline" onClick={() => navigate("/rooms")}>
            Back to rooms
          </Button>
        }
      />
    );
  }

  const isAvailable = room.status === "available";

  return (
    <div className="space-y-8">
      <Button variant="ghost" size="sm" className="-ml-4" onClick={() => navigate("/rooms")}>
        <ArrowLeft /> Back to find a room
      </Button>

      <div className="relative aspect-[21/9] w-full overflow-hidden rounded-xl bg-tint-soft sm:aspect-[21/7]">
        <img src={room.image} alt={room.name} className="h-full w-full object-cover" />
        <div className="absolute top-4 left-4">
          <StatusBadge status={room.status} className="bg-background" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-bold sm:text-4xl">{room.name}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-[15px] text-muted-foreground">
            <span className="flex items-center gap-2">
              <MapPin size={16} /> {room.floor}
            </span>
            <span className="flex items-center gap-2">
              <Users size={16} /> Seats up to {room.capacity}
            </span>
          </div>

          <p className="mt-6 max-w-prose text-base leading-relaxed text-foreground/80">{room.description}</p>

          <h2 className="mt-12 text-xl font-semibold">Facilities</h2>
          {room.facilities.length === 0 ? (
            <p className="mt-4 text-[15px] text-muted-foreground">No extra facilities listed for this room.</p>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {room.facilities.map((f) => (
                <div
                  key={f}
                  className="flex items-center gap-3 rounded-xl bg-tint-soft px-4 py-3 text-sm font-medium text-foreground/80"
                >
                  <CheckCircle2 size={16} className="shrink-0 text-primary-soft" />
                  {f}
                </div>
              ))}
            </div>
          )}

          <h2 className="mt-12 flex items-center gap-3 text-xl font-semibold">
            <CalendarDays size={20} className="text-primary-soft" /> Today&apos;s schedule
          </h2>
          {schedule.length === 0 ? (
            <p className="mt-4 text-[15px] text-muted-foreground">
              No meetings are scheduled for this room today, so it is open all day.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {schedule.map((slot) => (
                <div key={slot.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl bg-tint px-4 py-3">
                  <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Clock size={16} className="shrink-0" />
                    {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                  </span>
                  <span className="text-sm font-medium text-muted-foreground">Booked</span>
                  <span className="min-w-0 truncate text-sm text-foreground/80">{slot.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <Card className="sticky top-24 border-0 bg-tint-soft shadow-none ring-0">
            <CardContent>
              <p className="text-lg font-semibold text-foreground">Ready to meet here?</p>
              <p className="mt-2 text-[15px] text-muted-foreground">
                {isAvailable
                  ? "This room is currently available for booking."
                  : "This room isn't available for booking right now."}
              </p>
              <Button
                className="mt-6 w-full"
                disabled={!isAvailable}
                onClick={() => navigate(`/booking?room=${room.id}`)}
              >
                Book this room
              </Button>
              <div className="mt-6">
                <MockNotice text="Availability shown is demonstration data for this prototype." />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
