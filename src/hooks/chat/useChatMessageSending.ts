import createClientMessageId from "@/src/domain/chat/createClientMessageId";
import type { ChatReplyPreview, Message, PendingChatImage } from "@/src/domain/chat/types";
import { messageSchema } from "@/src/domain/chat/validation";
import { IMAGE_UNLOCK_REQUIRED_MESSAGE } from "@/src/features/chat/constants";
import { trackAnalytic } from "@/src/service/analytics";
import { socketDebug, socketWarn } from "@/src/service/socket-debug";
import type { Dispatch, SetStateAction } from "react";
import type { Socket } from "socket.io-client";

interface UseChatMessageSendingOptions {
  socket: Socket | null;
  roomId: string | null;
  matchedUserId?: string;
  userId: string;
  isActive: boolean;
  text: string;
  setText: (value: string) => void;
  editingMessageId: string | null;
  setEditingMessageId: (value: string | null) => void;
  pendingImage: PendingChatImage | null;
  canShareImages: boolean;
  replyTo: ChatReplyPreview | null;
  setReplyingTo: (value: Message | null) => void;
  setUploadError: (value: string | null) => void;
  setMessages: Dispatch<SetStateAction<Message[]>>;
  clearPendingImage: () => void;
}

const useChatMessageSending = ({
  socket,
  roomId,
  matchedUserId,
  userId,
  isActive,
  text,
  setText,
  editingMessageId,
  setEditingMessageId,
  pendingImage,
  canShareImages,
  replyTo,
  setReplyingTo,
  setUploadError,
  setMessages,
  clearPendingImage,
}: UseChatMessageSendingOptions) => {
  const sendMessage = async () => {
    const trimmed = text.trim();
    socketDebug("ChatScreen", "sendMessage called", {
      roomId: roomId ?? null,
      hasSocket: Boolean(socket),
      socketConnected: Boolean(socket?.connected),
      hasMatchedUser: Boolean(matchedUserId),
      isActive,
      isEditing: Boolean(editingMessageId),
      hasPendingImage: Boolean(pendingImage),
      pendingUploading: Boolean(pendingImage?.uploading),
      textLength: trimmed.length,
    });
    if (!socket || !roomId || !matchedUserId || !isActive) {
      socketWarn("ChatScreen", "sendMessage blocked", {
        hasSocket: Boolean(socket),
        roomId: roomId ?? null,
        matchedUserId: matchedUserId ?? null,
        isActive,
      });
      return;
    }
    if (pendingImage?.uploading) {
      socketWarn(
        "ChatScreen",
        "sendMessage blocked: pending image still uploading",
      );
      return;
    }
    if (!trimmed && !pendingImage) {
      socketWarn("ChatScreen", "sendMessage blocked: empty text and no image");
      return;
    }
    if (pendingImage && !canShareImages) {
      socketWarn("ChatScreen", "sendMessage blocked: image sharing locked", {
        roomId,
        matchedUserId,
      });
      setUploadError(IMAGE_UNLOCK_REQUIRED_MESSAGE);
      return;
    }

    if (trimmed) {
      const messageResult = messageSchema.safeParse(trimmed);
      if (!messageResult.success) {
        const errorMessage =
          messageResult.error.issues[0]?.message || "Invalid message.";
        socketWarn(
          "ChatScreen",
          "sendMessage blocked: message validation failed",
          { issue: errorMessage },
        );
        setUploadError(errorMessage);
        return;
      }
    }

    if (editingMessageId) {
      if (!trimmed) {
        socketWarn("ChatScreen", "edit_message blocked: empty trimmed message");
        return;
      }
      socketDebug("ChatScreen", "emit edit_message", {
        roomId,
        messageId: editingMessageId,
        textLength: trimmed.length,
      });
      socket.emit("edit_message", {
        roomId,
        messageId: editingMessageId,
        message: trimmed,
      });
      setEditingMessageId(null);
      setText("");
      return;
    }

    if (
      pendingImage &&
      !pendingImage.uploading &&
      pendingImage.imageUrl &&
      pendingImage.imagePublicId
    ) {
      const clientMessageId = createClientMessageId(userId);
      socketDebug("ChatScreen", "emit send_message (image)", {
        roomId,
        receiverId: matchedUserId,
        clientMessageId,
        replyTo: replyTo?._id || null,
      });
      socket.emit("send_message", {
        roomId,
        receiverId: matchedUserId,
        messageType: "image",
        imageUrl: pendingImage.imageUrl,
        imagePublicId: pendingImage.imagePublicId,
        replyTo: replyTo?._id || null,
        clientMessageId,
      });
      setMessages((previous) => [
        ...previous,
        {
          clientMessageId,
          sender: userId,
          message: "",
          messageType: "image",
          imageUrl: pendingImage.imageUrl,
          imagePublicId: pendingImage.imagePublicId,
          timestamp: Date.now(),
          replyTo,
          reactions: [],
          pending: true,
          deliveredAt: null,
          readAt: null,
        },
      ]);
    }

    if (trimmed) {
      const clientMessageId = createClientMessageId(userId);
      trackAnalytic({
        activity: "message_sent",
        label: "Message Sent",
        value: roomId,
      });
      socketDebug("ChatScreen", "emit send_message (text)", {
        roomId,
        receiverId: matchedUserId,
        clientMessageId,
        replyTo: replyTo?._id || null,
        textLength: trimmed.length,
      });
      socket.emit("send_message", {
        roomId,
        receiverId: matchedUserId,
        message: trimmed,
        replyTo: replyTo?._id || null,
        messageType: "text",
        clientMessageId,
      });
      setMessages((previous) => [
        ...previous,
        {
          clientMessageId,
          sender: userId,
          message: trimmed,
          messageType: "text",
          timestamp: Date.now(),
          replyTo,
          reactions: [],
          pending: true,
          deliveredAt: null,
          readAt: null,
        },
      ]);
    }

    setText("");
    setReplyingTo(null);
    clearPendingImage();
    socketDebug("ChatScreen", "sendMessage completed and local composer reset");
  };

  return sendMessage;
};

export default useChatMessageSending;
