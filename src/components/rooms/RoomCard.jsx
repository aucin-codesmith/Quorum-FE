import { useNavigate } from "react-router-dom";
import { Users, MapPin } from "lucide-react";
import Badge from "../common/Badge";
import Button from "../common/Button";
import { statusMeta } from "../../utils/format";

export default function RoomCard({ room, compact = false }) {
  const navigate = useNavigate();
  const meta = statusMeta(room.status);
  const isAvailable = room.status === "available";

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-mist-200 bg-white shadow-card transition-shadow hover:shadow-panel">
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-mist-100">
        <img
          src={room.image}
          alt={room.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
        />
        <div className="absolute top-3 left-3">
          <Badge tone={meta.tone} className="bg-white/95 shadow-sm">
            {meta.label}
          </Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-[17px] text-ink-800">{room.name}</h3>
          <span className="flex shrink-0 items-center gap-1 text-[13px] font-medium text-slate-500">
            <Users size={14} /> {room.capacity}
          </span>
        </div>
        <p className="mt-0.5 flex items-center gap-1 text-[12.5px] text-mist-300">
          <MapPin size={12.5} /> {room.floor}
        </p>

        {!compact && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {room.facilities.slice(0, 3).map((f) => (
              <span
                key={f}
                className="rounded-md bg-mist-50 px-2 py-1 text-[11.5px] font-medium text-slate-600"
              >
                {f}
              </span>
            ))}
            {room.facilities.length > 3 && (
              <span className="rounded-md bg-mist-50 px-2 py-1 text-[11.5px] font-medium text-slate-500">
                +{room.facilities.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="mt-4 flex gap-2 pt-1">
          <Button
            variant="secondary"
            size="sm"
            fullWidth
            onClick={() => navigate(`/rooms/${room.id}`)}
          >
            View Details
          </Button>
          <Button
            size="sm"
            fullWidth
            disabled={!isAvailable}
            onClick={() => navigate(`/booking?room=${room.id}`)}
          >
            Book Room
          </Button>
        </div>
      </div>
    </div>
  );
}
