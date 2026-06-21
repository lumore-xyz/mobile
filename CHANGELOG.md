# Changelog

All notable changes to the Lumore mobile app (`lumore` Expo app) are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/). The runtime
`version` field in `app.json` tracks the semver; build numbers are managed by CI.

## [Unreleased]

### Changed
- **Single icon library.** All app icons now come from `lucide-react-native/icons`. `src/libs/Icon.tsx` was rewritten to look up icons by computed key (`icons[name]`), accepts PascalCase Lucide names, and keeps `type="image"` for image-based entries (`graduation.png`, `relationship.png`, `mask.png`, `distance.png`, `cake.png`). Every call site (bottom nav, headers, notifications, chat input/header/message, profile fields/pills/quick actions, community rooms, create-post cards, settings items, match-making, the app-update prompt, the Google sign-in button, etc.) was converted from `<Ionicons>` / `<MaterialCommunityIcons>` / `<MaterialIcons>` / `<Feather>` / `<Fontisto>` to the Lucide-based `Icon`. Outlined Ionicons names map to the closest Lucide equivalent (`videocam-outline` → `Video`, `cash-outline` → `Wallet`, `beer-outline` → `Beer`, `smoking-rooms` → `Cigarette`, `paw` → `PawPrint`, `person-outline` → `UserRound`, `magnet-outline` → `Magnet`, `footsteps-outline` → `Footprints`, `options-outline` → `SlidersHorizontal`, `chatbubble-ellipses-outline` → `MessageCircleMore`, etc.). Picker-selected icons from the admin (server data) keep working because admin option icons are already Lucide.

### Removed
- `@expo/vector-icons` dependency. Dropped imports of `Ionicons`, `MaterialCommunityIcons`, `MaterialIcons`, `Feather`, and `Fontisto` across the app.
- `OptionIcon` no longer renders Ionicons names for legacy option icons — admin option icons must be Lucide. Non-Lucide icons stored on options silently render nothing (per the "hard-fail unmatched" decision).
- `ICON_LIBRARIES` is now `["Lucide"]` only (was `["Lucide", "Ionicons"]`).

### Internal
- `src/libs/Icon.tsx` is now a thin wrapper over `lucide-react-native/icons` with image-fallback support and a hard-fail for unknown Lucide names (no <Ionicons> fallback).
- Lint clean (`expo lint`), TypeScript clean for every changed file. The four pre-existing `tsc --noEmit` errors (in `src/app/chat/archive.tsx` and `src/app/community/index.tsx`) are untouched and were present before this change.

## [1.1.0] – In-app notifications, dynamic-option icons, UI polish

### Added
- **In-app notification system.**
  - New `Notification` bell with unread-count badge. Mounted in the Explore header (next to preferences), the Chats inbox header, and the Profile quick-actions list.
  - New `/(subpage)/notifications` route with a full notifications screen: list (read/unread visual state), pull-to-refresh, infinite scroll / pagination, empty state, mark-one / mark-all-read actions, per-row delete, and tap-to-navigate (match → chat room, community → community detail, feedback → feedback screen, game → games, account → settings).
  - Notification cards now use a per-type/per-entity icon (`heart` for matches, `location` for community, `chatbubble-ellipses` for feedback, `game-controller` for game submissions, `shield-checkmark` for verification, etc.).
  - Real-time socket sync via `useNotificationSocketSync` (mounted globally in `NotificationSyncProvider`). On `notification_created` / `notification_updated` / `notification_deleted` / `notification_unread_count` events the bell badge + list stay live without a manual refresh.
- **Dynamic-option icons** for every dropdown, multi-select, chip, and single-select rendered via the new `OptionIcon` component. Icons come from the backend (`AppOptions.options[*].items[*].icon`) or the mirrored mobile catalog (`libs/optionIcons.ts`). Unknown icons are safely ignored.
  - `SelectInput` (trigger + actionsheet row).
  - `MultiSelectInput` (trigger chips + actionsheet rows).
  - `MultiSelectChipInput` (each chip).

