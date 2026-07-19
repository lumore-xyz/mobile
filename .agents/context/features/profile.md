# Profile

## Purpose

Show a user identity surface for the current user and other users, including profile details, images, posts, answers, and verification state.

## Current Behavior

The profile experience displays user fields, profile picture, posts, This or That answers, match-related visibility/lock state, and verification status. It supports both the current user profile and public profile routes. The presentation is photo-led and editorial, with a strong identity hero, owner-only completion guidance and shortcuts, grouped essentials, personality cards, and purposeful empty states.

## Key Files

- Routes: `src/app/profile.tsx`, `src/app/(subpage)/profile/[userId].tsx`
- Screen: `src/screens/Profile.tsx`
- Components: `src/components/profile`
- Hooks: `src/hooks/useUser.ts`, `src/hooks/useUserPosts.ts`, `src/hooks/useUserPrefrence.ts`
- Helpers: `src/utils/helpers/calculateAge.ts`, `src/utils/helpers/distanceDisplay.ts`, `src/utils/helpers/languageDisplay.ts`

## Data/API Dependencies

- `GET /profile/:userId`
- `GET /post/:userId`
- `GET /games/this-or-that/answers/:userId`
- `PATCH /profile/:userId/visibility`
- Didit verification status from user payload.

## UX Requirements

Profiles should be photo-led, warm, editorial, and avoid dense metadata walls. Respect locked/private fields and use accessible labels for visibility controls.

## Open Questions

- Which fields should be shown before a profile is unlocked?
- How should profile trust/verification be visually prioritized?

## Future Work

- Add field-level documentation for privacy/visibility.
- Add visual regression coverage for owner, public, locked, loading, and empty profile states.
