import SurfacePanel from "@/src/components/ui/SurfacePanel";
import SectionHeading from "@/src/components/profile/SectionHeading";
import ThisOrThatSectionSkeleton from "@/src/components/profile/ThisOrThatSectionSkeleton";
import { ThisOrThatAnswer } from "@/src/utils/types";
import { Image } from "expo-image";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

interface ThisOrThatProfileSectionProps {
  answers: ThisOrThatAnswer[];
  isLoading: boolean;
  isOwner: boolean;
  onPlay: () => void;
}

const ThisOrThatProfileSection = ({
  answers,
  isLoading,
  isOwner,
  onPlay,
}: ThisOrThatProfileSectionProps) => (
  <SurfacePanel surface="paper" className="mt-5">
    <View className="flex-row items-center justify-between">
      <SectionHeading
        title="This or That"
        subtitle="Choices that reveal a little more"
      />
      {isOwner ? (
        <Pressable
          onPress={onPlay}
          className="min-h-11 justify-center rounded-full bg-ui-forest/10 px-4 active:opacity-75"
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Play This or That"
        >
          <Text className="text-sm font-semibold text-ui-forest">Play</Text>
        </Pressable>
      ) : null}
    </View>
    {isLoading ? (
      <ThisOrThatSectionSkeleton />
    ) : answers.length ? (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mt-3"
        contentContainerStyle={{ gap: 12 }}
      >
        {answers.map((answer) => (
          <View
            key={answer._id}
            className="w-64 overflow-hidden rounded-3xl bg-ui-forest/5"
          >
            {answer.selectedImageUrl ? (
              <Image
                source={{ uri: answer.selectedImageUrl }}
                className="h-28 w-full"
                contentFit="cover"
              />
            ) : null}
            <View className="p-3">
              <Text className="text-xs font-medium capitalize text-ui-slate">
                {answer.question?.category || "general"}
              </Text>
              <Text className="mt-1 text-sm font-semibold">
                {answer.selectedText}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    ) : (
      <View className="mt-4 rounded-2xl bg-ui-forest/5 p-4">
        <Text className="text-sm text-ui-slate">
          No answers yet. A few quick choices can make your profile feel more
          personal.
        </Text>
      </View>
    )}
  </SurfacePanel>
);

export default ThisOrThatProfileSection;
