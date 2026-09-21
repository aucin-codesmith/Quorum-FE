import { Ban, CalendarDays, CheckCheck, Clock, Hash, MapPin, Trash2, User, Users } from "lucide-react";
import StatusBadge from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { formatDate, formatTimeRange } from "@/utils/format";

function Row({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-4 rounded-xl bg-tint-soft p-4">
      <Icon size={18} className="mt-0.5 shrink-0 text-primary-soft" />
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-[15px] font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}

export default function ReservationSheet({ reservation, onOpenChange, onComplete, onCancel, onDelete }) {
  const open = Boolean(reservation);
  const r = reservation;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        {r && (
          <>
            <SheetHeader>
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Hash size={16} /> {r.id}
              </p>
              <SheetTitle className="text-2xl font-bold">{r.title}</SheetTitle>
              <SheetDescription asChild>
                <div>
                  <StatusBadge status={r.status} />
                </div>
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-4 px-6">
              <Row icon={MapPin} label="Room" value={`${r.roomName}, ${r.roomFloor}`} />
              <Row icon={CalendarDays} label="Date" value={formatDate(r.date)} />
              <Row icon={Clock} label="Time" value={formatTimeRange(r.startTime, r.endTime)} />
              <Row icon={User} label="Booked by" value={r.userName} />
              <Row icon={Users} label="Participants" value={`${r.participants} people`} />

              {r.description && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-base font-semibold">Description</h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-foreground/80">{r.description}</p>
                  </div>
                </>
              )}
              <p className="text-sm text-muted-foreground">
                Created on {formatDate(r.createdAt.split("T")[0], { short: true })}
              </p>
            </div>

            <SheetFooter>
              {r.status === "upcoming" && (
                <>
                  <Button onClick={() => onComplete(r)}>
                    <CheckCheck /> Mark as completed
                  </Button>
                  <Button variant="destructive" onClick={() => onCancel(r)}>
                    <Ban /> Cancel reservation
                  </Button>
                </>
              )}
              <Button variant="outline" onClick={() => onDelete(r)}>
                <Trash2 /> Delete record
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
