import React from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  triggerLightImpactHaptic,
  triggerSelectionHaptic,
} from "@/src/utils/haptics";
import Icon from "@/src/libs/Icon";
import { COLORS } from "@/src/libs/constants/theme";
import { AudioWaveform } from "./AudioWaveform";

interface ReplyingToPreview {
  _id: string;
  senderId: string;
  messageType: "text" | "image" | "audio";
  message: string;
  imageUrl?: string | null;
  audioUrl?: string | null;
  audioDurationMs?: number | null;
}

interface PendingImage {
  previewUrl: string;
  imagePublicId: string | null;
  uploading: boolean;
}

interface ChatInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onImageSelect: () => void;
  onDiscardSelectedImage: () => void;
  canShareImages: boolean;
  isConnected: boolean;
  isActive: boolean;
  roomData: any;
  userId: string;
  isUploadingImage: boolean;
  isUploadingVoice: boolean;
  isRecordingVoice: boolean;
  recordingDurationMs: number;
  recordingWaveform: number[];
  replyingTo: ReplyingToPreview | null;
  onCancelReply: () => void;
  isEditing: boolean;
  onCancelEdit: () => void;
  pendingImage: PendingImage | null;
  uploadError?: string | null;
  onDismissUploadError: () => void;
  onStartVoiceRecording: () => void;
  onStopVoiceRecording: () => void;
  onCancelVoiceRecording: () => void;
}

