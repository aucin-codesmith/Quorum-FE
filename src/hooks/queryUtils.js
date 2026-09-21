import { useMemo } from "react";

const EMPTY = [];

// Drops undefined/empty params so they are not sent as ?q=
export const cleanParams = (params) =>
  Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ""));

// Common shape returned by the list hooks.
export function useListResult(query, map) {
  const items = useMemo(() => {
    const rows = query.data?.data;
    return rows ? (map ? rows.map(map) : rows) : EMPTY;
  }, [query.data, map]);
  return {
    items,
    meta: query.data?.meta,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
