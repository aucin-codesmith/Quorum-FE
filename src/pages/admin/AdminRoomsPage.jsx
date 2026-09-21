import { useMemo, useState } from "react";
import { Building2, Pencil, Plus, Trash2, Wrench, CheckCircle2 } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import StatusBadge from "@/components/common/StatusBadge";
import EmptyState from "@/components/common/EmptyState";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import RowMenu from "@/components/admin/RowMenu";
import TableFilters from "@/components/admin/TableFilters";
import RoomFormDialog from "@/components/admin/RoomFormDialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useReservations } from "@/hooks/useReservations";
import { useRooms } from "@/hooks/useRooms";
import { useToast } from "@/hooks/useToast";

const statusFilter = [
  { value: "any", label: "All statuses" },
  { value: "available", label: "Available" },
  { value: "occupied", label: "Occupied" },
  { value: "maintenance", label: "Under maintenance" },
];

export default function AdminRoomsPage() {
  const { rooms, addRoom, updateRoom, deleteRoom } = useRooms();
  const { reservations } = useReservations();
  const { notify } = useToast();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("any");
  const [form, setForm] = useState(null); // { room } — room null means "add"
  const [toDelete, setToDelete] = useState(null);

  const upcomingByRoom = useMemo(() => {
    const map = {};
    reservations.forEach((r) => {
      if (r.status === "upcoming") map[r.roomId] = (map[r.roomId] ?? 0) + 1;
    });
    return map;
  }, [reservations]);

  const filtered = useMemo(
    () =>
      rooms.filter(
        (r) =>
          (status === "any" || r.status === status) &&
          `${r.name} ${r.floor}`.toLowerCase().includes(query.toLowerCase())
      ),
    [rooms, query, status]
  );

  const statusOptions = useMemo(
    () =>
      statusFilter.map((o) => ({
        value: o.value,
        label: `${o.label} (${o.value === "any" ? rooms.length : rooms.filter((r) => r.status === o.value).length})`,
      })),
    [rooms]
  );

  const handleSubmit = (values) => {
    if (form.room) {
      updateRoom(form.room.id, values);
      notify("Room updated", { description: `${values.name} was saved.` });
    } else {
      addRoom(values);
      notify("Room added", { description: `${values.name} is now listed.` });
    }
    setForm(null);
  };

  const requestDelete = (room) => {
    const count = upcomingByRoom[room.id] ?? 0;
    if (count > 0) {
      notify("Can't delete this room yet", {
        description: `${room.name} has ${count} upcoming ${count === 1 ? "reservation" : "reservations"}. Cancel or move them first, or mark the room as under maintenance.`,
        variant: "danger",
      });
      return;
    }
    setToDelete(room);
  };

  const setRoomStatus = (room, next) => {
    updateRoom(room.id, { status: next });
    notify("Status updated", { description: `${room.name} is now ${next === "maintenance" ? "under maintenance" : next}.` });
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
        onQueryChange={setQuery}
        searchPlaceholder="Search by room or floor…"
        searchLabel="Search rooms"
        summary={`${filtered.length} of ${rooms.length} rooms`}
        filters={[{ key: "status", label: "Status", value: status, onChange: setStatus, options: statusOptions }]}
      />

      {filtered.length === 0 ? (
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
        <Card className="py-0">
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
              {filtered.map((room) => (
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
                  <TableCell>{upcomingByRoom[room.id] ?? 0}</TableCell>
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
      )}

      {form && (
        <RoomFormDialog
          open
          onOpenChange={(open) => !open && setForm(null)}
          room={form.room}
          rooms={rooms}
          onSubmit={handleSubmit}
        />
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        onOpenChange={(open) => !open && setToDelete(null)}
        title={`Delete ${toDelete?.name}?`}
        description="The room disappears from Find a room. Past reservations keep their record but show a removed room."
        confirmLabel="Delete room"
        cancelLabel="Keep room"
        onConfirm={() => {
          deleteRoom(toDelete.id);
          notify("Room deleted", { description: `${toDelete.name} was removed.`, variant: "danger" });
          setToDelete(null);
        }}
      />
    </div>
  );
}
