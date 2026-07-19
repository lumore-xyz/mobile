# Session Bootstrap

## Purpose

Route users to the correct first screen after app launch based on session validity and onboarding state.

## Current Behavior

The splash flow checks whether stored access/refresh tokens can produce a valid session. It then routes unauthenticated users to login, incomplete users to onboarding, and onboarded users to explore.

## Key Files

- `src/app/splash.tsx`
- `src/screens/Splash.tsx`
- `src/service/auth-session.ts`
- `src/service/storage.ts`
- `src/utils/version.ts`

## Data/API Dependencies

- Stored MMKV values: access token, refresh token, user, onboarding state.
- Auth refresh endpoint through `refreshAccessToken`.

## UX Requirements

Splash should feel quick, branded, and calm. Avoid showing intermediate blank screens. If session recovery fails, route decisively to login.

## Open Questions

- Should onboarding completion be trusted from local storage, backend profile state, or both?

## Future Work

- Add telemetry for bootstrap failures.
- Add a fallback error state if bootstrap hangs.
