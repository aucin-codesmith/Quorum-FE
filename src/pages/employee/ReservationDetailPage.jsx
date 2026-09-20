import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  CalendarDays,
  Clock,
  Users,
  Hash,
  AlignLeft,
  Ban,
  CalendarX2,
} from "lucide-react";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import EmptyState from "../../components/common/EmptyState";
import { useReservations } from "../../hooks/useReservations";
import { useToast } from "../../hooks/useToast";
import { formatDate, formatTimeRange, statusMeta } from "../../utils/format";

export default function ReservationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getReservation, cancelReservation } = useReservations();
  const { notify } = useToast();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const reservation = getReservation(id);

  if (!reservation) {
    return (
      <EmptyState
        icon={CalendarX2}
        title="Reservation not found"
        description="This reservation may have been removed."
        action={<Button onClick={() => navigate("/my-reservations")}>Back to Reservations</Button>}
      />
    );
  }

  const meta = statusMeta(reservation.status);
  const canCancel = reservation.status === "upcoming";

  const handleCancel = () => {
    setCancelling(true);
    setTimeout(() => {
      cancelReservation(reservation.id);
      setCancelling(false);
      setCancelOpen(false);
      notify("Reservation cancelled", {
        description: `${reservation.title} has been cancelled.`,
        variant: "danger",
      });
    }, 700);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <button
        onClick={() => navigate("/my-reservations")}
        className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-500 hover:text-ink-800"
      >
        <ArrowLeft size={15} /> Back to My Reservations
      </button>

      <div className="rounded-2xl border border-mist-200 bg-white p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="flex items-center gap-1.5 text-[12.5px] font-medium text-mist-300">
              <Hash size={13} /> {reservation.id}
            </p>
            <h1 className="mt-1 font-display text-[24px] text-ink-800">{reservation.title}</h1>
          </div>
          <Badge tone={meta.tone}>{meta.label}</Badge>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DetailRow icon={MapPin} label="Room" value={`${reservation.roomName} · ${reservation.roomFloor}`} />
          <DetailRow icon={CalendarDays} label="Date" value={formatDate(reservation.date)} />
          <DetailRow
            icon={Clock}
            label="Time"
            value={formatTimeRange(reservation.startTime, reservation.endTime)}
          />
          <DetailRow icon={Users} label="Participants" value={`${reservation.participants} people`} />
        </div>

        {reservation.description && (
          <div className="mt-6 border-t border-mist-100 pt-5">
            <p className="flex items-center gap-1.5 text-[12px] font-bold tracking-[0.05em] text-ink-700 uppercase">
              <AlignLeft size={13} /> Description
            </p>
            <p className="mt-2 text-[14px] leading-relaxed text-slate-600">
              {reservation.description}
            </p>
          </div>
        )}

        <div className="mt-6 border-t border-mist-100 pt-4">
          <p className="text-[12.5px] text-mist-300">
            Reservation created on {formatDate(reservation.createdAt.split("T")[0], { short: true })}
          </p>
        </div>

        {canCancel && (
          <div className="mt-6 border-t border-mist-100 pt-6">
            <Button variant="danger" icon={Ban} onClick={() => setCancelOpen(true)}>
              Cancel Reservation
            </Button>
          </div>
        )}
      </div>

      <Modal
        open={cancelOpen}
        onClose={() => !cancelling && setCancelOpen(false)}
        title="Cancel this reservation?"
        description="This action cannot be undone in this session."
      >
        <div className="rounded-xl bg-mist-50 p-4">
          <p className="text-[14px] font-bold text-ink-800">{reservation.title}</p>
          <p className="mt-1 text-[13px] text-slate-500">
            {reservation.roomName} · {formatDate(reservation.date, { short: true })} ·{" "}
            {formatTimeRange(reservation.startTime, reservation.endTime)}
          </p>
        </div>
        <div className="mt-4 flex gap-3">
          <Button variant="secondary" fullWidth onClick={() => setCancelOpen(false)} disabled={cancelling}>
            Keep Reservation
          </Button>
          <Button variant="danger" fullWidth onClick={handleCancel} loading={cancelling}>
            Cancel Reservation
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-mist-50 p-3.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500">
        <Icon size={15} />
      </div>
      <div className="min-w-0">
        <p className="text-[11.5px] font-semibold tracking-[0.03em] text-mist-300 uppercase">{label}</p>
        <p className="truncate text-[13.5px] font-semibold text-ink-800">{value}</p>
      </div>
    </div>
  );
}
