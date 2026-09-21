import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { initialReservations } from "@/data/mockData";
import { overlaps } from "@/utils/date";
import { useAuth } from "@/hooks/useAuth";
import { useRooms } from "@/hooks/useRooms";
import { useUsers } from "@/hooks/useUsers";

// NOTE: This context simulates a backend-backed reservations store using
// local React state only. Every mutation below should be swapped for a real
// API call once the backend is available.
//
// Stored reservations only hold roomId / userId. roomName, roomFloor and
// userName are resolved on read so renaming a room or user in the admin area
// is reflected everywhere without touching reservation records.

const ReservationsContext = createContext(null);

let nextId = 1057;

export function ReservationsProvider({ children }) {
  const { user } = useAuth();
  const { rooms } = useRooms();
  const { users } = useUsers();
  const [stored, setStored] = useState(initialReservations);

  const reservations = useMemo(
    () =>
      stored.map((r) => {
        const room = rooms.find((x) => x.id === r.roomId);
        const owner = users.find((x) => x.id === r.userId);
        return {
          ...r,
          roomName: room?.name ?? "Removed room",
          roomFloor: room?.floor ?? "",
          userName: owner?.name ?? "Removed user",
        };
      }),
    [stored, rooms, users]
  );

  const myReservations = useMemo(
    () => reservations.filter((r) => r.userId === user?.id),
    [reservations, user]
  );

  // Returns the first non-cancelled reservation that overlaps the requested slot, if any.
  const findConflict = useCallback(
    ({ roomId, date, startTime, endTime, excludeId }) =>
      stored.find(
        (r) =>
          r.id !== excludeId &&
          r.status !== "cancelled" &&
          r.roomId === roomId &&
          r.date === date &&
          overlaps(r.startTime, r.endTime, startTime, endTime)
      ),
    [stored]
  );

  const addReservation = useCallback(
    (reservation) => {
      const created = {
        id: `res-${nextId++}`,
        status: "upcoming",
        createdAt: new Date().toISOString(),
        userId: user?.id,
        ...reservation,
      };
      setStored((current) => [created, ...current]);
      return created;
    },
    [user]
  );

  const updateReservation = useCallback((id, patch) => {
    setStored((current) => current.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }, []);

  const cancelReservation = useCallback(
    (id) => updateReservation(id, { status: "cancelled" }),
    [updateReservation]
  );

  const completeReservation = useCallback(
    (id) => updateReservation(id, { status: "completed" }),
    [updateReservation]
  );

  const deleteReservation = useCallback((id) => {
    setStored((current) => current.filter((r) => r.id !== id));
  }, []);

  const getReservation = useCallback((id) => reservations.find((r) => r.id === id), [reservations]);

  const value = useMemo(
    () => ({
      reservations,
      myReservations,
      findConflict,
      addReservation,
      updateReservation,
      cancelReservation,
      completeReservation,
      deleteReservation,
      getReservation,
    }),
    [
      reservations,
      myReservations,
      findConflict,
      addReservation,
      updateReservation,
      cancelReservation,
      completeReservation,
      deleteReservation,
      getReservation,
    ]
  );

  return <ReservationsContext.Provider value={value}>{children}</ReservationsContext.Provider>;
}

export function useReservations() {
  const ctx = useContext(ReservationsContext);
  if (!ctx) throw new Error("useReservations must be used within a ReservationsProvider");
  return ctx;
}
