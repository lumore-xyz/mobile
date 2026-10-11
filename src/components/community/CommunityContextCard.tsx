import type { LocationRoomSummary } from "@/src/features/community/types";
import formatCommunityTag from "@/src/features/community/formatCommunityTag";
import { COLORS } from "@/src/libs/constants/theme";
import Icon from "@/src/libs/Icon";
import React from "react";
import { Pressable, Text, View } from "react-native";

interface CommunityContextCardProps {
  room: LocationRoomSummary;
  roomAddress: string;
  onCopyAddress: () => void;
  onOpenMap: () => void;
}

const CommunityContextCard = ({
  room,
  roomAddress,
  onCopyAddress,
  onOpenMap,
}: CommunityContextCardProps) => {
  if (room.type === "topic") {
    return (
      <View className="rounded-[24px] border border-ui-parchment bg-ui-paper p-4">
        <View className="flex-row items-center gap-3">
          <View className="h-10 w-10 items-center justify-center rounded-full bg-ui-forest/10">
            <Icon name="Sparkles" size={18} color={COLORS.forest} />
          </View>
          <View className="flex-1">
            <Text className="font-bold text-ui-ink">Shared interests</Text>
            <Text className="mt-0.5 text-sm leading-5 text-ui-slate">
              Explore the interests this community is built around.
            </Text>
          </View>
        </View>
        {room.tags?.length ? (
          <View className="mt-4 flex-row flex-wrap gap-2">
            {room.tags.map((tag) => (
              <View key={tag} className="rounded-full bg-ui-forest/10 px-3 py-1.5">
                <Text className="text-xs font-semibold text-ui-forest">
                  {formatCommunityTag(tag)}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <Text className="mt-4 text-sm text-ui-slate">
            This community is centered on a shared interest.
          </Text>
        )}
      </View>
    );
  }

  if (!room.location) {
    return (
      <View className="rounded-[24px] border border-ui-parchment bg-ui-paper p-4">
        <View className="flex-row items-center gap-3">
          <View className="h-10 w-10 items-center justify-center rounded-full bg-ui-forest/10">
            <Icon name="MapPinOff" size={18} color={COLORS.forest} />
          </View>
          <View className="flex-1">
            <Text className="font-bold text-ui-ink">Place details unavailable</Text>
            <Text className="mt-0.5 text-sm leading-5 text-ui-slate">
              Ask the creator for this local community’s location.
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="rounded-[24px] bg-ui-ink/5 p-3">
      <View className="flex-row items-start gap-3">
        <View className="h-10 w-10 items-center justify-center rounded-full bg-ui-forest/10">
          <Icon name="MapPin" size={18} color={COLORS.forest} />
        </View>
        <View className="flex-1">
          <Text className="font-bold text-ui-ink">Community location</Text>
          <Text className="mt-1 text-sm leading-5 text-ui-slate" numberOfLines={2}>
            {roomAddress || "Location details are not available yet."}
          </Text>
        </View>
      </View>
      <View className="mt-4 flex-row gap-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Copy community address"
          onPress={onCopyAddress}
          className="min-h-11 flex-1 flex-row items-center justify-center gap-2 rounded-full bg-ui-paper px-3 active:opacity-75"
        >
          <Icon name="Copy" size={16} color={COLORS.ink} />
          <Text className="font-semibold text-ui-ink">Copy</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open community in map"
          onPress={onOpenMap}
          className="min-h-11 flex-1 flex-row items-center justify-center gap-2 rounded-2xl bg-ui-forest px-3 active:opacity-75"
        >
          <Icon name="Map" size={16} color={COLORS.paper} />
          <Text className="font-semibold text-ui-paper">Open map</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default CommunityContextCard;
