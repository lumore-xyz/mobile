import React from "react";
import { View } from "react-native";
import { ChatMessage } from "./ChatMessage";
import { DateHeader } from "./DateHeader";
import type { Message } from "@/src/domain/chat/types";

interface MessageGroupProps {
  timestamp: number;
  messages: Message[];
  currentUserId: string;
  onReply: (message: Message) => void;
  onStartEdit: (message: Message) => void;
  onToggleLike: (messageId: string, emoji?: string) => void;
}

export const MessageGroup = React.memo(function MessageGroup({
  timestamp,
  messages,
  currentUserId,
  onReply,
  onStartEdit,
  onToggleLike,
}: MessageGroupProps) {
  return (
    <View className="space-y-4">
      <DateHeader timestamp={timestamp} />
      {messages.map((message, index) => (
        <ChatMessage
          key={message._id || message.clientMessageId || index}
          message={message}
          isOwnMessage={message.sender === currentUserId}
          onReply={onReply}
          onStartEdit={onStartEdit}
          onToggleLike={onToggleLike}
        />
      ))}
    </View>
  );
});
