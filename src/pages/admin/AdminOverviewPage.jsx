import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Building2, CalendarClock, CalendarRange, Users } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import StatCard from "@/components/common/StatCard";
import StatusBadge from "@/components/common/StatusBadge";
import EmptyState from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useReservations } from "@/hooks/useReservations";
import { useRooms } from "@/hooks/useRooms";
import { useUsers } from "@/hooks/useUsers";
import { formatDate, formatTime, formatTimeRange } from "@/utils/format";
import { WORK_END, WORK_START, nowTime, timeToMinutes, todayISO } from "@/utils/date";

const WORK_MINUTES = timeToMinutes(WORK_END) - timeToMinutes(WORK_START);

export default function AdminOverviewPage() {
  const navigate = useNavigate();
  const { rooms } = useRooms();
  const { users } = useUsers();
  const { reservations } = useReservations();

  const { today, todayList, board, upcomingCount, inProgress } = useMemo(() => {
    const today = todayISO();
    const now = nowTime();
    const live = reservations.filter((r) => r.status !== "cancelled");
    const todayList = live
      .filter((r) => r.date === today)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    const board = rooms.map((room) => {
      const mine = todayList.filter((r) => r.roomId === room.id);
      const current = mine.find((r) => r.status === "upcoming" && r.startTime <= now && now < r.endTime);
      const next = mine.find((r) => r.status === "upcoming" && r.startTime > now);
      const booked = mine.reduce((sum, r) => sum + (timeToMinutes(r.endTime) - timeToMinutes(r.startTime)), 0);
      return { room, current, next, utilization: Math.min(100, Math.round((booked / WORK_MINUTES) * 100)) };
    });

    return {
      today,
      todayList,
      board,
      upcomingCount: reservations.filter((r) => r.status === "upcoming").length,
      inProgress: board.filter((b) => b.current).length,
    };
  }, [reservations, rooms]);

  const recent = useMemo(
    () => [...reservations].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5),
    [reservations]
  );

  const availableRooms = rooms.filter((r) => r.status === "available").length;
  const activeUsers = users.filter((u) => u.status === "active").length;

  return (
    <div className="space-y-12">
      <PageHeader
        title="Overview"
        description={`${formatDate(today)}. A live look at rooms, bookings and people.`}
        actions={
          <Button size="lg" onClick={() => navigate("/admin/reservations/new")}>
            <CalendarRange /> New reservation
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Rooms" value={rooms.length} icon={Building2} hint={`${availableRooms} available`} />
        <StatCard
          label="Booked today"
          value={todayList.length}
          icon={CalendarRange}
          hint={`${inProgress} in progress now`}
        />
        <StatCard label="Upcoming reservations" value={upcomingCount} icon={CalendarClock} />
        <StatCard label="Active users" value={activeUsers} icon={Users} hint={`of ${users.length} accounts`} />
      </div>

      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Rooms right now</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate("/admin/rooms")}>
            Manage rooms <ArrowRight />
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {board.map(({ room, current, next, utilization }) => (
            <Card key={room.id}>
              <CardContent className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-semibold">{room.name}</h3>
                    <p className="truncate text-sm text-muted-foreground">{room.floor}</p>
                  </div>
                  <StatusBadge status={room.status} />
                </div>

                <p className="min-h-10 text-sm text-foreground/80">
                  {room.status === "maintenance"
                    ? "Closed for maintenance."
                    : current
                      ? `In use: ${current.title}, until ${formatTime(current.endTime)}.`
                      : next
                        ? `Free now. Next: ${next.title} at ${formatTime(next.startTime)}.`
                        : "Free for the rest of the day."}
                </p>

                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Booked today</span>
                    <span className="font-semibold text-foreground">{utilization}%</span>
                  </div>
                  <Progress value={utilization} aria-label={`${room.name} booked ${utilization}% of working hours today`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Today&apos;s reservations</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate("/admin/reservations")}>
              View all <ArrowRight />
            </Button>
          </div>
          {todayList.length === 0 ? (
            <EmptyState
              icon={CalendarClock}
              title="No bookings today"
              description="Rooms are all open. Create a reservation on someone's behalf to get started."
            />
          ) : (
            <Card className="py-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Meeting</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Booked by</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {todayList.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium text-foreground">{formatTimeRange(r.startTime, r.endTime)}</TableCell>
                      <TableCell className="max-w-56 truncate">{r.title}</TableCell>
                      <TableCell>{r.roomName}</TableCell>
                      <TableCell>{r.userName}</TableCell>
                      <TableCell>
                        <StatusBadge status={r.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </section>

        <section>
          <h2 className="mb-6 text-xl font-semibold">Recently booked</h2>
          <Card className="gap-0 divide-y py-0">
            {recent.map((r) => (
              <div key={r.id} className="px-6 py-4">
                <p className="truncate text-[15px] font-semibold text-foreground">{r.title}</p>
                <p className="mt-1 truncate text-sm text-muted-foreground">
                  {r.userName} booked {r.roomName} for {formatDate(r.date, { short: true })}
                </p>
              </div>
            ))}
          </Card>
        </section>
      </div>
    </div>
  );
}
