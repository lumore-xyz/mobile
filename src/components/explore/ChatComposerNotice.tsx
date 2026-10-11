import { triggerSelectionHaptic } from "@/src/utils/haptics";
import { Pressable, Text, View } from "react-native";

interface ChatComposerNoticeProps {
  message: string;
  cancelLabel: string;
  accessibilityLabel: string;
  onCancel: () => void;
}

const ChatComposerNotice = ({
  message,
  cancelLabel,
  accessibilityLabel,
  onCancel,
}: ChatComposerNoticeProps) => (
  <View className="mb-2 flex-row items-center justify-between rounded-2xl bg-ui-forest/5 px-3 py-2">
    <Text className="flex-1 text-xs leading-4 text-ui-ink" numberOfLines={2}>
      {message}
    </Text>
    <Pressable
      onPress={() => {
        triggerSelectionHaptic();
        onCancel();
      }}
      className="min-h-11 justify-center rounded-full px-2 active:opacity-70"
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <Text className="text-xs font-medium text-ui-slate">{cancelLabel}</Text>
    </Pressable>
  </View>
);

export default ChatComposerNotice;
