import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  triggerLightImpactHaptic,
  triggerSelectionHaptic,
} from "@/src/utils/haptics";
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
      <Text className="p-4 text-center text-sm text-ui-shade">
        The chat has ended by{" "}
        {roomData?.endedBy === userId ? "you" : "the other user"}. You can no
        longer send messages.
      </Text>
    );
  }

  return (
    <View className="p-2 w-full bg-ui-light border border-ui-shade/10 rounded-2xl">
      {replyingTo ? (
        <View className="flex-row items-center justify-between rounded-xl px-3 py-2 bg-ui-highlight/5 mb-2">
          <Text className="text-xs text-ui-shade">
            Replying:{" "}
            {replyingTo.messageType === "image"
              ? "Photo"
              : replyingTo.messageType === "audio"
                ? "Voice note"
              : replyingTo.message || "Message"}
          </Text>
          <TouchableOpacity
            onPress={() => {
              triggerSelectionHaptic();
              onCancelReply();
            }}
            className="min-h-11 justify-center"
            hitSlop={8}
          >
            <Text className="text-xs text-ui-shade/70">Cancel</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {isEditing ? (
        <View className="flex-row items-center justify-between rounded-xl px-3 py-2 bg-ui-highlight/5 mb-2">
          <Text className="text-xs text-ui-shade">Editing message</Text>
          <TouchableOpacity
            onPress={() => {
              triggerSelectionHaptic();
              onCancelEdit();
            }}
            className="min-h-11 justify-center"
            hitSlop={8}
          >
            <Text className="text-xs text-ui-shade/70">Cancel</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {isRecordingVoice ? (
        <View className="mb-2 flex-row items-center gap-3 rounded-full bg-ui-highlight px-3 py-2">
          <TouchableOpacity
            onPress={() => {
              triggerSelectionHaptic();
              onCancelVoiceRecording();
            }}
            className="min-h-11 justify-center"
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Cancel voice recording"
          >
            <View className="h-10 w-10 items-center justify-center rounded-full bg-white">
              <Ionicons name="trash-outline" size={20} color="#541388" />
            </View>
          </TouchableOpacity>
          <View className="flex-1">
            <AudioWaveform
              samples={recordingWaveform}
              seed={`recording-${recordingDurationMs}`}
              barCount={42}
              height={38}
              barWidth={3}
              gap={4}
              activeColor="#FFFFFF"
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
          <ActivityIndicator size="small" color="#541388" />
          <Text className="text-xs text-ui-shade">
            Uploading voice note...
          </Text>
        </View>
      ) : null}

      <View className="bg-white border border-gray-200 w-full flex-row items-center gap-3 rounded-full px-3 py-2">
        <TouchableOpacity
          className={`h-11 w-11 items-center justify-center rounded-full border border-ui-shade/20 ${
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
          <Ionicons name="add-circle-outline" size={20} color="#667085" />
        </TouchableOpacity>

        <TextInput
          className="min-h-11 flex-1 py-2 text-base"
          placeholder={
            isRecordingVoice
              ? "Recording voice note..."
              : isEditing
                ? "Edit your message"
                : "Say Hi"
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
          <TouchableOpacity
            className="h-11 w-11"
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
                isRecordingVoice ? "bg-red-500" : "bg-ui-highlight/10"
              }`}
            >
              <Ionicons
                name={isRecordingVoice ? "stop" : "mic-outline"}
                size={18}
                color={isRecordingVoice ? "white" : "#541388"}
              />
            </View>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          className="h-11 w-11"
          onPress={handleSend}
          disabled={!canSend}
          hitSlop={4}
          accessibilityRole="button"
          accessibilityLabel={
            isEditing ? "Save edited message" : "Send message"
          }
          accessibilityState={{ disabled: !canSend }}
        >
          <View className="h-11 w-11 rounded-full items-center justify-center bg-ui-highlight">
            <Ionicons name="paper-plane" size={16} color="white" />
          </View>
        </TouchableOpacity>
      </View>

      {pendingImage ? (
        <View className="rounded-xl border border-ui-shade/15 p-2 mt-2">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-xs text-ui-shade">
              {pendingImage.uploading ? "Uploading..." : ""}
            </Text>
            <TouchableOpacity
              onPress={() => {
                triggerSelectionHaptic();
                onDiscardSelectedImage();
              }}
              className="min-h-11 justify-center"
              hitSlop={8}
            >
              <Text className="text-xs text-ui-shade/80">Remove</Text>
            </TouchableOpacity>
          </View>

          <View className="relative w-36 h-36">
            <Image
              source={{ uri: pendingImage.previewUrl }}
              className="w-36 h-36 rounded-lg"
              resizeMode="cover"
            />
            {pendingImage.uploading ? (
              <View className="absolute inset-0 rounded-lg bg-black/30 items-center justify-center">
                <ActivityIndicator size="small" color="#FFFFFF" />
              </View>
            ) : null}
          </View>
        </View>
      ) : null}

      {uploadError ? (
        <View className="mt-2 flex-row items-center gap-3 rounded-md bg-red-50 px-3 py-2">
          <Text className="flex-1 text-xs leading-4 text-red-600">
            {uploadError}
          </Text>
          <TouchableOpacity
            onPress={() => {
              triggerSelectionHaptic();
              onDismissUploadError();
            }}
            className="min-h-8 justify-center px-2"
            hitSlop={8}
          >
            <Text className="text-xs font-medium text-ui-shade/70">
              Dismiss
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
});

export default ChatInput;
