import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  MapPin,
  CheckCircle2,
  Clock,
  CalendarDays,
} from "lucide-react";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import MockNotice from "../../components/common/MockNotice";
import EmptyState from "../../components/common/EmptyState";
import { rooms, roomSchedules } from "../../data/mockData";
import { statusMeta } from "../../utils/format";

export default function RoomDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const room = rooms.find((r) => r.id === id);
  const schedule = roomSchedules[id] ?? [];

  if (!room) {
    return (
      <EmptyState
        icon={MapPin}
        title="Room not found"
        description="This room may have been removed or renamed."
        action={<Button onClick={() => navigate("/rooms")}>Back to Rooms</Button>}
      />
    );
  }

  const meta = statusMeta(room.status);
  const isAvailable = room.status === "available";

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate("/rooms")}
        className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-500 hover:text-ink-800"
      >
        <ArrowLeft size={15} /> Back to Find a Room
      </button>

      <div className="overflow-hidden rounded-2xl border border-mist-200 bg-white">
        <div className="relative aspect-[21/9] w-full overflow-hidden bg-mist-100 sm:aspect-[21/7]">
          <img src={room.image} alt={room.name} className="h-full w-full object-cover" />
          <div className="absolute top-4 left-4">
            <Badge tone={meta.tone} className="bg-white/95 shadow-sm">
              {meta.label}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 p-6 sm:p-8 lg:grid-cols-3">
          {/* Info column */}
          <div className="lg:col-span-2">
            <h1 className="font-display text-[28px] text-ink-800">{room.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[13.5px] text-slate-500">
              <span className="flex items-center gap-1.5">
                <MapPin size={15} /> {room.floor}
              </span>
              <span className="flex items-center gap-1.5">
                <Users size={15} /> Seats up to {room.capacity}
              </span>
            </div>

            <p className="mt-5 text-[14.5px] leading-relaxed text-slate-600">
              {room.description}
            </p>

            <h3 className="mt-7 text-[13px] font-bold tracking-[0.03em] text-ink-700 uppercase">
              Facilities
            </h3>
            <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {room.facilities.map((f) => (
                <div
                  key={f}
                  className="flex items-center gap-2 rounded-lg bg-mist-50 px-3 py-2.5 text-[13px] font-medium text-slate-600"
                >
                  <CheckCircle2 size={15} className="shrink-0 text-slate-500" />
                  {f}
                </div>
              ))}
            </div>

            <h3 className="mt-7 flex items-center gap-2 text-[13px] font-bold tracking-[0.03em] text-ink-700 uppercase">
              <CalendarDays size={14} /> Today&apos;s Schedule
            </h3>
            {schedule.length === 0 ? (
              <p className="mt-3 text-[13.5px] text-slate-500">
                No meetings scheduled for this room today.
              </p>
            ) : (
              <div className="mt-3 space-y-2">
                {schedule.map((slot, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-lg border border-mist-100 bg-white px-3.5 py-2.5"
                  >
                    <Clock size={14} className="shrink-0 text-mist-300" />
                    <span className="text-[12.5px] font-semibold text-ink-700">
                      {slot.start} – {slot.end}
                    </span>
                    <span className="truncate text-[12.5px] text-slate-500">{slot.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Booking CTA column */}
          <div>
            <div className="sticky top-24 rounded-2xl border border-mist-200 bg-mist-50/60 p-5">
              <p className="text-[13px] font-semibold text-ink-700">Ready to meet here?</p>
              <p className="mt-1 text-[12.5px] text-slate-500">
                {isAvailable
                  ? "This room is currently available for booking."
                  : "This room isn't available for booking right now."}
              </p>
              <Button
                fullWidth
                className="mt-4"
                disabled={!isAvailable}
                onClick={() => navigate(`/booking?room=${room.id}`)}
              >
                Book This Room
              </Button>
              <div className="mt-4">
                <MockNotice text="Schedule and availability shown are demonstration data for this prototype." />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
