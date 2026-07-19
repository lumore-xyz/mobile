import VisibilityToggle from "@/src/components/VisibilityToggle";
import Icon from "@/src/libs/Icon";
import { triggerSelectionHaptic } from "@/src/utils/haptics";
import React from "react";
import { Pressable, Text, View } from "react-native";

interface ProfileFieldProps {
  label: string;
  field: string;
  value?: string | React.ReactNode;
  onEdit: (field: string) => void;
  visibility?: string;
  onVisibilityChange?: (field: string, visibility: string) => void;
  children?: React.ReactNode;
}

const ProfileField: React.FC<ProfileFieldProps> = ({
  label,
  field,
  value,
  onEdit,
  visibility,
  onVisibilityChange,
  children,
}) => {
  const renderValue = () => {
    if (children) return children;
    if (React.isValidElement(value)) return value;
    if (value === undefined || value === null || value === "") {
      return <Text className="text-base text-ui-muted">Not set yet</Text>;
    }
    return <Text className="text-base leading-6 text-ui-shade">{String(value)}</Text>;
  };

  return (
    <Pressable
      onPress={() => {
        triggerSelectionHaptic();
        onEdit(field);
      }}
      className="mt-3 min-h-14 rounded-[22px] bg-ui-light p-4 active:opacity-80"
      android_ripple={{ color: "rgba(84,19,136,0.06)", borderless: false }}
      accessibilityRole="button"
      accessibilityLabel={`Edit ${label}`}
    >
      <View className="flex-row items-center justify-between gap-3">
        <View className="flex-1 pr-1">
          <Text className="text-sm font-semibold text-ui-muted">{label}</Text>
          {renderValue()}
        </View>
        <View className="flex-row items-center gap-2">
          {visibility !== undefined && onVisibilityChange && (
            <VisibilityToggle
              field={field}
              currentVisibility={visibility}
              onVisibilityChange={onVisibilityChange}
              className="w-32"
            />
          )}
          <View className="h-9 w-9 items-center justify-center rounded-full bg-ui-surface-page">
            <Icon name="ChevronRight" size={17} />
          </View>
        </View>
      </View>
    </Pressable>
  );
};

export default ProfileField;