### Changed
- **Notifications screen** (`src/screens/Notifications.tsx`):
  - Replaced the modal `×` + standalone back-arrow duplication with a single `ScreenHeader` component. Modal mode shows `×`, standalone mode shows a back arrow that falls back to `/explore` if there's no history.
  - Header shows a "Mark all read" pill when at least one unread item is visible.
  - Empty state now has a "Refresh" button (previously labelled "Pull to refresh") plus a `ScrollView` with `RefreshControl` so users can pull-to-refresh even with no notifications.
  - Removed redundant `refetch()` after `invalidateQueries` (a single invalidate is enough to refetch the list + unread count).
- `useNotifications` hook is now split into focused modules: `libs/notifications/queries.ts` (query keys + helpers), `libs/notifications/sync.ts` (socket sync), `hooks/useNotifications.ts` (thin consumer that re-exports for backward compatibility). The dead `pendingCount` state was removed.
- `OptionIcon` is a safe renderer — it only outputs an `<Ionicons>` if the icon name is in the curated catalog (returns `null` otherwise so renames / typos never crash the UI).
- `applyDynamicOptions` now validates icon data and only persists icons whose library is in the supported list (currently `Ionicons`).
- All buttons/inputs and selection UIs now use `rounded-lg` (8px) for consistency. Tabs and modal containers keep their intentional larger radii (`rounded-xl`, `rounded-t-3xl`).
- Notifications screen layout: `NotificationsTitle` and `Header` (modal) unified into a single `ScreenHeader` with the same `goBack` helper.

### Fixed
- Bell badge now updates in real time via `notification_unread_count` socket events even when the user is not on the notifications screen.
- Selecting a notification in the screen no longer fires a redundant `markAsRead` for already-read items.
- `handleRefresh` no longer triggers three parallel refetches (was `refetch()` + `invalidate` + `refetchQueries(unreadCount)`); a single invalidate is now used and the dependent queries refetch automatically.
- `useNotificationSocketSync` no longer leaves dead `pendingCount` state around; the badge is now driven exclusively from the React Query cache.
- Tap-to-navigate targets now fall back gracefully when an entityId is missing (no crash on stale notifications).

### Internal
- New modules:
  - `src/libs/notifications/constants.ts` (types + enums + socket events).
  - `src/libs/notifications/api.ts` (typed HTTP client).
  - `src/libs/notifications/router.ts` (`resolveNotificationTarget` + `navigateToNotification`).
  - `src/libs/notifications/queries.ts` (query keys + `getCurrentUserId`, `clampPageSize`, `isNotificationForUser`).
  - `src/libs/notifications/sync.ts` (`useNotificationSocketSync`).
  - `src/components/notifications/NotificationBell.tsx` (bell + badge).
  - `src/components/notifications/NotificationCard.tsx` (card + delete + tap-to-navigate).
  - `src/components/notifications/NotificationIcon.tsx` (per-type icon).
  - `src/service/providers/NotificationSyncProvider.tsx` (mounts the global socket sync inside `QueryClientProvider`).
- `src/screens/Notifications.tsx` consolidated into a single `ScreenHeader` component.
- `src/libs/options.ts` extended with `SelectOptionIcon` and `ICON_LIBRARIES` constant; `applyDynamicOptions` now persists validated icon data.
- `src/libs/optionIcons.ts` mirrors the backend's curated Ionicons catalog so the renderer can validate names offline and ignore unknown icons safely.
- Lint clean (`expo lint`) and TypeScript clean (`tsc --noEmit`) for every changed file.

## [1.0.0] – Initial public release
- Initial Expo Router release. Authentication, profile, discovery, chat rooms, location-room matching, credits, this-or-that games, settings, profile editing, push notifications via OneSignal, deep-linking via Expo Router, secure storage via `expo-secure-store`.
