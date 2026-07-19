import Skeleton from "@/src/components/ui/Skeleton";
import { ChatReplyPreview, Message } from "@/src/domain/chat/types";
import { messageSchema } from "@/src/domain/chat/validation";
import {
  deleteTempChatImage,
  uploadChatAudio,
  uploadChatImage,
} from "@/src/libs/apis";
import { getExpoAudioModule } from "@/src/libs/audio";
import { trackAnalytic } from "@/src/service/analytics";
import { useChat } from "@/src/service/context/ChatContext";
import { useSocket } from "@/src/service/context/SocketContext";
import {
  socketDebug,
  socketError,
  socketWarn,
} from "@/src/service/socket-debug";
import { getUser, storage } from "@/src/service/storage";
import {
  createRecordingWaveformSample,
  DEFAULT_WAVEFORM_BAR_COUNT,
  normalizeWaveformSamples,
} from "@/src/utils/audioWaveform";
import { toUserFacingError } from "@/src/utils/userFacingError";
import * as ImagePicker from "expo-image-picker";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Alert, View } from "react-native";
import ChatHeader from "./ChatHeader";
import ChatInput from "./ChatInput";
import { ChatMessages } from "./ChatMessages";

interface PendingImage {
  previewUrl: string;
  imageUrl: string | null;
  imagePublicId: string | null;
  uploading: boolean;
}

const DEFAULT_HEART_EMOJI = "\u2764\uFE0F";
const DRAFT_KEY_PREFIX = "chat_draft_";
const CLIENT_MESSAGE_ID_RANDOM_SLICE_START = 2;
const CLIENT_MESSAGE_ID_RANDOM_SLICE_END = 8;
const IMAGE_UNLOCK_REQUIRED_MESSAGE =
  "You can share photos after your match unlocks you.";
const VOICE_NOTES_UNAVAILABLE_MESSAGE =
  "Voice notes aren’t available in this version of the app. Please update Lumore and try again.";
const MIN_VOICE_NOTE_DURATION_MS = 800;
const RECORDING_WAVEFORM_SAMPLE_LIMIT = 72;

