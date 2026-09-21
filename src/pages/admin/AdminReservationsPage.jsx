import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Ban, CalendarRange, CheckCheck, Eye, Plus, Trash2 } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import StatusBadge from "@/components/common/StatusBadge";
import EmptyState from "@/components/common/EmptyState";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import RowMenu from "@/components/admin/RowMenu";
import ReservationSheet from "@/components/admin/ReservationSheet";
import TableFilters from "@/components/admin/TableFilters";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useReservations } from "@/hooks/useReservations";
import { useRooms } from "@/hooks/useRooms";
import { useToast } from "@/hooks/useToast";
import { formatDate, formatTimeRange } from "@/utils/format";

const statusLabels = [
  { value: "any", label: "All statuses", key: "all" },
  { value: "upcoming", label: "Upcoming", key: "upcoming" },
  { value: "completed", label: "Completed", key: "completed" },
  { value: "cancelled", label: "Cancelled", key: "cancelled" },
];

export default function AdminReservationsPage() {
  const navigate = useNavigate();
  const { rooms } = useRooms();
  const { reservations, cancelReservation, completeReservation, deleteReservation } = useReservations();
  const { notify } = useToast();
  const [status, setStatus] = useState("any");
  const [query, setQuery] = useState("");
  const [roomId, setRoomId] = useState("any");
  const [openId, setOpenId] = useState(null);
  const [confirm, setConfirm] = useState(null); // { kind: "cancel" | "delete", reservation }

  const counts = useMemo(() => {
    const c = { all: reservations.length, upcoming: 0, completed: 0, cancelled: 0 };
    reservations.forEach((r) => (c[r.status] += 1));
    return c;
  }, [reservations]);

  const filtered = useMemo(
    () =>
      reservations
        .filter((r) => status === "any" || r.status === status)
        .filter((r) => roomId === "any" || r.roomId === roomId)
        .filter((r) => `${r.title} ${r.userName} ${r.roomName} ${r.id}`.toLowerCase().includes(query.toLowerCase()))
        .sort((a, b) => b.date.localeCompare(a.date) || b.startTime.localeCompare(a.startTime)),
    [reservations, status, roomId, query]
  );

  // Derived from the store so the sheet always reflects the latest status.
  const opened = reservations.find((r) => r.id === openId) ?? null;

  const complete = (r) => {
    completeReservation(r.id);
    notify("Marked as completed", { description: r.title });
  };

  const runConfirm = () => {
    const { kind, reservation: r } = confirm;
    if (kind === "cancel") {
      cancelReservation(r.id);
      notify("Reservation cancelled", { description: `${r.title} was cancelled.`, variant: "danger" });
    } else {
      deleteReservation(r.id);
      setOpenId(null);
      notify("Record deleted", { description: `${r.title} was removed.`, variant: "danger" });
    }
    setConfirm(null);
  };

  const roomOptions = [{ value: "any", label: "All rooms" }, ...rooms.map((r) => ({ value: r.id, label: r.name }))];

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
        onQueryChange={setQuery}
        searchPlaceholder="Search title, person or room…"
        searchLabel="Search reservations"
        summary={`${filtered.length} of ${counts.all} reservations`}
        filters={[
          {
            key: "status",
            label: "Status",
            value: status,
            onChange: setStatus,
            options: statusLabels.map((o) => ({ value: o.value, label: `${o.label} (${counts[o.key]})` })),
          },
          { key: "room", label: "Room", value: roomId, onChange: setRoomId, options: roomOptions },
        ]}
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={CalendarRange}
          title="No reservations here"
          description="Nothing matches this filter yet. Try another tab, or create a reservation."
          action={
            <Button variant="outline" size="sm" onClick={() => navigate("/admin/reservations/new")}>
              <Plus /> New reservation
            </Button>
          }
        />
      ) : (
        <Card className="py-0">
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
              {filtered.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <button
                      onClick={() => setOpenId(r.id)}
                      className="max-w-56 truncate text-left font-semibold text-foreground hover:underline"
                    >
                      {r.title}
                    </button>
                    <p className="text-sm text-muted-foreground">{r.id}</p>
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
            : `${confirm?.reservation.title} is removed from every list and can't be restored in this session.`
        }
        confirmLabel={confirm?.kind === "cancel" ? "Cancel reservation" : "Delete record"}
        cancelLabel="Keep it"
        onConfirm={runConfirm}
      />
    </div>
  );
}
