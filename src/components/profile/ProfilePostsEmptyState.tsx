import SurfacePanel from "@/src/components/ui/SurfacePanel";
import PostsSectionSkeleton from "@/src/components/profile/PostsSectionSkeleton";
import Icon from "@/src/libs/Icon";
import { COLORS } from "@/src/libs/constants/theme";
import { Text } from "react-native";

export default function ProfilePostsEmptyState({
  isLoading,
  isOwner,
}: {
  isLoading: boolean;
  isOwner: boolean;
}) {
  if (isLoading) return <PostsSectionSkeleton />;

  return (
    <SurfacePanel surface="paper">
      <Icon name="Sparkles" size={24} color={COLORS.forest} />
      <Text className="mt-3 text-base font-semibold text-ui-ink">
        {isOwner ? "Show a little more of you" : "Nothing shared yet"}
      </Text>
      <Text className="mt-1 text-sm leading-5 text-ui-slate">
        {isOwner
          ? "Share a thought, prompt, or photo to give people an easy conversation starter."
          : "Posts will appear here when this person shares something."}
      </Text>
    </SurfacePanel>
  );
}
