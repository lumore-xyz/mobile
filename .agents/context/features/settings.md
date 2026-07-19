# Settings

## Purpose

Provide a hub for account, profile, rewards, community, feedback, and verification actions.

## Current Behavior

Settings groups links for edit profile, edit preferences, user settings, credits, referral, games, feedback, and identity verification.

## Key Files

- Route: `src/app/(subpage)/settings.tsx`
- Screen: `src/screens/Settings.tsx`
- Component: `src/components/headers/SubPageBack.tsx`
- Auth logout support: `src/service/requests/auth.ts`

## Data/API Dependencies

- User fetch through `useUser`.
- Didit verification start endpoint.

## UX Requirements

Settings should be clear and calm. Destructive actions must be separated and confirmed. Use design-system surface rules to reduce boxy grouping.

## Open Questions

- Should logout live here or in user settings?
- Which settings require separate detail docs?

## Future Work

- Redesign settings sections using softer cards or list bands.
- Add notification/privacy settings if supported.
