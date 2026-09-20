import { useNavigate } from "react-router-dom";
import { CalendarDays, Clock, MapPin, ChevronRight } from "lucide-react";
import Badge from "../common/Badge";
import { formatDate, formatTimeRange, statusMeta } from "../../utils/format";

export default function ReservationCard({ reservation }) {
  const navigate = useNavigate();
  const meta = statusMeta(reservation.status);

  return (
    <button
      onClick={() => navigate(`/my-reservations/${reservation.id}`)}
      className="flex w-full items-center gap-4 rounded-2xl border border-mist-200 bg-white p-4.5 text-left shadow-card transition-shadow hover:shadow-panel"
    >
      <div className="hidden h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-mist-50 text-ink-700 sm:flex">
        <span className="text-[10px] font-bold tracking-wide uppercase">
          {formatDate(reservation.date, { short: true, month: "short", day: undefined }).split(" ")[0]}
        </span>
        <span className="font-display text-[17px] leading-none">
          {new Date(`${reservation.date}T00:00:00`).getDate()}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="truncate text-[14.5px] font-bold text-ink-800">{reservation.title}</h4>
          <Badge tone={meta.tone}>{meta.label}</Badge>
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <MapPin size={13} /> {reservation.roomName}
          </span>
          <span className="flex items-center gap-1.5">
            <CalendarDays size={13} /> {formatDate(reservation.date, { short: true })}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={13} /> {formatTimeRange(reservation.startTime, reservation.endTime)}
          </span>
        </div>
      </div>

      <ChevronRight size={18} className="shrink-0 text-mist-300" />
    </button>
  );
}
