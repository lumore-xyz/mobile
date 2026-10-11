import Button from "@/src/components/ui/Button";
import Icon from "@/src/libs/Icon";
import { COLORS } from "@/src/libs/constants/theme";
import { toUserFacingError } from "@/src/utils/userFacingError";
import React from "react";
import { Text, View } from "react-native";

interface ExploreErrorNoticeProps {
  error: unknown;
  actionLabel: string;
  disabled: boolean;
  onAction: () => void;
}

export default function ExploreErrorNotice({
  error,
  actionLabel,
  disabled,
  onAction,
}: ExploreErrorNoticeProps) {
  return (
    <View
      className="gap-3 rounded-[22px] border border-ui-danger/20 bg-ui-paper/95 p-4"
      accessibilityLiveRegion="polite"
    >
      <View className="flex-row items-start gap-3">
        <Icon name="CircleAlert" size={18} color={COLORS.danger} />
        <Text className="flex-1 text-sm font-semibold leading-5 text-ui-danger">
          {toUserFacingError(
            error,
            "We could not load your suggestions. Please try again.",
          )}
        </Text>
      </View>
      <Button
        text={actionLabel}
        variant="secondary"
        onClick={onAction}
        disabled={disabled}
      />
    </View>
  );
}
