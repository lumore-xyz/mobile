# Chat Moderation & Feedback

## Purpose

Let users report unsafe behavior, submit feedback about chats, and view received feedback.

## Current Behavior

Users can submit chat feedback and reports through inbox/chat flows. A feedback screen presents received reflections with an aggregate rating summary, individual rating context, optional reasons, and written feedback. It includes pull-to-refresh, loading parity, and dedicated empty and retryable error states. Zod schemas validate feedback/report payloads.

## Key Files

- Route: `src/app/(subpage)/feedback.tsx`
- Screen: `src/screens/Feedback.tsx`
- Domain validation: `src/domain/chat/validation.ts`
- APIs: `submitChatFeedback`, `reportChatUser`, `fetchReceivedFeedbacks`
- Chat header/actions: `src/components/explore/ChatHeader.tsx`

## Data/API Dependencies

- `POST /inbox/:roomId/feedback`
- `POST /inbox/:roomId/report`
- `GET /inbox/feedback/received`

## UX Requirements

Safety and reporting flows must be calm, clear, non-judgmental, and easy to escape. Errors should explain how to recover.

## Open Questions

- What report categories are officially supported?
- Should reporting also block/end a chat?

## Future Work

- Add safety copy guidelines.
- Add moderation outcome states.
- Add visual regression coverage for rated, unrated, anonymous, empty, loading, and error feedback states.
