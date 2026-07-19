# Navigation

## Purpose

Define how users move through top-level and subpage flows.

## Current Behavior

Expo Router file-based routes drive navigation. Top-level bottom nav has five tabs: Explore, Community, Chats, Create, and Profile. Subpages are grouped under `(subpage)`. Chat, community, create-post, onboarding, and profile detail use nested routes.

## Key Files

- Routes: `src/app`
- Bottom nav: `src/components/MobileNav.tsx`
- Back header: `src/components/headers/SubPageBack.tsx`

## Data/API Dependencies

Navigation is mostly local, but notification routing maps backend entities to routes.

## UX Requirements

Keep bottom nav to five items or fewer, always show labels, maintain predictable back behavior, and preserve route state where possible.

## Open Questions

- Should Community routes use `/community` only, or is `/rooms` still a legacy path to remove?

## Future Work

- Audit route aliases and stale paths.
- Add deep-link documentation.
