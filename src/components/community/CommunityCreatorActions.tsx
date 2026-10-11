import { COLORS } from "@/src/libs/constants/theme";
import Icon from "@/src/libs/Icon";
import { Pressable, Text, View } from "react-native";

interface CommunityCreatorActionsProps {
  isStartingMatch: boolean;
  onStartEditing: () => void;
  onStartMatch: () => void;
}

export default function CommunityCreatorActions({
  isStartingMatch,
  onStartEditing,
  onStartMatch,
}: CommunityCreatorActionsProps) {
  return (
    <View className="gap-3">
      <Pressable
        onPress={onStartEditing}
        className="rounded-[24px] border border-ui-parchment bg-ui-paper p-4 active:opacity-85"
        accessibilityRole="button"
        accessibilityLabel="Edit community details"
      >
        <View className="flex-row items-center gap-3">
          <View className="h-12 w-12 items-center justify-center rounded-full bg-ui-forest/10">
            <Icon name="Pencil" size={20} color={COLORS.forest} />
          </View>
          <View className="flex-1">
            <Text className="text-base font-bold text-ui-ink">
              Edit community details
            </Text>
            <Text className="mt-1 text-sm leading-5 text-ui-slate">
              Update the community name, description, and cover image.
            </Text>
          </View>
          <View className="h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-ui-ink/5">
            <Icon name="ChevronRight" size={18} color={COLORS.ink} />
          </View>
        </View>
      </Pressable>

      <Pressable
        onPress={onStartMatch}
        disabled={isStartingMatch}
        accessibilityRole="button"
        accessibilityLabel="Start community match now"
        accessibilityState={{ disabled: isStartingMatch }}
        className={`rounded-[24px] border border-ui-forest/20 bg-ui-forest/10 p-4 active:opacity-85 ${isStartingMatch ? "opacity-70" : ""}`}
      >
        <View className="flex-row items-center gap-3">
          <View className="h-12 w-12 items-center justify-center rounded-full bg-ui-champagne">
            <Icon name="Zap" size={20} color={COLORS.forest} />
          </View>
          <View className="flex-1">
            <Text className="text-base font-bold text-ui-ink">
              {isStartingMatch ? "Starting cycle..." : "Start match now"}
            </Text>
            <Text className="mt-1 text-sm leading-5 text-ui-slate">
              Run this community&apos;s next cycle before the countdown ends.
            </Text>
          </View>
          <View className="h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-ui-forest">
            <Icon name="Zap" size={16} color={COLORS.paper} />
          </View>
        </View>
      </Pressable>

      <View className="mt-1 rounded-[24px] bg-ui-ink/5 p-4">
        <Text className="text-xs font-semibold uppercase tracking-wide text-ui-slate">
          What creators can do
        </Text>
        <View className="mt-2 gap-2">
          <View className="flex-row items-center gap-2">
            <Icon name="BadgeCheck" size={14} color={COLORS.forest} />
            <Text className="text-sm text-ui-ink">
              Edit name, description, and cover image
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            <Icon name="Sparkles" size={14} color={COLORS.forest} />
            <Text className="text-sm text-ui-ink">
              Run the next match cycle on demand
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
