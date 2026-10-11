import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from "@/src/components/ui/actionsheet";
import type { InboxFiltersState, InboxSort } from "@/src/domain/chat/inboxTypes";
import { COLORS } from "@/src/libs/constants/theme";
import Icon from "@/src/libs/Icon";
import React from "react";
import { Pressable, Text, View } from "react-native";

interface InboxFilterSheetProps {
  isOpen: boolean;
  filters: InboxFiltersState;
  sortOptions: { label: string; value: InboxSort }[];
  sortIcons: Record<InboxSort, string>;
  onClose: () => void;
  onChange: (next: InboxFiltersState) => void;
}

const InboxFilterSheet = React.memo(function InboxFilterSheet({
  isOpen,
  filters,
  sortOptions,
  sortIcons,
  onClose,
  onChange,
}: InboxFilterSheetProps) {
  const [draft, setDraft] = React.useState(filters);
  React.useEffect(() => setDraft(filters), [filters, isOpen]);

  const updateDraft = (next: Partial<InboxFiltersState>) => {
    setDraft((current) => ({ ...current, ...next }));
  };

  return (
    <Actionsheet isOpen={isOpen} onClose={onClose}>
      <ActionsheetBackdrop />
      <ActionsheetContent className="items-stretch rounded-t-[32px] bg-ui-surface-page px-5 pb-8 pt-2">
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator />
        </ActionsheetDragIndicatorWrapper>
        <Text className="mb-4 mt-3 w-full text-left text-2xl font-semibold text-ui-midnight">
          Filter conversations
        </Text>
        <Text className="-mt-2 mb-5 w-full text-left text-sm leading-5 text-ui-slate">
          Find the right conversation faster.
        </Text>
        <Pressable
          onPress={() => updateDraft({ unreadOnly: !draft.unreadOnly })}
          className={`mb-5 w-full flex-row items-center justify-between rounded-[22px] border px-4 py-3.5 ${draft.unreadOnly ? "border-ui-forest/20 bg-ui-forest/10" : "border-ui-parchment bg-ui-paper"}`}
          accessibilityRole="switch"
          accessibilityLabel="Unread conversations only"
          accessibilityState={{ checked: draft.unreadOnly }}
        >
          <View className="min-w-0 flex-1 flex-row items-center gap-3">
            <View className={`h-10 w-10 items-center justify-center rounded-full ${draft.unreadOnly ? "bg-ui-forest" : "bg-ui-forest/10"}`}>
              <Icon name="MailOpen" size={18} color={draft.unreadOnly ? COLORS.paper : COLORS.forest} />
            </View>
            <View className="min-w-0 flex-1">
              <Text className="font-bold text-ui-ink">Unread only</Text>
              <Text className="mt-0.5 text-xs text-ui-slate">
                Show conversations waiting for you
              </Text>
            </View>
          </View>
          <View className={`h-6 w-11 shrink-0 rounded-full p-1 ${draft.unreadOnly ? "bg-ui-forest" : "bg-ui-parchment"}`}>
            <View className={`h-4 w-4 rounded-full bg-ui-paper ${draft.unreadOnly ? "ml-5" : ""}`} />
          </View>
        </Pressable>
        <View className="mb-3 w-full flex-row items-center justify-between">
          <Text className="text-left text-xs font-bold uppercase tracking-wider text-ui-slate">
            Sort by
          </Text>
          {draft.sort !== "recent" || draft.unreadOnly ? (
            <Pressable
              onPress={() => setDraft({ ...draft, sort: "recent", unreadOnly: false })}
              className="min-h-9 justify-center px-2"
              accessibilityRole="button"
              accessibilityLabel="Clear conversation filters"
            >
              <Text className="text-xs font-bold text-ui-forest">Reset</Text>
            </Pressable>
          ) : null}
        </View>
        <View className="w-full flex-row flex-wrap justify-between gap-y-2.5">
          {sortOptions.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => updateDraft({ sort: option.value })}
              className={`min-h-[62px] w-[48.5%] flex-row items-center justify-between rounded-[20px] border px-3.5 ${draft.sort === option.value ? "border-ui-forest/20 bg-ui-forest/10" : "border-ui-parchment bg-ui-paper"}`}
              accessibilityRole="radio"
              accessibilityLabel={option.label}
              accessibilityState={{ selected: draft.sort === option.value }}
            >
              <View className="flex-1 flex-row items-center gap-2">
                <Icon
                  name={sortIcons[option.value]}
                  size={16}
                  color={draft.sort === option.value ? COLORS.forest : COLORS.slate}
                />
                <Text className={`flex-1 text-sm font-semibold leading-5 ${draft.sort === option.value ? "text-ui-forest" : "text-ui-ink"}`}>
                  {option.label}
                </Text>
              </View>
              {draft.sort === option.value ? (
                <Icon name="Check" size={18} color={COLORS.forest} />
              ) : null}
            </Pressable>
          ))}
        </View>
        <Pressable
          onPress={() => {
            onChange(draft);
            onClose();
          }}
          className="mt-5 min-h-12 w-full items-center justify-center rounded-2xl bg-ui-forest px-6 active:opacity-85"
          accessibilityRole="button"
          accessibilityLabel="Apply conversation filters"
        >
          <Text className="font-bold text-ui-paper">Apply filters</Text>
        </Pressable>
      </ActionsheetContent>
    </Actionsheet>
  );
});

export default InboxFilterSheet;
