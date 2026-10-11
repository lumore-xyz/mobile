import Button from "@/src/components/ui/Button";
import LumoreRefreshControl from "@/src/components/ui/LumoreRefreshControl";
import { COLORS } from "@/src/libs/constants/theme";
import Icon from "@/src/libs/Icon";
import React from "react";
import { ScrollView, Text, View } from "react-native";

interface NotificationStatesProps {
  state: "unread-empty" | "empty" | "error";
  onShowAll?: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export default function NotificationStates({
  state,
  onShowAll,
  onRefresh,
  isRefreshing = false,
}: NotificationStatesProps) {
  if (state === "unread-empty") {
    return (
      <View className="mx-4 mt-6 items-center rounded-[24px] border border-ui-parchment bg-ui-paper px-6 py-8">
        <View className="h-14 w-14 items-center justify-center rounded-full bg-ui-forest/10">
          <Icon name="CheckCheck" size={24} color={COLORS.forest} />
        </View>
        <Text className="mt-4 text-center text-xl font-bold text-ui-ink">No unread updates</Text>
        <Text className="mt-2 text-center text-sm leading-5 text-ui-slate">
          You have seen everything new. Your earlier notifications are still available.
        </Text>
        {onShowAll ? (
          <Button
            variant="outline"
            text="Show all notifications"
            onClick={onShowAll}
            className="mt-5 px-6"
          />
        ) : null}
      </View>
    );
  }

  if (state === "error") {
    return (
      <View className="mx-4 mt-8 items-center rounded-[24px] border border-ui-parchment bg-ui-paper px-6 py-8" accessibilityLiveRegion="polite">
        <View className="h-14 w-14 items-center justify-center rounded-full bg-ui-danger/5">
          <Icon name="CloudOff" size={24} color={COLORS.danger} />
        </View>
        <Text className="mt-4 text-center text-xl font-bold text-ui-ink">Notifications are taking a moment</Text>
        <Text className="mt-2 text-center text-sm leading-5 text-ui-slate">
          We could not load your updates. Check your connection and try again.
        </Text>
        <Button text="Try again" onClick={() => onRefresh?.()} className="mt-5 px-6" />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="px-4 pb-10 pt-5"
      refreshControl={
        <LumoreRefreshControl
          refreshing={isRefreshing}
          onRefresh={() => onRefresh?.()}
        />
      }
    >
      <View className="items-center rounded-[24px] border border-ui-parchment bg-ui-paper px-6 py-8">
        <View className="h-14 w-14 items-center justify-center rounded-full bg-ui-forest/10">
          <Icon name="Bell" size={24} color={COLORS.forest} />
        </View>
        <Text className="mt-4 text-center text-xl font-bold text-ui-ink">You&apos;re all caught up</Text>
        <Text className="mt-2 text-center text-sm leading-5 text-ui-slate">
          New matches, feedback, verification updates, and community activity will show up here.
        </Text>
        <Button
          variant="outline"
          text={isRefreshing ? "Refreshing..." : "Refresh"}
          onClick={() => onRefresh?.()}
          className="mt-5 px-6"
        />
      </View>
    </ScrollView>
  );
}
