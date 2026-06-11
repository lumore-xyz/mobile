import { triggerSelectionHaptic } from "@/src/utils/haptics";
import clsxLib from "clsx";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

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
  const defaultContainerClass = "mb-3 flex-row rounded-xl bg-ui-shade/5 p-2";
  const defaultTabClass = "min-h-11 flex-1 justify-center rounded-lg py-2";
  const defaultLabelClass = "text-center font-medium";
  const defaultActiveLabelClass = "text-ui-dark";
  const defaultInactiveLabelClass = "text-ui-shade";
  const defaultBadgeClass = "min-w-5 rounded-full px-1.5 py-0.5";
  const defaultActiveBadgeClass = "bg-ui-highlight/10";
  const defaultInactiveBadgeClass = "bg-ui-shade/10";
  const defaultActiveBadgeLabelClass = "text-ui-highlight";
  const defaultInactiveBadgeLabelClass = "text-ui-shade";

  return (
    <View className={containerClassName || defaultContainerClass}>
      {tabs.map((tab) => {
        const active = isTabActive(tab.key);

        return (
          <TouchableOpacity
            key={tab.key}
            onPress={() => handleTabPress(tab.key)}
            disabled={active}
            className={clsxLib(tabClassName || defaultTabClass)}
            style={[
              active && {
                backgroundColor: "#fff",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2, // Android shadow
              },
            ]}
            accessibilityRole="tab"
            accessibilityState={{ selected: active, disabled: active }}
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
          </TouchableOpacity>
        );
      })}
    </View>
  );
});

export default Tabs;
