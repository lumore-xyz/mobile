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
import { COLORS } from "@/src/libs/constants/theme";
import Icon from "@/src/libs/Icon";
import { queryClient } from "@/src/service/query-client";
import { getUser } from "@/src/service/storage";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import SubPageBack from "../../components/headers/SubPageBack";

const FALLBACK_CATEGORIES = [
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
  const { data: categoriesData = [] } = useQuery<any[]>({
    queryKey: ["prompt categories"],
    queryFn: () => fetchPromptCategories(),
  });

  const categories = categoriesData.length
    ? categoriesData
    : FALLBACK_CATEGORIES;

  return (
    <View className="h-full bg-ui-surface-page">
      <SubPageBack title="Prompt post" />
      <View className="h-full flex-1 p-4">
        <View className="mb-4 overflow-hidden rounded-[28px] bg-ui-foreground p-5">
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1">
              <Text className="text-2xl font-bold text-ui-light">
                Pick your angle
              </Text>
              <Text className="mt-1 text-sm leading-5 text-ui-light/70">
                Choose a prompt, answer with texture, and let people start from
                something real.
              </Text>
            </View>
            <View className="h-11 w-11 items-center justify-center rounded-full bg-ui-primary">
              <Icon name="MessageCircleMore" size={20} color={COLORS.shade} />
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
              const selected = active === cat._id;
              return (
                <Pressable
                  key={cat._id}
                  accessibilityRole="tab"
                  accessibilityLabel={`${cat._id} prompts`}
                  accessibilityState={{ selected }}
                  onPress={() => setActive(cat._id)}
                  className={`min-h-11 self-start rounded-full border px-4 ${
                    selected
                      ? "border-ui-highlight bg-ui-highlight"
                      : "border-ui-border bg-ui-light"
                  }`}
                >
                  <Text
                    className={`py-2 capitalize ${
                      selected ? "text-ui-light" : "text-ui-muted"
                    }`}
                  >
                    {cat._id}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        <View className="flex-1 pt-1">
          <PromptList category={active} />
        </View>
      </View>
    </View>
  );
};

export default CreatePromptPost;

const PromptList = ({ category }: { category: string }) => {
  const { data: promptsData = [], isLoading } = useQuery<any[]>({
    queryKey: ["prompt list", category],
    queryFn: () => fetchPromptsByCategories([category]),
  });

  const [isOpen, setIsOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<any>(null);
  const [value, setValue] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [errorText, setErrorText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const trimmedValue = value.trim();

  const openEditor = (prompt: any) => {
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
            <View className="rounded-[28px] border border-ui-border bg-ui-light p-5">
              <Text className="text-sm font-semibold text-ui-muted">
                Loading prompts...
              </Text>
            </View>
          ) : null}

          {!isLoading && !promptsData.length ? (
            <View className="items-center rounded-[28px] border border-ui-border bg-ui-light px-6 py-8">
              <View className="h-14 w-14 items-center justify-center rounded-full bg-ui-highlight/10">
                <Icon name="MessageCircleMore" size={24} color={COLORS.highlight} />
              </View>
              <Text className="mt-4 text-center text-xl font-bold text-ui-shade">
                No prompts here yet
              </Text>
              <Text className="mt-2 text-center text-sm leading-5 text-ui-muted">
                Try another category while this one catches up.
              </Text>
            </View>
          ) : null}

          {promptsData.map((prompt) => (
            <Pressable
              key={prompt._id}
              accessibilityRole="button"
              accessibilityLabel="Answer this prompt"
              onPress={() => openEditor(prompt)}
              className="mb-3 rounded-[24px] border border-ui-border bg-ui-light p-4 active:opacity-90"
            >
              <View className="flex-row items-start gap-3">
                <View className="h-10 w-10 items-center justify-center rounded-full bg-ui-highlight/10">
                  <Icon name="Quote" size={18} color={COLORS.highlight} />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold leading-6 text-ui-shade">
                    {prompt.text}
                  </Text>
                  <Text className="mt-2 text-xs font-semibold text-ui-highlight">
                    Tap to answer
                  </Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <Actionsheet isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <ActionsheetBackdrop />
        <ActionsheetContent className="p-0 pb-6">
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>
          <View className="w-full px-4 pt-4">
            <Text className="mb-1 text-xl font-bold text-ui-shade">
              Answer prompt
            </Text>
            <Text className="mb-4 text-sm leading-5 text-ui-muted">
              {selectedPrompt?.text}
            </Text>

            <TextAreaInput
              label="Your answer"
              value={value}
              action={setValue}
              placeholder="Write your answer..."
            />
            <Text className="mt-2 text-xs text-ui-muted">
              {trimmedValue.length
                ? `${trimmedValue.length} characters`
                : "Keep it honest, specific, and easy to reply to."}
            </Text>

            <View className="mt-4 rounded-[24px] border border-ui-border bg-ui-shade/5 p-4">
              <Text className="mb-3 text-sm font-bold text-ui-shade">
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
              <View className="mt-3 rounded-2xl bg-red-50 px-4 py-3">
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
