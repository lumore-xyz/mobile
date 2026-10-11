import CommunityDirectoryChip from "@/src/components/community/CommunityDirectoryChip";
import CommunityFilterToggle from "@/src/components/community/CommunityFilterToggle";
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from "@/src/components/ui/actionsheet";
import type { CommunityRoomSort, CommunityRoomTypeFilter } from "@/src/features/community/types";
import { COLORS } from "@/src/libs/constants/theme";
import Icon from "@/src/libs/Icon";
import React from "react";
import { Pressable, Text, View } from "react-native";

export interface CommunityFilters {
  type: CommunityRoomTypeFilter;
  nearby: boolean;
  sort: CommunityRoomSort;
  joinedOnly: boolean;
  inPoolOnly: boolean;
}

export const COMMUNITY_SORT_OPTIONS: {
  label: string;
  value: CommunityRoomSort;
  icon: string;
}[] = [
  { label: "Most in pool", value: "pool_high", icon: "Sparkles" },
  { label: "Fewest in pool", value: "pool_low", icon: "Sparkles" },
  { label: "Newest", value: "newest", icon: "Clock3" },
  { label: "Nearest", value: "nearest", icon: "MapPin" },
];

interface CommunityFilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  draft: CommunityFilters;
  setDraft: React.Dispatch<React.SetStateAction<CommunityFilters>>;
  hasCurrentLocation: boolean;
  onApply: () => void;
  onReset: () => void;
}

