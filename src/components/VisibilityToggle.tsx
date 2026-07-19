import React, { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetItem,
} from "./ui/actionsheet";
import { visibilityOptions } from "../libs/options";
import { COLORS } from "../libs/constants/theme";
import Icon from "../libs/Icon";
import { triggerSelectionHaptic } from "../utils/haptics";

interface VisibilityToggleProps {
  field: string;
  currentVisibility: string;
  onVisibilityChange: (field: string, visibility: string) => void;
  className?: string;
}

const visibilityIconByValue: Record<string, string> = {
  public: "Eye",
  unlocked: "Users",
  private: "Lock",
};

const visibilityPresentationByValue: Record<
  string,
  { label: string; description: string; accentClass: string }
> = {
  public: {
    label: "Public",
    description: "Visible on your profile so more people can discover it.",
    accentClass: "bg-ui-highlight",
  },
  unlocked: {
    label: "Unlocked",
    description: "Shown only to people who have unlocked or connected with you.",
    accentClass: "bg-ui-accent",
  },
  private: {
    label: "Private",
    description: "Only you can see this until you decide to share it.",
    accentClass: "bg-ui-shade",
  },
};

const VisibilityToggle = ({
  field,
  currentVisibility,
  onVisibilityChange,
  className = "w-[150px]",
}: VisibilityToggleProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = useMemo(
    () =>
      visibilityOptions.find((option) => option.value === currentVisibility) ||
      visibilityOptions[0],
    [currentVisibility],
  );
  const selectedIcon = visibilityIconByValue[selectedOption?.value || "public"];
  const selectedPresentation =
    visibilityPresentationByValue[selectedOption?.value || "public"];

  const handleOpen = () => {
    triggerSelectionHaptic();
    setIsOpen(true);
  };

  const handleSelect = (visibility: string) => {
    triggerSelectionHaptic();
    onVisibilityChange(field, visibility);
    setIsOpen(false);
  };

  return (
    <View className={className}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Visibility: ${selectedPresentation?.label || "Public"}`}
        onPress={handleOpen}
        className="min-h-11 flex-row items-center gap-2 rounded-full border border-ui-border bg-ui-light px-3 active:opacity-75"
      >
        <View className="h-8 w-8 items-center justify-center rounded-full bg-ui-highlight/10">
          <Icon name={selectedIcon} size={15} color={COLORS.highlight} />
        </View>
        <Text className="min-w-0 flex-1 text-sm font-bold text-ui-shade" numberOfLines={1}>
          {selectedPresentation?.label || selectedOption?.label || "Public"}
        </Text>
        <Icon name="ChevronDown" size={16} color={COLORS.muted} />
      </Pressable>

      <Actionsheet isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <ActionsheetBackdrop />
        <ActionsheetContent className="rounded-t-[32px] bg-ui-surface-page px-4 pb-6 pt-2">
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>

          <View className="w-full pb-2 pt-2">
            <View className="mb-4 rounded-[28px] bg-ui-foreground p-4">
              <View className="mb-3 h-10 w-10 items-center justify-center rounded-full bg-ui-primary">
                <Icon name="Eye" size={18} color={COLORS.shade} />
              </View>
              <Text className="text-2xl font-bold leading-7 text-ui-light">
                Who can see this?
              </Text>
              <Text className="mt-2 text-sm leading-5 text-ui-light/70">
                Choose how visible this detail should be on your dating profile.
              </Text>
            </View>
            {visibilityOptions.map((option) => {
              const isSelected = option.value === selectedOption?.value;
              const icon = visibilityIconByValue[option.value] || "Eye";
              const presentation =
                visibilityPresentationByValue[option.value] || {
                  label: option.label,
                  description: "Choose who should be able to see this.",
                  accentClass: "bg-ui-highlight",
                };
              return (
                <ActionsheetItem
                  key={option.value}
                  onPress={() => handleSelect(option.value)}
                  className={`mb-3 rounded-[24px] border px-4 py-4 ${
                    isSelected
                      ? "border-ui-highlight bg-ui-light"
                      : "border-ui-border bg-ui-light/70"
                  }`}
                  accessibilityLabel={`Set visibility to ${presentation.label}. ${presentation.description}`}
                  accessibilityState={{ selected: isSelected }}
                >
                  <View className="flex-1 flex-row items-center gap-3">
                    <View
                      className={`h-11 w-11 items-center justify-center rounded-full ${
                        isSelected
                          ? presentation.accentClass
                          : "bg-ui-surface-page"
                      }`}
                    >
                      <Icon
                        name={icon}
                        size={18}
                        color={isSelected ? COLORS.light : COLORS.highlight}
                      />
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2">
                        <Text
                          className={`text-base ${
                            isSelected
                              ? "font-bold text-ui-highlight"
                              : "font-semibold text-ui-shade"
                          }`}
                        >
                          {presentation.label}
                        </Text>
                        {isSelected ? (
                          <View className="rounded-full bg-ui-highlight/10 px-2 py-0.5">
                            <Text className="text-xs font-semibold text-ui-highlight">
                              Selected
                            </Text>
                          </View>
                        ) : null}
                      </View>
                      <Text className="mt-1 text-sm leading-5 text-ui-muted">
                        {presentation.description}
                      </Text>
                    </View>
                  </View>
                  {isSelected ? (
                    <View className="ml-2 h-8 w-8 items-center justify-center rounded-full bg-ui-highlight">
                      <Icon name="Check" size={16} color={COLORS.light} />
                    </View>
                  ) : null}
                </ActionsheetItem>
              );
            })}
          </View>
        </ActionsheetContent>
      </Actionsheet>
    </View>
  );
};

export default VisibilityToggle;
