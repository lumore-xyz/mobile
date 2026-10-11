import type { Prompt } from "@/src/domain/posts/types";
import { COLORS } from "@/src/libs/constants/theme";
import Icon from "@/src/libs/Icon";
import React from "react";
import { Pressable, Text, View } from "react-native";

interface PromptRowProps {
  prompt: Prompt;
  onPress: (prompt: Prompt) => void;
}

const PromptRow = React.memo(function PromptRow({ prompt, onPress }: PromptRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Answer this prompt"
      onPress={() => onPress(prompt)}
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
  );
});

export default PromptRow;
