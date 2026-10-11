import createClientMessageId from "@/src/domain/chat/createClientMessageId";
import type { ChatReplyPreview, Message, PendingChatImage } from "@/src/domain/chat/types";
import { uploadChatAudio } from "@/src/features/chat/api";
import useVoiceRecorder from "@/src/hooks/chat/useVoiceRecorder";
import { trackAnalytic } from "@/src/service/analytics";
import { socketDebug, socketError, socketWarn } from "@/src/service/socket-debug";
import getHttpErrorStatus from "@/src/utils/getHttpErrorStatus";
import { toUserFacingError } from "@/src/utils/userFacingError";
import { useCallback, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { Socket } from "socket.io-client";

type VoiceRecorder = ReturnType<typeof useVoiceRecorder>;

interface UseVoiceMessageSendingOptions {
  socket: Socket | null;
  roomId: string | null;
  matchedUserId?: string;
  isActive: boolean;
  userId: string;
  text: string;
  editingMessageId: string | null;
  pendingImage: PendingChatImage | null;
  replyTo: ChatReplyPreview | null;
  setReplyingTo: (message: Message | null) => void;
  setUploadError: (error: string | null) => void;
  setMessages: Dispatch<SetStateAction<Message[]>>;
  recorder: Pick<
    VoiceRecorder,
    | "startRecording"
    | "cancelRecording"
    | "finishRecording"
    | "stopRecording"
    | "resetWaveform"
  >;
}

const useVoiceMessageSending = ({
  socket,
  roomId,
  matchedUserId,
  isActive,
  userId,
  text,
  editingMessageId,
  pendingImage,
  replyTo,
  setReplyingTo,
  setUploadError,
  setMessages,
  recorder,
}: UseVoiceMessageSendingOptions) => {
  const [isUploadingVoice, setIsUploadingVoice] = useState(false);
  const {
    startRecording,
    cancelRecording,
    finishRecording,
    stopRecording,
    resetWaveform,
  } = recorder;

  const handleStartVoiceRecording = useCallback(async () => {
    socketDebug("ChatScreen", "handleStartVoiceRecording called", {
      roomId: roomId ?? null,
      isActive,
      hasSocket: Boolean(socket),
      socketConnected: Boolean(socket?.connected),
    });
    if (!socket || !roomId || !matchedUserId || !isActive) {
      socketWarn("ChatScreen", "voice recording blocked", {
        hasSocket: Boolean(socket),
        roomId: roomId ?? null,
        matchedUserId: matchedUserId ?? null,
        isActive,
      });
      return;
    }
    if (editingMessageId || pendingImage || text.trim()) {
      socketWarn("ChatScreen", "voice recording blocked: composer busy");
      return;
    }

    await startRecording();
  }, [editingMessageId, isActive, matchedUserId, pendingImage, roomId, socket, startRecording, text]);

  const handleCancelVoiceRecording = useCallback(async () => {
    socketDebug("ChatScreen", "voice recording cancel requested", {
      roomId: roomId ?? null,
    });
    await cancelRecording();
  }, [cancelRecording, roomId]);

  const handleStopVoiceRecording = useCallback(async () => {
    socketDebug("ChatScreen", "handleStopVoiceRecording called", {
      roomId: roomId ?? null,
    });
    if (!socket || !roomId || !matchedUserId || !isActive) {
      await stopRecording();
      socketWarn("ChatScreen", "voice send blocked", {
        hasSocket: Boolean(socket),
        roomId: roomId ?? null,
        matchedUserId: matchedUserId ?? null,
        isActive,
      });
      return;
    }

    try {
      const recording = await finishRecording();
      if (!recording) return;
      setIsUploadingVoice(true);
      const uploaded = await uploadChatAudio(
        roomId,
        recording.uri,
        recording.durationMs,
      );
      const clientMessageId = createClientMessageId(userId);
      const durationMs = uploaded.audioDurationMs || recording.durationMs;

      socketDebug("ChatScreen", "emit send_message (audio)", {
        roomId,
        receiverId: matchedUserId,
        clientMessageId,
        replyTo: replyTo?._id || null,
        durationMs,
      });
      socket.emit("send_message", {
        roomId,
        receiverId: matchedUserId,
        messageType: "audio",
        audioUrl: uploaded.audioUrl,
        audioPublicId: uploaded.audioPublicId,
        audioDurationMs: durationMs,
        audioWaveform: recording.waveform,
        replyTo: replyTo?._id || null,
        clientMessageId,
      });

      setMessages((previous) => [
        ...previous,
        {
          clientMessageId,
          sender: userId,
          message: "",
          messageType: "audio",
          audioUrl: uploaded.audioUrl,
          audioPublicId: uploaded.audioPublicId,
          audioDurationMs: durationMs,
          audioWaveform: recording.waveform,
          timestamp: Date.now(),
          replyTo,
          reactions: [],
          pending: true,
          deliveredAt: null,
          readAt: null,
        },
      ]);
      trackAnalytic({
        activity: "voice_note_sent",
        label: "Voice Note Sent",
        value: roomId,
      });
      setReplyingTo(null);
      socketDebug("ChatScreen", "voice note send completed");
    } catch (error: unknown) {
      const status = getHttpErrorStatus(error);
      setUploadError(
        toUserFacingError(
          error,
          "We couldn’t send that voice note. Please try again.",
        ),
      );
      socketError("ChatScreen", "voice note upload/send failed", {
        roomId,
        status,
        message: error instanceof Error ? error.message : null,
      });
    } finally {
      setIsUploadingVoice(false);
      resetWaveform();
    }
  }, [finishRecording, isActive, matchedUserId, replyTo, resetWaveform, roomId, setMessages, setReplyingTo, setUploadError, socket, stopRecording, userId]);

  return {
    isUploadingVoice,
    handleStartVoiceRecording,
    handleCancelVoiceRecording,
    handleStopVoiceRecording,
  };
};

export default useVoiceMessageSending;
