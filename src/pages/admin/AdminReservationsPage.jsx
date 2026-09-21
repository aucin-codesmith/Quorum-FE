import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Ban, CalendarRange, CheckCheck, Eye, Plus, Trash2 } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import StatusBadge from "@/components/common/StatusBadge";
import EmptyState from "@/components/common/EmptyState";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import DataPagination from "@/components/common/DataPagination";
import { ErrorState, TableSkeleton } from "@/components/common/QueryState";
import RowMenu from "@/components/admin/RowMenu";
import ReservationSheet from "@/components/admin/ReservationSheet";
import TableFilters from "@/components/admin/TableFilters";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useReservationMutations, useReservations } from "@/hooks/useReservations";
import { useRooms } from "@/hooks/useRooms";
import { useStats } from "@/hooks/useStats";
import { useToast } from "@/hooks/useToast";
import { errorMessage } from "@/lib/formErrors";
import { formatDate, formatTimeRange } from "@/utils/format";

const PAGE_SIZE = 10;

export default function AdminReservationsPage() {
  const navigate = useNavigate();
  const { notify } = useToast();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("any");
  const [roomId, setRoomId] = useState("any");
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState(null);
  const [confirm, setConfirm] = useState(null); // { kind: "cancel" | "delete", reservation }

  const q = useDebouncedValue(query.trim());
  const { reservations, meta, isLoading, isFetching, isError, error, refetch } = useReservations({
    page,
    limit: PAGE_SIZE,
    q,
    status: status === "any" ? undefined : status,
    roomId: roomId === "any" ? undefined : roomId,
    sort: "-date",
  });
  const { rooms } = useRooms();
  const { stats } = useStats();
  const { cancelReservation, completeReservation, deleteReservation } = useReservationMutations();

  // If the current page no longer exists (e.g. its last row was deleted or filtered out), step back.
  // Adjusting state during render is React's supported pattern for state derived from other data.
  if (meta && page > meta.totalPages) setPage(meta.totalPages);

  const c = stats?.reservations;
  const withCount = (label, n) => (c ? `${label} (${n})` : label);
  const statusOptions = [
    { value: "any", label: withCount("All statuses", c?.total) },
    { value: "upcoming", label: withCount("Upcoming", c?.upcoming) },
    { value: "completed", label: withCount("Completed", c?.completed) },
    { value: "cancelled", label: withCount("Cancelled", c?.cancelled) },
  ];
  const roomOptions = [{ value: "any", label: "All rooms" }, ...rooms.map((r) => ({ value: r.id, label: r.name }))];

  // Derived from the current page so the sheet reflects the latest status after an action.
  const opened = reservations.find((r) => r.id === openId) ?? null;

  const complete = async (r) => {
    try {
      await completeReservation(r.id);
      notify("Marked as completed", { description: r.title });
    } catch (err) {
      notify("Could not update the reservation", { description: errorMessage(err), variant: "danger" });
    }
  };

  const runConfirm = async () => {
    const { kind, reservation: r } = confirm;
    setConfirm(null);
    try {
      if (kind === "cancel") {
        await cancelReservation(r.id);
        notify("Reservation cancelled", { description: `${r.title} was cancelled.`, variant: "danger" });
      } else {
        await deleteReservation(r.id);
        setOpenId(null);
        notify("Record deleted", { description: `${r.title} was removed.`, variant: "danger" });
      }
    } catch (err) {
      notify(kind === "cancel" ? "Could not cancel the reservation" : "Could not delete the record", {
        description: errorMessage(err),
        variant: "danger",
      });
    }
  };

  const resetPage = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Reservations"
        description="Monitor every booking, step in when plans change, and book on someone's behalf."
        actions={
          <Button onClick={() => navigate("/admin/reservations/new")}>
            <Plus /> New reservation
          </Button>
        }
      />

      <TableFilters
        query={query}
        onQueryChange={resetPage(setQuery)}
        searchPlaceholder="Search title, person or room…"
        searchLabel="Search reservations"
        summary={meta ? `${meta.total} ${meta.total === 1 ? "reservation" : "reservations"}` : undefined}
        filters={[
          { key: "status", label: "Status", value: status, onChange: resetPage(setStatus), options: statusOptions },
          { key: "room", label: "Room", value: roomId, onChange: resetPage(setRoomId), options: roomOptions },
        ]}
      />

      {isLoading ? (
        <TableSkeleton />
      ) : isError ? (
        <ErrorState error={error} onRetry={refetch} title="We couldn't load the reservations" />
      ) : reservations.length === 0 ? (
        <EmptyState
          icon={CalendarRange}
          title="No reservations here"
          description="Nothing matches this filter yet. Try another filter, or create a reservation."
          action={
            <Button variant="outline" size="sm" onClick={() => navigate("/admin/reservations/new")}>
              <Plus /> New reservation
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          <Card className={`py-0 transition-opacity ${isFetching ? "opacity-60" : ""}`}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Meeting</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>When</TableHead>
                  <TableHead>Booked by</TableHead>
                  <TableHead>Guests</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reservations.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <button
                        onClick={() => setOpenId(r.id)}
                        className="max-w-56 truncate text-left font-semibold text-foreground hover:underline"
                      >
                        {r.title}
                      </button>
                    </TableCell>
                    <TableCell>{r.roomName}</TableCell>
                    <TableCell>
                      <p className="text-foreground">{formatDate(r.date, { short: true })}</p>
                      <p className="text-sm text-muted-foreground">{formatTimeRange(r.startTime, r.endTime)}</p>
                    </TableCell>
                    <TableCell>{r.userName}</TableCell>
                    <TableCell>{r.participants}</TableCell>
                    <TableCell>
                      <StatusBadge status={r.status} />
                    </TableCell>
                    <TableCell>
                      <RowMenu
                        label={`Actions for ${r.title}`}
                        items={[
                          { label: "View details", icon: Eye, onSelect: () => setOpenId(r.id) },
                          { label: "Mark as completed", icon: CheckCheck, hidden: r.status !== "upcoming", onSelect: () => complete(r) },
                          {
                            label: "Cancel reservation",
                            icon: Ban,
                            hidden: r.status !== "upcoming",
                            onSelect: () => setConfirm({ kind: "cancel", reservation: r }),
                          },
                          {
                            label: "Delete record",
                            icon: Trash2,
                            destructive: true,
                            separatorBefore: true,
                            onSelect: () => setConfirm({ kind: "delete", reservation: r }),
                          },
                        ]}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
          <DataPagination meta={meta} onPageChange={setPage} />
        </div>
      )}

      <ReservationSheet
        reservation={opened}
        onOpenChange={(open) => !open && setOpenId(null)}
        onComplete={complete}
        onCancel={(r) => setConfirm({ kind: "cancel", reservation: r })}
        onDelete={(r) => setConfirm({ kind: "delete", reservation: r })}
      />

      <ConfirmDialog
        open={Boolean(confirm)}
        onOpenChange={(open) => !open && setConfirm(null)}
        title={confirm?.kind === "cancel" ? "Cancel this reservation?" : "Delete this record?"}
        description={
          confirm?.kind === "cancel"
            ? `${confirm.reservation.title} is booked by ${confirm.reservation.userName}. The room is freed for that slot.`
            : `${confirm?.reservation.title} is removed from every list and can't be restored.`
        }
        confirmLabel={confirm?.kind === "cancel" ? "Cancel reservation" : "Delete record"}
        cancelLabel="Keep it"
        onConfirm={runConfirm}
      />
    </div>
  );
}
