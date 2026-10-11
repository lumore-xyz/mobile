import type { ProfilePost } from "@/src/domain/profile/types";
import React from "react";
import { Text, View } from "react-native";

const TextPost = ({ post }: { post: ProfilePost }) => (
  <View className="p-5">
    <View className="mb-4 h-1 w-12 rounded-full bg-ui-forest" />
    <Text className="text-[26px] font-bold leading-9 text-ui-ink">
      {post?.content?.text || "No text added yet."}
    </Text>
  </View>
);

export default TextPost;
