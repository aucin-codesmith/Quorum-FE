import { useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { AlertCircle, CalendarDays, CheckCircle2, Clock, MapPin, Type, Users } from "lucide-react";
import IconInput from "@/components/common/IconInput";
import { ErrorState, PageSkeleton } from "@/components/common/QueryState";
import SimpleSelect from "@/components/common/SimpleSelect";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useReservationMutations } from "@/hooks/useReservations";
import { useRoomSchedule, useRooms } from "@/hooks/useRooms";
import { useToast } from "@/hooks/useToast";
import { useUsers } from "@/hooks/useUsers";
import { applyApiErrors, errorMessage } from "@/lib/formErrors";
import { formatDate, formatTime, formatTimeRange } from "@/utils/format";
import { nowTime, overlaps, timeSlots, timeToMinutes, todayISO, toISODate } from "@/utils/date";

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

function buildSchema({ isAdmin }) {
  return z
    .object({
      userId: z.string(),
      roomId: z.string().min(1, "Choose a room."),
      title: z.string().trim().min(3, "Give the meeting a title of at least 3 characters."),
      description: z.string().max(500, "Keep the description under 500 characters."),
      date: z.date().nullable(),
      startTime: z.string().min(1, "Choose a start time."),
      endTime: z.string().min(1, "Choose an end time."),
      // Whole numbers only, no leading zero trick to sneak in a lower value (e.g. "01").
      participants: z.string().regex(/^[1-9]\d*$/, "Enter at least 1 participant."),
    })
    .superRefine((v, ctx) => {
      if (isAdmin && !v.userId) ctx.addIssue({ code: "custom", path: ["userId"], message: "Choose who this is for." });
      if (!v.date) ctx.addIssue({ code: "custom", path: ["date"], message: "Pick a date." });
      else if (v.date < startOfToday()) ctx.addIssue({ code: "custom", path: ["date"], message: "Pick today or a later date." });
      if (v.startTime && v.endTime && timeToMinutes(v.endTime) <= timeToMinutes(v.startTime)) {
        ctx.addIssue({ code: "custom", path: ["endTime"], message: "End time must be after the start time." });
      }
      // Today's already-passed slots are greyed out in the pickers, but a value chosen before
      // midnight (or the default) can still age past "now" while the form sits open.
      if (v.date && toISODate(v.date) === todayISO()) {
        if (v.startTime && timeToMinutes(v.startTime) <= timeToMinutes(nowTime())) {
          ctx.addIssue({ code: "custom", path: ["startTime"], message: "Choose a time later than now." });
        }
      }
      // Exceeding the room's capacity is surfaced as a warning near the field (see
      // ReservationFormBody), not a blocking error: the booking can still go ahead.
    });
}

const FORM_FIELDS = ["userId", "roomId", "title", "description", "date", "startTime", "endTime", "participants"];

// mode="employee": books for the signed-in user. mode="admin": adds a "Booked for" field.
// The form only mounts once rooms (and, for admins, users) have loaded, so its defaults are complete.
export default function ReservationForm({ mode = "employee", onDone }) {
  const isAdmin = mode === "admin";
  const rooms = useRooms();
  const users = useUsers({ status: "active" }, { enabled: isAdmin });

  const isLoading = rooms.isLoading || (isAdmin && users.isLoading);
  const failed = rooms.isError ? rooms : isAdmin && users.isError ? users : null;

  if (isLoading) return <PageSkeleton blocks={2} />;
  if (failed) return <ErrorState error={failed.error} onRetry={failed.refetch} title="We couldn't load the booking form" />;

  return <ReservationFormBody mode={mode} onDone={onDone} rooms={rooms.rooms} users={users.users} />;
}

