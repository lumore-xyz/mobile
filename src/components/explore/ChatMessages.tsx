import type { Message } from "@/src/domain/chat/types";
import React, { useEffect, useRef } from "react";
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

export const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  currentUserId,
  matchNote,
  matchCreatedAt,
  isPartnerTyping = false,
  onReply,
  onStartEdit,
  onToggleLike,
}) => {
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);

    return () => clearTimeout(timeout);
  }, [messages]);

  const groupedMessages = messages.reduce(
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

  const sortedDates = Object.keys(groupedMessages).sort(
    (a, b) => groupedMessages[a].timestamp - groupedMessages[b].timestamp,
  );

  return (
    <ScrollView
      className="flex-1 px-4 py-2"
      ref={scrollRef}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View className="space-y-4">
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
          <View className="px-1 py-1">
            <Text className="text-xs text-ui-shade/70 italic">Typing...</Text>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
};
