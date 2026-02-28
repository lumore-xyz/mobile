import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from "@/src/components/ui/actionsheet";
import { TextAreaInput } from "@/src/components/ui/TextInput";
import VisibilityToggle from "@/src/components/VisibilityToggle";
import {
  createPromptPost,
  fetchPromptCategories,
  fetchPromptsByCategories,
} from "@/src/libs/apis";
import { queryClient } from "@/src/service/query-client";
import { getUser } from "@/src/service/storage";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

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
    <View className="flex-1 bg-ui-light">
      <View className="p-4 pb-2">
        <Text className="text-2xl font-semibold">Prompt post</Text>
        <Text className="text-xs text-ui-shade mt-1">
          Pick a prompt and add your answer.
        </Text>
      </View>
      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-4"
          contentContainerClassName="items-start"
        >
          <View className="flex-row gap-2 py-2 pr-8 items-center">
            {categories.map((cat) => (
              <Pressable
                key={cat._id}
                onPress={() => setActive(cat._id)}
                className={`self-start px-4 py-2 rounded-full border ${
                  active === cat._id
                    ? "bg-ui-highlight border-ui-highlight"
                    : "bg-white border-ui-shade/20"
                }`}
              >
                <Text
                  className={` capitalize ${
                    active === cat._id ? "text-white" : "text-ui-shade"
                  }`}
                >
                  {cat._id}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>

      <PromptList category={active} />
    </View>
  );
};

export default CreatePromptPost;

const PromptList = ({ category }: { category: string }) => {
  const { data: promptsData = [] } = useQuery<any[]>({
    queryKey: ["prompt list", category],
    queryFn: () => fetchPromptsByCategories([category]),
  });

  const [isOpen, setIsOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<any>(null);
  const [value, setValue] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [errorText, setErrorText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openEditor = (prompt: any) => {
    setSelectedPrompt(prompt);
    setValue("");
    setVisibility("public");
    setErrorText("");
    setIsOpen(true);
  };

  const handleSubmit = async () => {
    if (!selectedPrompt?._id) return;
    if (!value.trim()) {
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
          promptAnswer: value.trim(),
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
      <ScrollView className="flex-1 px-4">
        <View className="pb-8">
          {promptsData.map((prompt) => (
            <Pressable
              key={prompt._id}
              onPress={() => openEditor(prompt)}
              className="bg-white border border-ui-highlight/30 p-4 rounded-2xl mb-3"
            >
              <Text className="text-base text-ui-shade">{prompt.text}</Text>
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
          <View className="px-4 pt-4 w-full">
            <Text className="text-base font-semibold mb-2">Answer prompt</Text>
            <Text className="text-sm text-ui-shade mb-3">
              {selectedPrompt?.text}
            </Text>

            <TextAreaInput
              label="Your answer"
              value={value}
              action={setValue}
              placeholder="Write your answer..."
            />

            <View className="mt-4 border border-ui-shade/10 rounded-xl p-3">
              <Text className="text-xs text-ui-shade mb-2">Visibility</Text>
              <VisibilityToggle
                field="promptPost"
                currentVisibility={visibility}
                onVisibilityChange={(_, vis) => setVisibility(vis)}
              />
            </View>

            {errorText ? (
              <Text className="text-red-500 text-sm mt-2">{errorText}</Text>
            ) : null}

            <Pressable
              onPress={handleSubmit}
              disabled={isSubmitting}
              className={`mt-4 py-3 rounded-xl bg-ui-highlight ${
                isSubmitting ? "opacity-70" : ""
              }`}
            >
              <Text className="text-center text-white font-semibold">
                {isSubmitting ? "Posting..." : "Post prompt"}
              </Text>
            </Pressable>
          </View>
        </ActionsheetContent>
      </Actionsheet>
    </>
  );
};
