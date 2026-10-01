import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";
import AuthLayout from "@/components/layout/AuthLayout";
import IconInput from "@/components/common/IconInput";
import { SessionSplash } from "@/components/common/QueryState";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { homeFor } from "@/routes/homeFor";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { notify } = useToast();
  const { user, loading: restoring, login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ email: "", password: "" });

  // Where the visitor was headed before being sent here (set by RequireRole).
  const from = location.state?.from;
  const wantsAdmin = from?.startsWith("/admin");

  if (restoring) return <SessionSplash />;
  if (user && !submitting) return <Navigate to={homeFor(user)} replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const result = await login(form.email, form.password);
    if (!result.ok) {
      setSubmitting(false);
      setError(result.error);
      return;
    }
    notify("Welcome back", { description: `Signed in as ${result.user.name}.`, variant: "success" });
    // Go back to where they were headed only if their role can open it.
    const canOpenFrom = from && from.startsWith("/admin") === (result.user.role === "admin");
    navigate(canOpenFrom ? from : homeFor(result.user), { replace: true });
  };

  return (
    <AuthLayout title="Sign in to your account" description="Enter your company credentials to continue.">
      <form className="mt-12" onSubmit={handleSubmit}>
        <FieldGroup className="gap-6">
          <Field>
            <FieldLabel htmlFor="email">Work email</FieldLabel>
            <IconInput
              id="email"
              type="email"
              icon={Mail}
              placeholder="you@company.com"
              autoComplete="username"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <IconInput
              id="password"
              type={showPassword ? "text" : "password"}
              icon={Lock}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              suffix={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </Button>
              }
            />
            {error && <FieldError>{error}</FieldError>}
          </Field>

          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? "Signing in…" : "Sign in"}
            {!submitting && <ArrowRight />}
          </Button>
        </FieldGroup>
      </form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        New here?{" "}
        <Link to="/register" className="font-semibold text-primary hover:underline">
          Create an account
        </Link>
      </p>

      {wantsAdmin && (
        <p className="mt-4 rounded-xl bg-tint-soft p-4 text-sm text-muted-foreground">
          The admin area needs an administrator account.
        </p>
      )}
    </AuthLayout>
  );
}
