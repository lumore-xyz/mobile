import ActiveFilterChip from "@/src/components/ui/ActiveFilterChip";
import type { InboxFiltersState } from "@/src/domain/chat/inboxTypes";
import { COLORS } from "@/src/libs/constants/theme";
import Icon from "@/src/libs/Icon";
import React, { useEffect, useState } from "react";
import { Pressable, TextInput, View } from "react-native";

interface InboxSearchToolbarProps {
  filters: InboxFiltersState;
  selectedSortLabel?: string;
  onFiltersChange: (next: Partial<InboxFiltersState>) => void;
  onOpenFilters: () => void;
}

export default function InboxSearchToolbar({
  filters,
  selectedSortLabel,
  onFiltersChange,
  onOpenFilters,
}: InboxSearchToolbarProps) {
  const [searchDraft, setSearchDraft] = useState(filters.search);

  useEffect(() => {
    setSearchDraft(filters.search);
  }, [filters.search]);

  useEffect(() => {
    if (searchDraft === filters.search) return;
    const timer = setTimeout(() => {
      onFiltersChange({ search: searchDraft });
    }, 350);
    return () => clearTimeout(timer);
  }, [filters.search, onFiltersChange, searchDraft]);

  return (
    <View className="gap-3 pb-3">
      <View className="flex-row items-center gap-2">
        <View className="h-12 flex-1 flex-row items-center rounded-full border border-ui-parchment bg-ui-paper px-4">
          <Icon name="Search" size={18} color={COLORS.slate} />
          <TextInput
            value={searchDraft}
            onChangeText={setSearchDraft}
            placeholder="Search conversations"
            placeholderTextColor={COLORS.slate}
            className="ml-2 flex-1 text-sm text-ui-ink"
            returnKeyType="search"
            accessibilityLabel="Search conversations"
          />
          {searchDraft ? (
            <Pressable
              onPress={() => {
                setSearchDraft("");
                onFiltersChange({ search: "" });
              }}
              className="h-8 w-8 items-center justify-center rounded-full"
              accessibilityRole="button"
              accessibilityLabel="Clear conversation search"
            >
              <Icon name="X" size={16} color={COLORS.slate} />
            </Pressable>
          ) : null}
        </View>
        <Pressable
          onPress={onOpenFilters}
          className="h-12 w-12 items-center justify-center rounded-full border border-ui-parchment bg-ui-paper active:opacity-70"
          accessibilityRole="button"
          accessibilityLabel="Filter and sort conversations"
        >
          <Icon name="SlidersHorizontal" size={19} color={COLORS.forest} />
        </Pressable>
      </View>
      {filters.unreadOnly || filters.sort !== "recent" ? (
        <View className="flex-row flex-wrap items-center gap-2">
          {filters.unreadOnly ? <ActiveFilterChip label="Unread only" /> : null}
          {filters.sort !== "recent" && selectedSortLabel ? (
            <ActiveFilterChip label={selectedSortLabel} />
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
