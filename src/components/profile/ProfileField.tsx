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
      return <Text className="text-ui-shade/50">Not set</Text>;
    }
    return <Text className="text-base">{String(value)}</Text>;
  };

  return (
    <Pressable
      onPress={() => {
        triggerSelectionHaptic();
        onEdit(field);
      }}
      className="mt-3 min-h-12 rounded-xl border border-ui-shade/10 bg-white p-3"
      android_ripple={{ color: "rgba(84,19,136,0.06)", borderless: false }}
      accessibilityRole="button"
    >
      <View className="flex flex-row justify-between items-center">
        <View className="text-lg flex-1 pr-3">
          <Text className="text-base text-ui-shade/60">{label}</Text>
          {renderValue()}
        </View>
        <View className="flex-row items-center gap-2">
          {visibility !== undefined && onVisibilityChange && (
            <VisibilityToggle
              field={field}
              currentVisibility={visibility}
              onVisibilityChange={onVisibilityChange}
            />
          )}
          <Icon type="Ionicons" name="chevron-forward" size={18} />
        </View>
      </View>
    </Pressable>
  );
};

export default ProfileField;
