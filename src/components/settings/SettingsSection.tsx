import Icon from "@/src/libs/Icon";
import { COLORS } from "@/src/libs/constants/theme";
import React from "react";
import { Text, View } from "react-native";

const SettingsSection = ({
  title,
  description,
  icon,
  children,
  variant = "plain",
}: {
  title: string;
  description: string;
  icon: string;
  children: React.ReactNode;
  variant?: "plain" | "card";
}) => {
  const isCard = variant === "card";

  return (
    <View
      className={
        isCard
          ? "mt-5 rounded-[24px] border border-ui-parchment bg-ui-surface-page p-4"
          : "mt-8"
      }
    >
      <View
        className={`flex-row items-start gap-3 ${isCard ? "mb-1" : "mb-2"}`}
      >
        <View className="h-10 w-10 items-center justify-center rounded-full bg-ui-forest/10">
          <Icon name={icon} size={18} color={COLORS.forest} />
        </View>
        <View className="flex-1">
          <Text className="text-xl font-bold text-ui-ink">{title}</Text>
          <Text className="mt-1 text-sm leading-5 text-ui-slate">
            {description}
          </Text>
        </View>
      </View>
      {children}
    </View>
  );
};

export default SettingsSection;
