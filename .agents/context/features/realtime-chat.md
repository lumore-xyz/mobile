# Realtime Chat

## Purpose

Enable live private chat between matched users, including richer media and interaction states.

## Current Behavior

Chat rooms join/leave sockets, fetch message history, send text, upload/send images, record/upload/send voice notes, edit messages, react to messages, show delivery/read state, support typing events, handle ended chats, and coordinate profile lock/unlock behavior. The conversation UI uses a compact identity header, warm message canvas, visually distinct soft bubbles, explicit reply/edit actions, stable media frames, status-aware composer controls, and accessible feedback for typing, uploads, errors, and ended chats.

## Key Files

- Route: `src/app/chat/[roomId].tsx`
- Components: `src/components/explore/ChatScreen.tsx`, `ChatHeader.tsx`, `ChatInput.tsx`, `ChatMessages.tsx`, `ChatMessage.tsx`, `AudioWaveform.tsx`, `MatchNoteBanner.tsx`
- Context: `src/service/context/ChatContext.tsx`, `src/service/context/SocketContext.tsx`
- Message history and socket updates: `src/hooks/chat/useChatMessages.ts`, `src/hooks/chat/useChatSocketListeners.ts`
- Domain and payload contracts: `src/domain/chat/types.ts`, `src/domain/chat/socketEvents.ts`, `src/domain/chat/groupMessagesByDate.ts`
- Inbox cache keys: `src/features/chat/inboxQueryKeys.ts`
- Message normalization and room lifecycle rules: `src/domain/chat/mapRawChatMessage.ts`, `src/domain/chat/mapRawChatReplyPreview.ts`, `src/domain/chat/isChatRoomActive.ts`
- APIs: `fetchRoomData`, `fetchRoomChat`, `uploadChatImage`, `uploadChatAudio`, temp-delete helpers
- API module: `src/features/chat/api.ts`

## Data/API Dependencies

- `GET /inbox/:roomId`
- `GET /messages/:roomId`
- `POST /messages/:roomId/image`
- `POST /messages/:roomId/audio`
- `DELETE /messages/image-temp`
- `DELETE /messages/audio-temp`
- Socket events from `CHAT_SOCKET_EVENTS`.

## UX Requirements

Message bubbles should be soft and readable. Media must reserve stable dimensions. Voice notes need clear recording/send/cancel states. Critical actions need visible alternatives, not gesture-only controls.

## Open Questions

- What are the exact rules for image sharing locked/unlocked states?
- How long can voice notes be?

## Future Work

- Add tests for chat validation schemas.
- Add visual regression coverage for bubble/media/reply/edit, locked, disconnected, recording, uploading, and ended-chat states.
