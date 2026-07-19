# Changelogs

Record every meaningful repository change here after it is made. Keep entries newest first.

## 2026-07-19

- Redesigned the community creator controls action sheet with a dark indigo header card, icon-button close/back, dynamic title, in-sheet save button on edit mode, larger premium icon containers, pill buttons, safe-area aware scroll, and haptics on every action.
- Added an overflow-hidden rounded cover image, swapped helper copy to muted ink, added a sparkles trust strip in the controls menu, and reused `FieldEditorSheet` patterns for design consistency.
- Verification after creator controls action sheet redesign: `npm run lint` passed; `npm run typecheck` passed.
- Verification after This-or-That submit redesign: `npm run lint` passed; `npm run typecheck` passed.
- Redesigned the This-or-That game screen with a dark profile-game hero, clearer progress card, larger dating-signal choice cards, polished loading/error/empty states, and haptic accessible choice/skip actions.
- Verification after This-or-That game redesign: `npm run lint` passed; `npm run typecheck` passed.
- Redesigned the Games screen with a dark play-to-reveal hero, featured This-or-That card, clearer match-signal framing, and benefit rows for why games improve profiles.
- Verification after Games redesign: `npm run lint` passed; `npm run typecheck` passed.
- Redesigned the Referral screen with a dark invite-rewards hero, stronger referral-code card, tokenized copy actions, clearer apply-code feedback, polished stats, and warmer verification gating.
- Verification after Referral redesign: `npm run lint` passed; `npm run typecheck` passed.
- Redesigned the Earn Credits screen with a dark rewards hero, polished rewarded-ad action card, quota pills, richer earn-method cards, clearer distribution/use rules, and a stronger future-token note.
- Verification after Earn Credits redesign: `npm run lint` passed; `npm run typecheck` passed.
- Redesigned the Credits screen with a dark wallet-style balance card, clearer daily reward panel, tokenized earn/claim actions, mini stats, polished transaction rows, and stronger empty/loading states.
- Verification after Credits redesign: `npm run lint` passed; `npm run typecheck` passed.
- Redesigned the User Settings screen with a dark account-control intro, grouped contact and wallet panels, clearer session controls, a stronger danger zone, tokenized icons, and haptic action feedback.
- Verification after User Settings redesign: `npm run lint` passed; `npm run typecheck` passed.
- Redesigned the Settings screen with a dark guided intro, rounded grouped settings sections, descriptive settings rows, tokenized icons, haptic row feedback, and a stronger verification card.
- Verification after Settings redesign: `npm run lint` passed; `npm run typecheck` passed.
- Fixed `FieldEditorSheet` mounting when no field is selected yet by guarding field-label formatting and editor content rendering.
- Verification after `FieldEditorSheet` undefined field fix: `npm run lint` passed; `npm run typecheck` passed.
- Redesigned the Edit Preference screen with a dark guided intro, stronger match-preference progress card, quick preference actions, rounded section cards, and icon-led preference groups.
- Verification after Edit Preference redesign: `npm run lint` passed; `npm run typecheck` passed.
- Changed the Public visibility option icon to an open eye for clearer visible-to-everyone semantics.
- Verification after public visibility icon update: `npm run lint` passed; `npm run typecheck` passed.
- Improved the visibility action sheet with clearer Public/Unlocked/Private labels, explanatory option copy, stronger selected state, tokenized icons, and a dark trust-oriented intro panel.
- Verification after visibility action-sheet redesign: `npm run lint` passed; `npm run typecheck` passed.
- Fixed selected multi-select chip check icons to use an explicit theme color so they render white on highlighted chips.
- Verification after multi-select check icon color fix: `npm run lint` passed; `npm run typecheck` passed.
- Improved edit profile action-sheet controls with a guided dark sheet header, rounded input/textarea surfaces, tokenized date picker trigger, calmer single/multi-select chips, clearer selected states, and better stacked field spacing.
- Verification after edit profile action-sheet control redesign: `npm run lint` passed; `npm run typecheck` passed.
- Redesigned the Edit Profile screen with a dark guided intro, stronger profile photo preview, polished profile-strength card, quick edit actions, rounded section cards, softer field rows, and cleaner lifestyle chips.
- Verification after Edit Profile redesign: `npm run lint` passed; `npm run typecheck` passed.
- Added profile post editing from the owner post actions sheet, including a second edit sheet for prompt answers, text posts, image captions, and visibility updates.
- Verification after profile post edit sheet addition: `npm run lint` passed; `npm run typecheck` passed.
- Moved profile post edit actions to an absolute top-right overlay and removed the bottom metadata/action row for cleaner dating-profile-style cards.
- Verification after profile post action overlay change: `npm run lint` passed; `npm run typecheck` passed.
- Revised profile-created post cards toward a Hinge-inspired dating-profile module style with content-first prompt/photo/text blocks, lighter metadata, and conversational affordance copy.
- Verification after Hinge-inspired profile post revision: `npm run lint` passed; `npm run typecheck` passed.
- Redesigned profile-created post cards with richer metadata, type chips, editorial prompt/text treatments, framed image previews, and tokenized empty/fallback states.
- Verification after profile post-card redesign: `npm run lint` passed; `npm run typecheck` passed.
- Rebuilt `VisibilityToggle` as a dedicated visibility picker so the selected/default value is always visible in the trigger and selected state is clear in its action sheet.
- Verification after `VisibilityToggle` selected-value fix: `npm run lint` passed; `npm run typecheck` passed.
- Fixed create-post visibility selectors so the default value is visible in action sheets by allowing full-width visibility controls and refreshing the select trigger styling.
- Verification after visibility selector fix: `npm run lint` passed; `npm run typecheck` passed.
- Removed the extra empty space in the Create Prompt Post screen by constraining the horizontal category chip row and tightening the prompt list spacing.
- Verification after Create Prompt Post spacing fix: `npm run lint` passed; `npm run typecheck` passed.
- Redesigned the Create Post flow with a dark format-picker intro, richer post type cards, polished prompt categories/cards, guided text/image composers, stronger media picker empty states, tokenized visibility/error panels, and accessible submit controls.
- Verification after Create Post redesign: `npm run lint` passed; `npm run typecheck` passed.
- Redesigned the Create Community screen with a dark editorial intro, rounded guided form surface, clearer cover-image upload state, tokenized location confirmation, disabled-submit guidance, and accessible `Pressable` controls.
- Verification after Create Community redesign: `npm run lint` passed; `npm run typecheck` passed.
- Redesigned the Community detail screen with an immersive photo hero, accessible overlaid controls, tokenized location and pool-status panels, refreshed pool/chat empty states, polished member cards, and updated creator controls.
- Verification after Community detail redesign: `npm run lint` passed; `npm run typecheck` passed.
- Redesigned the Community list with a dark editorial overview, accessible create action, photo-led room cards, tokenized metadata pills, clearer loading/error/empty states, and real room summary fields.
- Verification after Community list redesign: `npm run lint` passed; `npm run typecheck` passed.
- Aligned Notifications with the Feedback subpage style by using the shared `SubPageBack` header, a dark rounded editorial summary card, matching loading hero, and card-based empty/error states.
- Verification after notification consistency pass: `npm run lint` passed with 2 existing warnings in `src/app/community/index.tsx`; `npm run typecheck` still reports the 3 existing `LocationRoomSummary` field errors in `src/app/community/index.tsx`.
- Redesigned Notifications with an unread summary, semantic event icons, stronger read/unread hierarchy, clearer routing affordances, tokenized relative timestamps, and matching loading surfaces.
- Added confirmed notification deletion, accessible 44pt controls, vector empty-state imagery, and distinct empty, partial-error, and retryable full-error experiences.
- Redesigned received Feedback with an editorial overview, aggregate rating context, scannable contributor cards, visual rating bars, optional reason emphasis, and useful empty/loading/retry states.
- Verification after Notifications and Feedback redesign: `npm run lint` passed with 2 existing warnings in `src/app/community/index.tsx`; `npm run typecheck` reports only the 3 existing community room model errors; `git diff --check` passed.
- Redesigned the chat inbox with an editorial conversation header, unread-message summary, count-aware pill tabs, compact relative timestamps, message-type icons, and clearer unread card emphasis.
- Added pull-to-refresh, actionable loading/error/empty states, distinct active and archive guidance, unavailable-chat semantics, stable profile imagery, and descriptive conversation accessibility labels.
- Modernized shared tabs and the notification bell with semantic colors, `Pressable` feedback, accessible selected states, and a light icon variant for dark surfaces.
- Fixed the legacy archive route's missing tab callback, removing the previous chat archive TypeScript error.
- Verification after inbox redesign: `npm run lint` passed with 2 existing warnings in `src/app/community/index.tsx`; `npm run typecheck` now reports only the 3 existing community room model errors; `git diff --check` passed.
- Redesigned the active chat experience with a compact small-screen-safe identity header, warm cream conversation canvas, softer asymmetric bubbles, clearer reply previews, stable shared-image frames, and tokenized delivery/read states.
- Refined the message composer with a single calm pill surface, explicit disabled/send/recording/upload/error states, accessible cancellation controls, and a more reassuring ended-chat notice.
- Elevated match notes, date dividers, reactions, typing feedback, voice playback, and loading skeletons into a consistent Lover + Outlaw visual language without changing realtime behavior.
- Verification after chat redesign: `npm run lint` passed with 2 existing warnings in `src/app/community/index.tsx`; `npm run typecheck` still reports the existing chat archive and community room model errors; `git diff --check` passed.
- Redesigned owner and public profile screens with a larger photo-led identity hero, clearer name and verification hierarchy, compact metadata pills, and accessible edit actions.
- Reframed profile completion as an encouraging dark editorial moment, simplified owner shortcuts, grouped lifestyle essentials, refreshed This or That and post surfaces, and added more useful empty-state guidance.
- Added profile accessibility labels, semantic headings, stable image dimensions, tokenized refresh colors, 48pt action targets, and loading skeleton parity.
- Verification after profile redesign: `npm run lint` passed with 2 existing warnings in `src/app/community/index.tsx`; `npm run typecheck` still reports the existing chat archive and community room model errors; `git diff --check` passed.
- Added semantic surface, text, border, and action tokens to the NativeWind and TypeScript theme foundations.
- Refined shared buttons into accessible pill-shaped `Pressable` controls and refreshed shared input/textarea curves, surfaces, focus states, and spacing.
- Improved the five-item bottom navigation with tokenized icon colors, a clearer violet active state, larger touch areas, and consistent pressed feedback.
- Verification: `npm run lint` passed with 2 existing warnings in `src/app/community/index.tsx`; `npm run typecheck` still reports the existing chat archive and community room model errors.
- Created detailed feature documentation files under `.agents/context/features` for every feature listed in `.agents/context/FEATURES.md`.
- Expanded `.agents/context/FEATURES.md` into a current feature inventory based on routes, screens, services, providers, hooks, socket events, and API helpers.
- Added `.agents/context/FEATURES.md` as the index for detailed feature docs in `.agents/context/features`.
- Updated `.agents/context/RULES.md` to include the features index and feature details directory.
- Added agent context files in `.agents/context`: architecture, changelogs, todos, requirements, rules, and decisions.
- Updated `AGENTS.md` to direct AI agents to the shared context files.
- Established `.agents/context/DESIGN_SYSTEM.md` as the canonical Lumore design-system source.
- Verification: `npm run lint` passed with 2 warnings in `src/app/community/index.tsx`; `npm run typecheck` failed on existing chat/community typing issues.
- Verification after feature-index update: `npm run lint` passed with the same 2 warnings; `npm run typecheck` failed with the same existing chat/community typing issues.
- Verification after feature inventory update: `npm run lint` passed with the same 2 warnings; `npm run typecheck` failed with the same existing chat/community typing issues.
- Verification after detailed feature docs: `npm run lint` passed with the same 2 warnings; `npm run typecheck` failed with the same existing chat/community typing issues.

## Entry Format

Use this structure:

```md
## YYYY-MM-DD

- Changed X to accomplish Y.
- Added/updated/removed Z.
- Verification: `npm run lint`, `npm run typecheck`, or reason not run.
```
