import { useQuery } from "@tanstack/react-query";
import { fetchCreditsBalance } from "@/src/features/credits/api";
import { creditsQueryKeys } from "@/src/features/credits/queryKeys";
import { getUser } from "@/src/service/storage";

export default function useCreditsBalance(userId?: string, enabled = true) {
  const storedUser = userId === undefined ? getUser() : null;
  const ownerId = userId ?? String(storedUser?._id || storedUser?.id || "");
  return useQuery({
    queryKey: creditsQueryKeys.balanceForUser(ownerId),
    queryFn: fetchCreditsBalance,
    enabled: Boolean(ownerId) && enabled,
  });
}
