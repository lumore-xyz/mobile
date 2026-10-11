import type {
  ChatReplyPreview,
  ChatRoom,
  PendingChatImage,
} from "@/src/domain/chat/types";
import getChatMessageTypeLabel from "@/src/domain/chat/getChatMessageTypeLabel";
import { COLORS } from "@/src/libs/constants/theme";
import Icon from "@/src/libs/Icon";
import {
  triggerLightImpactHaptic,
  triggerSelectionHaptic,
} from "@/src/utils/haptics";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import ChatComposerNotice from "./ChatComposerNotice";
import ChatUploadErrorNotice from "./ChatUploadErrorNotice";
import PendingChatImagePreview from "./PendingChatImagePreview";
import VoiceRecordingControls from "./VoiceRecordingControls";

interface ChatInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onImageSelect: () => void;
  onDiscardSelectedImage: () => void;
  canShareImages: boolean;
  isConnected: boolean;
  isActive: boolean;
  roomData: ChatRoom | undefined;
  userId: string;
  isUploadingImage: boolean;
  isUploadingVoice: boolean;
  isRecordingVoice: boolean;
  recordingDurationMs: number;
  recordingWaveform: number[];
  replyingTo: ChatReplyPreview | null;
  onCancelReply: () => void;
  isEditing: boolean;
  onCancelEdit: () => void;
  pendingImage: PendingChatImage | null;
  uploadError?: string | null;
  onDismissUploadError: () => void;
  onStartVoiceRecording: () => void;
  onStopVoiceRecording: () => void;
  onCancelVoiceRecording: () => void;
}

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
      <View className="border-t border-ui-parchment bg-ui-paper px-4 py-4">
        <View className="flex-row items-center justify-center gap-2 rounded-full bg-ui-forest/5 px-4 py-3">
          <Icon name="MessageCircleOff" size={18} color={COLORS.slate} />
          <Text className="flex-1 text-center text-sm leading-5 text-ui-slate">
            {roomData?.endedBy === userId
              ? "You ended this chat. Your conversation is still available to read."
              : "This chat has ended. Your conversation is still available to read."}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="w-full border-t border-ui-parchment bg-ui-paper px-3 pb-3 pt-2">
      {replyingTo ? (
        <ChatComposerNotice
          message={`Replying: ${
            getChatMessageTypeLabel(replyingTo.messageType) ||
            replyingTo.message ||
            "Message"
          }`}
          cancelLabel="Cancel"
          accessibilityLabel="Cancel reply"
          onCancel={onCancelReply}
        />
      ) : null}

      {isEditing ? (
        <ChatComposerNotice
          message="Editing message"
          cancelLabel="Cancel"
          accessibilityLabel="Cancel message editing"
          onCancel={onCancelEdit}
        />
      ) : null}

      {isRecordingVoice ? (
        <VoiceRecordingControls
          durationMs={recordingDurationMs}
          waveform={recordingWaveform}
          onCancel={onCancelVoiceRecording}
        />
      ) : null}

      {isUploadingVoice ? (
        <View className="mb-2 flex-row items-center gap-2 rounded-xl bg-ui-forest/5 px-3 py-2">
          <ActivityIndicator size="small" color={COLORS.forest} />
          <Text className="text-xs text-ui-ink">Uploading voice note...</Text>
        </View>
      ) : null}

      <View className="w-full flex-row items-center gap-2 rounded-[24px] border border-ui-parchment bg-ui-surface-page px-2 py-1.5">
        <Pressable
          className={`h-11 w-11 items-center justify-center rounded-full active:bg-ui-forest/10 ${
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
          <Icon name="ImagePlus" size={20} color={COLORS.slate} />
        </Pressable>

        <TextInput
          className="min-h-11 flex-1 py-2 text-base leading-5 text-ui-ink"
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
          onSubmitEditing={handleSend}
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
              className={`h-11 w-11 items-center justify-center rounded-full ${
                isRecordingVoice ? "bg-ui-danger" : "bg-ui-forest/10"
              }`}
            >
              <Icon
                name={isRecordingVoice ? "Square" : "Mic"}
                size={18}
                color={isRecordingVoice ? COLORS.paper : COLORS.forest}
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
          accessibilityLabel={isEditing ? "Save edited message" : "Send message"}
          accessibilityState={{ disabled: !canSend }}
        >
          <View className="h-11 w-11 items-center justify-center rounded-full bg-ui-forest">
            <Icon name="Send" size={16} color={COLORS.paper} />
          </View>
        </Pressable>
      </View>

      {pendingImage ? (
        <PendingChatImagePreview
          image={pendingImage}
          onRemove={onDiscardSelectedImage}
        />
      ) : null}

      {uploadError ? (
        <ChatUploadErrorNotice
          message={uploadError}
          onDismiss={onDismissUploadError}
        />
      ) : null}
    </View>
  );
});

export default ChatInput;
