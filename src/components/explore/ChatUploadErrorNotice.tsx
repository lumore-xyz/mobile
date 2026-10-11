import { COLORS } from "@/src/libs/constants/theme";
import Icon from "@/src/libs/Icon";
import { triggerSelectionHaptic } from "@/src/utils/haptics";
import { Pressable, Text, View } from "react-native";

interface ChatUploadErrorNoticeProps {
  message: string;
  onDismiss: () => void;
}

const ChatUploadErrorNotice = ({
  message,
  onDismiss,
}: ChatUploadErrorNoticeProps) => (
  <View
    className="mt-2 flex-row items-center gap-3 rounded-2xl bg-ui-danger/5 px-3 py-2"
    accessibilityLiveRegion="assertive"
  >
    <Icon name="CircleAlert" size={18} color={COLORS.danger} />
    <Text className="flex-1 text-xs leading-4 text-ui-danger">{message}</Text>
    <Pressable
      onPress={() => {
        triggerSelectionHaptic();
        onDismiss();
      }}
      className="min-h-11 justify-center rounded-full px-2 active:opacity-70"
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel="Dismiss message error"
    >
      <Text className="text-xs font-medium text-ui-ink/70">Dismiss</Text>
    </Pressable>
  </View>
);

export default ChatUploadErrorNotice;
