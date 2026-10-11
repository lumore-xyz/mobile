import Icon from "@/src/libs/Icon";
import React from "react";
import { Pressable, Text, View } from "react-native";

const AccountSettingRow = ({
  label,
  value,
  onEdit,
}: {
  label: string;
  value?: string;
  onEdit: () => void;
}) => (
  <View className="border-b border-ui-parchment">
    <Pressable
      onPress={onEdit}
      className="min-h-[68px] flex-row items-center justify-between gap-4 py-3 active:opacity-70"
      accessibilityRole="button"
      accessibilityLabel={`Edit ${label}`}
    >
      <View className="flex-1">
        <Text className="text-[13px] font-medium text-ui-slate">{label}</Text>
        <Text
          className={`mt-1 text-base leading-6 ${value ? "text-ui-ink" : "text-ui-forest"}`}
          numberOfLines={1}
        >
          {value || `Add ${label.toLowerCase()}`}
        </Text>
      </View>
      <View className="h-9 w-9 items-center justify-center rounded-full bg-ui-forest/5">
        <Icon name="ChevronRight" size={17} />
      </View>
    </Pressable>
  </View>
);

export default AccountSettingRow;
