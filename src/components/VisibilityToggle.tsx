import React from "react";
import { View } from "react-native";
import { visibilityOptions } from "../libs/options";
import SelectInputUI from "./ui/SelectInput";

interface VisibilityToggleProps {
  field: string;
  currentVisibility: string;
  onVisibilityChange: (field: string, visibility: string) => void;
}

const VisibilityToggle = ({
  field,
  currentVisibility,
  onVisibilityChange,
}: VisibilityToggleProps) => {
  return (
    <View className="w-[130px]">
      <SelectInputUI
        // label={field}
        options={visibilityOptions}
        action={(value) => onVisibilityChange(field, value)}
        value={currentVisibility}
      />
    </View>
  );
};

export default VisibilityToggle;
