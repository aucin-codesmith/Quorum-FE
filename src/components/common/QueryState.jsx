import { AlertTriangle, Loader2 } from "lucide-react";
import EmptyState from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { errorMessage } from "@/lib/formErrors";

// Full-screen spinner shown while a stored session is being verified.
export function SessionSplash() {
  return (
    <div className="grid min-h-screen place-items-center bg-background" role="status" aria-label="Loading">
      <Loader2 className="size-6 animate-spin text-primary-soft" />
    </div>
  );
}

// Header + a few blocks; a neutral placeholder while a page's first request is in flight.
export function PageSkeleton({ blocks = 3 }) {
  return (
    <div className="space-y-8" role="status" aria-label="Loading">
      <div className="space-y-3">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-5 w-96 max-w-full" />
      </div>
      {Array.from({ length: blocks }, (_, i) => (
        <Skeleton key={i} className="h-28 w-full" />
      ))}
    </div>
  );
}

export function CardGridSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3" role="status" aria-label="Loading">
      {Array.from({ length: count }, (_, i) => (
        <Card key={i} className="gap-0 py-0">
          <Skeleton className="aspect-[16/10] w-full rounded-none" />
          <CardContent className="space-y-3 p-6">
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function ListSkeleton({ rows = 4 }) {
  return (
    <div className="space-y-4" role="status" aria-label="Loading">
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className="h-24 w-full" />
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 6 }) {
  return (
    <Card className="py-0" role="status" aria-label="Loading">
      <CardContent className="space-y-4 p-6">
        {Array.from({ length: rows }, (_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </CardContent>
    </Card>
  );
}

// A failed request, with the server's own message and a retry.
export function ErrorState({ error, onRetry, title = "We couldn't load this" }) {
  return (
    <EmptyState
      icon={AlertTriangle}
      title={title}
      description={errorMessage(error)}
      action={
        onRetry && (
          <Button variant="outline" size="sm" onClick={() => onRetry()}>
            Try again
          </Button>
        )
      }
    />
  );
}

// Full-screen message when the stored session could not be verified because the server was unreachable.
export function SessionError({ error, onRetry }) {
  return (
    <div className="grid min-h-screen place-items-center bg-background px-6">
      <div className="w-full max-w-md">
        <ErrorState error={error} onRetry={onRetry} title="We can't reach QUORUM right now" />
      </div>
    </div>
  );
}
