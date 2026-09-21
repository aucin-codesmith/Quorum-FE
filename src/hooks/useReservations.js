import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { cleanParams, useListResult } from "./queryUtils";

// The API nests room and user; the UI reads flat roomName / roomFloor / userName / roomId / userId.
export const normalizeReservation = (r) => ({
  ...r,
  roomId: r.room.id,
  roomName: r.room.name,
  roomFloor: r.room.floor,
  userId: r.user.id,
  userName: r.user.name,
});

// GET /api/reservations. The server scopes employees to their own; administrators get everyone's.
export function useReservations(params = {}, { enabled = true } = {}) {
  const query = { limit: 100, ...cleanParams(params) };
  const result = useQuery({
    queryKey: ["reservations", query],
    queryFn: ({ signal }) => api.get("/api/reservations", { query, signal }),
    placeholderData: keepPreviousData,
    enabled,
  });
  const { items, ...rest } = useListResult(result, normalizeReservation);
  return { reservations: items, ...rest };
}

export function useReservation(id) {
  const result = useQuery({
    queryKey: ["reservation", id],
    queryFn: ({ signal }) => api.get(`/api/reservations/${id}`, { signal }),
    enabled: Boolean(id),
    select: (r) => normalizeReservation(r.data),
  });
  return { reservation: result.data, isLoading: result.isLoading, isError: result.isError, error: result.error, refetch: result.refetch };
}

export function useReservationMutations() {
  const qc = useQueryClient();
  // A booking change ripples into schedules, room and user "upcoming" counts and the admin numbers.
  const refresh = () =>
    Promise.all(
      ["reservations", "reservation", "schedule", "rooms", "room", "users", "stats"].map((key) =>
        qc.invalidateQueries({ queryKey: [key] })
      )
    );

  const add = useMutation({
    mutationFn: (body) => api.post("/api/reservations", { body }).then((r) => normalizeReservation(r.data)),
    onSuccess: refresh,
  });
  const update = useMutation({
    mutationFn: ({ id, patch }) => api.put(`/api/reservations/${id}`, { body: patch }).then((r) => normalizeReservation(r.data)),
    onSuccess: refresh,
  });
  const remove = useMutation({ mutationFn: (id) => api.delete(`/api/reservations/${id}`), onSuccess: refresh });

  const updateReservation = (id, patch) => update.mutateAsync({ id, patch });
  return {
    addReservation: add.mutateAsync,
    updateReservation,
    cancelReservation: (id) => updateReservation(id, { status: "cancelled" }),
    completeReservation: (id) => updateReservation(id, { status: "completed" }),
    deleteReservation: remove.mutateAsync,
  };
}
