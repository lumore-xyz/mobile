export interface ChatReaction {
  userId: string;
  emoji: string;
}

export interface ChatReplyPreview {
  _id: string;
  senderId: string;
  messageType: "text" | "image" | "audio";
  message: string;
  imageUrl?: string | null;
  audioUrl?: string | null;
  audioDurationMs?: number | null;
  audioWaveform?: number[] | null;
}

export interface Message {
  _id?: string;
  clientMessageId?: string;
  sender: string;
  message: string;
  messageType?: "text" | "image" | "audio";
  imageUrl?: string | null;
  imagePublicId?: string | null;
  audioUrl?: string | null;
  audioPublicId?: string | null;
  audioDurationMs?: number | null;
  audioWaveform?: number[] | null;
  timestamp: number;
  replyTo?: ChatReplyPreview | null;
  reactions?: ChatReaction[];
  editedAt?: number | null;
  deliveredAt?: number | null;
  readAt?: number | null;
  pending?: boolean;
}

export interface KeyExchangeRequest {
  fromUserId: string;
  sessionKey: string;
  timestamp: number;
}

export interface KeyExchangeResponse {
  fromUserId: string;
  sessionKey: string;
  timestamp: number;
}

export interface TypingPayload {
  roomId?: string;
  userId?: string;
  isTyping?: boolean;
}

export interface MatchFoundPayload {
  roomId: string;
  matchedUser: unknown;
}

export interface RoomMatchFoundPayload {
  roomId: string;
  chatRoomId?: string;
  matchedUser?: unknown;
  matchedUserId?: string;
  locationRoom?: {
    _id: string;
    title: string;
  };
  matchingNote?: unknown;
}

export interface MatchmakingErrorPayload {
  message?: string;
}

export interface CreditsEventPayload {
  message?: string;
}

export interface ProfileLockPayload {
  lockedBy?: string;
  unlockedBy?: string;
}

export interface MessageEditedPayload {
  messageId?: string;
  encryptedData?: string | { data?: number[] };
  iv?: string | { data?: number[] };
  editedAt?: string;
}

export interface MessageReactionUpdatedPayload {
  messageId?: string;
  reactions?: {
    userId?: string;
    user?: string | { _id?: string };
    emoji?: string;
  }[];
}

export interface MessageDeliveredPayload {
  messageIds?: string[];
  deliveredAt?: string;
}

export interface MessageReadPayload {
  messageIds?: string[];
  readAt?: string;
}
