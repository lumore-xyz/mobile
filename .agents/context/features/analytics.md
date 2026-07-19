# Analytics

## Purpose

Track app events for product and behavior insights.

## Current Behavior

A lightweight analytics helper exists for posting analytic events. Current usage appears limited and should be expanded deliberately.

## Key Files

- `src/service/analytics.ts`

## Data/API Dependencies

- Backend analytics endpoint as implemented by the helper.

## UX Requirements

Analytics must not block user actions. Avoid collecting sensitive data unless explicitly required and approved.

## Open Questions

- What events are required for activation, retention, and safety analysis?
- What privacy policy constraints apply?

## Future Work

- Define an event taxonomy.
- Add analytics to onboarding, matchmaking, chat, referrals, and credits.
