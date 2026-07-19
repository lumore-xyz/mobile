import MobileNav from "@/src/components/MobileNav";
import { COLORS } from "@/src/libs/constants/theme";
import Icon from "@/src/libs/Icon";
import { triggerSelectionHaptic } from "@/src/utils/haptics";
import { router } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";

const CreatePost = () => {
  return (
    <View className="h-full bg-ui-surface-page">
      <View className="h-full flex-1 p-4">
        <View className="mb-5 overflow-hidden rounded-[28px] bg-ui-foreground p-5">
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1">
              <Text
                className="text-3xl font-bold text-ui-light"
                accessibilityRole="header"
              >
                Create post
              </Text>
              <Text className="mt-1 text-sm leading-5 text-ui-light/70">
                Choose a format that feels like you: quick, visual, or a little
                more unfiltered.
              </Text>
            </View>
            <View className="h-11 w-11 items-center justify-center rounded-full bg-ui-primary">
              <Icon name="Sparkles" size={20} color={COLORS.shade} />
            </View>
          </View>

          <View className="mt-5 flex-row items-end justify-between gap-3">
            <View>
              <Text className="text-3xl font-bold text-ui-light">3</Text>
              <Text className="mt-0.5 text-sm text-ui-light/70">
                ways to share
              </Text>
            </View>
            <View className="rounded-full bg-ui-light/10 px-3 py-1.5">
              <Text className="text-xs font-semibold text-ui-light">
                Profile story
              </Text>
            </View>
          </View>
        </View>

        <PostCard
          title="Prompts"
          description="Answer a quick question with personality and a little spark."
          icon="MessageCircleMore"
          tone="highlight"
          onPress={() => router.push("/create-post/prompts")}
        />
        <PostCard
          title="Image"
          description="Share a photo with a caption that gives it context."
          icon="ImagePlus"
          tone="accent"
          onPress={() => router.push("/create-post/image")}
        />
        <PostCard
          title="Free text"
          description="Write a thought, a story, a quote, or whatever is sitting with you."
          icon="PencilLine"
          tone="foreground"
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
  tone,
  onPress,
}: {
  title: string;
  description: string;
  icon: string;
  tone: "highlight" | "accent" | "foreground";
  onPress: () => void;
}) => {
  const toneClass =
    tone === "accent"
      ? "bg-ui-accent/10"
      : tone === "foreground"
        ? "bg-ui-foreground/10"
        : "bg-ui-highlight/10";
  const iconColor =
    tone === "accent"
      ? COLORS.accent
      : tone === "foreground"
        ? COLORS.foreground
        : COLORS.highlight;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Create ${title} post`}
      onPress={() => {
        triggerSelectionHaptic();
        onPress();
      }}
      className="mb-4 rounded-[28px] border border-ui-border bg-ui-light p-4 active:opacity-90"
    >
      <View className="flex-row items-center gap-3">
        <View className={`h-12 w-12 items-center justify-center rounded-full ${toneClass}`}>
          <Icon name={icon} size={21} color={iconColor} />
        </View>
        <View className="flex-1">
          <Text className="text-lg font-bold text-ui-shade">{title}</Text>
          <Text className="mt-1 text-sm leading-5 text-ui-muted">
            {description}
          </Text>
        </View>
        <View className="h-10 w-10 items-center justify-center rounded-full bg-ui-shade/5">
          <Icon name="ChevronRight" size={18} color={COLORS.muted} />
        </View>
      </View>
    </Pressable>
  );
};
