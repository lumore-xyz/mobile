import { QueryClient } from "@tanstack/react-query";

const shouldRetryQuery = (failureCount: number, error: unknown) => {
  const status = Number((error as any)?.response?.status || 0);
  if (status >= 400 && status < 500) return false;
  return failureCount < 2;
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
      retry: shouldRetryQuery,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});
