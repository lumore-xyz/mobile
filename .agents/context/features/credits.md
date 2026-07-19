# Credits

## Purpose

Show users their credit balance and history for paid/rewarded app actions.

## Current Behavior

Credits screen fetches balance and paginated history. Users can claim daily credits. Credit changes also flow through realtime events during matchmaking.

## Key Files

- Route: `src/app/(subpage)/credits.tsx`
- Screen: `src/screens/Credits.tsx`
- APIs: `fetchCreditsBalance`, `fetchCreditsHistory`, `claimDailyCredits`
- Query key usage in screens and `ExploreChatContext`

## Data/API Dependencies

- `GET /credits/balance`
- `GET /credits/history`
- `POST /credits/daily-claim`
- Socket event: `creditsUpdated`

## UX Requirements

Credits should feel rewarding and transparent. Show why credits changed, when they changed, and how to earn more.

## Open Questions

- What actions spend credits?
- Are credit purchases planned?

## Future Work

- Document ledger entry types.
- Add clearer earn/spend explanations.
