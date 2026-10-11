import React from "react";
import { Text, View } from "react-native";
import Icon from "@/src/libs/Icon";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  icon?: string;
}

const SectionHeading = ({
  title,
  subtitle,
  icon,
}: SectionHeadingProps) => (
  <View
    className={`flex-1 ${icon ? "flex-row items-start gap-3" : "pr-3"}`}
  >
    {icon ? (
      <View className="h-10 w-10 items-center justify-center rounded-full bg-ui-forest/10">
        <Icon name={icon} size={18} />
      </View>
    ) : null}
    <View className="flex-1">
      <Text
        className="text-xl font-bold leading-6 text-ui-ink"
        accessibilityRole="header"
      >
        {title}
      </Text>
      {subtitle ? (
        <Text className="mt-1 text-sm leading-5 text-ui-slate">
          {subtitle}
        </Text>
      ) : null}
    </View>
  </View>
);

export default SectionHeading;
