import type { PendingChatImage } from "@/src/domain/chat/types";
import { IMAGE_UNLOCK_REQUIRED_MESSAGE } from "@/src/features/chat/constants";
import {
  deleteTempChatImage,
  uploadChatImage,
} from "@/src/features/chat/api";
import {
  socketDebug,
  socketError,
  socketWarn,
} from "@/src/service/socket-debug";
import {
  toUserFacingError,
} from "@/src/utils/userFacingError";
import getHttpErrorStatus from "@/src/utils/getHttpErrorStatus";
import * as ImagePicker from "expo-image-picker";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "react-native";

interface UseChatImageUploadOptions {
  roomId?: string | null;
  matchedUserId?: string | null;
  isActive: boolean;
  canShareImages: boolean;
  onUploadError: (error: string | null) => void;
}

const useChatImageUpload = ({
  roomId,
  matchedUserId,
  isActive,
  canShareImages,
  onUploadError,
}: UseChatImageUploadOptions) => {
  const [pendingImage, setPendingImage] = useState<PendingChatImage | null>(
    null,
  );
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const pendingImageRef = useRef<PendingChatImage | null>(null);
  const uploadRequestIdRef = useRef(0);

  useEffect(() => {
    pendingImageRef.current = pendingImage;
  }, [pendingImage]);

  useEffect(
    () => () => {
      const pending = pendingImageRef.current;
      if (pending?.imagePublicId) {
        void deleteTempChatImage(pending.imagePublicId).catch(() => {});
      }
    }, [],
  );

  const clearPendingImage = useCallback(() => {
    setPendingImage(null);
  }, []);

  const handleImageSelect = useCallback(async () => {
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
        matchedUserId: matchedUserId ?? null,
      });
      onUploadError(IMAGE_UNLOCK_REQUIRED_MESSAGE);
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

      onUploadError(null);
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

      setPendingImage((previous) => {
        if (!previous || previous.previewUrl !== asset.uri) return previous;
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
    } catch (error: unknown) {
      if (requestId !== uploadRequestIdRef.current) return;
      const status = getHttpErrorStatus(error);
      const fallbackMessage =
        status === 413
          ? "Image is too large. Please choose a smaller image."
          : "Image upload failed. Please try again.";
      onUploadError(toUserFacingError(error, fallbackMessage));
      setPendingImage((previous) => {
        if (!previous || !previous.uploading) return previous;
        if (selectedImageUri && previous.previewUrl !== selectedImageUri)
          return previous;
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
  }, [canShareImages, isActive, matchedUserId, onUploadError, roomId]);

  const handleDiscardSelectedImage = useCallback(async () => {
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
      onUploadError(null);
      if (pendingImage.imagePublicId) {
        await deleteTempChatImage(pendingImage.imagePublicId);
      }
    } catch (error) {
      console.error("[ChatScreen] Temp image delete failed:", error);
    } finally {
      clearPendingImage();
      setIsUploadingImage(false);
    }
  }, [clearPendingImage, onUploadError, pendingImage]);

  return {
    pendingImage,
    isUploadingImage,
    handleImageSelect,
    handleDiscardSelectedImage,
    clearPendingImage,
  };
};

export default useChatImageUpload;
