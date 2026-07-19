# Features Index

This file is the current feature inventory for Lumore Mobile. Detailed feature documentation belongs in `.agents/context/features`, with one lowercase hyphenated markdown file per feature.

## Product Summary

Lumore is an Expo React Native dating app. It supports account creation, onboarding, profile expression, matchmaking, realtime chat, local community rooms, posts, notifications, credits/rewards, referrals, lightweight games, identity verification, and app safety/update infrastructure.

## Current Features

| Feature | What Exists Today | Primary Files | Detail File |
| --- | --- | --- | --- |
| Authentication | Email/password login, signup, Google Sign-In, token storage, token refresh, logout, forgot/reset password, set new password, guest login redirect. | `src/app/login.tsx`, `src/app/signup.tsx`, `src/app/forgot-password.tsx`, `src/app/reset-password.tsx`, `src/app/set-new-password.tsx`, `src/service/requests/auth.ts`, `src/service/auth-session.ts`, `src/service/storage.ts` | `features/authentication.md` |
| Session Bootstrap | Splash screen checks stored session/onboarding state and routes users to login, onboarding, or explore. | `src/app/splash.tsx`, `src/screens/Splash.tsx`, `src/service/auth-session.ts`, `src/service/storage.ts` | `features/session-bootstrap.md` |
| Onboarding | Multi-step profile/preference setup: nickname, real name, birthday, phone, email, referral code, gender, interested-in, languages, age range, distance, and dating goals. | `src/app/(onboarding)/onboarding.tsx`, `src/screens/Onboarding.tsx`, `src/features/onboarding` | `features/onboarding.md` |
| Profile | Current user profile view, public profile view, profile picture upload, user posts, This or That answers, verification entry points, and profile visibility state. | `src/app/profile.tsx`, `src/app/(subpage)/profile/[userId].tsx`, `src/screens/Profile.tsx`, `src/hooks/useUser.ts`, `src/hooks/useUserPosts.ts` | `features/profile.md` |
| Profile Editing | Edit profile fields, field-level visibility, profile image picker, username availability, user settings, and account deletion. | `src/screens/EditProfile.tsx`, `src/screens/EditPreference.tsx`, `src/screens/EditUserSettings.tsx`, `src/components/profile`, `src/hooks/useUsernameAvailability.ts` | `features/profile-editing.md` |
| Preferences | Users can edit match preferences including interested-in, age range, distance, goals, and related option-driven fields. | `src/app/(subpage)/edit-preference.tsx`, `src/screens/EditPreference.tsx`, `src/hooks/useUserPrefrence.ts`, `src/schemas/preferenceSchema.ts` | `features/preferences.md` |
| Explore & Matchmaking | Explore screen shows availability count and matchmaking entry. Socket-driven matching can start/stop, handle match found, insufficient credits, profile lock/unlock, and chat-ended events. | `src/app/explore.tsx`, `src/screens/Explore.tsx`, `src/components/explore/MatchMaking.tsx`, `src/service/context/ExploreChatContext.tsx`, `src/domain/chat/socketEvents.ts` | `features/explore-matchmaking.md` |
| Chat Inbox | Active and archived inbox tabs, unread counts, last-message previews for text/image/audio, community match labels, feedback shortcut, and realtime inbox refresh. | `src/app/chat/index.tsx`, `src/app/chat/archive.tsx`, `src/components/ui/Tabs.tsx` | `features/chat-inbox.md` |
| Realtime Chat | Room chat with Socket.IO join/leave, text messages, image messages, voice notes, message editing, reactions, typing/read/delivery handling, profile locks, and ended-chat handling. | `src/app/chat/[roomId].tsx`, `src/components/explore/ChatScreen.tsx`, `src/components/explore/ChatMessage.tsx`, `src/service/context/ChatContext.tsx`, `src/libs/apis.ts` | `features/realtime-chat.md` |
| Chat Moderation & Feedback | Users can submit chat feedback, report users, and view feedback received from inbox/community. | `src/screens/Feedback.tsx`, `src/app/(subpage)/feedback.tsx`, `src/domain/chat/validation.ts`, `src/libs/apis.ts` | `features/chat-moderation-feedback.md` |
| Community Rooms | Nearby location-based rooms, room detail pages, room creation/editing with cover image, pin/unpin, rejoin/leave pool, creator controls, room match cycles, and realtime room pool updates. | `src/app/community/index.tsx`, `src/app/community/create.tsx`, `src/app/community/[roomId].tsx`, `src/service/providers/LocationProvider.tsx`, `src/libs/apis.ts` | `features/community-rooms.md` |
| Location | Device location provider, reverse-geocoded addresses through OpenStreetMap/Nominatim, location sync to profile, and location-aware nearby rooms/users. | `src/service/providers/LocationProvider.tsx`, `src/libs/locationSync.ts`, `src/libs/apis.ts` | `features/location.md` |
| Create Post | Entry point for prompt posts, image posts, and free-text posts with visibility support and post CRUD helpers. | `src/app/create-post`, `src/libs/apis.ts`, `src/hooks/useMediaPermision.ts` | `features/create-post.md` |
| Prompt Posts | Prompt category selection, prompt fetching by category, and prompt-based post creation. | `src/app/create-post/prompts.tsx`, `src/libs/apis.ts` | `features/prompt-posts.md` |
| Image & Text Posts | Image post upload with caption/visibility, free-text post creation, post update/delete helpers, and individual post fetch. | `src/app/create-post/image.tsx`, `src/app/create-post/free-text.tsx`, `src/libs/apis.ts` | `features/posts.md` |
| Notifications | Notification list, unread badge/count, mark-read, mark-all-read, delete, notification routing, OneSignal registration, and backend socket sync. | `src/app/(subpage)/notifications.tsx`, `src/screens/Notifications.tsx`, `src/hooks/useNotifications.ts`, `src/libs/notifications`, `src/service/providers/OneSignalProvider.tsx` | `features/notifications.md` |
| Credits | Credit balance, history pagination, daily credit claim, and credits updates from realtime matchmaking events. | `src/app/(subpage)/credits.tsx`, `src/screens/Credits.tsx`, `src/libs/apis.ts` | `features/credits.md` |
| Rewarded Ads | Rewarded ad loading/showing, ad-backed credit claim flow, and ad provider context. | `src/app/(subpage)/earn-credits.tsx`, `src/screens/EarnCredits.tsx`, `src/hooks/useAd.ts`, `src/service/providers/AdProvider.tsx` | `features/rewarded-ads.md` |
| Referrals | Referral summary, apply referral code, referral attribution capture from install referrer/URLs, and share-link generation. | `src/app/(subpage)/referral.tsx`, `src/screens/Referral.tsx`, `src/service/referralAttribution.ts`, `src/service/providers/ReferralAttributionProvider.tsx` | `features/referrals.md` |
| Games: This or That | Game hub, answer This or That questions, view user answers, and submit custom questions with left/right images and category. | `src/app/(subpage)/games`, `src/screens/Games.tsx`, `src/screens/ThisOrThat.tsx`, `src/screens/ThisOrThatSubmit.tsx`, `src/libs/apis.ts` | `features/this-or-that.md` |
| Settings | Settings hub for profile, preferences, user settings, credits, referrals, games, feedback, and verification. | `src/app/(subpage)/settings.tsx`, `src/screens/Settings.tsx` | `features/settings.md` |
| Identity Verification | Starts Didit verification in an external browser and reflects verified/pending state in profile/settings. | `src/screens/Settings.tsx`, `src/screens/Profile.tsx`, `src/libs/apis.ts` | `features/identity-verification.md` |
| App Update Prompt | Checks backend app-version config, caches result, supports optional and forced update states, and shows update prompt globally. | `src/components/ui/AppUpdatePrompt.tsx`, `src/hooks/useAppUpdate.ts`, `src/service/appUpdate.ts` | `features/app-updates.md` |
| Global Screen Protection | Prevents screen capture globally while the app runs, strongest on Android. | `src/app/_layout.tsx`, `src/hooks/useGlobalScreenProtection.ts` | `features/screen-protection.md` |
| Shared App Shell | Root providers for query client, gestures, ads, location, options, referral attribution, sockets, notification sync, confetti, explore matchmaking, safe area, keyboard avoidance, and Gluestack UI. | `src/app/_layout.tsx`, `src/service/providers/index.tsx` | `features/app-shell.md` |
| Navigation | File-based Expo Router navigation with five bottom tabs: Explore, Community, Chats, Create, Profile. Subpages are grouped under `(subpage)`. | `src/app`, `src/components/MobileNav.tsx` | `features/navigation.md` |
| Options & Dynamic Metadata | Fetches public status/options, caches option versions, and maps option icons/labels across forms and profiles. | `src/service/providers/OptionsProvider.tsx`, `src/libs/options.ts`, `src/libs/optionIcons.ts`, `src/libs/OptionIcon.tsx` | `features/options-metadata.md` |
| Analytics | Lightweight analytics event helper posts app events to backend when available. | `src/service/analytics.ts` | `features/analytics.md` |
| UI Foundation | Shared UI primitives for buttons, text inputs, date/range/slider/select/multiselect controls, tabs, skeletons, sheets, avatars, icons, layout, and keyboard-aware screens. | `src/components/ui`, `src/components/layout`, `src/libs/Icon.tsx` | `features/ui-foundation.md` |

## Feature Documentation Rules

Each detail file should include:

- Purpose: what the feature does for users.
- Current behavior: what exists in the app today.
- Key files: routes, screens, components, hooks, services, schemas, and domain modules.
- Data/API dependencies: backend endpoints, socket events, query keys, storage, or providers.
- UX requirements: design-system rules, empty states, loading states, accessibility, and edge cases.
- Open questions: unknowns or product decisions still needed.
- Future work: planned improvements or follow-up tasks.

## Maintenance

When adding or significantly changing a feature, update this index and the matching feature detail file in `.agents/context/features`. If a detail file does not exist yet, keep the target path listed here and create it before substantial implementation starts.
