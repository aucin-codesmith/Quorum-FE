import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { DEFAULT_ADMIN_ID, DEFAULT_EMPLOYEE_ID } from "@/data/mockData";
import { useUsers } from "@/hooks/useUsers";

// Mock session: only the signed-in user's id is kept, and it is resolved against the
// users store on every render so admin edits to a profile show up immediately.
// Swap login/logout for real auth calls once the backend exists.

const AuthContext = createContext(null);
const STORAGE_KEY = "quorum.session";

function readStoredId() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function storeId(id) {
  try {
    if (id) localStorage.setItem(STORAGE_KEY, id);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage can be blocked (private window); the session then lasts until reload.
  }
}

export function AuthProvider({ children }) {
  const { users } = useUsers();
  const [userId, setUserId] = useState(readStoredId);

  const user = useMemo(() => users.find((u) => u.id === userId) ?? null, [users, userId]);

  // Returns { ok: true, user } or { ok: false, error }.
  const login = useCallback(
    (email) => {
      const normalized = email.trim().toLowerCase();
      const match = users.find((u) => u.email.toLowerCase() === normalized);
      const fallbackId = normalized.includes("admin") ? DEFAULT_ADMIN_ID : DEFAULT_EMPLOYEE_ID;
      const target = match ?? users.find((u) => u.id === fallbackId);

      if (!target || target.status !== "active") {
        return { ok: false, error: "This account is inactive. Ask an administrator to reactivate it." };
      }
      setUserId(target.id);
      storeId(target.id);
      return { ok: true, user: target };
    },
    [users]
  );

  const logout = useCallback(() => {
    setUserId(null);
    storeId(null);
  }, []);

  const value = useMemo(() => ({ user, isAdmin: user?.role === "admin", login, logout }), [user, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
