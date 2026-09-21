import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { cleanParams, useListResult } from "./queryUtils";

// GET /api/rooms. Defaults to everything (limit 100); the admin table passes page/limit/filters.
export function useRooms(params = {}) {
  const query = { limit: 100, ...cleanParams(params) };
  const result = useQuery({
    queryKey: ["rooms", query],
    queryFn: ({ signal }) => api.get("/api/rooms", { query, signal }),
    placeholderData: keepPreviousData,
  });
  const { items, ...rest } = useListResult(result);
  return { rooms: items, ...rest };
}

export function useRoom(id) {
  const result = useQuery({
    queryKey: ["room", id],
    queryFn: ({ signal }) => api.get(`/api/rooms/${id}`, { signal }),
    enabled: Boolean(id),
  });
  return { room: result.data?.data, isLoading: result.isLoading, isError: result.isError, error: result.error, refetch: result.refetch };
}

// Booked (non-cancelled) slots for one day; the server defaults to today when `date` is omitted.
export function useRoomSchedule(roomId, date, { enabled = true } = {}) {
  const result = useQuery({
    queryKey: ["schedule", roomId, date ?? "today"],
    queryFn: ({ signal }) => api.get(`/api/rooms/${roomId}/schedule`, { query: { date }, signal }),
    enabled: enabled && Boolean(roomId),
  });
  return { slots: result.data?.data.reservations ?? [], isLoading: result.isLoading, isError: result.isError };
}

export function useRoomMutations() {
  const qc = useQueryClient();
  const refresh = () =>
    Promise.all(["rooms", "room", "stats"].map((key) => qc.invalidateQueries({ queryKey: [key] })));

  const add = useMutation({ mutationFn: (body) => api.post("/api/rooms", { body }).then((r) => r.data), onSuccess: refresh });
  const update = useMutation({
    mutationFn: ({ id, patch }) => api.put(`/api/rooms/${id}`, { body: patch }).then((r) => r.data),
    onSuccess: refresh,
  });
  const remove = useMutation({ mutationFn: (id) => api.delete(`/api/rooms/${id}`), onSuccess: refresh });

  return {
    addRoom: add.mutateAsync,
    updateRoom: (id, patch) => update.mutateAsync({ id, patch }),
    deleteRoom: remove.mutateAsync,
  };
}
