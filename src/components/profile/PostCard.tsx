import ImagePost from "@/src/components/profile/ImagePost";
import PromptPost from "@/src/components/profile/PromptPost";
import TextPost from "@/src/components/profile/TextPost";
import type { ProfilePost } from "@/src/domain/profile/types";
import { COLORS } from "@/src/libs/constants/theme";
import Icon from "@/src/libs/Icon";
import { triggerSelectionHaptic } from "@/src/utils/haptics";
import React, { memo } from "react";
import { Pressable, View } from "react-native";

const PostCard = memo(function PostCard({
  post,
  canEdit,
  onOpenActions,
}: {
  post: ProfilePost;
  canEdit: boolean;
  onOpenActions: (post: ProfilePost) => void;
}) {
  return (
    <View
      className={`relative overflow-hidden rounded-[24px] border ${
        post.type === "PROMPT"
          ? "border-ui-midnight bg-ui-midnight"
          : "border-ui-parchment bg-ui-paper"
      }`}
    >
      {canEdit ? (
        <Pressable
          onPress={() => {
            triggerSelectionHaptic();
            onOpenActions(post);
          }}
          className={`absolute right-3 top-3 z-10 h-11 w-11 items-center justify-center rounded-full active:opacity-75 ${
            post.type === "PROMPT" ? "bg-ui-paper/15" : "bg-ui-paper/90"
          }`}
          hitSlop={4}
          accessibilityRole="button"
          accessibilityLabel="Open post actions"
        >
          <Icon
            name="EllipsisVertical"
            size={17}
            color={post.type === "PROMPT" ? COLORS.paper : COLORS.ink}
          />
        </Pressable>
      ) : null}
      <View className="min-h-32">
        {post?.type === "PROMPT" ? <PromptPost post={post} /> : null}
        {post?.type === "IMAGE" ? <ImagePost post={post} /> : null}
        {post?.type === "TEXT" ? <TextPost post={post} /> : null}
      </View>
    </View>
  );
});

export default PostCard;
