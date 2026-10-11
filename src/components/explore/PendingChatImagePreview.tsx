import type { PendingChatImage } from "@/src/domain/chat/types";
import { COLORS } from "@/src/libs/constants/theme";
import { triggerSelectionHaptic } from "@/src/utils/haptics";
import { Image } from "expo-image";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

interface PendingChatImagePreviewProps {
  image: PendingChatImage;
  onRemove: () => void;
}

const PendingChatImagePreview = ({
  image,
  onRemove,
}: PendingChatImagePreviewProps) => (
  <View className="mt-2 rounded-[24px] border border-ui-parchment bg-ui-surface-page p-3">
    <View className="mb-2 flex-row items-center justify-between">
      <Text className="text-xs text-ui-ink">
        {image.uploading ? "Uploading..." : ""}
      </Text>
      <Pressable
        onPress={() => {
          triggerSelectionHaptic();
          onRemove();
        }}
        className="min-h-11 justify-center rounded-full px-2 active:opacity-70"
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Remove selected image"
      >
        <Text className="text-xs font-medium text-ui-slate">Remove</Text>
      </Pressable>
    </View>
    <View className="relative h-36 w-36">
      <Image
        source={{ uri: image.previewUrl }}
        className="h-36 w-36 rounded-2xl"
        contentFit="cover"
      />
      {image.uploading ? (
        <View className="absolute inset-0 items-center justify-center rounded-2xl bg-ui-ink/40">
          <ActivityIndicator size="small" color={COLORS.paper} />
        </View>
      ) : null}
    </View>
  </View>
);

export default PendingChatImagePreview;
