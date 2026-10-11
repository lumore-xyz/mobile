import SurfacePanel from "@/src/components/ui/SurfacePanel";
import MobileNav from "@/src/components/MobileNav";
import PostCreationOption from "@/src/components/posts/PostCreationOption";
import { COLORS } from "@/src/libs/constants/theme";
import Icon from "@/src/libs/Icon";
import { router } from "expo-router";
import React from "react";
import { ScrollView, Text, View } from "react-native";

const postOptions = [
  {
    title: "Prompts",
    description: "Answer a question that gives people an easy opener.",
    icon: "MessageCircleMore",
    tone: "highlight",
    hint: "A little structure",
    route: "/create-post/prompts",
  },
  {
    title: "Image",
    description: "Pair a photo with the detail that makes it yours.",
    icon: "ImagePlus",
    tone: "accent",
    hint: "A moment in focus",
    route: "/create-post/image",
  },
  {
    title: "Free text",
    description: "Write a thought, memory, or something you believe.",
    icon: "PencilLine",
    tone: "foreground",
    hint: "Your own words",
    route: "/create-post/free-text",
  },
] as const;

const CreatePost = () => {
  return (
    <View className="flex-1 bg-ui-surface-page">
      <ScrollView
        className="flex-1 px-4"
        contentContainerClassName="pb-8 pt-4"
        showsVerticalScrollIndicator={false}
      >
        <SurfacePanel surface="midnight" className="mb-6 overflow-hidden">
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1">
              <Text
                className="font-display text-[32px] leading-9 text-ui-paper"
                accessibilityRole="header"
              >
                Create post
              </Text>
              <Text className="mt-1 text-sm leading-5 text-ui-paper/70">
                Choose a format that feels like you: quick, visual, or a little
                more unfiltered.
              </Text>
            </View>
            <View className="h-11 w-11 items-center justify-center rounded-full bg-ui-champagne">
              <Icon name="Sparkles" size={20} color={COLORS.ink} />
            </View>
          </View>

        </SurfacePanel>

        <View className="mb-2">
          <Text className="text-xl font-bold text-ui-ink">Choose a format</Text>
          <Text className="mt-1 text-sm leading-5 text-ui-slate">
            Start with the kind of story you want to tell.
          </Text>
        </View>
        {postOptions.map((option) => (
          <PostCreationOption
            key={option.title}
            {...option}
            onPress={() => router.push(option.route)}
          />
        ))}
      </ScrollView>
      <MobileNav />
    </View>
  );
};

export default CreatePost;