export default function CommunityFilterSheet({
  isOpen,
  onClose,
  draft,
  setDraft,
  hasCurrentLocation,
  onApply,
  onReset,
}: CommunityFilterSheetProps) {
  const nearbyDisabled = !hasCurrentLocation || draft.type === "topic";
  const nearestDisabled = !hasCurrentLocation || draft.type === "topic";
  const hasFilters =
    draft.type !== "all" ||
    draft.nearby ||
    draft.sort !== "pool_high" ||
    draft.joinedOnly ||
    draft.inPoolOnly;

  return (
    <Actionsheet isOpen={isOpen} onClose={onClose}>
      <ActionsheetBackdrop />
      <ActionsheetContent className="items-stretch rounded-t-[32px] bg-ui-surface-page px-5 pb-8 pt-2">
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator />
        </ActionsheetDragIndicatorWrapper>
        <View className="mb-5 mt-3 w-full flex-row items-start justify-between">
          <View>
            <Text className="text-left text-2xl font-semibold text-ui-midnight">Filter communities</Text>
            <Text className="mt-1 text-sm leading-5 text-ui-slate">Choose what to browse and how to sort it.</Text>
          </View>
          {hasFilters ? (
            <Pressable
              onPress={onReset}
              className="min-h-10 justify-center px-2"
              accessibilityRole="button"
              accessibilityLabel="Reset community filters"
            >
              <Text className="text-xs font-bold text-ui-forest">Reset</Text>
            </Pressable>
          ) : null}
        </View>

        <Text className="mb-2 w-full text-left text-xs font-bold uppercase tracking-wider text-ui-slate">Browse</Text>
        <View className="mb-5 w-full flex-row gap-2">
          {(["all", "local", "topic"] as const).map((type) => (
            <CommunityDirectoryChip
              key={type}
              expand
              label={type === "all" ? "All" : type === "local" ? "Local" : "Topic"}
              selected={draft.type === type}
              onPress={() => setDraft((current) => ({
                ...current,
                type,
                nearby: type === "topic" ? false : current.nearby,
                sort: type === "topic" && current.sort === "nearest" ? "pool_high" : current.sort,
              }))}
            />
          ))}
        </View>

        <Pressable
          onPress={() => setDraft((current) => ({ ...current, nearby: !current.nearby }))}
          disabled={nearbyDisabled}
          className={`mb-5 w-full flex-row items-center justify-between rounded-[22px] border px-4 py-3.5 ${draft.nearby ? "border-ui-forest/20 bg-ui-forest/10" : "border-ui-parchment bg-ui-paper"} ${nearbyDisabled ? "opacity-45" : "active:opacity-75"}`}
          accessibilityRole="switch"
          accessibilityLabel="Show nearby communities within 25 kilometers"
          accessibilityState={{ checked: draft.nearby, disabled: nearbyDisabled }}
        >
          <View className="flex-row items-center gap-3">
            <View className={`h-10 w-10 items-center justify-center rounded-full ${draft.nearby ? "bg-ui-forest" : "bg-ui-forest/10"}`}>
              <Icon name="MapPin" size={18} color={draft.nearby ? COLORS.paper : COLORS.forest} />
            </View>
            <View className="flex-1">
              <Text className="font-bold text-ui-ink">Nearby · 25 km</Text>
              <Text className="mt-0.5 text-xs text-ui-slate">
                {hasCurrentLocation ? "Show local communities around you" : "Turn on location to browse nearby"}
              </Text>
            </View>
          </View>
          <View className={`h-6 w-11 rounded-full p-1 ${draft.nearby ? "bg-ui-forest" : "bg-ui-parchment"}`}>
            <View className={`h-4 w-4 rounded-full bg-ui-paper ${draft.nearby ? "ml-5" : ""}`} />
          </View>
        </Pressable>

        <View className="mb-5 w-full gap-2.5">
          <CommunityFilterToggle
            icon="UsersRound"
            label="Joined community"
            description="Show communities you’ve joined"
            selected={draft.joinedOnly}
            onPress={() => setDraft((current) => ({ ...current, joinedOnly: !current.joinedOnly }))}
          />
          <CommunityFilterToggle
            icon="Sparkles"
            label="In pool"
            description="Show communities you’re waiting in"
            selected={draft.inPoolOnly}
            onPress={() => setDraft((current) => ({ ...current, inPoolOnly: !current.inPoolOnly }))}
          />
        </View>

        <Text className="mb-3 w-full text-left text-xs font-bold uppercase tracking-wider text-ui-slate">Sort by</Text>
        <View className="w-full flex-row flex-wrap justify-between gap-y-2.5">
          {COMMUNITY_SORT_OPTIONS.map((option) => {
            const disabled = option.value === "nearest" && nearestDisabled;
            const selected = draft.sort === option.value;
            return (
              <Pressable
                key={option.value}
                onPress={() => setDraft((current) => ({ ...current, sort: option.value }))}
                disabled={disabled}
                className={`min-h-[58px] w-[48.5%] flex-row items-center justify-between rounded-[20px] border px-3.5 ${selected ? "border-ui-forest/20 bg-ui-forest/10" : "border-ui-parchment bg-ui-paper"} ${disabled ? "opacity-45" : "active:opacity-75"}`}
                accessibilityRole="radio"
                accessibilityLabel={option.label}
                accessibilityState={{ selected, disabled }}
              >
                <View className="flex-1 flex-row items-center gap-2">
                  <Icon name={option.icon} size={16} color={selected ? COLORS.forest : COLORS.slate} />
                  <Text className={`flex-1 text-sm font-semibold leading-5 ${selected ? "text-ui-forest" : "text-ui-ink"}`}>
                    {option.label}
                  </Text>
                </View>
                {selected ? <Icon name="Check" size={18} color={COLORS.forest} /> : null}
              </Pressable>
            );
          })}
        </View>
        <Pressable
          onPress={onApply}
          className="mt-5 min-h-12 w-full items-center justify-center rounded-2xl bg-ui-forest px-6 active:opacity-85"
          accessibilityRole="button"
          accessibilityLabel="Apply community filters"
        >
          <Text className="font-bold text-ui-paper">Apply filters</Text>
        </Pressable>
      </ActionsheetContent>
    </Actionsheet>
  );
}
