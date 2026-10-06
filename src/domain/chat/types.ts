interface ChatReaction {
  userId: string;
  emoji: string;
}

interface ChatParticipant {
  _id: string;
}

export interface ChatRoom {
  _id: string;
  participants: ChatParticipant[];
  isActive?: boolean;
  endedAt?: string | null;
  endedBy?: string | null;
  status?: string;
  source?: string;
  sourceMetadata?: { title?: string };
  locationRoom?: { title?: string };
  matchingNote?:
    | string
    | { notesByUser?: Record<string, string>; oneSentenceNote?: string }
    | null;
  createdAt?: string | null;
}

interface RawChatReaction {
  userId?: string | { _id?: string };
  user?: string | { _id?: string };
  emoji?: string;
}

export interface RawChatMessage {
  _id?: string;
  clientMessageId?: string;
  sender?: string | { _id?: string; id?: string };
  senderId?: string;
  messageType?: "text" | "image" | "audio";
  message?: string;
  imageUrl?: string | null;
  imagePublicId?: string | null;
  audioUrl?: string | null;
  audioPublicId?: string | null;
  audioDurationMs?: number | string | null;
  audioWaveform?: unknown[] | null;
  timestamp?: number | string;
  createdAt?: string;
  replyTo?: RawChatMessage | null;
  reactions?: RawChatReaction[];
  editedAt?: string | null;
  deliveredAt?: string | null;
  readAt?: string | null;
}

export interface MessageEditedPayload {
  messageId?: string;
  message?: string;
  editedAt?: string;
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

export interface ProfileLockPayload {
  lockedBy?: string;
  unlockedBy?: string;
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
