import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowRight, CalendarClock, ShieldCheck, Users2 } from "lucide-react";
import Logo from "../../components/layout/Logo";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { useToast } from "../../hooks/useToast";

export default function LoginPage() {
  const navigate = useNavigate();
  const { notify } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Mock authentication for prototype purposes only.
    setTimeout(() => {
      setLoading(false);
      notify("Welcome back", { description: "Signed in successfully.", variant: "success" });
      navigate("/dashboard");
    }, 700);
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-ink-800 px-14 py-12 lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1.5px 1.5px, white 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
        <div
          className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-accent-500/20 blur-3xl"
        />

        <Logo variant="light" size="lg" />

        <div className="relative max-w-md">
          <p className="font-display text-[34px] leading-[1.2] text-white">
            Smarter meetings,
            <br />
            better collaboration.
          </p>
          <p className="mt-4 text-[14.5px] leading-relaxed text-white/55">
            QUORUM brings every meeting room in the building onto one screen —
            so your team spends less time chasing chat threads and more time
            in the room.
          </p>

          <div className="mt-10 space-y-4">
            {[
              { icon: CalendarClock, text: "Real-time room availability across every floor" },
              { icon: Users2, text: "One place to book, manage, and cancel reservations" },
              { icon: ShieldCheck, text: "No more double-booked rooms or chat-thread chaos" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/8 text-accent-300">
                  <Icon size={16} />
                </div>
                <p className="text-[13.5px] text-white/70">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-[12.5px] text-white/35">
          © 2026 QUORUM Workplace Systems. Internal employee portal.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-paper px-6 py-12 sm:px-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>

          <h1 className="font-display text-[26px] text-ink-800">Sign in to your account</h1>
          <p className="mt-1.5 text-[14px] text-slate-500">
            Enter your company credentials to continue.
          </p>

          <form className="mt-8 space-y-4.5" onSubmit={handleSubmit}>
            <Input
              label="Work email"
              type="email"
              icon={Mail}
              placeholder="you@company.com"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              icon={Lock}
              placeholder="Enter your password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              suffix={
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  className="rounded-md p-2 text-mist-300 hover:text-ink-700"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-[13px] font-medium text-slate-600">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-mist-300 text-slate-600 focus:ring-slate-500/30"
                />
                Remember me
              </label>
              <button
                type="button"
                className="text-[13px] font-semibold text-slate-600 hover:text-ink-800"
              >
                Forgot password?
              </button>
            </div>

            <Button type="submit" fullWidth size="lg" icon={ArrowRight} iconPosition="right" loading={loading}>
              Sign in
            </Button>
          </form>

          <p className="mt-8 text-center text-[12.5px] text-mist-300">
            This is a frontend prototype — any credentials will sign you in.
          </p>
        </div>
      </div>
    </div>
  );
}
