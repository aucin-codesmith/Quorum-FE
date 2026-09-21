import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

const EMPTY = [];

// The fixed facility catalogue lives on the server so the filter and the room form cannot drift from validation.
export function useFacilities() {
  const result = useQuery({
    queryKey: ["facilities"],
    queryFn: ({ signal }) => api.get("/api/facilities", { signal }),
    staleTime: Infinity,
    select: (r) => r.data,
  });
  return { facilities: result.data ?? EMPTY, isLoading: result.isLoading };
}
