# Chat Inbox

## Purpose

Give users a fast overview of active and archived chat rooms.

## Current Behavior

Inbox has active/archive tabs, realtime invalidation on inbox updates, unread counts and totals, contextual date display, last-message previews for text/image/audio, community-room match labels, locked/unlocked profile indicators, a feedback shortcut, and pull-to-refresh. The presentation uses an editorial summary header, count-aware pill tabs, high-signal unread conversation cards, and distinct active, archive, error, loading, and unavailable states.

## Key Files

- Routes: `src/app/chat/index.tsx`, `src/app/chat/archive.tsx`
- Components: `Inbox`, `InboxTabs`, `UserChat`, `src/components/ui/Tabs.tsx`
- APIs: `fetchIbox`

## Data/API Dependencies

- `GET /inbox?status=active`
- `GET /inbox?status=archive`
- Socket event: `inbox_updated`
- User lookup through `useUser`.

## UX Requirements

Use virtualized lists, clear unread state, stable avatar sizing, and warm empty states. Avoid cramped metadata.

## Open Questions

- Should archive be a separate route or only a tab?

## Future Work

- Add typed inbox response models.
- Consider search/filter when inbox volume grows.
- Add visual regression coverage for unread, locked, unavailable, empty, error, and archived states.
