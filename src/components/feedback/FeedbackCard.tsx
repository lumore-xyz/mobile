import { COLORS } from "@/src/libs/constants/theme";
import Icon from "@/src/libs/Icon";
import type { FeedbackItem } from "@/src/utils/types";
import React from "react";
import { Text, View } from "react-native";

const FeedbackCard = ({ item }: { item: FeedbackItem }) => {
  const name = item.user?.nickname || item.user?.username || "Anonymous";

  return (
    <View className="mb-3 rounded-[24px] border border-ui-parchment bg-ui-paper p-4">
      <View className="mb-3 flex-row items-start justify-between gap-3">
        <View className="min-w-0 flex-1 flex-row items-center gap-3">
          <View className="h-10 w-10 items-center justify-center rounded-2xl bg-ui-forest/10">
            <Text className="font-bold text-ui-forest">
              {name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text
            className="min-w-0 flex-1 text-base font-bold text-ui-ink"
            numberOfLines={1}
          >
            {name}
          </Text>
        </View>
        <Text className="text-xs font-medium text-ui-slate">
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>

      {typeof item.rating === "number" ? (
        <View className="mb-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-xs font-semibold text-ui-slate">
              Conversation rating
            </Text>
            <View className="flex-row items-center gap-1 rounded-full bg-ui-champagne/20 px-2.5 py-1">
              <Icon name="Star" size={13} color={COLORS.midnight} />
              <Text className="text-xs font-bold text-ui-midnight">
                {item.rating}/10
              </Text>
            </View>
          </View>
          <View className="mt-2 h-1.5 overflow-hidden rounded-full bg-ui-ink/10">
            <View
              className="h-1.5 rounded-full bg-ui-forest"
              style={{ width: `${Math.max(0, Math.min(10, item.rating)) * 10}%` }}
            />
          </View>
        </View>
      ) : null}

      {item.reason ? (
        <Text className="mb-1 text-xs font-semibold text-ui-forest">
          {item.reason}
        </Text>
      ) : null}
      <Text className="text-sm leading-6 text-ui-ink">
        {item.feedback || "No written feedback was provided."}
      </Text>
    </View>
  );
};

export default FeedbackCard;
