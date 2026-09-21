import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { cleanParams, useListResult } from "./queryUtils";

// GET /api/users (administrators only). Pass { enabled: false } to skip the request for other roles.
export function useUsers(params = {}, { enabled = true } = {}) {
  const query = { limit: 100, ...cleanParams(params) };
  const result = useQuery({
    queryKey: ["users", query],
    queryFn: ({ signal }) => api.get("/api/users", { query, signal }),
    placeholderData: keepPreviousData,
    enabled,
  });
  const { items, ...rest } = useListResult(result);
  return { users: items, ...rest };
}

export function useUserMutations() {
  const qc = useQueryClient();
  const refresh = () => Promise.all(["users", "stats"].map((key) => qc.invalidateQueries({ queryKey: [key] })));

  const add = useMutation({ mutationFn: (body) => api.post("/api/users", { body }).then((r) => r.data), onSuccess: refresh });
  const update = useMutation({
    mutationFn: ({ id, patch }) => api.put(`/api/users/${id}`, { body: patch }).then((r) => r.data),
    onSuccess: refresh,
  });
  const remove = useMutation({ mutationFn: (id) => api.delete(`/api/users/${id}`), onSuccess: refresh });

  return {
    addUser: add.mutateAsync,
    updateUser: (id, patch) => update.mutateAsync({ id, patch }),
    deleteUser: remove.mutateAsync,
  };
}
