import { triggerSelectionHaptic } from "@/src/utils/haptics";
import React from "react";
import { Pressable, Text, View } from "react-native";

export type NotificationFilter = "all" | "unread";

interface NotificationFiltersProps {
  filter: NotificationFilter;
  onChange: (filter: NotificationFilter) => void;
  totalCount: number;
  unreadCount: number;
}

const NotificationFilters = React.memo(function NotificationFilters({
  filter,
  onChange,
  totalCount,
  unreadCount,
}: NotificationFiltersProps) {
  const filters = [
    { key: "all" as const, label: "All", count: totalCount },
    { key: "unread" as const, label: "Unread", count: unreadCount },
  ];

  return (
    <View
      className="mx-4 mt-3 flex-row rounded-full border border-ui-parchment bg-ui-paper p-1.5"
      accessibilityRole="tablist"
    >
      {filters.map((item) => {
        const selected = filter === item.key;
        return (
          <Pressable
            key={item.key}
            onPress={() => {
              if (!selected) {
                triggerSelectionHaptic();
                onChange(item.key);
              }
            }}
            className={`min-h-11 flex-1 flex-row items-center justify-center gap-2 rounded-full px-3 active:opacity-75 ${selected ? "bg-ui-forest" : "bg-transparent"}`}
            accessibilityRole="tab"
            accessibilityLabel={`${item.label}, ${item.count}`}
            accessibilityState={{ selected }}
          >
            <Text className={`text-sm font-semibold ${selected ? "text-ui-paper" : "text-ui-slate"}`}>
              {item.label}
            </Text>
            <View className={`min-w-6 items-center justify-center rounded-full px-1.5 py-0.5 ${selected ? "bg-ui-champagne" : "bg-ui-ink/10"}`}>
              <Text className="text-xs font-bold text-ui-ink">{item.count}</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
});

export default NotificationFilters;
