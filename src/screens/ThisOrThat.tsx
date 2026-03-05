import { useMutation, useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import SubPageBack from "../components/headers/SubPageBack";
import Button from "../components/ui/Button";
import Skeleton from "../components/ui/Skeleton";
import { fetchThisOrThatQuestions, submitThisOrThatAnswer } from "../libs/apis";
import { ThisOrThatQuestion } from "../utils/types";

const ThisOrThatScreen = () => {
  const [index, setIndex] = useState(0);
  const [localTotal, setLocalTotal] = useState(0);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["this-or-that", "questions"],
    queryFn: () => fetchThisOrThatQuestions(20),
  });

  const questions: ThisOrThatQuestion[] = data?.data || [];
  const current = questions[index];
  const total = questions.length;

  const { mutateAsync, isPending } = useMutation({
    mutationFn: submitThisOrThatAnswer,
  });

  useEffect(() => {
    if (!data?.data) return;
    setIndex(0);
    setLocalTotal(0);
  }, [data]);

  const progress = useMemo(() => {
    if (!total) return 0;
    return Math.min(Math.round(((index + 1) / total) * 100), 100);
  }, [index, total]);

  const handleChoice = async (selection: "left" | "right") => {
    if (!current || isPending) return;
    try {
      await mutateAsync({ questionId: current._id, selection });
      setLocalTotal((prev) => prev + 1);
      setIndex((prev) => prev + 1);
    } catch (error) {
      console.error("Failed to submit answer", error);
    }
  };

  const handleSkip = () => {
    if (!current) return;
    setIndex((prev) => prev + 1);
  };

  return (
    <View className="flex-1 bg-ui-light">
      <SubPageBack title="This Or That" />
      <ScrollView className="p-4" contentContainerClassName="pb-10">
        <View className="flex-row items-start justify-between gap-3">
          <View>
            <Text className="text-xs uppercase tracking-wide text-ui-shade/70">
              This Or That
            </Text>
            <Text className="text-2xl font-bold text-ui-shade mt-1">
              Pick your vibe
            </Text>
            <Text className="text-sm max-w-[250px] text-ui-shade/70 mt-1">
              Your choices help us understand your preferences better.
            </Text>
          </View>
          <View className="w-32">
            <Button
              variant="outline"
              text="Submit"
              onClick={() =>
                router.navigate("/(subpage)/games/this-or-that/submit")
              }
            />
          </View>
        </View>

        {isLoading ? (
          <ThisOrThatLoadingSkeleton />
        ) : null}

        {isError ? (
          <View className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">
            <Text className="text-sm text-red-600">
              Unable to load questions.
            </Text>
            <View className="mt-3">
              <Button text="Retry" onClick={() => refetch()} />
            </View>
          </View>
        ) : null}

        {!isLoading && !isError && !current ? (
          <View className="mt-6 rounded-2xl border border-ui-shade/10 bg-white p-6 items-center">
            <Text className="text-xl font-semibold text-ui-shade">
              You are all caught up
            </Text>
            <Text className="text-sm text-ui-shade/70 mt-2">
              You answered {localTotal} question{localTotal === 1 ? "" : "s"}.
            </Text>
            <View className="flex-row gap-2 mt-4">
              <Button text="Get More" onClick={() => refetch()} />
              <Button
                variant="outline"
                text="Submit a new one"
                onClick={() =>
                  router.navigate("/(subpage)/games/this-or-that/submit")
                }
              />
            </View>
          </View>
        ) : null}

        {current ? (
          <View className="mt-6 rounded-2xl border border-ui-shade/10 bg-white p-5">
            <View className="flex-row items-center justify-between gap-2">
              <Text className="text-xs uppercase tracking-wide text-ui-shade/70">
                {current.category || "general"}
              </Text>
              <Text className="text-xs text-ui-shade/70">
                {Math.min(index + 1, total)} / {total}
              </Text>
            </View>
            <View className="mt-3 h-2 w-full rounded-full bg-ui-shade/10">
              <View
                className="h-2 rounded-full bg-ui-highlight"
                style={{ width: `${progress}%` }}
              />
            </View>

            <Text className="mt-5 text-center text-sm text-ui-shade/70">
              Which one describes you better?
            </Text>
            <View className="mt-4 gap-3">
              <Pressable
                className="min-h-24 rounded-xl border border-ui-highlight/20 bg-ui-highlight/5 p-4"
                onPress={() => handleChoice("left")}
                disabled={isPending}
              >
                {current.leftImageUrl ? (
                  <Image
                    source={{ uri: current.leftImageUrl }}
                    className="mb-3 h-40 w-full rounded-lg"
                    style={{ resizeMode: "cover" }}
                  />
                ) : null}
                <Text className="text-base font-medium text-ui-shade">
                  {current.leftOption}
                </Text>
              </Pressable>

              <Pressable
                className="min-h-24 rounded-xl border border-ui-shade/20 bg-white p-4"
                onPress={() => handleChoice("right")}
                disabled={isPending}
              >
                {current.rightImageUrl ? (
                  <Image
                    source={{ uri: current.rightImageUrl }}
                    className="mb-3 h-40 w-full rounded-lg"
                    style={{ resizeMode: "cover" }}
                  />
                ) : null}
                <Text className="text-base font-medium text-ui-shade">
                  {current.rightOption}
                </Text>
              </Pressable>
            </View>

            <View className="mt-4 items-end">
              <Button
                variant="outline"
                text="Skip"
                onClick={handleSkip}
                disabled={isPending}
              />
            </View>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
};

const ThisOrThatLoadingSkeleton = () => (
  <View className="mt-6 rounded-2xl border border-ui-shade/10 bg-white p-5">
    <View className="flex-row items-center justify-between">
      <Skeleton width={76} height={11} />
      <Skeleton width={42} height={10} />
    </View>
    <Skeleton width="100%" height={8} radius={999} style={{ marginTop: 12 }} />
    <Skeleton width="68%" height={12} style={{ marginTop: 18 }} />

    <View className="mt-4 gap-3">
      <View className="rounded-xl border border-ui-highlight/20 bg-ui-highlight/5 p-4">
        <Skeleton width="100%" height={124} radius={10} />
        <Skeleton width="72%" height={14} style={{ marginTop: 10 }} />
      </View>
      <View className="rounded-xl border border-ui-shade/20 bg-white p-4">
        <Skeleton width="100%" height={124} radius={10} />
        <Skeleton width="72%" height={14} style={{ marginTop: 10 }} />
      </View>
    </View>

    <View className="items-end mt-4">
      <Skeleton width={88} height={40} radius={14} />
    </View>
  </View>
);

export default ThisOrThatScreen;
