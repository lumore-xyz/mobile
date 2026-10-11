import VisibilityToggle from "@/src/components/VisibilityToggle";
import Icon from "@/src/libs/Icon";
import { triggerSelectionHaptic } from "@/src/utils/haptics";
import { COLORS } from "@/src/libs/constants/theme";
import React from "react";
import { Pressable, Text, View } from "react-native";

interface ProfileFieldProps<TField extends string> {
  label: string;
  field: TField;
  value?: string | React.ReactNode;
  onEdit: (field: TField) => void;
  visibility?: string;
  onVisibilityChange?: (field: string, visibility: string) => void;
  children?: React.ReactNode;
  variant?: "card" | "list";
  emptyLabel?: string;
}

const ProfileField = <TField extends string,>({
  label,
  field,
  value,
  onEdit,
  visibility,
  onVisibilityChange,
  children,
  variant = "card",
  emptyLabel = "Not set yet",
}: ProfileFieldProps<TField>) => {
  const isListVariant = variant === "list";
  const renderValue = () => {
    if (children) return children;
    if (React.isValidElement(value)) return value;
    if (value === undefined || value === null || value === "") {
      return (
        <Text
          className={
            isListVariant ? "text-base text-ui-forest" : "text-base text-ui-slate"
          }
        >
          {emptyLabel}
        </Text>
      );
    }
    return (
      <Text
        className={`${isListVariant ? "mt-1 " : ""}text-base leading-6 text-ui-ink`}
        numberOfLines={isListVariant ? 2 : undefined}
      >
        {String(value)}
      </Text>
    );
  };

  return (
    <Pressable
      onPress={() => {
        triggerSelectionHaptic();
        onEdit(field);
      }}
      className={
        isListVariant
          ? "min-h-[68px] flex-row items-center justify-between gap-4 border-b border-ui-parchment py-3 active:opacity-70"
          : "mt-3 min-h-14 rounded-[22px] bg-ui-paper p-4 active:opacity-80"
      }
      android_ripple={
        isListVariant
          ? undefined
          : { color: `${COLORS.forest}10`, borderless: false }
      }
      accessibilityRole="button"
      accessibilityLabel={`Edit ${label}`}
    >
      <View
        className={`${isListVariant ? "w-full " : ""}flex-row items-center justify-between gap-3`}
      >
        <View className={`flex-1 ${isListVariant ? "" : "pr-1"}`}>
          <Text
            className={
              isListVariant
                ? "text-[13px] font-medium text-ui-slate"
                : "text-sm font-semibold text-ui-slate"
            }
          >
            {label}
          </Text>
          {renderValue()}
        </View>
        <View className="flex-row items-center gap-2">
          {!isListVariant && visibility !== undefined && onVisibilityChange && (
            <VisibilityToggle
              field={field}
              currentVisibility={visibility}
              onVisibilityChange={onVisibilityChange}
              className="w-32"
            />
          )}
          <View
            className={`h-9 w-9 items-center justify-center rounded-full ${
              isListVariant ? "bg-ui-forest/5" : "bg-ui-surface-page"
            }`}
          >
            <Icon name="ChevronRight" size={17} />
          </View>
        </View>
      </View>
    </Pressable>
  );
};

export default ProfileField;
