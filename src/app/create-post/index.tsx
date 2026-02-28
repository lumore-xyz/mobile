import MobileNav from "@/src/components/MobileNav";
import Icon from "@/src/libs/Icon";
import { router } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";

const CreatePost = () => {
  return (
    <View className="bg-ui-light h-full">
      <View className="p-4 flex-1 h-full">
        <Text className="text-2xl font-semibold mb-1">Create post</Text>
        <Text className="text-sm text-ui-shade mb-6">
          Choose the format that best expresses you.
        </Text>

        <PostCard
          title="Prompts"
          description="Answer quick prompts to show your personality."
          icon={{ type: "Ionicons", name: "chatbubble-ellipses-outline" }}
          accent="border-ui-highlight"
          onPress={() => router.push("/create-post/prompts")}
        />
        <PostCard
          title="Image"
          description="Share a photo with a short caption."
          icon={{ type: "Ionicons", name: "image-outline" }}
          accent="border-ui-accent"
          onPress={() => router.push("/create-post/image")}
        />
        <PostCard
          title="Free text"
          description="Write freely - a story, a quote, or a thought."
          icon={{ type: "Ionicons", name: "create-outline" }}
          accent="border-cyan-700"
          onPress={() => router.push("/create-post/free-text")}
        />
      </View>
      <MobileNav />
    </View>
  );
};

export default CreatePost;

const PostCard = ({
  title,
  description,
  icon,
  accent,
  onPress,
}: {
  title: string;
  description: string;
  icon: { type: string; name: string };
  accent: string;
  onPress: () => void;
}) => (
  <Pressable
    onPress={onPress}
    className={`mb-4 p-4 rounded-2xl bg-white border ${accent}`}
  >
    <View className="flex-row items-center gap-3">
      <View className="h-10 w-10 rounded-full bg-ui-light items-center justify-center">
        <Icon type={icon.type} name={icon.name} size={20} />
      </View>
      <View className="flex-1">
        <Text className="text-base font-semibold">{title}</Text>
        <Text className="text-xs text-ui-shade mt-1">{description}</Text>
      </View>
      <Icon type="Ionicons" name="chevron-forward" size={18} />
    </View>
  </Pressable>
);
