import React from "react";
import { View } from "react-native";
import { ChatMessage } from "./ChatMessage";
import { DateHeader } from "./DateHeader";
import type { Message } from "@/src/domain/chat/types";

interface MessageGroupProps {
  date: string;
  messages: Message[];
  currentUserId: string;
  onReply: (message: Message) => void;
  onStartEdit: (message: Message) => void;
  onToggleLike: (messageId: string, emoji?: string) => void;
}

export const MessageGroup: React.FC<MessageGroupProps> = ({
  messages,
  currentUserId,
  onReply,
  onStartEdit,
  onToggleLike,
}) => {
  return (
    <View className="space-y-4">
      <DateHeader timestamp={messages[0]?.timestamp} />
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
};
