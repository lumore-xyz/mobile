# Notifications

## Purpose

Keep users informed about matches, messages, community updates, feedback, games, account/system events, and other app activity.

## Current Behavior

The app shows notifications, unread counts/badges and summaries, read/delete actions, mark-all-read, target routing, OneSignal registration, and backend socket sync for created/updated/deleted/unread-count events. The screen uses semantic notification icons, relative timestamps, explicit deep-link affordances, confirmed deletion, pull-to-refresh, progressive loading, and distinct empty, partial-error, and full-error recovery states.

## Key Files

- Route: `src/app/(subpage)/notifications.tsx`
- Screen: `src/screens/Notifications.tsx`
- Hooks: `src/hooks/useNotifications.ts`
- Library: `src/libs/notifications`
- Components: `src/components/notifications`
- Providers: `src/service/providers/OneSignalProvider.tsx`, `NotificationSyncProvider.tsx`

## Data/API Dependencies

- Notification API helpers in `src/libs/notifications/api.ts`
- Socket events in `NOTIFICATION_SOCKET_EVENTS`
- OneSignal permission and identity APIs.

## UX Requirements

Notifications need clear icons, readable timestamps, useful empty states, and reliable deep links. Icon-only controls require accessibility labels.

## Open Questions

- Which notification types are product-critical versus informational?

## Future Work

- Document notification type to route mapping.
- Add notification preference controls if backend supports them.
- Add visual regression coverage for unread, read, destructive confirmation, empty, loading, and error states.
