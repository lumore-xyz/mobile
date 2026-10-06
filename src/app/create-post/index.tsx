import MobileNav from "@/src/components/MobileNav";
import { COLORS } from "@/src/libs/constants/theme";
import Icon from "@/src/libs/Icon";
import { triggerSelectionHaptic } from "@/src/utils/haptics";
import { router } from "expo-router";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

const CreatePost = () => {
  return (
    <View className="flex-1 bg-ui-surface-page">
      <ScrollView
        className="flex-1 px-4"
        contentContainerClassName="pb-8 pt-4"
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-6 overflow-hidden rounded-[24px] bg-ui-midnight p-5">
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

        </View>

        <View className="mb-2">
          <Text className="text-xl font-bold text-ui-ink">Choose a format</Text>
          <Text className="mt-1 text-sm leading-5 text-ui-slate">
            Start with the kind of story you want to tell.
          </Text>
        </View>
        <PostOption
          title="Prompts"
          description="Answer a question that gives people an easy opener."
          icon="MessageCircleMore"
          tone="highlight"
          hint="A little structure"
          onPress={() => router.push("/create-post/prompts")}
        />
        <PostOption
          title="Image"
          description="Pair a photo with the detail that makes it yours."
          icon="ImagePlus"
          tone="accent"
          hint="A moment in focus"
          onPress={() => router.push("/create-post/image")}
        />
        <PostOption
          title="Free text"
          description="Write a thought, memory, or something you believe."
          icon="PencilLine"
          tone="foreground"
          hint="Your own words"
          onPress={() => router.push("/create-post/free-text")}
        />
      </ScrollView>
      <MobileNav />
    </View>
  );
};

export default CreatePost;

const PostOption = ({
  title,
  description,
  icon,
  tone,
  hint,
  onPress,
}: {
  title: string;
  description: string;
  icon: string;
  tone: "highlight" | "accent" | "foreground";
  hint: string;
  onPress: () => void;
}) => {
  const toneClass =
    tone === "accent"
      ? "bg-ui-aubergine/10"
      : tone === "foreground"
        ? "bg-ui-midnight/10"
        : "bg-ui-forest/10";
  const iconColor =
    tone === "accent"
      ? COLORS.aubergine
      : tone === "foreground"
        ? COLORS.midnight
        : COLORS.forest;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Create ${title} post`}
      onPress={() => {
        triggerSelectionHaptic();
        onPress();
      }}
      className="min-h-[116px] flex-row items-center gap-4 border-b border-ui-parchment py-5 active:opacity-70"
    >
      <View className={`h-14 w-14 items-center justify-center rounded-[20px] ${toneClass}`}>
        <Icon name={icon} size={23} color={iconColor} />
      </View>
      <View className="flex-1">
        <Text className="text-lg font-bold text-ui-ink">{title}</Text>
        <Text className="mt-1 text-sm leading-5 text-ui-slate">
          {description}
        </Text>
        <Text className="mt-2 text-xs font-semibold text-ui-forest">
          {hint}
        </Text>
      </View>
      <View className="h-9 w-9 items-center justify-center rounded-full bg-ui-forest/5">
        <Icon name="ArrowUpRight" size={17} color={COLORS.forest} />
      </View>
    </Pressable>
  );
};
