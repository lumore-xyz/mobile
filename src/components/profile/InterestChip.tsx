import OptionIcon from "@/src/libs/OptionIcon";
import { interestOptions } from "@/src/libs/optionsCatalog";
import { COLORS } from "@/src/libs/constants/theme";
import React from "react";
import { Text, View } from "react-native";

interface InterestChipProps {
  interest: string;
  variant?: "summary" | "explore";
}

const InterestChip: React.FC<InterestChipProps> = ({
  interest,
  variant = "summary",
}) => {
  const option = interestOptions.find((item) => item.value === interest);
  const isExplore = variant === "explore";

  return (
    <View
      className={`flex-row items-center rounded-full bg-ui-forest/5 ${
        isExplore ? "gap-2 px-3.5 py-2.5" : "gap-1.5 px-3 py-2"
      }`}
    >
      <OptionIcon
        icon={option?.icon}
        size={isExplore ? 15 : 14}
        color={COLORS.forest}
      />
      <Text
        className={`capitalize ${
          isExplore
            ? "text-sm font-bold text-ui-forest"
            : "text-sm font-medium text-ui-ink"
        }`}
      >
        {option?.label || interest}
      </Text>
    </View>
  );
};

export default InterestChip;
