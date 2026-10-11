# Decisions

Record durable technical, product, and design decisions here. Newest entries go first.

## 2026-10-10: Communities Support Local and Topic Types

Decision: Community rooms have a `local` or `topic` type. Local is the default for existing data and clients and requires a location; Topic can omit location.

Reason: Communities should support both place-based groups and interest-based groups while preserving existing rooms.

Impact: Discovery includes Topic rooms without geographic filtering. Location search/pin selection and interest-based recommendation are separate follow-up work; matching eligibility remains unchanged in this phase.

## 2026-10-10: Communities Use Tags as Discovery Metadata

Decision: Communities may have up to five normalized tags, selected from type-specific suggestions or entered by the creator. Tags are returned in community summaries and editable by the creator.

Reason: Shared tags provide durable metadata for later community search and preference-based recommendations without changing current matching eligibility.

Impact: Tags are indexed and visible in discovery/detail UI; ranking by member interests remains future work.

## 2026-10-10: Community Directory Uses Server Pagination and Filters

Decision: Browse public active Local and Topic communities through server-side pages, defaulting to matching-pool size descending. Search checks names, descriptions, and tags; users can filter Local, Topic, or within 25 km and sort by pool size, newest, or nearest.

Reason: Topic communities should be discoverable without device location, and the directory should scale beyond a fixed nearby result list.

Impact: Device location is only required for Nearby and Nearest. Tag-aware personalized ranking remains a separate follow-up.

## 2026-10-10: Pending HaloKYC Sessions Resume In Place

Decision: A Lumore user in `pending` can reopen the saved HaloKYC session. Treat `processing`, `awaiting_credits`, and `manual_review` from HaloKYC as `processing` in Lumore.

Reason: Leaving the verification flow before uploading evidence should not strand the user or create duplicate sessions.

Impact: The mobile Profile and Settings actions remain available for `pending` users and call the existing session endpoint; only `processing` disables the action.

## 2026-10-04: Lumore Uses a Discreet Curated Matchmaking Direction

Decision: Position Lumore as a premium, high-touch matchmaking experience for accomplished people seeking thoughtful compatibility. Express selectivity through curation, privacy, writing, and hospitality; do not use wealth, social rank, or desirability as visual or product status signals.

Reason: The app should feel considered and distinctive while treating members with dignity and making compatibility—not status—the basis of a promising introduction.

Impact: `.agents/context/DESIGN_SYSTEM.md` is the source of truth for app-wide visual and interaction patterns. The palette is implemented in `src/libs/constants/theme.ts` and NativeWind tokens; screens should use semantic color roles and platform-serif display type without adding a custom font dependency.

## 2026-10-03: Force-refreshing Explore costs 10 credits

Decision: Users can replace the current Daily Explore suggestions through an explicit confirmation action costing 10 credits.

Reason: Users need a deliberate escape hatch when the current list is not useful, while the cost protects recommendation quality and discourages repeated refresh churn.

Impact: The backend excludes the current list when generating replacements, debits through an idempotent refresh request reference, and returns the configured refresh cost to clients. The mobile UI must explain the cost and replacement effect before submitting the action.

## 2026-10-03: Explore Rejections Are Private and Server-Enforced

Decision: Rejecting a Daily Explore suggestion requires a structured reason, permits optional private feedback, and creates a backend rejection record without notifying the suggested user.

Reason: A local-only dismissal would allow the same pair to return and would lose useful recommendation feedback. Keeping the feedback private avoids turning pre-conversation preference signals into unsolicited criticism.

Impact: Explore clients remove the rejected card immediately and must use `POST /explore/profiles/:profileId/reject`. The server authorizes the profile against the caller's unlocked daily list and excludes rejection pairs from future Explore responses while the record is retained.

## 2026-10-03: Authentication Uses a Photo-Led Shared Shell

Decision: Keep authentication and password recovery in one shared, safe-area-aware shell with a darkened relationship photograph above a warm raised form sheet.

Reason: The existing photograph expresses Lumore's intimate positioning, while a consistent sheet preserves field contrast, keyboard scrolling, and predictable action placement across small screens.

Impact: New authentication states should reuse `AuthScreenLayout`, semantic tokens, pill actions, inline icon-and-text feedback, and visible labels. Do not introduce standalone generic auth cards or raw status colors.

## 2026-10-03: Daily Explore uses HTTP discovery

Decision: Use GET /explore and POST /explore/unlock for discovery. Store no extra profile data locally; React Query caches are scoped by signed-in user, expire at the server reset time, and refresh when the screen/app becomes active.

Reason: The backend owns the selected 100-profile pool, ranking, one-credit charge and top-ten notes. The client must recover an uncertain unlock with GET rather than automatically repeat a paid POST.

