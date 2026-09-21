import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import Logo from "@/components/layout/Logo";
import IconInput from "@/components/common/IconInput";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { homeFor } from "@/routes/homeFor";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { notify } = useToast();
  const { user, login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ email: "", password: "" });

  // Where the visitor was headed before being sent here (set by RequireRole).
  const from = location.state?.from;
  const wantsAdmin = from?.startsWith("/admin");

  if (user && !loading) return <Navigate to={homeFor(user)} replace />;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    // Mock authentication for prototype purposes only.
    setTimeout(() => {
      const result = login(form.email);
      setLoading(false);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      notify("Welcome back", { description: "Signed in successfully.", variant: "success" });
      // Go back to where they were headed only if their role can open it.
      const canOpenFrom = from && from.startsWith("/admin") === (result.user.role === "admin");
      navigate(canOpenFrom ? from : homeFor(result.user), { replace: true });
    }, 700);
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="hidden flex-col justify-between bg-tint-soft px-16 py-12 lg:flex">
        <Logo size="lg" />

        <div className="max-w-md">
          <p className="text-4xl leading-tight font-bold text-ink">
            Smarter meetings,
            <br />
            better collaboration.
          </p>
          <p className="mt-6 text-base leading-relaxed text-muted-foreground">
            QUORUM brings every meeting room in the building onto one screen, so your team spends
            less time chasing chat threads and more time in the room.
          </p>
        </div>

        <p className="text-sm text-muted-foreground">© 2026 QUORUM Workplace Systems. Internal employee portal.</p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-background px-6 py-12 sm:px-10">
        <div className="w-full max-w-sm">
          <div className="mb-12 lg:hidden">
            <Logo />
          </div>

          <h1 className="text-3xl font-bold">Sign in to your account</h1>
          <p className="mt-3 text-base text-muted-foreground">Enter your company credentials to continue.</p>

          <form className="mt-12" onSubmit={handleSubmit}>
            <FieldGroup className="gap-6">
              <Field>
                <FieldLabel htmlFor="email">Work email</FieldLabel>
                <IconInput
                  id="email"
                  type="email"
                  icon={Mail}
                  placeholder="you@company.com"
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

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox id="remember" checked={remember} onCheckedChange={(v) => setRemember(v === true)} />
                  <Label htmlFor="remember" className="font-medium text-foreground/80">
                    Remember me
                  </Label>
                </div>
                <Button type="button" variant="link" className="h-auto p-0 text-sm text-muted-foreground hover:text-foreground">
                  Forgot password?
                </Button>
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? "Signing in…" : "Sign in"}
                {!loading && <ArrowRight />}
              </Button>
            </FieldGroup>
          </form>

          <div className="mt-12 rounded-xl bg-tint-soft p-4 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">Prototype sign-in</p>
            <p className="mt-1">
              {wantsAdmin
                ? "The admin area needs an administrator account. "
                : "Any credentials work. "}
              An email containing <span className="font-medium text-foreground">admin</span> opens the
              administrator area; anything else signs in as an employee.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setForm((f) => ({ ...f, email: "admin@company.com", password: f.password || "demo" }))}
              >
                Fill administrator demo
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setForm((f) => ({ ...f, email: "alya.ramadhani@company.com", password: f.password || "demo" }))}
              >
                Fill employee demo
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
