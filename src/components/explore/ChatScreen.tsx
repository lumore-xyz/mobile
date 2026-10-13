import type { Message } from "@/src/domain/chat/types";
import toChatReplyPreview from "@/src/domain/chat/toChatReplyPreview";
import { IMAGE_UNLOCK_REQUIRED_MESSAGE } from "@/src/features/chat/constants";
import useChatDraft from "@/src/hooks/chat/useChatDraft";
import useChatImageUpload from "@/src/hooks/chat/useChatImageUpload";
import useChatMessageSending from "@/src/hooks/chat/useChatMessageSending";
import useChatRoomConnection from "@/src/hooks/chat/useChatRoomConnection";
import useChatTyping from "@/src/hooks/chat/useChatTyping";
import useVoiceMessageSending from "@/src/hooks/chat/useVoiceMessageSending";
import useVoiceRecorder from "@/src/hooks/chat/useVoiceRecorder";
import { useChat } from "@/src/service/context/ChatContext";
import { useSocket } from "@/src/service/context/SocketContext";
import { getUser } from "@/src/service/storage";
import { socketDebug, socketWarn } from "@/src/service/socket-debug";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ChatHeader from "./ChatHeader";
import ChatInput from "./ChatInput";
import { ChatMessages } from "./ChatMessages";
import ChatScreenSkeleton from "./ChatScreenSkeleton";

const DEFAULT_HEART_EMOJI = "\u2764\uFE0F";

