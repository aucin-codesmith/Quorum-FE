import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, CalendarDays, Clock, Users, Hash, AlignLeft, Ban, CalendarX2 } from "lucide-react";
import StatusBadge from "@/components/common/StatusBadge";
import EmptyState from "@/components/common/EmptyState";
import { ErrorState, PageSkeleton } from "@/components/common/QueryState";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useReservation, useReservationMutations } from "@/hooks/useReservations";
import { useToast } from "@/hooks/useToast";
import { errorMessage } from "@/lib/formErrors";
import { formatDate, formatTimeRange } from "@/utils/format";

export default function ReservationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { reservation, isLoading, isError, error, refetch } = useReservation(id);
  const { cancelReservation } = useReservationMutations();
  const { notify } = useToast();
  const [cancelOpen, setCancelOpen] = useState(false);

  if (isLoading) return <PageSkeleton blocks={2} />;

  // The API answers 404 for a reservation that is missing or belongs to someone else.
  if (isError && error.status !== 404 && error.status !== 400) {
    return <ErrorState error={error} onRetry={refetch} title="We couldn't load this reservation" />;
  }
  if (isError || !reservation) {
    return (
      <EmptyState
        icon={CalendarX2}
        title="Reservation not found"
        description="This reservation may have been removed."
        action={
          <Button variant="outline" onClick={() => navigate("/my-reservations")}>
            Back to reservations
          </Button>
        }
      />
    );
  }

  const canCancel = reservation.status === "upcoming";

  const handleCancel = async () => {
    try {
      await cancelReservation(reservation.id);
      notify("Reservation cancelled", { description: `${reservation.title} has been cancelled.`, variant: "danger" });
    } catch (err) {
      notify("Could not cancel the reservation", { description: errorMessage(err), variant: "danger" });
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <Button variant="ghost" size="sm" className="-ml-4" onClick={() => navigate("/my-reservations")}>
        <ArrowLeft /> Back to my reservations
      </Button>

      <Card>
        <CardContent className="sm:p-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Hash size={16} /> {reservation.id}
              </p>
              <h1 className="mt-2 text-3xl font-bold">{reservation.title}</h1>
            </div>
            <StatusBadge status={reservation.status} />
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DetailRow icon={MapPin} label="Room" value={`${reservation.roomName}, ${reservation.roomFloor}`} />
            <DetailRow icon={CalendarDays} label="Date" value={formatDate(reservation.date)} />
            <DetailRow icon={Clock} label="Time" value={formatTimeRange(reservation.startTime, reservation.endTime)} />
            <DetailRow icon={Users} label="Participants" value={`${reservation.participants} people`} />
          </div>

          {reservation.description && (
            <>
              <Separator className="my-8" />
              <h2 className="flex items-center gap-2 text-base font-semibold">
                <AlignLeft size={16} className="text-primary-soft" /> Description
              </h2>
              <p className="mt-3 text-base leading-relaxed text-foreground/80">{reservation.description}</p>
            </>
          )}

          <Separator className="my-6" />
          <p className="text-sm text-muted-foreground">
            Reservation created on {formatDate(reservation.createdAt.split("T")[0], { short: true })}
          </p>

          {canCancel && (
            <>
              <Separator className="my-8" />
              <Button variant="destructive" onClick={() => setCancelOpen(true)}>
                <Ban /> Cancel reservation
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Cancel this reservation?"
        description={`${reservation.title} in ${reservation.roomName} on ${formatDate(reservation.date, { short: true })}, ${formatTimeRange(reservation.startTime, reservation.endTime)}. This cannot be undone.`}
        confirmLabel="Cancel reservation"
        cancelLabel="Keep reservation"
        onConfirm={handleCancel}
      />
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-4 rounded-xl bg-tint-soft p-4">
      <Icon size={18} className="mt-0.5 shrink-0 text-primary-soft" />
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="truncate text-[15px] font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}
