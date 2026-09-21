import { Card, CardContent } from "@/components/ui/card";

// Supporting figure: quiet tinted surface, no border or shadow, so it never competes with the page's main action.
export default function StatCard({ label, value, icon: Icon, hint, tone = "default" }) {
  const iconColor = tone === "success" ? "text-success" : tone === "danger" ? "text-danger" : "text-primary-soft";

  return (
    <Card className="bg-tint-soft shadow-none ring-0">
      <CardContent className="flex items-center gap-4">
        <Icon size={22} strokeWidth={1.75} className={`shrink-0 ${iconColor}`} />
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-3xl leading-none font-semibold text-foreground">{value}</p>
          {hint && <p className="mt-2 text-sm text-muted-foreground">{hint}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