Impact: Say hello calls POST /explore/profiles/:profileId/conversation and then opens the returned chat room. The paid daily list covers this action; neither participant is charged again. Keep chat/community sockets, and keep API credentials exclusively on the backend.

## 2026-10-03: Pin Ads to the SDK 54 Kotlin Toolchain

Decision: Pin react-native-google-mobile-ads to exactly 16.0.3 while using Expo SDK 54/Kotlin 2.1.20.

Reason: Updating to 16.5.0 pulled Google Mobile Ads 25.4.0, whose Kotlin 2.3 metadata fails compilation with this app's compiler. Package 16.0.3 uses Google Mobile Ads 24.9.0. JavaScript bundling and permissive package peers do not verify native compiler compatibility.

Impact: Do not reintroduce a caret range for this dependency until a newer ads release passes a native Gradle build on the selected Expo toolchain.

## 2026-10-03: Dependency Maintenance Stays Within SDK 54 Compatibility

Decision: Apply selected updates inside declared ranges while retaining Expo SDK 54, React Native 0.81.5, React 19.1, NativeWind 4, and Tailwind 3. Constrain safe-area-context to the supported 5.6 minor.

Reason: npm's Wanted column only checks declared semver ranges; it does not validate Expo or native runtime compatibility.

Impact: Keep MMKV 4.1.2/Nitro 0.33.9 until their paired upgrade is validated with a native build and storage checks. MMKV 4.3.2 uses Nitro generator 0.35.9; its wildcard peer range alone is insufficient evidence of compatibility with this runtime.

Image parser correction: The earlier decision to override Metro's image-size dependency to 2.0.4 is superseded. Metro also invokes the parser with a file path, unsupported in v2. Keep Metro's compatible parser until its consumers are migrated; verify both getAssetSize and getAssetData in tests/securityDependencies.test.cjs and perform an Android export. The PostCSS and xcode UUID overrides remain.

## 2026-10-03: Apply Compatible Security Fixes Within Expo SDK 54

Decision: Keep Expo SDK 54 and NativeWind 4/Tailwind 3 aligned, pin patched PostCSS 8.5.28 through an npm override, and avoid forced audit upgrades or incompatible transitive API overrides.

Reason: npm audit proposes framework major changes and downgrades; current Metro and query-string consumers cannot safely adopt the patched major/module-format changes directly.

Impact: Reassess the PostCSS override when Expo's dependency range includes patched versions. Track unresolved advisories and address framework upgrades together with native-build and navigation validation.

Follow-up: The xcode -> uuid 11.1.1 override is compatible with its v4-only consumer. The initial Metro -> image-size 2.0.4 override was removed after full export exposed its incompatible file-path API; see the correction above. Retain `node --test tests/securityDependencies.test.cjs` to verify consumer compatibility on upgrades. A newer Expo Router still depends on query-string 7, so a framework upgrade alone does not resolve its decoder advisory.

## 2026-08-05: Identity Verification Uses HaloKYC

Decision: Start new identity-verification sessions through HaloKYC and use its webhook for verification outcomes.

Reason: Browser completion redirects are not authoritative; verification outcomes must arrive through the backend webhook and match both the user and active verification session.

Impact: Clients call the HaloKYC endpoint, and verification remains pending until the backend receives a recognized status event for the active user and verification session.

## 2026-07-19: Semantic UI Roles Extend the Brand Palette

Decision: Keep the established Lumore palette and expose semantic surface, text, border, and action roles through both Tailwind and TypeScript theme constants.

Reason: Shared roles make app-wide polish consistent and reduce raw per-component color choices without changing the brand source of truth.

Impact: New shared UI should use semantic roles where available; premium actions use violet, emotional actions use rose, and gold remains a selective celebration accent.

## 2026-07-19: Agent Context Lives in `.agents/context`

Decision: Keep persistent AI-agent context in `.agents/context`.

Reason: The repository needs a predictable place for architecture, requirements, design rules, todos, changelogs, and decision history so future agents can start with the same project understanding.

Impact: Agents must read `.agents/context/RULES.md` first and then open the relevant context files before editing.

## 2026-07-19: Design System Uses Lover + Outlaw Brand Archetypes

Decision: Lumore UI direction combines Lover warmth with Outlaw confidence.

Reason: The app should feel like a premium modern dating product, not a generic boxy social app.

Impact: UI work must follow `.agents/context/DESIGN_SYSTEM.md`, including the existing palette, softer shapes, pill controls, tactile motion, and anti-boxy rules.

## Decision Template

```md
## YYYY-MM-DD: Title

Decision: What was decided.

Reason: Why this decision was made.

Impact: What future contributors and agents must do because of it.
```
