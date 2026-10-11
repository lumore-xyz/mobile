import { COLORS } from "@/src/libs/constants/theme";
import Icon from "@/src/libs/Icon";
import type { InboxTab } from "@/src/domain/chat/inboxTypes";
import { Link } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";

const InboxState = ({
  mode,
  type,
  onAction,
}: {
  mode: InboxTab;
  type: "empty" | "error";
  onAction?: () => void;
}) => {
  const isError = type === "error";
  const title = isError
    ? "Messages are taking a moment"
    : mode === "archive"
      ? "Your archive is clear"
      : "Your next conversation starts here";
  const description = isError
    ? "We couldn't refresh your conversations. Check your connection and try again."
    : mode === "archive"
      ? "Chats you archive will stay safely tucked away here."
      : "Explore new connections and your active chats will appear here.";

  return (
    <View className="mt-6 items-center rounded-[24px] border border-ui-parchment bg-ui-paper px-6 py-8">
      <View className="h-14 w-14 items-center justify-center rounded-full bg-ui-forest/10">
        <Icon
          name={isError ? "CloudOff" : mode === "archive" ? "Archive" : "MessageCircleHeart"}
          size={26}
          color={COLORS.forest}
        />
      </View>
      <Text className="mt-4 text-center text-xl font-bold text-ui-ink" accessibilityRole="header">
        {title}
      </Text>
      <Text className="mt-2 text-center text-sm leading-5 text-ui-slate">
        {description}
      </Text>
      {isError && onAction ? (
        <Pressable
          onPress={onAction}
          className="mt-5 min-h-12 items-center justify-center rounded-2xl bg-ui-forest px-6 active:opacity-75"
          accessibilityRole="button"
          accessibilityLabel="Retry loading conversations"
        >
          <Text className="font-semibold text-ui-paper">Try again</Text>
        </Pressable>
      ) : !isError && mode === "active" ? (
        <Link href="/explore" asChild>
          <Pressable
            className="mt-5 min-h-12 flex-row items-center justify-center gap-2 rounded-2xl bg-ui-forest px-6 active:opacity-75"
            accessibilityRole="button"
            accessibilityLabel="Explore new connections"
          >
            <Icon name="Sparkles" size={17} color={COLORS.paper} />
            <Text className="font-semibold text-ui-paper">Explore connections</Text>
          </Pressable>
        </Link>
      ) : null}
    </View>
  );
};

export default InboxState;