function ReservationFormBody({ mode, onDone, rooms, users }) {
  const isAdmin = mode === "admin";
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const qc = useQueryClient();
  const { addReservation } = useReservationMutations();
  const { notify } = useToast();
  const [confirmValues, setConfirmValues] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);

  const schema = useMemo(() => buildSchema({ isAdmin }), [isAdmin]);

  const preselected = searchParams.get("room");
  const defaultRoom = rooms.find((r) => r.id === preselected && r.status === "available") ?? rooms.find((r) => r.status === "available");

  // The date starts pre-filled with today rather than blank, so the past-slot greying-out below
  // is already active on the very first render instead of only kicking in once a date is chosen.
  const initialNowMinutes = timeToMinutes(nowTime());
  const initialNextSlot = timeSlots.find((t) => timeToMinutes(t) > initialNowMinutes);
  const initialNextSlotIndex = initialNextSlot ? timeSlots.indexOf(initialNextSlot) : -1;

  const { control, handleSubmit, setValue, setError, formState } = useForm({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: {
      userId: isAdmin ? "" : user.id,
      roomId: defaultRoom?.id ?? "",
      title: "",
      description: "",
      date: startOfToday(),
      // If every slot today has already passed, these fall back to the usual defaults and the
      // "choose a time later than now" validation guides the user to pick a different date.
      startTime: initialNextSlot ?? "09:00",
      endTime: initialNextSlot ? (timeSlots[initialNextSlotIndex + 2] ?? timeSlots.at(-1)) : "10:00",
      participants: "2",
    },
  });

  const [roomId, date, startTime, endTime, participants, title, userId] = useWatch({
    control,
    name: ["roomId", "date", "startTime", "endTime", "participants", "title", "userId"],
  });

  const room = rooms.find((r) => r.id === roomId);
  const owner = users.find((u) => u.id === (isAdmin ? userId : user.id));

  // The day's booked slots come from the server (everyone's, not only mine), so the check is accurate for employees too.
  // The API still has the final word on submit.
  const dateISO = date ? toISODate(date) : undefined;
  const { slots } = useRoomSchedule(roomId, dateISO, { enabled: Boolean(roomId && dateISO) });
  const conflict = useMemo(() => {
    if (!startTime || !endTime || timeToMinutes(endTime) <= timeToMinutes(startTime)) return null;
    return slots.find((slot) => overlaps(slot.startTime, slot.endTime, startTime, endTime)) ?? null;
  }, [slots, startTime, endTime]);

  const roomUnavailable = room && room.status !== "available";
  const blocked = Boolean(conflict) || Boolean(roomUnavailable);

  // Only today's own slots need greying out; a future date has nothing in the past yet.
  const isToday = Boolean(date) && toISODate(date) === todayISO();
  const nowMinutes = timeToMinutes(nowTime());

  const startOptions = timeSlots
    .slice(0, -1)
    .map((t) => ({ value: t, label: formatTime(t), disabled: isToday && timeToMinutes(t) <= nowMinutes }));
  const endOptions = timeSlots
    .filter((t) => timeToMinutes(t) > timeToMinutes(startTime || "00:00"))
    .map((t) => ({ value: t, label: formatTime(t), disabled: isToday && timeToMinutes(t) <= nowMinutes }));

  const participantsCount = Number(participants);
  const overCapacity = room && Number.isInteger(participantsCount) && participantsCount > room.capacity;

  const onStartChange = (field) => (next) => {
    field.onChange(next);
    if (timeToMinutes(endTime) <= timeToMinutes(next)) {
      const following = timeSlots.find((t) => timeToMinutes(t) > timeToMinutes(next));
      if (following) setValue("endTime", following, { shouldValidate: true });
    }
  };

  const onValid = (values) => {
    if (blocked) return;
    setConfirmValues(values);
  };

  const handleConfirm = async () => {
    const v = confirmValues;
    const target = rooms.find((r) => r.id === v.roomId);
    setSubmitting(true);
    try {
      const created = await addReservation({
        roomId: v.roomId,
        ...(isAdmin && { userId: v.userId }),
        title: v.title.trim(),
        description: v.description.trim(),
        date: toISODate(v.date),
        startTime: v.startTime,
        endTime: v.endTime,
        participants: Number(v.participants),
      });
      setConfirmValues(null);
      notify("Reservation confirmed", {
        description: `${target.name} is booked for ${formatDate(created.date, { short: true })}.`,
        variant: "success",
      });
      onDone?.(created);
    } catch (err) {
      setConfirmValues(null);
      // Someone may have taken the slot since the schedule was loaded: refresh it, then explain.
      qc.invalidateQueries({ queryKey: ["schedule"] });
      applyApiErrors(err, setError, FORM_FIELDS);
      notify(err.code === "RESERVATION_CONFLICT" ? "That slot was just taken" : "Could not book the room", {
        description: errorMessage(err),
        variant: "danger",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const summaryRows = [
    isAdmin && { label: "Booked for", value: owner?.name ?? "Not chosen yet" },
    { label: "Meeting", value: title?.trim() || "Not named yet" },
    { label: "Date", value: date ? formatDate(toISODate(date), { short: true }) : "Not picked yet" },
    { label: "Time", value: formatTimeRange(startTime, endTime) },
    { label: "Participants", value: participants || "Not set yet" },
  ].filter(Boolean);

  return (
    <>
      <form onSubmit={handleSubmit(onValid)} noValidate className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        <div className="space-y-12 lg:col-span-2">
          {/* 1. Where */}
          <FieldSet className="gap-6">
            <FieldLegend className="mb-2 text-foreground data-[variant=legend]:text-xl data-[variant=legend]:font-semibold">Where</FieldLegend>
            <FieldGroup className="gap-6">
              {isAdmin && (
                <Controller
                  name="userId"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="userId">Booked for</FieldLabel>
                      <SimpleSelect
                        id="userId"
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Select a person"
                        aria-invalid={fieldState.invalid}
                        options={users
                          .filter((u) => u.status === "active")
                          .map((u) => ({ value: u.id, label: `${u.name}, ${u.department}` }))}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              )}
              <Controller
                name="roomId"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="roomId">Meeting room</FieldLabel>
                    <SimpleSelect
                      id="roomId"
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select a room"
                      aria-invalid={fieldState.invalid}
                      options={rooms.map((r) => ({
                        value: r.id,
                        disabled: r.status !== "available",
                        label: `${r.name}, ${r.floor}, seats ${r.capacity}${r.status !== "available" ? ` (${r.status})` : ""}`,
                      }))}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </FieldGroup>
          </FieldSet>

          {/* 2. When */}
          <FieldSet className="gap-6">
            <FieldLegend className="mb-2 text-foreground data-[variant=legend]:text-xl data-[variant=legend]:font-semibold">When</FieldLegend>
            <FieldGroup className="gap-6">
              <Controller
                name="date"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="date">Meeting date</FieldLabel>
                    <Popover open={dateOpen} onOpenChange={setDateOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          id="date"
                          type="button"
                          variant="outline"
                          aria-invalid={fieldState.invalid}
                          className="h-11 w-full justify-start px-4 text-base font-normal aria-invalid:border-destructive"
                        >
                          <CalendarDays className="text-primary-soft" />
                          {field.value ? (
                            format(field.value, "EEEE, d MMMM yyyy")
                          ) : (
                            <span className="text-muted-foreground">Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="start" className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={field.value ?? undefined}
                          onSelect={(d) => {
                            field.onChange(d ?? null);
                            if (d) setDateOpen(false);
                          }}
                          disabled={{ before: startOfToday() }}
                          autoFocus
                        />
                      </PopoverContent>
                    </Popover>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="startTime"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="startTime">Start time</FieldLabel>
                    <SimpleSelect
                      id="startTime"
                      value={field.value}
                      onValueChange={onStartChange(field)}
                      options={startOptions}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name="endTime"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid || Boolean(conflict)}>
                    <FieldLabel htmlFor="endTime">End time</FieldLabel>
                    <SimpleSelect
                      id="endTime"
                      value={field.value}
                      onValueChange={field.onChange}
                      options={endOptions}
                      aria-invalid={fieldState.invalid || Boolean(conflict)}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    {conflict && (
                      <FieldError>
                        {conflict.title} already holds this room from {formatTimeRange(conflict.startTime, conflict.endTime)}.
                        Choose another time or room.
                      </FieldError>
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </FieldSet>

          {/* 3. Details */}
          <FieldSet className="gap-6">
            <FieldLegend className="mb-2 text-foreground data-[variant=legend]:text-xl data-[variant=legend]:font-semibold">Details</FieldLegend>
            <FieldGroup className="gap-6">
              <Controller
                name="title"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="title">Meeting title</FieldLabel>
                    <IconInput
                      {...field}
                      id="title"
                      icon={Type}
                      placeholder="e.g. Weekly Design Sync"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name="description"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="description">Meeting description (optional)</FieldLabel>
                    <Textarea
                      {...field}
                      id="description"
                      rows={3}
                      placeholder="What's this meeting about?"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name="participants"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="participants">Number of participants</FieldLabel>
                    <IconInput
                      {...field}
                      // A plain onChange, not field.onChange: strips anything that isn't a digit
                      // (minus sign, "e", ".", pasted text) so the value can never read as
                      // negative or non-numeric, and drops a leading 0 (min is 1, not 0).
                      onChange={(e) => field.onChange(e.target.value.replace(/\D/g, "").replace(/^0+(?=\d)/, ""))}
                      // Number inputs still accept these keys even with min={1}; block them so the
                      // field never briefly shows a negative or decimal value while typing.
                      onKeyDown={(e) => ["-", "+", "e", "E", "."].includes(e.key) && e.preventDefault()}
                      id="participants"
                      type="number"
                      min={1}
                      inputMode="numeric"
                      icon={Users}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    {!fieldState.invalid && overCapacity && (
                      <FieldDescription className="flex items-center gap-1.5 text-danger">
                        <AlertCircle size={14} className="shrink-0" />
                        {room.name} seats up to {room.capacity}. You can still book, but consider a larger room.
                      </FieldDescription>
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </FieldSet>

          <Button type="submit" size="lg" className="w-full" disabled={blocked || formState.isSubmitting}>
            Review reservation
          </Button>
        </div>

        {/* Live summary */}
        <div>
          <Card className="sticky top-24 border-0 bg-tint-soft shadow-none ring-0">
            <CardContent>
              <h2 className="text-lg font-semibold">Booking summary</h2>

              {room ? (
                <div className="mt-6 space-y-6">
                  <img src={room.image} alt={room.name} className="h-32 w-full rounded-xl object-cover" />
                  <div>
                    <p className="text-lg font-semibold text-foreground">{room.name}</p>
                    <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin size={16} /> {room.floor}
                    </p>
                  </div>

                  <dl className="space-y-3 border-t pt-6 text-sm">
                    {summaryRows.map((row) => (
                      <div key={row.label} className="flex items-center justify-between gap-4">
                        <dt className="text-muted-foreground">{row.label}</dt>
                        <dd className="truncate font-semibold text-foreground">{row.value}</dd>
                      </div>
                    ))}
                  </dl>

                  {blocked ? (
                    <div role="status" className="flex items-center gap-3 rounded-xl bg-danger-bg px-4 py-3 text-sm font-medium text-danger">
                      <AlertCircle size={18} className="shrink-0" />
                      {roomUnavailable ? "Room isn't available right now" : "Room is already booked for this slot"}
                    </div>
                  ) : date ? (
                    <div role="status" className="flex items-center gap-3 rounded-xl bg-success-bg px-4 py-3 text-sm font-medium text-success">
                      <CheckCircle2 size={18} className="shrink-0" />
                      Room is free for this slot
                    </div>
                  ) : (
                    <div role="status" className="flex items-center gap-3 rounded-xl bg-background px-4 py-3 text-sm text-muted-foreground">
                      <Clock size={18} className="shrink-0" />
                      Pick a date to check availability
                    </div>
                  )}
                </div>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">Select a room to see your summary.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </form>

      <Dialog open={Boolean(confirmValues)} onOpenChange={(open) => !open && !submitting && setConfirmValues(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm your reservation</DialogTitle>
            <DialogDescription>Please review the details before confirming.</DialogDescription>
          </DialogHeader>
          {confirmValues && room && (
            <div className="rounded-xl bg-tint-soft p-6">
              <p className="text-base font-semibold text-foreground">{confirmValues.title}</p>
              <dl className="mt-4 space-y-3 text-sm">
                {[
                  isAdmin && ["Booked for", owner?.name],
                  ["Room", `${room.name}, ${room.floor}`],
                  ["Date", formatDate(toISODate(confirmValues.date), { short: true })],
                  ["Time", formatTimeRange(confirmValues.startTime, confirmValues.endTime)],
                  ["Participants", confirmValues.participants],
                ]
                  .filter(Boolean)
                  .map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between gap-4">
                      <dt className="text-muted-foreground">{label}</dt>
                      <dd className="truncate font-semibold text-foreground">{value}</dd>
                    </div>
                  ))}
              </dl>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmValues(null)} disabled={submitting}>
              Go back
            </Button>
            <Button onClick={handleConfirm} disabled={submitting}>
              {submitting ? "Confirming…" : "Confirm reservation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
