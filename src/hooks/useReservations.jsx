import { createContext, useContext, useMemo, useState } from "react";
import { initialReservations } from "../data/mockData";

// NOTE: This context simulates a backend-backed reservations store using
// local React state only. Every mutation below (create / cancel) should be
// swapped for a real API call once the backend is available; the shape of
// each reservation object is designed to map 1:1 onto a future API response.

const ReservationsContext = createContext(null);

let nextId = 1043;

export function ReservationsProvider({ children }) {
  const [reservations, setReservations] = useState(initialReservations);

  const addReservation = (reservation) => {
    const created = {
      id: `res-${nextId++}`,
      status: "upcoming",
      createdAt: new Date().toISOString(),
      ...reservation,
    };
    setReservations((current) => [created, ...current]);
    return created;
  };

  const cancelReservation = (id) => {
    setReservations((current) =>
      current.map((r) => (r.id === id ? { ...r, status: "cancelled" } : r))
    );
  };

  const getReservation = (id) => reservations.find((r) => r.id === id);

  const value = useMemo(
    () => ({ reservations, addReservation, cancelReservation, getReservation }),
    [reservations]
  );

  return <ReservationsContext.Provider value={value}>{children}</ReservationsContext.Provider>;
}

export function useReservations() {
  const ctx = useContext(ReservationsContext);
  if (!ctx) throw new Error("useReservations must be used within a ReservationsProvider");
  return ctx;
}
