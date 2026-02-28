import type { Message } from "@/src/domain/chat/types";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useRef } from "react";
import { Image, Linking, Text, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";

interface ChatMessageProps {
  message: Message;
  isOwnMessage: boolean;
  onReply: (message: Message) => void;
  onStartEdit: (message: Message) => void;
  onToggleLike: (messageId: string, emoji?: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isOwnMessage,
  onReply,
  onStartEdit,
  onToggleLike,
}) => {
  const lastTapRef = useRef(0);
  const type = message.messageType || "text";
  const isRead = Boolean(message.readAt);

  const reactionCounts = useMemo(() => {
    const grouped = new Map<string, number>();
    (message.reactions || []).forEach((reaction) => {
      const emoji = reaction.emoji || "\u2764\uFE0F";
      grouped.set(emoji, (grouped.get(emoji) || 0) + 1);
    });
    return Array.from(grouped.entries());
  }, [message.reactions]);

  const onDoubleLike = () => {
    if (!message._id) return;
    onToggleLike(message._id, "\u2764\uFE0F");
  };

  const handleTouchEnd = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 280) {
      onDoubleLike();
    }
    lastTapRef.current = now;
  };

  return (
    <View className={`flex mb-3 ${isOwnMessage ? "items-end" : "items-start"}`}>
      <View className="flex flex-col max-w-[75%] gap-1">
        <TouchableWithoutFeedback onPressOut={handleTouchEnd}>
          <View
            className={`rounded-xl p-3 ${
              isOwnMessage ? "bg-ui-highlight" : "bg-ui-highlight/5"
            }`}
          >
            {message.replyTo ? (
              <View
                className={`mb-2 flex-row items-center gap-1 rounded-md px-2 py-1 border ${
                  isOwnMessage
                    ? "border-white/40 bg-white/10"
                    : "border-ui-shade/20 bg-ui-light"
                }`}
              >
                <Ionicons
                  name="return-up-back-outline"
                  size={12}
                  color={isOwnMessage ? "#E8ECF4" : "#667085"}
                />
                <Text
                  className={`text-xs ${
                    isOwnMessage ? "text-ui-light/90" : "text-ui-shade"
                  }`}
                >
                  {message.replyTo.messageType === "image"
                    ? "Photo"
                    : message.replyTo.message || "Message"}
                </Text>
              </View>
            ) : null}

            {type === "image" && message.imageUrl ? (
              <Image
                source={{ uri: message.imageUrl }}
                className="rounded-lg max-h-64 w-52"
                resizeMode="cover"
              />
            ) : (
              <LinkifyText text={message.message} isOwnMessage={isOwnMessage} />
            )}
          </View>
        </TouchableWithoutFeedback>

        {reactionCounts.length > 0 ? (
          <View
            className={`flex-row gap-2 ${isOwnMessage ? "justify-end" : "justify-start"}`}
          >
            {reactionCounts.map(([emoji, count]) => (
              <View key={emoji} className="bg-ui-highlight/10 rounded-full px-2 py-0.5">
                <Text className="text-xs text-ui-shade">
                  {emoji} {count > 1 ? count : ""}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        <View
          className={`flex-row gap-3 ${isOwnMessage ? "justify-end" : "justify-start"}`}
        >
          <TouchableOpacity onPress={() => onReply(message)}>
            <Text className="text-xs text-ui-shade/70">Reply</Text>
          </TouchableOpacity>
          {isOwnMessage && type === "text" && message._id ? (
            <TouchableOpacity onPress={() => onStartEdit(message)}>
              <Text className="text-xs text-ui-shade/70">Edit</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <View className={`mt-1 flex-row items-center ${isOwnMessage ? "justify-end" : "justify-start"}`}>
          <Text
            className="text-xs text-ui-shade/60 opacity-70"
          >
            {new Date(message.timestamp).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}
            {message.editedAt ? " (edited)" : ""}
          </Text>
          {isOwnMessage ? (
            <Ionicons
              name="checkmark-done"
              size={12}
              color={isRead ? "#4F46E5" : "#98A2B3"}
              style={{ marginLeft: 4 }}
            />
          ) : null}
        </View>
      </View>
    </View>
  );
};

const LinkifyText = ({
  text,
  isOwnMessage,
}: {
  text: string;
  isOwnMessage: boolean;
}) => {
  const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/gi;
  const parts = text.split(urlRegex);

  return (
    <Text className={`${isOwnMessage ? "text-ui-light" : "text-ui-shade"}`}>
      {parts.map((part, index) => {
        if (!part) return null;
        if (part.match(urlRegex)) {
          const href = part.startsWith("http") ? part : `https://${part}`;
          return (
            <Text
              key={`${part}-${index}`}
              className={`${isOwnMessage ? "text-ui-light" : "text-ui-highlight"} underline`}
              onPress={() => {
                void Linking.openURL(href).catch(() => {});
              }}
            >
              {part}
            </Text>
          );
        }
        return <Text key={`${part}-${index}`}>{part}</Text>;
      })}
    </Text>
  );
};
