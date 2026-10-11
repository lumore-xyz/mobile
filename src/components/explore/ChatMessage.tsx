import type { Message } from "@/src/domain/chat/types";
import getChatMessageTypeLabel from "@/src/domain/chat/getChatMessageTypeLabel";
import LinkifyText from "@/src/components/explore/LinkifyText";
import VoiceNotePlayer from "@/src/components/explore/VoiceNotePlayer";
import {
  triggerLightImpactHaptic,
  triggerSelectionHaptic,
} from "@/src/utils/haptics";
import Icon from "@/src/libs/Icon";
import { COLORS } from "@/src/libs/constants/theme";
import { Image } from "expo-image";
import React, { useMemo, useRef } from "react";
import {
  Pressable,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";

interface ChatMessageProps {
  message: Message;
  isOwnMessage: boolean;
  onReply: (message: Message) => void;
  onStartEdit: (message: Message) => void;
  onToggleLike: (messageId: string, emoji?: string) => void;
}

const CHAT_TIME_FORMATTER = new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
});

export const ChatMessage = React.memo(function ChatMessage({
  message,
  isOwnMessage,
  onReply,
  onStartEdit,
  onToggleLike,
}: ChatMessageProps) {
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
    triggerLightImpactHaptic();
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
    <View className={`mb-2 flex ${isOwnMessage ? "items-end" : "items-start"}`}>
      <View className="max-w-[82%] gap-1">
        <TouchableWithoutFeedback onPressOut={handleTouchEnd}>
          <View
            className={`px-4 py-3 ${
              isOwnMessage
                ? "rounded-[22px] rounded-br-md bg-ui-forest"
                : "rounded-[22px] rounded-bl-md border border-ui-parchment bg-ui-paper"
            }`}
          >
            {message.replyTo ? (
              <View
                className={`mb-2 flex-row items-center gap-2 rounded-xl border-l-2 px-3 py-2 ${
                  isOwnMessage
                    ? "border-ui-paper/70 bg-ui-paper/10"
                    : "border-ui-forest bg-ui-forest/5"
                }`}
              >
                <Icon
                  name="Reply"
                  size={12}
                  color={isOwnMessage ? COLORS.paper : COLORS.forest}
                />
                <Text
                  className={`text-xs ${
                    isOwnMessage ? "text-ui-paper/90" : "text-ui-ink"
                  }`}
                >
                  {getChatMessageTypeLabel(message.replyTo.messageType) ||
                    message.replyTo.message ||
                    "Message"}
                </Text>
              </View>
            ) : null}

            {type === "image" && message.imageUrl ? (
              <Image
                source={{ uri: message.imageUrl }}
                className="h-56 w-56 rounded-2xl"
                contentFit="cover"
                transition={150}
                accessible
                accessibilityLabel="Shared photo"
              />
            ) : type === "audio" && message.audioUrl ? (
              <VoiceNotePlayer
                audioUrl={message.audioUrl}
                durationMs={message.audioDurationMs || 0}
                waveform={message.audioWaveform}
                isOwnMessage={isOwnMessage}
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
              <View
                key={emoji}
                className="rounded-full border border-ui-parchment bg-ui-paper px-2.5 py-1"
              >
                <Text className="text-xs text-ui-ink">
                  {emoji} {count > 1 ? count : ""}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        <View className={`flex-row gap-2 ${isOwnMessage ? "justify-end" : "justify-start"}`}>
          <Pressable
            onPress={() => {
              triggerSelectionHaptic();
              onReply(message);
            }}
            className="min-h-11 flex-row items-center gap-1 rounded-full px-2 active:bg-ui-forest/5"
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Reply to message"
          >
            <Icon name="Reply" size={13} color={COLORS.slate} />
            <Text className="text-xs font-medium text-ui-slate">Reply</Text>
          </Pressable>
          {isOwnMessage && type === "text" && message._id ? (
            <Pressable
              onPress={() => {
                triggerSelectionHaptic();
                onStartEdit(message);
              }}
              className="min-h-11 flex-row items-center gap-1 rounded-full px-2 active:bg-ui-forest/5"
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Edit message"
            >
              <Icon name="Pencil" size={13} color={COLORS.slate} />
              <Text className="text-xs font-medium text-ui-slate">Edit</Text>
            </Pressable>
          ) : null}
        </View>

        <View
          className={`mt-1 flex-row items-center ${isOwnMessage ? "justify-end" : "justify-start"}`}
        >
          <Text className="text-xs text-ui-slate">
            {CHAT_TIME_FORMATTER.format(new Date(message.timestamp))}
            {message.editedAt ? " (edited)" : ""}
          </Text>
          {isOwnMessage ? (
            <View className="ml-1">
              <Icon
                name="CheckCheck"
                size={12}
                color={isRead ? COLORS.forest : COLORS.slate}
              />
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
});
