import type { QueryClient } from "@tanstack/react-query";
import { creditsQueryKeys } from "./queryKeys";

export default function invalidateCreditsQueries(
  queryClient: QueryClient,
): Promise<void> {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: creditsQueryKeys.balance }),
    queryClient.invalidateQueries({ queryKey: creditsQueryKeys.history }),
  ]).then(() => undefined);
}
