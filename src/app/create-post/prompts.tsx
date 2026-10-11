import SurfacePanel from "@/src/components/ui/SurfacePanel";
import PromptPostList from "@/src/components/posts/PromptPostList";
import SubPageBack from "@/src/components/headers/SubPageBack";
import { fetchPromptCategories } from "@/src/features/posts/api";
import type { PromptCategory } from "@/src/domain/posts/types";
import { COLORS } from "@/src/libs/constants/theme";
import Icon from "@/src/libs/Icon";
import { triggerSelectionHaptic } from "@/src/utils/haptics";
import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

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
    queryFn: fetchPromptCategories,
  });
  const categories = categoriesData.length
    ? categoriesData
    : FALLBACK_CATEGORIES;
  const activeCategory = categories.some((category) => category._id === active)
    ? active
    : (categories[0]?._id ?? "fun");

  return (
    <View className="flex-1 bg-ui-surface-page">
      <SubPageBack title="Prompt post" />
      <View className="min-h-0 flex-1 px-4 pb-4">
        <SurfacePanel surface="midnight" className="mb-4 overflow-hidden">
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
        </SurfacePanel>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="max-h-14 flex-grow-0"
          contentContainerClassName="items-start pb-2"
        >
          <View className="flex-row items-center gap-2">
            {categories.map((category) => {
              const selected = activeCategory === category._id;
              return (
                <Pressable
                  key={category._id}
                  accessibilityRole="tab"
                  accessibilityLabel={`${category.name || category._id} prompts`}
                  accessibilityState={{ selected }}
                  onPress={() => {
                    triggerSelectionHaptic();
                    setActive(category._id);
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
                    {category.name || category._id}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        <View className="flex-1 pt-1">
          <PromptPostList category={activeCategory} />
        </View>
      </View>
    </View>
  );
};

export default CreatePromptPost;
