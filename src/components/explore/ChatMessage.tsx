import type { Message } from "@/src/domain/chat/types";
import { getExpoAudioModule } from "@/src/libs/audio";
import {
  triggerLightImpactHaptic,
  triggerSelectionHaptic,
} from "@/src/utils/haptics";
import Icon from "@/src/libs/Icon";
import { COLORS } from "@/src/libs/constants/theme";
import React, { useMemo, useRef } from "react";
import {
  Image,
  Linking,
  Pressable,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { AudioWaveform } from "./AudioWaveform";

interface ChatMessageProps {
  message: Message;
  isOwnMessage: boolean;
  onReply: (message: Message) => void;
  onStartEdit: (message: Message) => void;
  onToggleLike: (messageId: string, emoji?: string) => void;
}

const URL_SPLIT_REGEX = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/gi;
const URL_TEST_REGEX = /^(https?:\/\/[^\s]+|www\.[^\s]+)$/i;

const formatAudioDuration = (durationMs: number, fallbackSeconds = 0) => {
  const totalSeconds = Math.max(
    0,
    Math.floor(durationMs > 0 ? durationMs / 1000 : fallbackSeconds),
  );
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

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
                ? "rounded-[22px] rounded-br-md bg-ui-highlight"
                : "rounded-[22px] rounded-bl-md border border-ui-border bg-ui-light"
            }`}
          >
            {message.replyTo ? (
              <View
                className={`mb-2 flex-row items-center gap-2 rounded-xl border-l-2 px-3 py-2 ${
                  isOwnMessage
                    ? "border-ui-light/70 bg-ui-light/10"
                    : "border-ui-highlight bg-ui-highlight/5"
                }`}
              >
                <Icon
                  name="Reply"
                  size={12}
                  color={isOwnMessage ? COLORS.light : COLORS.highlight}
                />
                <Text
                  className={`text-xs ${
                    isOwnMessage ? "text-ui-light/90" : "text-ui-shade"
                  }`}
                >
                  {message.replyTo.messageType === "image"
                    ? "Photo"
                    : message.replyTo.messageType === "audio"
                      ? "Voice note"
                      : message.replyTo.message || "Message"}
                </Text>
              </View>
            ) : null}

            {type === "image" && message.imageUrl ? (
              <Image
                source={{ uri: message.imageUrl }}
                className="h-56 w-56 rounded-2xl"
                resizeMode="cover"
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
                className="rounded-full border border-ui-border bg-ui-light px-2.5 py-1"
              >
                <Text className="text-xs text-ui-shade">
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
            className="min-h-11 flex-row items-center gap-1 rounded-full px-2 active:bg-ui-highlight/5"
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Reply to message"
          >
            <Icon name="Reply" size={13} color={COLORS.muted} />
            <Text className="text-xs font-medium text-ui-muted">Reply</Text>
          </Pressable>
          {isOwnMessage && type === "text" && message._id ? (
            <Pressable
              onPress={() => {
                triggerSelectionHaptic();
                onStartEdit(message);
              }}
              className="min-h-11 flex-row items-center gap-1 rounded-full px-2 active:bg-ui-highlight/5"
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Edit message"
            >
              <Icon name="Pencil" size={13} color={COLORS.muted} />
              <Text className="text-xs font-medium text-ui-muted">Edit</Text>
            </Pressable>
          ) : null}
        </View>

        <View
          className={`mt-1 flex-row items-center ${isOwnMessage ? "justify-end" : "justify-start"}`}
        >
          <Text className="text-xs text-ui-muted">
            {new Date(message.timestamp).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}
            {message.editedAt ? " (edited)" : ""}
          </Text>
          {isOwnMessage ? (
            <View className="ml-1">
              <Icon
                name="CheckCheck"
                size={12}
                color={isRead ? COLORS.highlight : COLORS.muted}
              />
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
});

const VoiceNotePlayer = React.memo(function VoiceNotePlayer({
  audioUrl,
  durationMs,
  waveform,
  isOwnMessage,
}: {
  audioUrl: string;
  durationMs: number;
  waveform?: number[] | null;
  isOwnMessage: boolean;
}) {
  const expoAudio = useMemo(() => getExpoAudioModule(), []);

  if (!expoAudio) {
    return (
      <View className="w-60">
        <View className="flex-row items-center gap-3">
          <View
            className={`h-10 w-10 items-center justify-center rounded-full ${
              isOwnMessage ? "bg-white/20" : "bg-ui-highlight/10"
            }`}
          >
            <Icon
              name="Mic"
              size={18}
              color={isOwnMessage ? COLORS.light : COLORS.highlight}
            />
          </View>
          <View className="flex-1">
            <AudioWaveform
              samples={waveform}
              seed={audioUrl}
              height={34}
              barCount={28}
              barWidth={3}
              gap={4}
              activeColor={isOwnMessage ? COLORS.light : COLORS.highlight}
              inactiveColor={
                isOwnMessage ? "rgba(255,255,255,0.45)" : "rgba(84,19,136,0.25)"
              }
            />
          </View>
          <Text
            className={`text-xs ${
              isOwnMessage ? "text-ui-light/80" : "text-ui-shade/70"
            }`}
          >
            {formatAudioDuration(durationMs)}
          </Text>
        </View>
        <Text
          className={`mt-2 text-xs ${
            isOwnMessage ? "text-ui-light/80" : "text-ui-shade/70"
          }`}
        >
          Update app to play
        </Text>
      </View>
    );
  }

  return (
    <VoiceNotePlayerWithAudio
      audioUrl={audioUrl}
      durationMs={durationMs}
      waveform={waveform}
      isOwnMessage={isOwnMessage}
      expoAudio={expoAudio}
    />
  );
});

const VoiceNotePlayerWithAudio = React.memo(function VoiceNotePlayerWithAudio({
  audioUrl,
  durationMs,
  waveform,
  isOwnMessage,
  expoAudio,
}: {
  audioUrl: string;
  durationMs: number;
  waveform?: number[] | null;
  isOwnMessage: boolean;
  expoAudio: NonNullable<ReturnType<typeof getExpoAudioModule>>;
}) {
  const player = expoAudio.useAudioPlayer(audioUrl, { updateInterval: 250 });
  const status = expoAudio.useAudioPlayerStatus(player);
  const durationSeconds =
    status.duration > 0 ? status.duration : Math.max(0, durationMs / 1000);
  const currentSeconds = Math.min(
    status.currentTime || 0,
    durationSeconds || status.currentTime || 0,
  );
  const progress =
    durationSeconds > 0
      ? Math.min(1, Math.max(0, currentSeconds / durationSeconds))
      : 0;

  const togglePlayback = () => {
    triggerSelectionHaptic();
    if (status.playing) {
      player.pause();
      return;
    }

    if (
      status.didJustFinish ||
      (durationSeconds > 0 && currentSeconds >= durationSeconds - 0.2)
    ) {
      void player
        .seekTo(0)
        .then(() => player.play())
        .catch(() => player.play());
      return;
    }

    player.play();
  };

  return (
    <View className="w-60 pe-4">
      <View className="flex-row items-center gap-3">
        <Pressable
          onPress={togglePlayback}
          className={`h-11 w-11 items-center justify-center rounded-full active:opacity-75 ${
            isOwnMessage ? "bg-white/20" : "bg-ui-highlight"
          }`}
          accessibilityRole="button"
          accessibilityLabel={
            status.playing ? "Pause voice note" : "Play voice note"
          }
        >
          <Icon
            name={status.playing ? "Pause" : "Play"}
            size={18}
            color="white"
          />
        </Pressable>

        <View className="flex-1">
          <AudioWaveform
            samples={waveform}
            progress={progress}
            seed={audioUrl}
            height={42}
            barCount={23}
            barWidth={3}
            gap={4}
            activeColor={isOwnMessage ? COLORS.light : COLORS.highlight}
            inactiveColor={
              isOwnMessage ? "rgba(255,255,255,0.42)" : "rgba(84,19,136,0.26)"
            }
          />
        </View>
      </View>
      <Text
        className={`mt-2 text-xs ${
          isOwnMessage ? "text-ui-light/85" : "text-ui-shade/70"
        }`}
      >
        {formatAudioDuration(durationMs, durationSeconds)}
      </Text>
    </View>
  );
});

const LinkifyText = React.memo(function LinkifyText({
  text,
  isOwnMessage,
}: {
  text: string;
  isOwnMessage: boolean;
}) {
  const parts = useMemo(() => text.split(URL_SPLIT_REGEX), [text]);

  return (
    <Text className={`text-base leading-6 ${isOwnMessage ? "text-ui-light" : "text-ui-shade"}`}>
      {parts.map((part, index) => {
        if (!part) return null;
        if (URL_TEST_REGEX.test(part)) {
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
});
