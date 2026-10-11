import { profileQueryKeys } from "@/src/features/profile/queryKeys";
import { queryClient } from "@/src/service/query-client";
import { getUser } from "@/src/service/storage";

export default async function invalidateCurrentUserPosts(): Promise<void> {
  const userId = getUser()?._id;
  if (!userId) return;
  await queryClient.invalidateQueries({ queryKey: profileQueryKeys.posts(userId) });
}
