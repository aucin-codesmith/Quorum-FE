import { useState } from "react";
import { Building2, Pencil, Plus, Trash2, Wrench, CheckCircle2 } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import StatusBadge from "@/components/common/StatusBadge";
import EmptyState from "@/components/common/EmptyState";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import DataPagination from "@/components/common/DataPagination";
import { ErrorState, TableSkeleton } from "@/components/common/QueryState";
import RowMenu from "@/components/admin/RowMenu";
import RoomFormDialog from "@/components/admin/RoomFormDialog";
import TableFilters from "@/components/admin/TableFilters";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useRoomMutations, useRooms } from "@/hooks/useRooms";
import { useStats } from "@/hooks/useStats";
import { useToast } from "@/hooks/useToast";
import { errorMessage } from "@/lib/formErrors";

const PAGE_SIZE = 10;

export default function AdminRoomsPage() {
  const { notify } = useToast();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("any");
  const [page, setPage] = useState(1);
  const [form, setForm] = useState(null); // { room } — room null means "add"
  const [toDelete, setToDelete] = useState(null);

  const q = useDebouncedValue(query.trim());
  const { rooms, meta, isLoading, isFetching, isError, error, refetch } = useRooms({
    page,
    limit: PAGE_SIZE,
    q,
    status: status === "any" ? undefined : status,
    sort: "name",
  });
  const { stats } = useStats();
  const { addRoom, updateRoom, deleteRoom } = useRoomMutations();

  // If the current page no longer exists (e.g. its last row was deleted or filtered out), step back.
  // Adjusting state during render is React's supported pattern for state derived from other data.
  if (meta && page > meta.totalPages) setPage(meta.totalPages);

  const counts = stats?.rooms;
  const statusOptions = [
    { value: "any", label: `All statuses${counts ? ` (${counts.total})` : ""}` },
    { value: "available", label: `Available${counts ? ` (${counts.available})` : ""}` },
    { value: "occupied", label: `Occupied${counts ? ` (${counts.occupied})` : ""}` },
    { value: "maintenance", label: `Under maintenance${counts ? ` (${counts.maintenance})` : ""}` },
  ];

  // Thrown errors go back to the dialog, which shows them on the right field.
  const handleSubmit = async (values) => {
    if (form.room) {
      await updateRoom(form.room.id, values);
      notify("Room updated", { description: `${values.name} was saved.` });
    } else {
      await addRoom(values);
      notify("Room added", { description: `${values.name} is now listed.` });
    }
    setForm(null);
  };

  const requestDelete = (room) => {
    if (room.upcomingReservations > 0) {
      notify("Can't delete this room yet", {
        description: `${room.name} has ${room.upcomingReservations} upcoming ${room.upcomingReservations === 1 ? "reservation" : "reservations"}. Cancel or move them first, or mark the room as under maintenance.`,
        variant: "danger",
      });
      return;
    }
    setToDelete(room);
  };

  const confirmDelete = async () => {
    const room = toDelete;
    setToDelete(null);
    try {
      await deleteRoom(room.id);
      notify("Room deleted", { description: `${room.name} was removed.`, variant: "danger" });
    } catch (err) {
      // e.g. 409: past reservations still reference the room.
      notify("Could not delete the room", { description: errorMessage(err), variant: "danger" });
    }
  };

  const setRoomStatus = async (room, next) => {
    try {
      await updateRoom(room.id, { status: next });
      notify("Status updated", { description: `${room.name} is now ${next === "maintenance" ? "under maintenance" : next}.` });
    } catch (err) {
      notify("Could not update the room", { description: errorMessage(err), variant: "danger" });
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Rooms"
        description="Add, edit and retire meeting rooms, and keep their status current."
        actions={
          <Button onClick={() => setForm({ room: null })}>
            <Plus /> Add room
          </Button>
        }
      />

      <TableFilters
        query={query}
        onQueryChange={(v) => {
          setQuery(v);
          setPage(1);
        }}
        searchPlaceholder="Search by room or floor…"
        searchLabel="Search rooms"
        summary={meta ? `${meta.total} ${meta.total === 1 ? "room" : "rooms"}` : undefined}
        filters={[
          {
            key: "status",
            label: "Status",
            value: status,
            onChange: (v) => {
              setStatus(v);
              setPage(1);
            },
            options: statusOptions,
          },
        ]}
      />

      {isLoading ? (
        <TableSkeleton />
      ) : isError ? (
        <ErrorState error={error} onRetry={refetch} title="We couldn't load the rooms" />
      ) : rooms.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No rooms match"
          description="Try a different search, or add a new room."
          action={
            <Button variant="outline" size="sm" onClick={() => setForm({ room: null })}>
              <Plus /> Add room
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          <Card className={`py-0 transition-opacity ${isFetching ? "opacity-60" : ""}`}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Facilities</TableHead>
                  <TableHead>Upcoming</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rooms.map((room) => (
                  <TableRow key={room.id}>
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <img src={room.image} alt="" className="size-12 shrink-0 rounded-xl bg-tint-soft object-cover" />
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground">{room.name}</p>
                          <p className="text-sm text-muted-foreground">{room.floor}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{room.capacity} seats</TableCell>
                    <TableCell>
                      {room.facilities.length === 0
                        ? "None"
                        : `${room.facilities.length} ${room.facilities.length === 1 ? "facility" : "facilities"}`}
                    </TableCell>
                    <TableCell>{room.upcomingReservations}</TableCell>
                    <TableCell>
                      <StatusBadge status={room.status} />
                    </TableCell>
                    <TableCell>
                      <RowMenu
                        label={`Actions for ${room.name}`}
                        items={[
                          { label: "Edit room", icon: Pencil, onSelect: () => setForm({ room }) },
                          {
                            label: "Mark as available",
                            icon: CheckCircle2,
                            hidden: room.status === "available",
                            onSelect: () => setRoomStatus(room, "available"),
                          },
                          {
                            label: "Mark under maintenance",
                            icon: Wrench,
                            hidden: room.status === "maintenance",
                            onSelect: () => setRoomStatus(room, "maintenance"),
                          },
                          { label: "Delete room", icon: Trash2, destructive: true, separatorBefore: true, onSelect: () => requestDelete(room) },
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

      {form && (
        <RoomFormDialog open onOpenChange={(open) => !open && setForm(null)} room={form.room} onSubmit={handleSubmit} />
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        onOpenChange={(open) => !open && setToDelete(null)}
        title={`Delete ${toDelete?.name}?`}
        description="The room disappears from Find a room. A room with reservations on record cannot be deleted; set it to maintenance instead."
        confirmLabel="Delete room"
        cancelLabel="Keep room"
        onConfirm={confirmDelete}
      />
    </div>
  );
}
