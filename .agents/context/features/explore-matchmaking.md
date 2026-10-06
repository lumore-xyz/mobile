# Daily Explore

## Behavior

Users unlock up to ten daily suggestions for one credit. A ready list can be replaced for the configured 10-credit force-refresh cost after confirmation. The backend selects up to 100 candidates using age/gender preferences and ranks distance and goals most strongly. Cards display public profile information, a score out of 100, and a match note; hidden fields remain absent. Profile photos open the existing profile route. Say hello creates or reuses a chat from a paid suggestion and opens the existing conversation screen. Rejecting a suggestion requires a reason, accepts optional private feedback, removes the card immediately, and excludes the pair through the backend rejection record.

The locked, generating, empty, and error states use Lumore's photo-led discovery composition with the relationship photograph, bouquet focal point, visible credit balance, and a `Start exploring` action. Ready suggestions use a white canvas and a virtualized list of compact editorial cards. Cards show a privacy-blurred avatar, nickname only, verification, compatibility, and any public age, gender, or distance metadata supplied by the API. The bottom action row keeps rejection on the left and an icon-only Say hello action on the right; both retain accessible labels.

## Implementation

- Screen and list: src/screens/Explore.tsx; route: src/app/explore.tsx.
- API contracts: src/features/explore/api.ts.
- Server-state lifecycle: src/features/explore/useDailyExplore.ts.
- Reset, error action and retry helpers: src/features/explore/state.ts.
- Chat/community listeners remain in `RealtimeEventsProvider`; this screen no longer starts live socket matchmaking.

## API Contract

- GET /explore reads today's list and can recover an interrupted payment.
- POST /explore/unlock explicitly unlocks once for the UTC day; partial lists cost one credit and empty lists are free.
- POST /explore/profiles/:profileId/conversation authorizes the selected profile and returns roomId. It adds no credit charge.
- POST /explore/profiles/:profileId/reject requires a supported reason, accepts up to 500 characters of private feedback, and returns the removed profile ID.
- A 202 generating response polls using Retry-After while the screen is focused and the app is active. Failed POSTs recover through GET. Automatic POST retries are disabled.
- UTC resetAt is rendered in the device's local time; expired cached cards are hidden immediately.

## Validation

Run npm run lint, npm run typecheck and node --test tests/exploreState.test.cjs. Validate unlock, pending/error recovery, privacy-safe missing photos, pull-to-refresh and Say hello on a device against the matching backend deployment.