export const ChatScreen = () => {
  const [newMessage, setNewMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingVoice, setIsUploadingVoice] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingWaveform, setRecordingWaveform] = useState<number[]>([]);
  const [pendingImage, setPendingImage] = useState<PendingImage | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);

  const pendingImageRef = useRef<PendingImage | null>(null);
  const uploadRequestIdRef = useRef(0);
  const isRecordingVoiceRef = useRef(false);
  const recordingWaveformRef = useRef<number[]>([]);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const partnerTypingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const expoAudio = useMemo(() => getExpoAudioModule(), []);
  const voiceRecordingOptions = useMemo(
    () =>
      expoAudio
        ? {
            ...expoAudio.RecordingPresets.LOW_QUALITY,
            isMeteringEnabled: true,
          }
        : null,
    [expoAudio],
  );
  const voiceRecorder =
    expoAudio && voiceRecordingOptions
      ? expoAudio.useAudioRecorder(voiceRecordingOptions)
      : null;
  const voiceRecorderState =
    expoAudio && voiceRecorder
      ? expoAudio.useAudioRecorderState(voiceRecorder, 250)
      : {
          isRecording: false,
          durationMillis: 0,
          metering: undefined,
          url: null,
        };

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
  const canShareImages = Boolean(matchedUser?.isViewerUnlockedByUser);

  useEffect(() => {
    if (canShareImages && uploadError === IMAGE_UNLOCK_REQUIRED_MESSAGE) {
      setUploadError(null);
    }
  }, [canShareImages, uploadError]);
  const matchNoteText = useMemo(() => {
    const note = roomData?.matchingNote;
    if (!note) return "";
    if (typeof note === "string") return note.trim();

    const perUser = note?.notesByUser?.[userId];
    if (typeof perUser === "string" && perUser.trim()) return perUser.trim();

    return String(note?.oneSentenceNote || "").trim();
  }, [roomData?.matchingNote, userId]);

  useEffect(() => {
    socketDebug("ChatScreen", "revalidateSocket requested");
    revalidateSocket();
  }, [revalidateSocket]);

  const replyingToPreview = useMemo<ChatReplyPreview | null>(() => {
    if (!replyingTo?._id) return null;
    const messageType = replyingTo.messageType || "text";
    return {
      _id: replyingTo._id,
      senderId: replyingTo.sender,
      messageType,
      message:
        messageType === "image"
          ? "Photo"
          : messageType === "audio"
            ? "Voice note"
            : (replyingTo.message || "").slice(0, 140),
      imageUrl: replyingTo.imageUrl || null,
      audioUrl: replyingTo.audioUrl || null,
      audioDurationMs: replyingTo.audioDurationMs || null,
    };
  }, [replyingTo]);

  const createClientMessageId = useCallback(
    () =>
      `${userId}-${Date.now()}-${Math.random()
        .toString(36)
        .slice(
          CLIENT_MESSAGE_ID_RANDOM_SLICE_START,
          CLIENT_MESSAGE_ID_RANDOM_SLICE_END,
        )}`,
    [userId],
  );

  useEffect(() => {
    if (!isRecordingVoice) return;

    setRecordingWaveform((prev) => {
      const nextSample = createRecordingWaveformSample(
        voiceRecorderState.metering,
        prev.length,
      );
      const next = [...prev, nextSample].slice(
        -RECORDING_WAVEFORM_SAMPLE_LIMIT,
      );
      recordingWaveformRef.current = next;
      return next;
    });
  }, [
    isRecordingVoice,
    voiceRecorderState.durationMillis,
    voiceRecorderState.metering,
  ]);

  const clearPendingImage = useCallback(() => {
    setPendingImage(null);
  }, []);

  useEffect(() => {
    if (!roomId) return;
    try {
      const saved = storage.getString(`${DRAFT_KEY_PREFIX}${roomId}`);
      if (saved) {
        setNewMessage(saved);
      }
    } catch (error) {
      console.error("[ChatScreen] Failed to read room draft:", error);
    }
  }, [roomId]);

  useEffect(() => {
    if (!roomId) return;
    try {
      const key = `${DRAFT_KEY_PREFIX}${roomId}`;
      if (newMessage.trim()) {
        storage.set(key, newMessage);
      } else {
        storage.remove(key);
      }
    } catch (error) {
      console.error("[ChatScreen] Failed to persist room draft:", error);
    }
  }, [roomId, newMessage]);

  useEffect(() => {
    if (!socket || !roomId) return;

    const joinChatRoom = () => {
      socketDebug("ChatScreen", "emit joinChat", {
        roomId,
        socketId: socket.id,
        socketConnected: socket.connected,
      });
      socket.emit("joinChat", { roomId });
    };

    socketDebug("ChatScreen", "chat room binding effect start", {
      roomId,
      socketId: socket.id,
      socketConnected: socket.connected,
    });
    setIsConnected(socket.connected);
    joinChatRoom();

    const onConnect = () => {
      socketDebug("ChatScreen", "socket connect event", {
        roomId,
        socketId: socket.id,
      });
      setIsConnected(true);
      joinChatRoom();
    };

    const onDisconnect = () => {
      socketWarn("ChatScreen", "socket disconnect event", {
        roomId,
        socketId: socket.id,
      });
      setIsConnected(false);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socketDebug("ChatScreen", "chat room binding cleanup", {
        roomId,
        socketId: socket.id,
      });
      socket.emit("leaveChat", { roomId });
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, [socket, roomId]);

  const sendMessage = async () => {
    socketDebug("ChatScreen", "sendMessage called", {
      roomId: roomId ?? null,
      hasSocket: Boolean(socket),
      socketConnected: Boolean(socket?.connected),
      hasMatchedUser: Boolean(matchedUser?._id),
      isActive,
      isEditing: Boolean(editingMessageId),
      hasPendingImage: Boolean(pendingImage),
      pendingUploading: Boolean(pendingImage?.uploading),
      textLength: newMessage.trim().length,
    });
    if (!socket || !roomId || !matchedUser || !isActive) {
      socketWarn("ChatScreen", "sendMessage blocked", {
        hasSocket: Boolean(socket),
        roomId: roomId ?? null,
        matchedUserId: matchedUser?._id ?? null,
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

    const trimmed = newMessage.trim();
    if (!trimmed && !pendingImage) {
      socketWarn("ChatScreen", "sendMessage blocked: empty text and no image");
      return;
    }

    if (pendingImage && !canShareImages) {
      socketWarn("ChatScreen", "sendMessage blocked: image sharing locked", {
        roomId,
        matchedUserId: matchedUser?._id ?? null,
      });
      setUploadError(IMAGE_UNLOCK_REQUIRED_MESSAGE);
      return;
    }

    if (trimmed) {
      const messageResult = messageSchema.safeParse(trimmed);
      if (!messageResult.success) {
        socketWarn(
          "ChatScreen",
          "sendMessage blocked: message validation failed",
          {
            issue: messageResult.error.issues[0]?.message || "Invalid message.",
          },
        );
        setUploadError(
          messageResult.error.issues[0]?.message || "Invalid message.",
        );
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
      setNewMessage("");
      return;
    }

    if (
      pendingImage &&
      !pendingImage.uploading &&
      pendingImage.imageUrl &&
      pendingImage.imagePublicId
    ) {
      const imageClientMessageId = createClientMessageId();
      socketDebug("ChatScreen", "emit send_message (image)", {
        roomId,
        receiverId: matchedUser._id,
        clientMessageId: imageClientMessageId,
        replyTo: replyingToPreview?._id || null,
      });
      socket.emit("send_message", {
        roomId,
        receiverId: matchedUser._id,
        messageType: "image",
        imageUrl: pendingImage.imageUrl,
        imagePublicId: pendingImage.imagePublicId,
        replyTo: replyingToPreview?._id || null,
        clientMessageId: imageClientMessageId,
      });

      setMessages((prev) => [
        ...prev,
        {
          clientMessageId: imageClientMessageId,
          sender: userId,
          message: "",
          messageType: "image",
          imageUrl: pendingImage.imageUrl,
          imagePublicId: pendingImage.imagePublicId,
          timestamp: Date.now(),
          replyTo: replyingToPreview,
          reactions: [],
          pending: true,
          deliveredAt: null,
          readAt: null,
        },
      ]);
    }

    if (trimmed) {
      const textClientMessageId = createClientMessageId();

      trackAnalytic({
        activity: "message_sent",
        label: "Message Sent",
        value: roomId,
      });

      socketDebug("ChatScreen", "emit send_message (text)", {
        roomId,
        receiverId: matchedUser._id,
        clientMessageId: textClientMessageId,
        replyTo: replyingToPreview?._id || null,
        textLength: trimmed.length,
      });
      socket.emit("send_message", {
        roomId,
        receiverId: matchedUser._id,
        message: trimmed,
        replyTo: replyingToPreview?._id || null,
        messageType: "text",
        clientMessageId: textClientMessageId,
      });

      setMessages((prev) => [
        ...prev,
        {
          clientMessageId: textClientMessageId,
          sender: userId,
          message: trimmed,
          messageType: "text",
          timestamp: Date.now(),
          replyTo: replyingToPreview,
          reactions: [],
          pending: true,
          deliveredAt: null,
          readAt: null,
        },
      ]);
    }

    setNewMessage("");
    setReplyingTo(null);
    clearPendingImage();
    socketDebug("ChatScreen", "sendMessage completed and local composer reset");
  };

  const handleImageSelect = async () => {
    socketDebug("ChatScreen", "handleImageSelect called", {
      roomId: roomId ?? null,
      isActive,
    });
    if (!roomId || !isActive) {
      socketWarn("ChatScreen", "handleImageSelect blocked", {
        roomId: roomId ?? null,
        isActive,
      });
      return;
    }

    if (!canShareImages) {
      socketWarn("ChatScreen", "handleImageSelect blocked: match locked", {
        roomId,
        matchedUserId: matchedUser?._id ?? null,
      });
      setUploadError(IMAGE_UNLOCK_REQUIRED_MESSAGE);
      return;
    }

    let requestId = 0;
    let selectedImageUri: string | null = null;

    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permission.status !== ImagePicker.PermissionStatus.GRANTED) {
        socketWarn("ChatScreen", "media permission denied");
        Alert.alert(
          "Permission required",
          "Please enable media library permission to upload images.",
        );
        return;
      }
      socketDebug("ChatScreen", "media permission granted");

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.[0]) {
        socketDebug("ChatScreen", "image picker canceled or empty asset");
        return;
      }
      const asset = result.assets[0];
      selectedImageUri = asset.uri;
      requestId = ++uploadRequestIdRef.current;
      const previousPending = pendingImageRef.current;

      setUploadError(null);
      setIsUploadingImage(true);
      setPendingImage({
        previewUrl: asset.uri,
        imagePublicId: null,
        imageUrl: null,
        uploading: true,
      });

      socketDebug("ChatScreen", "uploadChatImage start", {
        roomId,
        requestId,
        selectedImageUri,
      });

      const uploaded = await uploadChatImage(roomId, asset.uri);
      if (requestId !== uploadRequestIdRef.current) {
        socketWarn("ChatScreen", "upload result ignored due to stale request", {
          roomId,
          requestId,
          latestRequestId: uploadRequestIdRef.current,
        });
        if (uploaded?.imagePublicId) {
          await deleteTempChatImage(uploaded.imagePublicId).catch(() => {});
        }
        return;
      }

      setPendingImage((prev) => {
        if (!prev || prev.previewUrl !== asset.uri) return prev;
        return {
          previewUrl: asset.uri,
          imagePublicId: uploaded.imagePublicId,
          imageUrl: uploaded.imageUrl,
          uploading: false,
        };
      });
      socketDebug("ChatScreen", "uploadChatImage success", {
        roomId,
        requestId,
        imagePublicId: uploaded.imagePublicId,
      });

      if (previousPending?.imagePublicId) {
        await deleteTempChatImage(previousPending.imagePublicId).catch(
          () => {},
        );
      }
    } catch (error: any) {
      if (requestId !== uploadRequestIdRef.current) return;
      const status = Number(error?.response?.status || 0);
      const fallbackMessage =
        status === 413
          ? "Image is too large. Please choose a smaller image."
          : "Image upload failed. Please try again.";
      setUploadError(toUserFacingError(error, fallbackMessage));
      setPendingImage((prev) => {
        if (!prev || !prev.uploading) return prev;
        if (selectedImageUri && prev.previewUrl !== selectedImageUri)
          return prev;
        return null;
      });
      socketError("ChatScreen", "uploadChatImage failed", {
        roomId,
        requestId,
        status,
        message: error instanceof Error ? error.message : null,
      });
    } finally {
      if (requestId === uploadRequestIdRef.current) {
        setIsUploadingImage(false);
        socketDebug("ChatScreen", "upload flow finalized", {
          roomId,
          requestId,
        });
      }
    }
  };

  const handleDiscardSelectedImage = async () => {
    if (!pendingImage) {
      socketWarn("ChatScreen", "discard image skipped: no pending image");
      return;
    }
    socketDebug("ChatScreen", "discard pending image", {
      imagePublicId: pendingImage.imagePublicId || null,
      previewUrl: pendingImage.previewUrl,
    });
    uploadRequestIdRef.current += 1;

    try {
      setUploadError(null);
      if (pendingImage.imagePublicId) {
        await deleteTempChatImage(pendingImage.imagePublicId);
      }
    } catch (error) {
      console.error("[ChatScreen] Temp image delete failed:", error);
    } finally {
      clearPendingImage();
      setIsUploadingImage(false);
    }
  };

  const stopRecorderSilently = useCallback(async () => {
    try {
      if (
        voiceRecorder &&
        (voiceRecorderState.isRecording || isRecordingVoiceRef.current)
      ) {
        await voiceRecorder.stop();
      }
    } catch (error) {
      console.error("[ChatScreen] Failed to stop voice recorder:", error);
    } finally {
      isRecordingVoiceRef.current = false;
      setIsRecordingVoice(false);
      void expoAudio
        ?.setAudioModeAsync({
          allowsRecording: false,
          playsInSilentMode: true,
        })
        .catch(() => {});
    }
  }, [expoAudio, voiceRecorder, voiceRecorderState.isRecording]);

  const handleStartVoiceRecording = useCallback(async () => {
    socketDebug("ChatScreen", "handleStartVoiceRecording called", {
      roomId: roomId ?? null,
      isActive,
      hasSocket: Boolean(socket),
      socketConnected: Boolean(socket?.connected),
    });
    if (!socket || !roomId || !matchedUser || !isActive) {
      socketWarn("ChatScreen", "voice recording blocked", {
        hasSocket: Boolean(socket),
        roomId: roomId ?? null,
        matchedUserId: matchedUser?._id ?? null,
        isActive,
      });
      return;
    }
    if (!expoAudio || !voiceRecorder) {
      Alert.alert(
        "Voice notes unavailable",
        VOICE_NOTES_UNAVAILABLE_MESSAGE,
      );
      return;
    }
    if (editingMessageId || pendingImage || newMessage.trim()) {
      socketWarn("ChatScreen", "voice recording blocked: composer busy");
      return;
    }

    try {
      const permission = await expoAudio.requestRecordingPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Microphone permission required",
          "Please enable microphone access to record voice notes.",
        );
        return;
      }

      setUploadError(null);
      recordingWaveformRef.current = [];
      setRecordingWaveform([]);
      await expoAudio.setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });
      await voiceRecorder.prepareToRecordAsync();
      voiceRecorder.record();
      isRecordingVoiceRef.current = true;
      setIsRecordingVoice(true);
      socketDebug("ChatScreen", "voice recording started", { roomId });
    } catch (error) {
      console.error("[ChatScreen] Failed to start voice recording:", error);
      setUploadError("Could not start voice recording. Please try again.");
      isRecordingVoiceRef.current = false;
      setIsRecordingVoice(false);
      void expoAudio
        ?.setAudioModeAsync({
          allowsRecording: false,
          playsInSilentMode: true,
        })
        .catch(() => {});
    }
  }, [
    editingMessageId,
    expoAudio,
    isActive,
    matchedUser,
    newMessage,
    pendingImage,
    roomId,
    socket,
    voiceRecorder,
  ]);

  const handleCancelVoiceRecording = useCallback(async () => {
    socketDebug("ChatScreen", "voice recording cancel requested", {
      roomId: roomId ?? null,
    });
    recordingWaveformRef.current = [];
    setRecordingWaveform([]);
    await stopRecorderSilently();
  }, [roomId, stopRecorderSilently]);

  const handleStopVoiceRecording = useCallback(async () => {
    socketDebug("ChatScreen", "handleStopVoiceRecording called", {
      roomId: roomId ?? null,
      durationMs: voiceRecorderState.durationMillis,
    });
    if (!socket || !roomId || !matchedUser || !isActive) {
      await stopRecorderSilently();
      socketWarn("ChatScreen", "voice send blocked", {
        hasSocket: Boolean(socket),
        roomId: roomId ?? null,
        matchedUserId: matchedUser?._id ?? null,
        isActive,
      });
      return;
    }
    if (!expoAudio || !voiceRecorder) {
      Alert.alert(
        "Voice notes unavailable",
        VOICE_NOTES_UNAVAILABLE_MESSAGE,
      );
      return;
    }

    const recordedDurationMs = voiceRecorderState.durationMillis;
    const finalWaveform = normalizeWaveformSamples(
      recordingWaveformRef.current,
      DEFAULT_WAVEFORM_BAR_COUNT,
      `${roomId}-${recordedDurationMs}`,
    );
    try {
      await voiceRecorder.stop();
      isRecordingVoiceRef.current = false;
      setIsRecordingVoice(false);
      void expoAudio
        .setAudioModeAsync({
          allowsRecording: false,
          playsInSilentMode: true,
        })
        .catch(() => {});

      const audioUri = voiceRecorder.uri || voiceRecorderState.url;
      if (!audioUri) {
        setUploadError("Voice recording failed. Please try again.");
        return;
      }
      if (recordedDurationMs < MIN_VOICE_NOTE_DURATION_MS) {
        setUploadError("Voice note is too short. Try recording a bit longer.");
        return;
      }

      setUploadError(null);
      setIsUploadingVoice(true);
      const uploaded = await uploadChatAudio(
        roomId,
        audioUri,
        recordedDurationMs,
      );
      const audioClientMessageId = createClientMessageId();

      socketDebug("ChatScreen", "emit send_message (audio)", {
        roomId,
        receiverId: matchedUser._id,
        clientMessageId: audioClientMessageId,
        replyTo: replyingToPreview?._id || null,
        durationMs: uploaded.audioDurationMs || recordedDurationMs,
      });
      socket.emit("send_message", {
        roomId,
        receiverId: matchedUser._id,
        messageType: "audio",
        audioUrl: uploaded.audioUrl,
        audioPublicId: uploaded.audioPublicId,
        audioDurationMs: uploaded.audioDurationMs || recordedDurationMs,
        audioWaveform: finalWaveform,
        replyTo: replyingToPreview?._id || null,
        clientMessageId: audioClientMessageId,
      });

      setMessages((prev) => [
        ...prev,
        {
          clientMessageId: audioClientMessageId,
          sender: userId,
          message: "",
          messageType: "audio",
          audioUrl: uploaded.audioUrl,
          audioPublicId: uploaded.audioPublicId,
          audioDurationMs: uploaded.audioDurationMs || recordedDurationMs,
          audioWaveform: finalWaveform,
          timestamp: Date.now(),
          replyTo: replyingToPreview,
          reactions: [],
          pending: true,
          deliveredAt: null,
          readAt: null,
        },
      ]);
      recordingWaveformRef.current = [];
      setRecordingWaveform([]);
      trackAnalytic({
        activity: "voice_note_sent",
        label: "Voice Note Sent",
        value: roomId,
      });
      setReplyingTo(null);
      socketDebug("ChatScreen", "voice note send completed");
    } catch (error: any) {
      isRecordingVoiceRef.current = false;
      setIsRecordingVoice(false);
      void expoAudio
        ?.setAudioModeAsync({
          allowsRecording: false,
          playsInSilentMode: true,
        })
        .catch(() => {});
      const status = Number(error?.response?.status || 0);
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
      if (!isRecordingVoiceRef.current) {
        recordingWaveformRef.current = [];
        setRecordingWaveform([]);
      }
    }
  }, [
    createClientMessageId,
    expoAudio,
    isActive,
    matchedUser,
    replyingToPreview,
    roomId,
    setMessages,
    socket,
    stopRecorderSilently,
    userId,
    voiceRecorder,
    voiceRecorderState.durationMillis,
    voiceRecorderState.url,
  ]);

  useEffect(() => {
    pendingImageRef.current = pendingImage;
  }, [pendingImage]);

  useEffect(() => {
    isRecordingVoiceRef.current = isRecordingVoice;
  }, [isRecordingVoice]);

  useEffect(() => {
    return () => {
      const pending = pendingImageRef.current;
      if (pending?.imagePublicId) {
        void deleteTempChatImage(pending.imagePublicId).catch(() => {});
      }
      if (isRecordingVoiceRef.current) {
        void voiceRecorder?.stop().catch(() => {});
      }
    };
  }, [voiceRecorder]);

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

  const handleReply = useCallback((msg: Message) => {
    setReplyingTo(msg);
    setEditingMessageId(null);
  }, []);

  const handleStartEdit = useCallback(
    (msg: Message) => {
      if (!msg._id || msg.sender !== userId || msg.messageType !== "text")
        return;
      setEditingMessageId(msg._id);
      setReplyingTo(null);
      setNewMessage(msg.message);
    },
    [userId],
  );

  const cancelReply = useCallback(() => setReplyingTo(null), []);
  const cancelEdit = useCallback(() => {
    setEditingMessageId(null);
    setNewMessage("");
  }, []);
  const dismissUploadError = useCallback(() => setUploadError(null), []);

  useEffect(() => {
    if (!socket || !roomId || !matchedUser?._id || !isActive) return;

    const onTyping = (payload: {
      roomId?: string;
      userId?: string;
      isTyping?: boolean;
    }) => {
      if (payload?.roomId !== roomId) return;
      if (payload?.userId !== matchedUser._id) return;

      const typing = Boolean(payload?.isTyping);
      socketDebug("ChatScreen", "event typing", {
        roomId,
        fromUserId: payload?.userId || null,
        isTyping: typing,
      });
      setIsPartnerTyping(typing);

      if (partnerTypingTimeoutRef.current) {
        clearTimeout(partnerTypingTimeoutRef.current);
      }

      if (typing) {
        partnerTypingTimeoutRef.current = setTimeout(() => {
          setIsPartnerTyping(false);
        }, 2500);
      }
    };

    socketDebug("ChatScreen", "attach typing listener", {
      roomId,
      matchedUserId: matchedUser._id,
      socketId: socket.id,
    });
    socket.on("typing", onTyping);
    return () => {
      socketDebug("ChatScreen", "detach typing listener", {
        roomId,
        matchedUserId: matchedUser._id,
        socketId: socket.id,
      });
      socket.off("typing", onTyping);
      if (partnerTypingTimeoutRef.current) {
        clearTimeout(partnerTypingTimeoutRef.current);
        partnerTypingTimeoutRef.current = null;
      }
    };
  }, [socket, roomId, matchedUser?._id, isActive]);

  useEffect(() => {
    if (!socket || !roomId || !isActive) return;
    const isTyping = newMessage.trim().length > 0;
    socketDebug("ChatScreen", "emit typing", {
      roomId,
      isTyping,
      textLength: newMessage.trim().length,
      socketId: socket.id,
    });
    socket.emit("typing", { roomId, isTyping });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (isTyping) {
      typingTimeoutRef.current = setTimeout(() => {
        socketDebug("ChatScreen", "emit typing false from timeout", {
          roomId,
          socketId: socket.id,
        });
        socket.emit("typing", { roomId, isTyping: false });
      }, 1500);
    }
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [newMessage, socket, roomId, isActive]);

  useEffect(() => {
    return () => {
      if (socket && roomId) {
        socketDebug("ChatScreen", "emit typing false on unmount", {
          roomId,
          socketId: socket.id,
        });
        socket.emit("typing", { roomId, isTyping: false });
      }
    };
  }, [socket, roomId]);

  if (!matchedUser || isLoading) {
    return <ChatScreenSkeleton />;
  }

  return (
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
        recordingDurationMs={voiceRecorderState.durationMillis}
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
  );
};

const ChatScreenSkeleton = () => (
  <View className="bg-ui-surface-page" style={{ flex: 1 }}>
    <View className="border-b border-ui-border bg-ui-light px-4 py-3">
      <View className="flex-row items-center">
        <Skeleton width={40} height={40} radius={999} />
        <View className="ml-3 flex-1">
          <Skeleton width="46%" height={14} />
          <Skeleton width="28%" height={11} style={{ marginTop: 8 }} />
        </View>
      </View>
    </View>

    <View className="flex-1 px-4 py-4">
      <Skeleton width="72%" height={36} radius={16} />
      <Skeleton width="54%" height={52} radius={16} style={{ marginTop: 12 }} />
      <View className="items-end mt-3">
        <Skeleton width="64%" height={36} radius={16} />
      </View>
      <Skeleton width="58%" height={36} radius={16} style={{ marginTop: 12 }} />
      <View className="items-end mt-3">
        <Skeleton width="44%" height={36} radius={16} />
      </View>
    </View>

    <View className="border-t border-ui-border bg-ui-light px-3 py-3">
      <Skeleton width="100%" height={56} radius={999} />
    </View>
  </View>
);
