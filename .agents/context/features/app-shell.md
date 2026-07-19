# Shared App Shell

## Purpose

Provide the global runtime wrapper for navigation, state, gestures, safe areas, keyboard behavior, sockets, notifications, and app-wide prompts.

## Current Behavior

Root layout configures Google Sign-In, screen protection, OneSignal, safe areas, keyboard avoidance, Gluestack UI, provider tree, Expo Router stack, app update prompt, and status bar. The provider tree supplies React Query, gestures, ads, location, options, referral attribution, sockets, notification sync, confetti, and explore matchmaking.

## Key Files

- `src/app/_layout.tsx`
- `src/service/providers/index.tsx`
- `src/service/query-client.ts`
- Provider modules in `src/service/providers`
- Context modules in `src/service/context`

## Data/API Dependencies

- React Query cache.
- Socket.IO connection.
- OneSignal.
- Expo safe area/status/keyboard environment.

## UX Requirements

Global wrappers must preserve safe areas and avoid blank/loading flashes. App-wide prompts should not obscure critical navigation without intent.

## Open Questions

- Should root stack animation remain disabled globally?

## Future Work

- Document provider ordering dependencies.
- Add dev diagnostics for provider initialization.
