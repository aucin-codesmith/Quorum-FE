import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Building2, CalendarClock, CalendarRange, Users } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import StatCard from "@/components/common/StatCard";
import StatusBadge from "@/components/common/StatusBadge";
import EmptyState from "@/components/common/EmptyState";
import { ErrorState, PageSkeleton } from "@/components/common/QueryState";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useReservations } from "@/hooks/useReservations";
import { useRooms } from "@/hooks/useRooms";
import { useStats } from "@/hooks/useStats";
import { formatDate, formatTime, formatTimeRange } from "@/utils/format";
import { nowTime } from "@/utils/date";

export default function AdminOverviewPage() {
  const navigate = useNavigate();
  const { stats, isLoading: statsLoading, isError, error, refetch } = useStats();
  const { rooms, isLoading: roomsLoading } = useRooms();
  // "Today" is the server's date, so this page agrees with the API's own numbers.
  const today = stats?.date;
  const { reservations: todayAll, isLoading: todayLoading } = useReservations(
    { date: today, sort: "startTime" },
    { enabled: Boolean(today) }
  );
  const { reservations: recent } = useReservations({ sort: "-createdAt", limit: 5 });

  const todayList = useMemo(() => todayAll.filter((r) => r.status !== "cancelled"), [todayAll]);

  const board = useMemo(() => {
    const now = nowTime();
    const utilization = Object.fromEntries((stats?.roomUtilization ?? []).map((u) => [u.roomId, u.utilizationPercent]));
    return rooms.map((room) => {
      const mine = todayList.filter((r) => r.roomId === room.id && r.status === "upcoming");
      return {
        room,
        current: mine.find((r) => r.startTime <= now && now < r.endTime),
        next: mine.find((r) => r.startTime > now),
        utilization: utilization[room.id] ?? 0,
      };
    });
  }, [rooms, todayList, stats]);

  if (isError) return <ErrorState error={error} onRetry={refetch} title="We couldn't load the overview" />;
  if (statsLoading || roomsLoading || todayLoading) return <PageSkeleton blocks={4} />;

  const inProgress = board.filter((b) => b.current).length;

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
        <StatCard label="Rooms" value={stats.rooms.total} icon={Building2} hint={`${stats.rooms.available} available`} />
        <StatCard label="Booked today" value={stats.reservations.today} icon={CalendarRange} hint={`${inProgress} in progress now`} />
        <StatCard label="Upcoming reservations" value={stats.reservations.upcoming} icon={CalendarClock} />
        <StatCard label="Active users" value={stats.users.active} icon={Users} hint={`of ${stats.users.total} accounts`} />
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
