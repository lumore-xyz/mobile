# Requirements

## Product Description

Lumore is a premium, curated matchmaking app for accomplished people seeking thoughtful, compatible partners. It supports profile expression, daily introductions, chat, local/community discovery, notifications, credits, and interactive games. The product should feel cultivated, assured, intimate, discreet, and welcoming; curation and privacy create its sense of selectivity.

## Current Requirements

- Users can authenticate through standard auth flows and Google Sign-In.
- Users can complete onboarding and manage their profile and preferences.
- Users can unlock daily Explore suggestions for one credit, view ranked profiles and match notes, and start a conversation without another charge.
- Users can chat with matches, including media/audio-oriented chat UI.
- Users can create posts and participate in community/location room flows.
- Users can receive and open notifications.
- Users can view and earn credits, including ad-backed credit flows.
- Users can access settings, feedback, referral, games, and app-update flows.
- Introductions should foreground meaningful compatibility and clear match context without treating scores as a measure of personal worth.
- The product should communicate discretion, privacy, hospitality, and quality through its service and visual language, without status-coded ranking or pressure tactics.
- UI must follow `.agents/context/DESIGN_SYSTEM.md` across every flow.
- Changes must pass lint and typecheck unless a blocker is documented.

## Future Requirements

- Review the implemented palette and editorial typography across all main flows at device sizes; correct remaining inconsistencies and contrast issues.
- Reduce generic white-card UI and boxy layouts.
- Improve accessibility for touch targets, labels, contrast, screen reader roles, and dynamic text.
- Add tests for high-risk logic and user-facing workflows.
- Keep project decisions and todo planning documented in `.agents/context`.

## Non-Goals Unless Requested

- Do not rewrite the entire app architecture as part of visual polish work.
- Do not introduce a new UI framework without an explicit decision record.
- Do not remove native integrations or existing routes unless the user asks.
