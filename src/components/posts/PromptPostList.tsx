import PromptPostEditorSheet from "@/src/components/posts/PromptPostEditorSheet";
import PromptRow from "@/src/components/posts/PromptRow";
import Skeleton from "@/src/components/ui/Skeleton";
import type { Prompt } from "@/src/domain/posts/types";
import { createPromptPost, fetchPromptsByCategories } from "@/src/features/posts/api";
import invalidateCurrentUserPosts from "@/src/features/posts/invalidateCurrentUserPosts";
import { COLORS } from "@/src/libs/constants/theme";
import Icon from "@/src/libs/Icon";
import { triggerSelectionHaptic } from "@/src/utils/haptics";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  FlatList,
  type ListRenderItem,
  Pressable,
  Text,
  View,
} from "react-native";

const PromptPostList = ({ category }: { category: string }) => {
  const {
    data: prompts = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<Prompt[]>({
    queryKey: ["prompt list", category],
    queryFn: () => fetchPromptsByCategories([category]),
  });
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [value, setValue] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [errorText, setErrorText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const trimmedValue = value.trim();

  const openEditor = useCallback((prompt: Prompt) => {
    triggerSelectionHaptic();
    setSelectedPrompt(prompt);
    setValue("");
    setVisibility("public");
    setErrorText("");
    setIsEditorOpen(true);
  }, []);

  const handleSubmit = async () => {
    if (!selectedPrompt?._id) return;
    if (!trimmedValue) {
      setErrorText("Please answer the prompt before posting.");
      return;
    }
    setIsSubmitting(true);
    setErrorText("");
    try {
      await createPromptPost({
        type: "PROMPT",
        content: {
          promptId: selectedPrompt._id,
          promptAnswer: trimmedValue,
        },
        visibility,
      });
      await invalidateCurrentUserPosts();
      setIsEditorOpen(false);
      setSelectedPrompt(null);
      router.push("/profile");
    } catch {
      setErrorText("Unable to create prompt post right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderPrompt = useCallback<ListRenderItem<Prompt>>(
    ({ item }) => <PromptRow prompt={item} onPress={openEditor} />,
    [openEditor],
  );

  const emptyState = isLoading ? (
    <View className="gap-5 py-3">
      {Array.from({ length: 4 }, (_, index) => (
        <View key={`prompt-skeleton-${index}`} className="flex-row gap-3">
          <Skeleton width={40} height={40} radius={999} />
          <View className="flex-1 pt-1">
            <Skeleton width={index % 2 ? "82%" : "94%"} height={15} />
            <Skeleton width="34%" height={11} style={{ marginTop: 10 }} />
          </View>
        </View>
      ))}
    </View>
  ) : isError ? (
    <View className="items-center rounded-[24px] bg-ui-paper px-6 py-8">
      <View className="h-14 w-14 items-center justify-center rounded-full bg-ui-danger/10">
        <Icon name="CloudOff" size={23} color={COLORS.danger} />
      </View>
      <Text className="mt-4 text-center text-xl font-bold text-ui-ink">
        Prompts didn’t load
      </Text>
      <Text className="mt-2 text-center text-sm leading-5 text-ui-slate">
        Check your connection and try this category again.
      </Text>
      <Pressable
        onPress={() => {
          triggerSelectionHaptic();
          void refetch();
        }}
        className="mt-5 min-h-11 justify-center rounded-2xl bg-ui-forest px-5 active:opacity-80"
        accessibilityRole="button"
        accessibilityLabel="Retry loading prompts"
      >
        <Text className="font-semibold text-ui-paper">Try again</Text>
      </Pressable>
    </View>
  ) : (
    <View className="items-center rounded-[24px] border border-ui-parchment bg-ui-paper px-6 py-8">
      <View className="h-14 w-14 items-center justify-center rounded-full bg-ui-forest/10">
        <Icon name="MessageCircleMore" size={24} color={COLORS.forest} />
      </View>
      <Text className="mt-4 text-center text-xl font-bold text-ui-ink">
        No prompts here yet
      </Text>
      <Text className="mt-2 text-center text-sm leading-5 text-ui-slate">
        Try another category while this one catches up.
      </Text>
    </View>
  );

  return (
    <>
      <FlatList
        data={!isLoading && !isError ? prompts : []}
        keyExtractor={(prompt) => prompt._id}
        renderItem={renderPrompt}
        className="flex-1"
        contentContainerClassName="pb-8"
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={7}
        ListEmptyComponent={emptyState}
      />

      <PromptPostEditorSheet
        isOpen={isEditorOpen}
        prompt={selectedPrompt}
        value={value}
        visibility={visibility}
        errorText={errorText}
        isSubmitting={isSubmitting}
        onValueChange={setValue}
        onVisibilityChange={setVisibility}
        onClose={() => setIsEditorOpen(false)}
        onSubmit={handleSubmit}
      />
    </>
  );
};

export default PromptPostList;
