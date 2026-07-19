import { triggerSelectionHaptic } from "@/src/utils/haptics";
import clsxLib from "clsx";
import React from "react";
import { Pressable, Text, View } from "react-native";

export interface TabItem {
  key: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onSelect: (key: string) => void;
  showBadges?: boolean;
  containerClassName?: string;
  tabClassName?: string;
  activeTabClassName?: string;
  inactiveTabClassName?: string;
  labelClassName?: string;
  activeLabelClassName?: string;
  inactiveLabelClassName?: string;
  badgeClassName?: string;
  activeBadgeClassName?: string;
  inactiveBadgeClassName?: string;
  hapticFeedback?: boolean;
}

const Tabs = React.memo(function Tabs({
  tabs,
  activeTab,
  onSelect,
  showBadges = false,
  containerClassName,
  tabClassName,
  activeTabClassName,
  inactiveTabClassName,
  labelClassName,
  activeLabelClassName,
  inactiveLabelClassName,
  badgeClassName,
  activeBadgeClassName,
  inactiveBadgeClassName,
  hapticFeedback = true,
}: TabsProps) {
  const handleTabPress = (key: string) => {
    if (key === activeTab) return;
    if (hapticFeedback) {
      triggerSelectionHaptic();
    }
    onSelect(key);
  };

  const isTabActive = (tabKey: string) => tabKey === activeTab;

  // Default styles
  const defaultContainerClass =
    "mb-4 flex-row rounded-full border border-ui-border bg-ui-light p-1.5";
  const defaultTabClass = "min-h-11 flex-1 justify-center rounded-full px-3 py-2 active:opacity-75";
  const defaultLabelClass = "text-center text-sm font-semibold";
  const defaultActiveLabelClass = "text-ui-light";
  const defaultInactiveLabelClass = "text-ui-muted";
  const defaultBadgeClass = "min-w-5 rounded-full px-1.5 py-0.5";
  const defaultActiveBadgeClass = "bg-ui-primary";
  const defaultInactiveBadgeClass = "bg-ui-shade/10";
  const defaultActiveBadgeLabelClass = "text-ui-shade";
  const defaultInactiveBadgeLabelClass = "text-ui-shade";

  return (
    <View className={containerClassName || defaultContainerClass}>
      {tabs.map((tab) => {
        const active = isTabActive(tab.key);

        return (
          <Pressable
            key={tab.key}
            onPress={() => handleTabPress(tab.key)}
            className={clsxLib(
              tabClassName || defaultTabClass,
              active
                ? activeTabClassName || "bg-ui-highlight"
                : inactiveTabClassName || "bg-transparent",
            )}
            accessibilityRole="tab"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected: active }}
          >
            <View className="flex-row items-center justify-center gap-2">
              <Text
                className={clsxLib(
                  labelClassName || defaultLabelClass,
                  active
                    ? activeLabelClassName || defaultActiveLabelClass
                    : inactiveLabelClassName || defaultInactiveLabelClass,
                )}
              >
                {tab.label}
              </Text>

              {showBadges && tab.count !== undefined && (
                <View
                  className={clsxLib(
                    badgeClassName || defaultBadgeClass,
                    active
                      ? activeBadgeClassName || defaultActiveBadgeClass
                      : inactiveBadgeClassName || defaultInactiveBadgeClass,
                  )}
                >
                  <Text
                    className={clsxLib(
                      "text-xs font-semibold",
                      active
                        ? defaultActiveBadgeLabelClass
                        : defaultInactiveBadgeLabelClass,
                    )}
                  >
                    {tab.count}
                  </Text>
                </View>
              )}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
});

export default Tabs;
