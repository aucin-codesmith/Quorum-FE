import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      // Retry only when the server or network failed; a 4xx will not fix itself. The dev
      // environment occasionally drops the very first request right after a fresh page load
      // (observed on cold navigation, before any app code runs) but always recovers within one
      // retry; a short, fast-repeating backoff clears it well before the user notices, instead of
      // the default 1s/2s/4s ramp occasionally running out before the retries do.
      retry: (count, error) => (error?.status === 0 || error?.status >= 500) && count < 4,
      retryDelay: (attempt) => Math.min(250 * 2 ** attempt, 2000),
    },
  },
});
