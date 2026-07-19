# Requirements

## Product Description

Lumore is a modern dating mobile app focused on meaningful connection, profile expression, chat, local/community discovery, notifications, credits, and interactive games. The desired product feeling is classy, smooth, warm, intimate, and bold, guided by the Lover and Outlaw brand archetypes.

## Current Requirements

- Users can authenticate through standard auth flows and Google Sign-In.
- Users can complete onboarding and manage their profile and preferences.
- Users can explore potential matches and view profile details.
- Users can chat with matches, including media/audio-oriented chat UI.
- Users can create posts and participate in community/location room flows.
- Users can receive and open notifications.
- Users can view and earn credits, including ad-backed credit flows.
- Users can access settings, feedback, referral, games, and app-update flows.
- UI must follow `.agents/context/DESIGN_SYSTEM.md`.
- Changes must pass lint and typecheck unless a blocker is documented.

## Future Requirements

- Create a more distinctive, premium dating-app visual language across all main flows.
- Reduce generic white-card UI and boxy layouts.
- Centralize semantic design tokens so screens do not rely on scattered raw hex values.
- Improve accessibility for touch targets, labels, contrast, screen reader roles, and dynamic text.
- Add tests for high-risk logic and user-facing workflows.
- Keep project decisions and todo planning documented in `.agents/context`.

## Non-Goals Unless Requested

- Do not rewrite the entire app architecture as part of visual polish work.
- Do not introduce a new UI framework without an explicit decision record.
- Do not remove native integrations or existing routes unless the user asks.
