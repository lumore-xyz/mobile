# Explore & Matchmaking

## Purpose

Help users discover matches and enter realtime matchmaking.

## Current Behavior

Explore shows match availability and a matchmaking entry state. `ExploreChatContext` manages socket-backed start/stop matchmaking and handles match-found, room-match-found, profile lock/unlock, insufficient credits, credits updates, errors, and ended-chat events.

## Key Files

- Route: `src/app/explore.tsx`
- Screen: `src/screens/Explore.tsx`
- Component: `src/components/explore/MatchMaking.tsx`
- Context: `src/service/context/ExploreChatContext.tsx`
- Socket constants: `src/domain/chat/socketEvents.ts`

## Data/API Dependencies

- `GET /status/match-available-count`
- Socket emits: `startMatchmaking`, `stopMatchmaking`
- Socket events: `matchFound`, `roomMatchFound`, `matchmakingError`, `insufficientCredits`, `creditsUpdated`, `profileLocked`, `profileUnlocked`, `chatEnded`

## UX Requirements

Matchmaking should feel suspenseful and premium. Show clear loading, stop/cancel affordance, insufficient-credit recovery, and notification permission handling.

## Open Questions

- What exact credit cost applies per matchmaking attempt?
- Should failed matchmaking show alternative actions?

## Future Work

- Add event-state diagrams.
- Improve matchmaking visual language per design system.
