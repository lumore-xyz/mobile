import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, Image, Text, TextInput, TouchableOpacity, View } from "react-native";

interface ReplyingToPreview {
  _id: string;
  senderId: string;
  messageType: "text" | "image";
  message: string;
  imageUrl?: string | null;
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
  isConnected: boolean;
  isActive: boolean;
  roomData: any;
  userId: string;
  isUploadingImage: boolean;
  replyingTo: ReplyingToPreview | null;
  onCancelReply: () => void;
  isEditing: boolean;
  onCancelEdit: () => void;
  pendingImage: PendingImage | null;
  uploadError?: string | null;
  onDismissUploadError: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChangeText,
  onSend,
  onImageSelect,
  onDiscardSelectedImage,
  isConnected,
  isActive,
  roomData,
  userId,
  isUploadingImage,
  replyingTo,
  onCancelReply,
  isEditing,
  onCancelEdit,
  pendingImage,
  uploadError,
  onDismissUploadError,
}) => {
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
              : replyingTo.message || "Message"}
          </Text>
          <TouchableOpacity onPress={onCancelReply}>
            <Text className="text-xs text-ui-shade/70">Cancel</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {isEditing ? (
        <View className="flex-row items-center justify-between rounded-xl px-3 py-2 bg-ui-highlight/5 mb-2">
          <Text className="text-xs text-ui-shade">Editing message</Text>
          <TouchableOpacity onPress={onCancelEdit}>
            <Text className="text-xs text-ui-shade/70">Cancel</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <View className="bg-white border border-gray-200 w-full flex-row items-center gap-3 rounded-full px-3 py-2">
        <TouchableOpacity
          className="h-9 w-9 items-center justify-center rounded-full border border-ui-shade/20"
          onPress={onImageSelect}
          disabled={!isConnected || !isActive || isUploadingImage}
        >
          <Ionicons name="add-circle-outline" size={20} color="#667085" />
        </TouchableOpacity>

        <TextInput
          className="flex-1 py-3"
          placeholder={isEditing ? "Edit your message" : "Say Hi"}
          value={value}
          onChangeText={onChangeText}
          editable={isActive}
          returnKeyType="send"
          onSubmitEditing={() => {
            if (isActive) onSend();
          }}
        />

        <TouchableOpacity
          className="h-10 w-10"
          onPress={onSend}
          disabled={
            !isConnected ||
            !isActive ||
            (isUploadingImage && (!pendingImage || pendingImage.uploading)) ||
            (!value.trim() &&
              !isEditing &&
              (!pendingImage || pendingImage.uploading))
          }
        >
          <View className="h-10 w-10 rounded-full items-center justify-center bg-ui-highlight">
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
            <TouchableOpacity onPress={onDiscardSelectedImage}>
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
        <View className="flex-row items-start justify-between gap-2 px-1 mt-2">
          <Text className="text-xs text-red-500 flex-1">{uploadError}</Text>
          <TouchableOpacity onPress={onDismissUploadError}>
            <Text className="text-xs text-ui-shade/70">Dismiss</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
};

export default ChatInput;
