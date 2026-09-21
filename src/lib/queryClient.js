import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      // Retry only when the server or network failed; a 4xx will not fix itself.
      retry: (count, error) => (error?.status === 0 || error?.status >= 500) && count < 2,
    },
  },
});
