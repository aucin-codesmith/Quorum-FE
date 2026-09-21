import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { initialRooms } from "@/data/mockData";

// In-memory rooms store. Replace each mutation with an API call when the backend is ready.

const RoomsContext = createContext(null);

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop";

let nextId = initialRooms.length + 1;

export function RoomsProvider({ children }) {
  const [rooms, setRooms] = useState(initialRooms);

  const addRoom = useCallback((data) => {
    const created = {
      id: `r-${String(nextId++).padStart(2, "0")}`,
      image: DEFAULT_IMAGE,
      ...data,
    };
    setRooms((current) => [...current, created]);
    return created;
  }, []);

  const updateRoom = useCallback((id, patch) => {
    setRooms((current) => current.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }, []);

  const deleteRoom = useCallback((id) => {
    setRooms((current) => current.filter((r) => r.id !== id));
  }, []);

  const getRoom = useCallback((id) => rooms.find((r) => r.id === id), [rooms]);

  const value = useMemo(
    () => ({ rooms, addRoom, updateRoom, deleteRoom, getRoom }),
    [rooms, addRoom, updateRoom, deleteRoom, getRoom]
  );

  return <RoomsContext.Provider value={value}>{children}</RoomsContext.Provider>;
}

export function useRooms() {
  const ctx = useContext(RoomsContext);
  if (!ctx) throw new Error("useRooms must be used within a RoomsProvider");
  return ctx;
}
