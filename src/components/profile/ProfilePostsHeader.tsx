import SectionHeading from "@/src/components/profile/SectionHeading";
import React from "react";
import { Pressable, Text, View } from "react-native";

interface ProfilePostsHeaderProps {
  isOwner: boolean;
  onCreatePost: () => void;
}

const ProfilePostsHeader = ({
  isOwner,
  onCreatePost,
}: ProfilePostsHeaderProps) => (
  <View className="mt-6">
    <View className="mb-3 flex-row items-center justify-between">
      <SectionHeading
        title={isOwner ? "Your posts" : "Posts"}
        subtitle="Stories, thoughts, and moments"
      />
      {isOwner ? (
        <Pressable
          onPress={onCreatePost}
          className="min-h-11 justify-center rounded-full bg-ui-forest/10 px-4 active:opacity-75"
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Create a new post"
        >
          <Text className="text-sm font-semibold text-ui-forest">Create</Text>
        </Pressable>
      ) : null}
    </View>
  </View>
);

export default ProfilePostsHeader;
