import type { Message } from "@/src/domain/chat/types";
import React, { useEffect, useMemo, useRef } from "react";
import { ScrollView, Text, View } from "react-native";
import { MatchNoteBanner } from "./MatchNoteBanner";
import { MessageGroup } from "./MessageGroup";

interface ChatMessagesProps {
  messages: Message[];
  currentUserId: string;
  matchNote?: string | null;
  matchCreatedAt?: string | Date | null;
  isPartnerTyping?: boolean;
  onReply: (message: Message) => void;
  onStartEdit: (message: Message) => void;
  onToggleLike: (messageId: string, emoji?: string) => void;
}

export const ChatMessages = React.memo(function ChatMessages({
  messages,
  currentUserId,
  matchNote,
  matchCreatedAt,
  isPartnerTyping = false,
  onReply,
  onStartEdit,
  onToggleLike,
}: ChatMessagesProps) {
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);

    return () => clearTimeout(timeout);
  }, [isPartnerTyping, messages]);

  const { groupedMessages, sortedDates } = useMemo(() => {
    const nextGroups = messages.reduce(
      (
        groups: Record<
          string,
          {
            messages: Message[];
            timestamp: number;
          }
        >,
        message: Message,
      ) => {
        const date = new Date(message.timestamp).toLocaleDateString();
        if (!groups[date]) {
          groups[date] = {
            messages: [],
            timestamp: message.timestamp,
          };
        }
        groups[date].messages.push(message);
        return groups;
      },
      {} as Record<string, { messages: Message[]; timestamp: number }>,
    );

    const nextSortedDates = Object.keys(nextGroups).sort(
      (a, b) => nextGroups[a].timestamp - nextGroups[b].timestamp,
    );

    return {
      groupedMessages: nextGroups,
      sortedDates: nextSortedDates,
    };
  }, [messages]);

  return (
    <ScrollView
      className="flex-1 px-3 pt-3"
      ref={scrollRef}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 20 }}
    >
      <View className="gap-4">
        <MatchNoteBanner note={matchNote || ""} createdAt={matchCreatedAt} />
        {sortedDates.map((date) => (
          <MessageGroup
            key={date}
            date={date}
            messages={groupedMessages[date].messages}
            currentUserId={currentUserId}
            onReply={onReply}
            onStartEdit={onStartEdit}
            onToggleLike={onToggleLike}
          />
        ))}
        {isPartnerTyping ? (
          <View className="items-start px-1 py-1" accessibilityLiveRegion="polite">
            <View className="rounded-full border border-ui-border bg-ui-light px-3 py-2">
              <Text className="text-xs font-medium text-ui-muted">Typing…</Text>
            </View>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
});
