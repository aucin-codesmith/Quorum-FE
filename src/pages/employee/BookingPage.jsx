import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  CalendarDays,
  Clock,
  Users,
  Type,
  AlignLeft,
  MapPin,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import MockNotice from "../../components/common/MockNotice";
import { rooms } from "../../data/mockData";
import { formatDate, formatTimeRange } from "../../utils/format";
import { useReservations } from "../../hooks/useReservations";
import { useToast } from "../../hooks/useToast";

export default function BookingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addReservation } = useReservations();
  const { notify } = useToast();

  const preselectedRoom = searchParams.get("room");

  const [form, setForm] = useState({
    roomId: preselectedRoom ?? rooms.find((r) => r.status === "available")?.id ?? "",
    date: "",
    startTime: "09:00",
    endTime: "10:00",
    title: "",
    description: "",
    participants: 2,
  });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const selectedRoom = rooms.find((r) => r.id === form.roomId);

  const timeError =
    form.startTime && form.endTime && form.startTime >= form.endTime
      ? "End time must be after the start time."
      : null;

  const capacityWarning =
    selectedRoom && Number(form.participants) > selectedRoom.capacity
      ? `This room seats up to ${selectedRoom.capacity}. Consider a larger room.`
      : null;

  const isFormValid =
    form.roomId && form.date && form.title.trim() && !timeError && selectedRoom?.status === "available";

  const update = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleReview = (e) => {
    e.preventDefault();
    if (!isFormValid) return;
    setConfirmOpen(true);
  };

  const handleConfirm = () => {
    setSubmitting(true);
    setTimeout(() => {
      addReservation({
        roomId: selectedRoom.id,
        roomName: selectedRoom.name,
        roomFloor: selectedRoom.floor,
        title: form.title.trim(),
        description: form.description.trim(),
        date: form.date,
        startTime: form.startTime,
        endTime: form.endTime,
        participants: Number(form.participants),
      });
      setSubmitting(false);
      setConfirmOpen(false);
      notify("Reservation confirmed", {
        description: `${selectedRoom.name} is booked for ${formatDate(form.date, { short: true })}.`,
        variant: "success",
      });
      navigate("/my-reservations");
    }, 900);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Booking"
        title="Reserve a Meeting Room"
        description="Fill in the details below — your booking summary updates as you go."
      />

      <MockNotice />

      <form onSubmit={handleReview} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Form column */}
        <div className="space-y-5 rounded-2xl border border-mist-200 bg-white p-5 sm:p-6 lg:col-span-2">
          <Select label="Meeting Room" value={form.roomId} onChange={update("roomId")} required>
            <option value="" disabled>
              Select a room
            </option>
            {rooms.map((room) => (
              <option key={room.id} value={room.id} disabled={room.status !== "available"}>
                {room.name} — {room.floor} · seats {room.capacity}
                {room.status !== "available" ? ` (${room.status})` : ""}
              </option>
            ))}
          </Select>

          <Input
            label="Meeting Title"
            icon={Type}
            placeholder="e.g. Weekly Design Sync"
            value={form.title}
            onChange={update("title")}
            required
          />

          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-ink-700">
              Meeting Description
            </label>
            <div className="relative">
              <AlignLeft size={16} className="pointer-events-none absolute top-3.5 left-3.5 text-mist-300" />
              <textarea
                rows={3}
                placeholder="What's this meeting about?"
                value={form.description}
                onChange={update("description")}
                className="w-full resize-none rounded-lg border border-mist-200 bg-white py-3 pr-3.5 pl-10.5 text-[14px] text-ink-800 placeholder:text-mist-300 focus:border-slate-500 focus:ring-3 focus:ring-slate-500/10 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Input
              label="Meeting Date"
              type="date"
              icon={CalendarDays}
              value={form.date}
              onChange={update("date")}
              required
            />
            <Input
              label="Start Time"
              type="time"
              icon={Clock}
              value={form.startTime}
              onChange={update("startTime")}
              required
            />
            <Input
              label="End Time"
              type="time"
              icon={Clock}
              value={form.endTime}
              onChange={update("endTime")}
              error={timeError}
              required
            />
          </div>

          <Input
            label="Number of Participants"
            type="number"
            min={1}
            icon={Users}
            value={form.participants}
            onChange={update("participants")}
            error={capacityWarning}
            required
          />

          <Button type="submit" fullWidth size="lg" disabled={!isFormValid}>
            Review Reservation
          </Button>
        </div>

        {/* Live summary column */}
        <div>
          <div className="sticky top-24 rounded-2xl border border-mist-200 bg-ink-800 p-5 sm:p-6">
            <p className="text-[12px] font-bold tracking-[0.08em] text-accent-300 uppercase">
              Booking Summary
            </p>

            {selectedRoom ? (
              <div className="mt-4 space-y-4">
                <div className="overflow-hidden rounded-xl">
                  <img
                    src={selectedRoom.image}
                    alt={selectedRoom.name}
                    className="h-28 w-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-display text-[19px] text-white">{selectedRoom.name}</p>
                  <p className="flex items-center gap-1.5 text-[12.5px] text-white/50">
                    <MapPin size={12.5} /> {selectedRoom.floor}
                  </p>
                </div>

                <div className="space-y-2.5 border-t border-white/10 pt-4 text-[13px]">
                  <SummaryRow label="Meeting" value={form.title || "—"} />
                  <SummaryRow
                    label="Date"
                    value={form.date ? formatDate(form.date, { short: true }) : "—"}
                  />
                  <SummaryRow
                    label="Time"
                    value={formatTimeRange(form.startTime, form.endTime)}
                  />
                  <SummaryRow label="Participants" value={form.participants || "—"} />
                </div>

                {selectedRoom.status === "available" ? (
                  <div className="flex items-center gap-2 rounded-lg bg-success-100/10 px-3 py-2.5 text-[12.5px] font-medium text-success-100/90">
                    <CheckCircle2 size={15} className="shrink-0 text-[#7ed6a6]" />
                    Room is available for this slot
                  </div>
                ) : (
                  <div className="flex items-center gap-2 rounded-lg bg-danger-100/10 px-3 py-2.5 text-[12.5px] font-medium text-white/80">
                    <AlertCircle size={15} className="shrink-0 text-[#f0a29c]" />
                    Room isn&apos;t available right now
                  </div>
                )}
              </div>
            ) : (
              <p className="mt-4 text-[13px] text-white/50">Select a room to see your summary.</p>
            )}
          </div>
        </div>
      </form>

      <Modal
        open={confirmOpen}
        onClose={() => !submitting && setConfirmOpen(false)}
        title="Confirm Your Reservation"
        description="Please review the details before confirming."
      >
        {selectedRoom && (
          <div className="space-y-3">
            <div className="rounded-xl bg-mist-50 p-4">
              <p className="text-[15px] font-bold text-ink-800">{form.title}</p>
              <div className="mt-2.5 space-y-1.5 text-[13px] text-slate-600">
                <SummaryRow label="Room" value={`${selectedRoom.name} · ${selectedRoom.floor}`} light />
                <SummaryRow label="Date" value={formatDate(form.date, { short: true })} light />
                <SummaryRow label="Time" value={formatTimeRange(form.startTime, form.endTime)} light />
                <SummaryRow label="Participants" value={form.participants} light />
              </div>
            </div>
            <p className="text-[12px] text-mist-300">
              This is a UI prototype — confirming will only update the demo data in this session.
            </p>
            <div className="flex gap-3 pt-1">
              <Button
                variant="secondary"
                fullWidth
                onClick={() => setConfirmOpen(false)}
                disabled={submitting}
              >
                Go Back
              </Button>
              <Button fullWidth onClick={handleConfirm} loading={submitting}>
                Confirm Reservation
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function SummaryRow({ label, value, light = false }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className={light ? "text-slate-500" : "text-white/45"}>{label}</span>
      <span className={`truncate font-semibold ${light ? "text-ink-800" : "text-white"}`}>{value}</span>
    </div>
  );
}
