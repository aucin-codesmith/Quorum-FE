import { useNavigate } from "react-router-dom";
import { CalendarDays, Clock, MapPin, ChevronRight } from "lucide-react";
import StatusBadge from "@/components/common/StatusBadge";
import { Card } from "@/components/ui/card";
import { formatDate, formatTimeRange } from "@/utils/format";
import { parseISODate } from "@/utils/date";

export default function ReservationCard({ reservation }) {
  const navigate = useNavigate();
  const date = parseISODate(reservation.date);

  return (
    <Card className="p-0 transition-shadow duration-200 hover:shadow-md">
      <button
        onClick={() => navigate(`/my-reservations/${reservation.id}`)}
        className="flex w-full items-center gap-4 rounded-xl p-6 text-left"
      >
        <div className="hidden h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-tint-soft text-foreground sm:flex">
          <span className="text-xs font-medium">{date.toLocaleDateString("en-US", { month: "short" })}</span>
          <span className="text-xl leading-none font-semibold">{date.getDate()}</span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h4 className="truncate text-base font-semibold">{reservation.title}</h4>
            <StatusBadge status={reservation.status} />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <MapPin size={16} /> {reservation.roomName}
            </span>
            <span className="flex items-center gap-2">
              <CalendarDays size={16} /> {formatDate(reservation.date, { short: true })}
            </span>
            <span className="flex items-center gap-2">
              <Clock size={16} /> {formatTimeRange(reservation.startTime, reservation.endTime)}
            </span>
          </div>
        </div>

        <ChevronRight size={18} className="shrink-0 text-primary-soft" />
      </button>
    </Card>
  );
}
