import type { QueryClient } from "@tanstack/react-query";
import { inboxQueryKeys } from "./inboxQueryKeys";

export default function invalidateInboxLists(queryClient: QueryClient): void {
  void queryClient.invalidateQueries({ queryKey: inboxQueryKeys.active });
  void queryClient.invalidateQueries({ queryKey: inboxQueryKeys.archived });
}
