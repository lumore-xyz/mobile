import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from "@/src/components/ui/actionsheet";
import Button from "@/src/components/ui/Button";
import { TextAreaInput } from "@/src/components/ui/TextInput";
import VisibilityToggle from "@/src/components/VisibilityToggle";
import {
  createPromptPost,
  fetchPromptCategories,
  fetchPromptsByCategories,
} from "@/src/libs/apis";
import type { Prompt, PromptCategory } from "@/src/domain/posts/types";
import { COLORS } from "@/src/libs/constants/theme";
import Icon from "@/src/libs/Icon";
import { queryClient } from "@/src/service/query-client";
import { getUser } from "@/src/service/storage";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import SubPageBack from "../../components/headers/SubPageBack";
import Skeleton from "@/src/components/ui/Skeleton";
import { triggerSelectionHaptic } from "@/src/utils/haptics";

const FALLBACK_CATEGORIES: PromptCategory[] = [
  { _id: "deep" },
  { _id: "dislikes" },
  { _id: "flirty" },
  { _id: "fun" },
  { _id: "pov" },
  { _id: "quirky" },
  { _id: "thoughtful" },
  { _id: "values" },
];

const CreatePromptPost = () => {
  const [active, setActive] = useState("fun");
  const { data: categoriesData = [] } = useQuery<PromptCategory[]>({
    queryKey: ["prompt categories"],
    queryFn: () => fetchPromptCategories(),
  });

  const categories = categoriesData.length
    ? categoriesData
    : FALLBACK_CATEGORIES;
  const activeCategory = categories.some((category) => category._id === active)
    ? active
    : categories[0]?._id ?? "fun";

  return (
    <View className="flex-1 bg-ui-surface-page">
      <SubPageBack title="Prompt post" />
      <View className="min-h-0 flex-1 px-4 pb-4">
        <View className="mb-4 overflow-hidden rounded-[24px] bg-ui-midnight p-5">
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1">
              <Text className="text-2xl font-bold text-ui-paper">
                Pick your angle
              </Text>
              <Text className="mt-1 text-sm leading-5 text-ui-paper/70">
                Choose a prompt, answer with texture, and let people start from
                something real.
              </Text>
            </View>
            <View className="h-11 w-11 items-center justify-center rounded-full bg-ui-champagne">
              <Icon name="MessageCircleMore" size={20} color={COLORS.ink} />
            </View>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="max-h-14 flex-grow-0"
          contentContainerClassName="items-start pb-2"
        >
          <View className="flex-row items-center gap-2">
            {categories.map((cat) => {
              const selected = activeCategory === cat._id;
              return (
                <Pressable
                  key={cat._id}
                  accessibilityRole="tab"
                  accessibilityLabel={`${cat.name || cat._id} prompts`}
                  accessibilityState={{ selected }}
                  onPress={() => {
                    triggerSelectionHaptic();
                    setActive(cat._id);
                  }}
                  className={`min-h-11 self-start rounded-full border px-4 ${
                    selected
                      ? "border-ui-forest bg-ui-forest"
                      : "border-ui-parchment bg-ui-paper"
                  }`}
                >
                  <Text
                    className={`py-2 capitalize ${
                      selected ? "text-ui-paper" : "text-ui-slate"
                    }`}
                  >
                    {cat.name || cat._id}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        <View className="flex-1 pt-1">
          <PromptList category={activeCategory} />
        </View>
      </View>
    </View>
  );
};

export default CreatePromptPost;

const PromptList = ({ category }: { category: string }) => {
  const {
    data: promptsData = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<Prompt[]>({
    queryKey: ["prompt list", category],
    queryFn: () => fetchPromptsByCategories([category]),
  });

  const [isOpen, setIsOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [value, setValue] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [errorText, setErrorText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const trimmedValue = value.trim();

  const openEditor = (prompt: Prompt) => {
    triggerSelectionHaptic();
    setSelectedPrompt(prompt);
    setValue("");
    setVisibility("public");
    setErrorText("");
    setIsOpen(true);
  };

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
      const currentUser = getUser();
      if (currentUser?._id) {
        await queryClient.invalidateQueries({
          queryKey: ["user posts", currentUser._id],
        });
      }
      setIsOpen(false);
      setSelectedPrompt(null);
      router.push("/profile");
    } catch {
      setErrorText("Unable to create prompt post right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <ScrollView className="flex-1">
        <View className="pb-8">
          {isLoading ? (
            <View className="gap-5 py-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <View key={`prompt-skeleton-${index}`} className="flex-row gap-3">
                  <Skeleton width={40} height={40} radius={999} />
                  <View className="flex-1 pt-1">
                    <Skeleton width={index % 2 ? "82%" : "94%"} height={15} />
                    <Skeleton width="34%" height={11} style={{ marginTop: 10 }} />
                  </View>
                </View>
              ))}
            </View>
          ) : null}

          {isError ? (
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
          ) : null}

          {!isLoading && !isError && !promptsData.length ? (
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
          ) : null}

          {!isLoading && !isError ? promptsData.map((prompt) => (
            <Pressable
              key={prompt._id}
              accessibilityRole="button"
              accessibilityLabel="Answer this prompt"
              onPress={() => openEditor(prompt)}
              className="min-h-[88px] flex-row items-center gap-4 border-b border-ui-parchment py-4 active:opacity-70"
            >
              <View className="h-11 w-11 items-center justify-center rounded-full bg-ui-forest/10">
                <Icon name="Quote" size={18} color={COLORS.forest} />
              </View>
              <View className="flex-1">
                <Text className="text-[17px] font-semibold leading-6 text-ui-ink">
                  {prompt.text}
                </Text>
                <Text className="mt-1 text-xs font-semibold text-ui-forest">
                  Answer this prompt
                </Text>
              </View>
              <Icon name="ChevronRight" size={18} color={COLORS.slate} />
            </Pressable>
          )) : null}
        </View>
      </ScrollView>

      <Actionsheet isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <ActionsheetBackdrop />
        <ActionsheetContent className="p-0 pb-6">
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>
          <View className="w-full px-4 pt-4">
            <Text className="mb-1 text-xl font-bold text-ui-ink">
              Answer prompt
            </Text>
            <Text className="mb-4 text-sm leading-5 text-ui-slate">
              {selectedPrompt?.text}
            </Text>

            <TextAreaInput
              label="Your answer"
              value={value}
              action={setValue}
              placeholder="Write your answer..."
            />
            <Text className="mt-2 text-xs text-ui-slate">
              {trimmedValue.length
                ? `${trimmedValue.length} characters`
                : "Keep it honest, specific, and easy to reply to."}
            </Text>

            <View className="mt-4 rounded-[24px] border border-ui-parchment bg-ui-ink/5 p-4">
              <Text className="mb-3 text-sm font-bold text-ui-ink">
                Visibility
              </Text>
              <VisibilityToggle
                field="promptPost"
                currentVisibility={visibility}
                onVisibilityChange={(_, vis) => setVisibility(vis)}
                className="w-full"
              />
            </View>

            {errorText ? (
              <View className="mt-3 rounded-2xl bg-ui-danger/5 px-4 py-3">
                <Text className="text-sm font-medium text-ui-danger">
                  {errorText}
                </Text>
              </View>
            ) : null}

            <Button
              text={isSubmitting ? "Posting..." : "Post prompt"}
              disabled={isSubmitting || !trimmedValue}
              onClick={handleSubmit}
              className="mt-4 rounded-full"
            />
          </View>
        </ActionsheetContent>
      </Actionsheet>
    </>
  );
};
