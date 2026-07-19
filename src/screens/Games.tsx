import SubPageBack from "../components/headers/SubPageBack";
import { router } from "expo-router";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { COLORS } from "../libs/constants/theme";
import Icon from "../libs/Icon";
import { triggerSelectionHaptic } from "../utils/haptics";

const GamesScreen = () => {
  return (
    <View className="flex-1 bg-ui-surface-page">
      <SubPageBack title="Games" />
      <ScrollView className="px-4" contentContainerClassName="pb-10 pt-4">
        <View className="overflow-hidden rounded-[32px] bg-ui-foreground p-5">
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1">
              <Text className="text-sm font-semibold text-ui-light/60">
                Play to reveal
              </Text>
              <Text
                className="mt-1 text-[32px] font-black leading-9 text-ui-light"
                accessibilityRole="header"
              >
                Make your profile easier to answer
              </Text>
              <Text className="mt-2 text-sm leading-5 text-ui-light/70">
                Games add little signals to your profile so matches have more
                natural ways to start a conversation.
              </Text>
            </View>
            <View className="h-14 w-14 items-center justify-center rounded-full bg-ui-primary">
              <Icon name="Gamepad2" size={24} color={COLORS.shade} />
            </View>
          </View>
        </View>

        <Pressable
          onPress={() => {
            triggerSelectionHaptic();
            router.navigate("/(subpage)/games/this-or-that");
          }}
          className="mt-5 overflow-hidden rounded-[30px] bg-ui-light active:opacity-85"
          accessibilityRole="button"
          accessibilityLabel="Play This or That"
        >
          <View className="bg-ui-highlight/10 p-5">
            <View className="flex-row items-start justify-between gap-4">
              <View className="flex-1">
                <View className="mb-3 self-start rounded-full bg-ui-primary px-3 py-1">
                  <Text className="text-xs font-bold text-ui-shade">
                    Featured game
                  </Text>
                </View>
                <Text className="text-2xl font-black text-ui-shade">
                  This or That
                </Text>
                <Text className="mt-2 text-sm leading-5 text-ui-muted">
                  Pick between two options and let your choices show your taste,
                  rhythm, and personality.
                </Text>
              </View>
              <View className="h-12 w-12 items-center justify-center rounded-full bg-ui-highlight">
                <Icon name="MousePointerClick" size={21} color={COLORS.light} />
              </View>
            </View>
          </View>
          <View className="flex-row items-center justify-between px-5 py-4">
            <View className="flex-row items-center gap-2">
              <Icon name="Sparkles" size={17} color={COLORS.highlight} />
              <Text className="text-sm font-semibold text-ui-highlight">
                Builds match signals
              </Text>
            </View>
            <View className="h-9 w-9 items-center justify-center rounded-full bg-ui-surface-page">
              <Icon name="ChevronRight" size={17} color={COLORS.muted} />
            </View>
          </View>
        </Pressable>

        <View className="mt-5 rounded-[28px] border border-ui-border bg-ui-surface-page p-4">
          <View className="mb-1 flex-row items-start gap-3">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-ui-highlight/10">
              <Icon name="HeartHandshake" size={18} color={COLORS.highlight} />
            </View>
            <View className="flex-1">
              <Text className="text-xl font-bold text-ui-shade">
                Why games help
              </Text>
              <Text className="mt-1 text-sm leading-5 text-ui-muted">
                Quick choices feel lighter than long forms, but they still give
                people something specific to connect with.
              </Text>
            </View>
          </View>

          <View className="mt-3 gap-2">
            <GameBenefit icon="MessageCircleHeart" text="Creates easier openers for matches." />
            <GameBenefit icon="BadgeCheck" text="Adds personality without overexplaining." />
            <GameBenefit icon="Sparkles" text="Keeps your profile feeling alive." />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const GameBenefit = ({ icon, text }: { icon: string; text: string }) => (
  <View className="flex-row items-center gap-3 rounded-2xl bg-ui-light p-3">
    <View className="h-9 w-9 items-center justify-center rounded-full bg-ui-highlight/10">
      <Icon name={icon} size={16} color={COLORS.highlight} />
    </View>
    <Text className="flex-1 text-sm leading-5 text-ui-shade">{text}</Text>
  </View>
);

export default GamesScreen;
