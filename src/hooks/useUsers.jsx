import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { initialUsers } from "@/data/mockData";

// In-memory users store. Replace each mutation with an API call when the backend is ready.

const UsersContext = createContext(null);

let nextId = initialUsers.length + 1;

export function UsersProvider({ children }) {
  const [users, setUsers] = useState(initialUsers);

  const addUser = useCallback((data) => {
    const created = { id: `u-${String(nextId++).padStart(3, "0")}`, status: "active", ...data };
    setUsers((current) => [...current, created]);
    return created;
  }, []);

  const updateUser = useCallback((id, patch) => {
    setUsers((current) => current.map((u) => (u.id === id ? { ...u, ...patch } : u)));
  }, []);

  const deleteUser = useCallback((id) => {
    setUsers((current) => current.filter((u) => u.id !== id));
  }, []);

  const getUser = useCallback((id) => users.find((u) => u.id === id), [users]);

  const value = useMemo(
    () => ({ users, addUser, updateUser, deleteUser, getUser }),
    [users, addUser, updateUser, deleteUser, getUser]
  );

  return <UsersContext.Provider value={value}>{children}</UsersContext.Provider>;
}

export function useUsers() {
  const ctx = useContext(UsersContext);
  if (!ctx) throw new Error("useUsers must be used within a UsersProvider");
  return ctx;
}