export const ChatScreen = () => {
  const insets = useSafeAreaInsets();
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(Keyboard.isVisible());
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (Platform.OS !== "android") return;

    const showSubscription = Keyboard.addListener("keyboardDidShow", () =>
      setIsKeyboardVisible(true),
    );
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () =>
      setIsKeyboardVisible(false),
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);
  const userId = useMemo(() => {
    try {
      return getUser()?._id || "";
    } catch (error) {
      console.error("[ChatScreen] Error parsing user:", error);
      return "";
    }
  }, []);
  const { socket, revalidateSocket } = useSocket();
  const {
    roomId,
    roomData,
    matchedUser,
    cancelChat,
    messages,
    setMessages,
    isLoading,
    isActive,
  } = useChat();
  const [newMessage, setNewMessage] = useChatDraft(roomId);
  const isConnected = useChatRoomConnection(socket, roomId, revalidateSocket);
  const isPartnerTyping = useChatTyping(
    socket,
    roomId,
    matchedUser?._id,
    isActive,
    newMessage,
  );
  const canShareImages = Boolean(matchedUser?.isViewerUnlockedByUser);
  const voiceRecorder = useVoiceRecorder(setUploadError, roomId);
  const {
    isRecording: isRecordingVoice,
    recordingDurationMs,
    waveform: recordingWaveform,
  } = voiceRecorder;
  const {
    pendingImage,
    isUploadingImage,
    handleImageSelect,
    handleDiscardSelectedImage,
    clearPendingImage,
  } = useChatImageUpload({
    roomId,
    matchedUserId: matchedUser?._id,
    isActive,
    canShareImages,
    onUploadError: setUploadError,
  });

  useEffect(() => {
    if (canShareImages && uploadError === IMAGE_UNLOCK_REQUIRED_MESSAGE) {
      setUploadError(null);
    }
  }, [canShareImages, uploadError]);

  const matchNoteText = useMemo(() => {
    const note = roomData?.matchingNote;
    if (!note) return "";
    if (typeof note === "string") return note.trim();

    const perUser = note.notesByUser?.[userId];
    if (typeof perUser === "string" && perUser.trim()) return perUser.trim();
    return String(note.oneSentenceNote || "").trim();
  }, [roomData?.matchingNote, userId]);
  const replyingToPreview = useMemo(
    () => toChatReplyPreview(replyingTo),
    [replyingTo],
  );
  const sendMessage = useChatMessageSending({
    socket,
    roomId,
    matchedUserId: matchedUser?._id,
    userId,
    isActive,
    text: newMessage,
    setText: setNewMessage,
    editingMessageId,
    setEditingMessageId,
    pendingImage,
    canShareImages,
    replyTo: replyingToPreview,
    setReplyingTo,
    setUploadError,
    setMessages,
    clearPendingImage,
  });
  const {
    isUploadingVoice,
    handleStartVoiceRecording,
    handleCancelVoiceRecording,
    handleStopVoiceRecording,
  } = useVoiceMessageSending({
    socket,
    roomId,
    matchedUserId: matchedUser?._id,
    isActive,
    userId,
    text: newMessage,
    editingMessageId,
    pendingImage,
    replyTo: replyingToPreview,
    setReplyingTo,
    setUploadError,
    setMessages,
    recorder: voiceRecorder,
  });

  const handleToggleLike = useCallback(
    (messageId: string, emoji = DEFAULT_HEART_EMOJI) => {
      if (!socket || !roomId || !messageId) {
        socketWarn("ChatScreen", "toggle_message_reaction blocked", {
          hasSocket: Boolean(socket),
          roomId: roomId ?? null,
          messageId: messageId || null,
        });
        return;
      }
      socketDebug("ChatScreen", "emit toggle_message_reaction", {
        roomId,
        messageId,
        emoji,
        socketId: socket.id,
      });
      socket.emit("toggle_message_reaction", {
        roomId,
        messageId,
        emoji,
      });
    },
    [roomId, socket],
  );

  const handleReply = useCallback((message: Message) => {
    setReplyingTo(message);
    setEditingMessageId(null);
  }, []);

  const handleStartEdit = useCallback(
    (message: Message) => {
      if (!message._id || message.sender !== userId || message.messageType !== "text") {
        return;
      }
      setEditingMessageId(message._id);
      setReplyingTo(null);
      setNewMessage(message.message);
    },
    [setNewMessage, userId],
  );

  const cancelReply = useCallback(() => setReplyingTo(null), []);
  const cancelEdit = useCallback(() => {
    setEditingMessageId(null);
    setNewMessage("");
  }, [setNewMessage]);
  const dismissUploadError = useCallback(() => setUploadError(null), []);

  if (!matchedUser || isLoading) {
    return <ChatScreenSkeleton />;
  }

  return (
    <KeyboardAvoidingView
      behavior={isKeyboardVisible ? "height" : undefined}
      keyboardVerticalOffset={Platform.OS === "android" ? insets.top : 0}
      style={{ flex: 1 }}
    >
      <View className="bg-ui-surface-page" style={{ flex: 1 }}>
        <ChatHeader
          user={matchedUser}
          onEndChat={cancelChat}
          currentUserId={userId}
        />
        <ChatMessages
          messages={messages}
          currentUserId={userId}
          matchNote={matchNoteText}
          matchCreatedAt={roomData?.createdAt || null}
          isPartnerTyping={isPartnerTyping}
          onReply={handleReply}
          onStartEdit={handleStartEdit}
          onToggleLike={handleToggleLike}
        />
        <ChatInput
          value={newMessage}
          onChangeText={setNewMessage}
          onSend={sendMessage}
          onImageSelect={handleImageSelect}
          onDiscardSelectedImage={handleDiscardSelectedImage}
          canShareImages={canShareImages}
          isConnected={isConnected}
          isActive={isActive}
          roomData={roomData}
          userId={userId}
          isUploadingImage={isUploadingImage}
          isUploadingVoice={isUploadingVoice}
          isRecordingVoice={isRecordingVoice}
          recordingDurationMs={recordingDurationMs}
          recordingWaveform={recordingWaveform}
          replyingTo={replyingToPreview}
          onCancelReply={cancelReply}
          isEditing={Boolean(editingMessageId)}
          onCancelEdit={cancelEdit}
          pendingImage={pendingImage}
          uploadError={uploadError}
          onDismissUploadError={dismissUploadError}
          onStartVoiceRecording={handleStartVoiceRecording}
          onStopVoiceRecording={handleStopVoiceRecording}
          onCancelVoiceRecording={handleCancelVoiceRecording}
        />
      </View>
    </KeyboardAvoidingView>
  );
};
