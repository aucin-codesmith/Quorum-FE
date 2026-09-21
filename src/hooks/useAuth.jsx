import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, setUnauthorizedHandler, tokenStore } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";

// Real session: a JWT from the API, kept in localStorage and re-validated with GET /api/auth/me on load.

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // True only while a stored token is being checked, so guards do not bounce a signed-in user to /login on reload.
  const [loading, setLoading] = useState(() => Boolean(tokenStore.get()));
  // Set when the stored session could not be checked because the server was unreachable or failing.
  const [restoreError, setRestoreError] = useState(null);

  const loadSession = useCallback(
    () =>
      api
        .get("/api/auth/me")
        .then((res) => setUser(res.data))
        .catch((err) => {
          // A rejected token is dropped. A network or server failure keeps it and offers a retry,
          // instead of bouncing someone with a valid session to the login page.
          if (err.status === 401 || err.status === 403) tokenStore.clear();
          else setRestoreError(err);
        })
        .finally(() => setLoading(false)),
    []
  );

  useEffect(() => {
    if (tokenStore.get()) loadSession();
  }, [loadSession]);

  const retrySession = useCallback(() => {
    setRestoreError(null);
    setLoading(true);
    loadSession();
  }, [loadSession]);

  const clearSession = useCallback(() => {
    tokenStore.clear();
    setUser(null);
    queryClient.clear(); // never show one person's cached data to the next
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(clearSession);
    return () => setUnauthorizedHandler(null);
  }, [clearSession]);

  const startSession = useCallback(({ token, user: nextUser }) => {
    queryClient.clear();
    tokenStore.set(token);
    setUser(nextUser);
  }, []);

  // Both resolve to { ok: true, user } or { ok: false, error, code }.
  const authenticate = useCallback(
    async (path, body) => {
      try {
        const res = await api.post(path, { body, auth: false });
        startSession(res.data);
        return { ok: true, user: res.data.user };
      } catch (err) {
        return { ok: false, error: err.message, code: err.code, details: err.details };
      }
    },
    [startSession]
  );

  const login = useCallback((email, password) => authenticate("/api/auth/login", { email, password }), [authenticate]);
  const register = useCallback((payload) => authenticate("/api/auth/register", payload), [authenticate]);

  const value = useMemo(
    () => ({ user, loading, restoreError, retrySession, isAdmin: user?.role === "admin", login, register, logout: clearSession }),
    [user, loading, restoreError, retrySession, login, register, clearSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
