import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { SessionError, SessionSplash } from "@/components/common/QueryState";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { homeFor } from "./homeFor";

// Sends signed-out visitors to /login (remembering where they were headed) and signed-in users
// to the area that matches their role. Employees who try the admin area are told why.
export function RequireRole({ role }) {
  const { user, loading, restoreError, retrySession } = useAuth();
  const { notify } = useToast();
  const location = useLocation();

  const denied = Boolean(user) && user.role !== role;
  useEffect(() => {
    if (denied && role === "admin") {
      notify("Administrator access only", {
        id: "admin-only",
        variant: "info",
        description: `You're signed in as ${user.name}. Sign out and use an administrator account.`,
      });
    }
  }, [denied, role, user, notify]);

  if (loading) return <SessionSplash />;
  if (restoreError) return <SessionError error={restoreError} onRetry={retrySession} />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (denied) return <Navigate to={homeFor(user)} replace />;
  return <Outlet />;
}

export function HomeRedirect() {
  const { user, loading, restoreError, retrySession } = useAuth();
  if (loading) return <SessionSplash />;
  if (restoreError) return <SessionError error={restoreError} onRetry={retrySession} />;
  return <Navigate to={user ? homeFor(user) : "/login"} replace />;
}
