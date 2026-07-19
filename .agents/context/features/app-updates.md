# App Updates

## Purpose

Prompt users to update when a newer or required app version is available.

## Current Behavior

The app checks backend app-version config, caches config for six hours, compares installed/latest/minimum versions, and shows optional or force update states globally through `AppUpdatePrompt`.

## Key Files

- Component: `src/components/ui/AppUpdatePrompt.tsx`
- Hook: `src/hooks/useAppUpdate.ts`
- Service: `src/service/appUpdate.ts`
- Helper: `src/utils/version.ts`

## Data/API Dependencies

- `GET /app-version`
- Native app version from `expo-application`
- Store URLs from backend config.

## UX Requirements

Forced updates must block clearly and politely. Optional updates should be dismissible if product allows.

## Open Questions

- How long can users defer optional updates?

## Future Work

- Document app-version backend schema.
- Add manual refresh/debug affordance for QA.
