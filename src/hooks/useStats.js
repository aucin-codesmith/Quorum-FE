import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

// GET /api/stats/overview (administrators only): counts by status, today's bookings, room utilisation.
export function useStats({ enabled = true } = {}) {
  const result = useQuery({
    queryKey: ["stats"],
    queryFn: ({ signal }) => api.get("/api/stats/overview", { signal }),
    enabled,
    select: (r) => r.data,
  });
  return { stats: result.data, isLoading: result.isLoading, isError: result.isError, error: result.error, refetch: result.refetch };
}