const formatVoiceDuration = (durationMs: number) => {
  const totalSeconds = Math.max(0, Math.floor(durationMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const ChatInput = React.memo(function ChatInput({
  value,
  onChangeText,
  onSend,
  onImageSelect,
  onDiscardSelectedImage,
  canShareImages,
  isConnected,
  isActive,
  roomData,
  userId,
  isUploadingImage,
  isUploadingVoice,
  isRecordingVoice,
  recordingDurationMs,
  recordingWaveform,
  replyingTo,
  onCancelReply,
  isEditing,
  onCancelEdit,
  pendingImage,
  uploadError,
  onDismissUploadError,
  onStartVoiceRecording,
  onStopVoiceRecording,
  onCancelVoiceRecording,
}: ChatInputProps) {
  const canSend =
    isConnected &&
    isActive &&
    !isRecordingVoice &&
    !isUploadingVoice &&
    !(isUploadingImage && (!pendingImage || pendingImage.uploading)) &&
    Boolean(
      value.trim() || isEditing || (pendingImage && !pendingImage.uploading),
    );
  const canRecordVoice =
    isConnected &&
    isActive &&
    !isEditing &&
    !pendingImage &&
    !isUploadingImage &&
    !isUploadingVoice &&
    !value.trim();

  const handleImageSelect = () => {
    triggerSelectionHaptic();
    onImageSelect();
  };

  const handleSend = () => {
    if (!canSend) return;
    triggerLightImpactHaptic();
    onSend();
  };

  const handleVoicePress = () => {
    if (isRecordingVoice) {
      triggerLightImpactHaptic();
      onStopVoiceRecording();
      return;
    }
    if (!canRecordVoice) return;
    triggerSelectionHaptic();
    onStartVoiceRecording();
  };

  if (!isActive) {
    return (
      <View className="border-t border-ui-border bg-ui-light px-4 py-4">
        <View className="flex-row items-center justify-center gap-2 rounded-full bg-ui-highlight/5 px-4 py-3">
          <Icon name="MessageCircleOff" size={18} color={COLORS.muted} />
          <Text className="flex-1 text-center text-sm leading-5 text-ui-muted">
            {roomData?.endedBy === userId
              ? "You ended this chat. Your conversation is still available to read."
              : "This chat has ended. Your conversation is still available to read."}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="w-full border-t border-ui-border bg-ui-light px-3 pb-3 pt-2">
      {replyingTo ? (
        <View className="mb-2 flex-row items-center justify-between rounded-2xl bg-ui-highlight/5 px-3 py-2">
          <Text className="flex-1 text-xs leading-4 text-ui-shade" numberOfLines={2}>
            Replying:{" "}
            {replyingTo.messageType === "image"
              ? "Photo"
              : replyingTo.messageType === "audio"
                ? "Voice note"
              : replyingTo.message || "Message"}
          </Text>
          <Pressable
            onPress={() => {
              triggerSelectionHaptic();
              onCancelReply();
            }}
            className="min-h-11 justify-center rounded-full px-2 active:opacity-70"
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Cancel reply"
          >
            <Text className="text-xs font-medium text-ui-muted">Cancel</Text>
          </Pressable>
        </View>
      ) : null}

      {isEditing ? (
        <View className="mb-2 flex-row items-center justify-between rounded-2xl bg-ui-highlight/5 px-3 py-2">
          <Text className="text-xs text-ui-shade">Editing message</Text>
          <Pressable
            onPress={() => {
              triggerSelectionHaptic();
              onCancelEdit();
            }}
            className="min-h-11 justify-center rounded-full px-2 active:opacity-70"
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Cancel message editing"
          >
            <Text className="text-xs font-medium text-ui-muted">Cancel</Text>
          </Pressable>
        </View>
      ) : null}

      {isRecordingVoice ? (
        <View className="mb-2 flex-row items-center gap-3 rounded-full bg-ui-highlight px-3 py-2">
          <Pressable
            onPress={() => {
              triggerSelectionHaptic();
              onCancelVoiceRecording();
            }}
            className="min-h-11 justify-center"
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Cancel voice recording"
          >
            <View className="h-11 w-11 items-center justify-center rounded-full bg-ui-light">
              <Icon name="Trash" size={20} color={COLORS.highlight} />
            </View>
          </Pressable>
          <View className="flex-1">
            <AudioWaveform
              samples={recordingWaveform}
              seed={`recording-${recordingDurationMs}`}
              barCount={42}
              height={38}
              barWidth={3}
              gap={4}
              activeColor={COLORS.light}
              inactiveColor="rgba(255,255,255,0.9)"
            />
          </View>
          <Text className="w-12 text-right text-base text-white">
            {formatVoiceDuration(recordingDurationMs)}
          </Text>
        </View>
      ) : null}

      {isUploadingVoice ? (
        <View className="mb-2 flex-row items-center gap-2 rounded-xl bg-ui-highlight/5 px-3 py-2">
          <ActivityIndicator size="small" color={COLORS.highlight} />
          <Text className="text-xs text-ui-shade">
            Uploading voice note...
          </Text>
        </View>
      ) : null}

      <View className="w-full flex-row items-center gap-2 rounded-[28px] border border-ui-border bg-ui-surface-page px-2 py-1.5">
        <Pressable
          className={`h-11 w-11 items-center justify-center rounded-full active:bg-ui-highlight/10 ${
            canShareImages ? "" : "opacity-50"
          }`}
          onPress={handleImageSelect}
          disabled={
            !isConnected ||
            !isActive ||
            isUploadingImage ||
            isUploadingVoice ||
            isRecordingVoice
          }
          hitSlop={4}
          accessibilityRole="button"
          accessibilityLabel="Add image"
          accessibilityHint={
            canShareImages
              ? "Select an image to share in chat"
              : "Images are available after your match unlocks you"
          }
        >
          <Icon name="ImagePlus" size={20} color={COLORS.muted} />
        </Pressable>

        <TextInput
          className="min-h-11 flex-1 py-2 text-base leading-5 text-ui-shade"
          placeholder={
            isRecordingVoice
              ? "Recording voice note..."
              : isEditing
                ? "Edit your message"
                : "Write a message..."
          }
          value={value}
          onChangeText={onChangeText}
          editable={isActive && !isRecordingVoice && !isUploadingVoice}
          returnKeyType="send"
          blurOnSubmit={false}
          onSubmitEditing={() => {
            handleSend();
          }}
          accessibilityLabel="Message input"
        />

        {!isEditing ? (
          <Pressable
            className="h-11 w-11 active:opacity-75"
            onPress={handleVoicePress}
            disabled={!isRecordingVoice && !canRecordVoice}
            hitSlop={4}
            accessibilityRole="button"
            accessibilityLabel={
              isRecordingVoice ? "Stop and send voice note" : "Record voice note"
            }
            accessibilityState={{
              disabled: !isRecordingVoice && !canRecordVoice,
            }}
          >
            <View
              className={`h-11 w-11 rounded-full items-center justify-center ${
                isRecordingVoice ? "bg-ui-danger" : "bg-ui-highlight/10"
              }`}
            >
              <Icon
                name={isRecordingVoice ? "Square" : "Mic"}
                size={18}
                color={isRecordingVoice ? COLORS.light : COLORS.highlight}
              />
            </View>
          </Pressable>
        ) : null}

        <Pressable
          className={`h-11 w-11 active:opacity-75 ${canSend ? "" : "opacity-40"}`}
          onPress={handleSend}
          disabled={!canSend}
          hitSlop={4}
          accessibilityRole="button"
          accessibilityLabel={
            isEditing ? "Save edited message" : "Send message"
          }
          accessibilityState={{ disabled: !canSend }}
        >
          <View className="h-11 w-11 items-center justify-center rounded-full bg-ui-highlight">
            <Icon name="Send" size={16} color={COLORS.light} />
          </View>
        </Pressable>
      </View>

      {pendingImage ? (
        <View className="mt-2 rounded-[24px] border border-ui-border bg-ui-surface-page p-3">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-xs text-ui-shade">
              {pendingImage.uploading ? "Uploading..." : ""}
            </Text>
            <Pressable
              onPress={() => {
                triggerSelectionHaptic();
                onDiscardSelectedImage();
              }}
              className="min-h-11 justify-center rounded-full px-2 active:opacity-70"
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Remove selected image"
            >
              <Text className="text-xs font-medium text-ui-muted">Remove</Text>
            </Pressable>
          </View>

          <View className="relative w-36 h-36">
            <Image
              source={{ uri: pendingImage.previewUrl }}
              className="h-36 w-36 rounded-2xl"
              resizeMode="cover"
            />
            {pendingImage.uploading ? (
              <View className="absolute inset-0 items-center justify-center rounded-2xl bg-black/40">
                <ActivityIndicator size="small" color={COLORS.light} />
              </View>
            ) : null}
          </View>
        </View>
      ) : null}

      {uploadError ? (
        <View className="mt-2 flex-row items-center gap-3 rounded-2xl bg-red-50 px-3 py-2" accessibilityLiveRegion="assertive">
          <Icon name="CircleAlert" size={18} color={COLORS.danger} />
          <Text className="flex-1 text-xs leading-4 text-red-600">
            {uploadError}
          </Text>
          <Pressable
            onPress={() => {
              triggerSelectionHaptic();
              onDismissUploadError();
            }}
            className="min-h-11 justify-center rounded-full px-2 active:opacity-70"
            hitSlop={8}
          >
            <Text className="text-xs font-medium text-ui-shade/70">
              Dismiss
            </Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
});

export default ChatInput;
