import Logo from "@/components/layout/Logo";

// Split screen shared by sign-in and sign-up: brand panel on the left, the form on the right.
export default function AuthLayout({ title, description, children }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
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

      <div className="flex items-center justify-center bg-background px-6 py-12 sm:px-10">
        <div className="w-full max-w-sm">
          <div className="mb-12 lg:hidden">
            <Logo />
          </div>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="mt-3 text-base text-muted-foreground">{description}</p>
          {children}
        </div>
      </div>
    </div>
  );
}
