import ExpandablePostText from "@/src/components/profile/ExpandablePostText";
import type { ProfilePost } from "@/src/domain/profile/types";
import React from "react";
import { Text, View } from "react-native";

const PromptPost = ({ post }: { post: ProfilePost }) => {
  const promptText =
    typeof post.content.promptId === "object"
      ? post.content.promptId?.text || ""
      : "";
  const answer = post?.content?.promptAnswer || "";
  return (
    <View className="p-6">
      <View className="flex-row items-center gap-2">
        <View className="h-1 w-7 rounded-full bg-ui-champagne" />
        <Text className="text-[11px] font-bold uppercase tracking-[1.5px] text-ui-champagne">
          Get to know me
        </Text>
      </View>
      <View className="mt-6 pr-8">
        <Text className="text-base font-medium leading-6 text-ui-paper/75">
          {promptText || "A prompt worth answering"}
        </Text>
        <ExpandablePostText
          text={answer || "No answer added yet."}
          className="mt-3 text-[27px] font-semibold leading-8 text-ui-paper"
        />
      </View>
    </View>
  );
};

export default PromptPost;
