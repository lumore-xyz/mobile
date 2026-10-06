# Changelogs

Record every meaningful repository change here after it is made. Keep entries newest first.

## 2026-10-04: Create Lumore Play Store screenshot set

- Added eight 9:16 promotional screenshots using supplied app captures, Lumore colors, and concise feature headlines, plus an overview sheet and regeneration script.
- Replaced the exact community address in the supplied capture with a general nearby-area label.
- Verification: checked full-size poster renders and 1080 × 1920 exports; `npm run lint` and `npm run typecheck` passed.

## 2026-10-04: Replace deprecated Expo Image resize mode

- Set the profile photo's crop mode with Expo Image's `contentFit` prop instead of a deprecated `resizeMode` style.
- Verification: `npm run lint` and `npm run typecheck`.

## 2026-10-04: Respect profile unlocks in chat names

- Show a matched user's real name in the inbox and conversation header only when they have unlocked the viewer; otherwise show only their nickname.
- Verification: `npm run lint` and `npm run typecheck`.

## 2026-10-04: Implement Lumore's premium visual system across the app

- Replaced the bright cream, purple, pink, and yellow palette with shared porcelain, midnight, forest, aubergine, and champagne tokens in TypeScript and NativeWind; migrated app screens to the semantic color names.
- Matched Android launch, status, adaptive-icon, image-crop, and notification-accent colors to the new palette.
- Reduced oversized card corners and heavy title weights, introduced restrained serif display type for key headings, and changed shared primary actions and form fields to calmer shapes and surfaces.
- Replaced repeated multicolor match confetti with a short, brand-colored celebration.
- Verification: `npm run lint` and `npm run typecheck` passed; `npx expo export --platform android` passed. Emulator visual review could not complete because the installed dev client remained attached to a different Metro server on port 8081; native Gradle build could not download its wrapper distribution in the network-restricted environment.

## 2026-10-04: Reposition Lumore's app-wide design system

- Rewrote the canonical visual direction around discreet, high-touch matchmaking for accomplished people seeking thoughtful compatibility.
- Defined a restrained palette target, editorial typography and layout guidance, cross-feature patterns, accessibility expectations, and a screen review checklist.
- Aligned the product requirements and durable design decision with the new positioning; added shared-token implementation to the backlog.
- Kept current runtime colors unchanged; palette values are design targets that need a coordinated semantic-token implementation.
- Verification: documentation-only change; lint and typecheck were not run.

## 2026-10-04: Redesign profile prompt and photo cards

- Gave profile prompts deep indigo surfaces, gold detailing, and stronger editorial answer typography; paired uploaded photos with matching caption panels.
- Capped long prompt answers and photo captions with an accessible Read more control so oversized text does not overwhelm the profile.
- Added a graceful unavailable-image state for uploaded profile photos.
- Verification: `npm run lint` and `npm run typecheck` passed.

## 2026-10-04: Show profile avatar fallback in community matches

- Sized pool and matched-chat profile images explicitly and show the user initial when a remote profile photo fails to load.
- Verification: `npm run lint` and `npm run typecheck` passed.

## 2026-10-04: Fix Community cover sizing

- Applied explicit absolute-fill styles to Community cover images so remote images and the bundled fallback fill their card and detail hero on Android.
- Verification: `npm run lint` and `npm run typecheck` passed.

## 2026-10-04: Restore the Explore background image

- Fixed the Explore discovery background by assigning Expo Image and its tint overlay explicit absolute-fill styles, with a translucent tint that preserves the photo on Android.
- Verification: `npm run lint` and `npm run typecheck` passed.

## 2026-10-04: Show the color Lumore logo in onboarding

- Replaced the onboarding header text with the existing full-color Lumore wordmark.
- Verification: `npm run lint`, `npm run typecheck`, and `git diff --check`.

## 2026-10-04: Extend the auth panel through the bottom safe area

- Moved the bottom safe-area inset inside the shared authentication panel so no dark strip remains beneath the form.
- Verification: `npm run lint`, `npm run typecheck`, and `git diff --check`.

## 2026-10-04: Remove excess space from action sheets

- Removed the shared 80% minimum sheet height so each action sheet fits its content unless a screen explicitly requests a taller editor.
- Removed duplicate safe-area bottom padding from the Explore rejection, chat options, community controls, and field editor sheets.
- Verification: `npm run lint`, `npm run typecheck`, and `git diff --check`.

## 2026-10-04: Restore community covers and compact the requested screens

- Added a bundled Community cover fallback for rooms with missing or failed image URLs, used in room cards, room details, and cover previews.
- Reduced Community card spacing and the detail hero height, and removed the unlock/earn-credit note from the Explore locked state.
- Verification: `npm run lint`, `npm run typecheck`, `git diff --check`, and `npx expo export --platform android` (the Community cover is in the exported asset list).

## 2026-10-04: Fix remaining bundled images and profile image load crash

- Rendered the shared Lumore wordmark and update artwork with React Native `Image`, consistent with other bundled brand assets.
- Guarded profile post image dimension handling against incomplete load events that were throwing at runtime.
- Verification: `npm run lint`, `npm run typecheck`, and `git diff --check`.

## 2026-10-04: Use the native image view for the splash logo

- Rendered the bundled Splash logo with React Native `Image`, matching the auth screen fix for static asset IDs.
- Verification: `npm run lint` and `npm run typecheck` passed.

## 2026-10-04: Restore profile and This or That images

- Rendered bundled profile detail icons and This or That question/answer images with React Native `Image`, matching the auth and splash image fix.
- Verification: `npm run lint` and `npm run typecheck`.

## 2026-10-04: Restore auth screen local images

- Rendered the auth background, Lumore wordmark, and Google logo with React Native `Image` so their static asset IDs display on Android.
- Verification: Android emulator screenshot confirmed all three images; `npm run lint` and `npm run typecheck` passed.

## 2026-10-04: Avoid deprecated splash imports and transient Metro watches

- Replaced Moti's barrel import on the splash screen with React Native `Animated`, preserving its entrance and looping effects without accessing core `SafeAreaView`.
- Excluded generated CMake `.cxx` directories from Metro's watcher to avoid missing-directory watch errors during native builds.
- Verification: `npm run lint`, `npm run typecheck`, `git diff --check`, and `npx expo export --platform android` passed.

## 2026-10-04: Replace static asset require calls

- Replaced static image `require` calls across the app with imports and declared PNG/WebP module types for TypeScript.
- Verification: `npm run lint`, `npm run typecheck`, and `git diff --check` passed.

## 2026-10-04: Guard the optional inbox user ID

- Pass an empty ID to `useUser` when stored user data has no `_id`, matching the hook's disabled-query behavior.
- Verification: `npm run lint`, `npm run typecheck`, and `git diff --check` passed.

## 2026-10-04: Align the update prompt with Lumore colors

- Replaced its isolated purple/beige palette with shared color tokens and removed unused accent/close-button styles.
- Kept the gradient treatment using the existing violet and indigo tokens.
- Verification: `npm run lint`, `npm run typecheck`, `git diff --check`, and `npx expo export --platform android` passed.

## 2026-10-04: Make the splash responsive and token-based

- Replaced hardcoded cream and gold colors with existing semantic tokens.
- Used live window dimensions so the animated mark scales correctly after rotation or resize.
- Verification: `npm run lint` and `npm run typecheck` passed.

## 2026-10-04: Bound form-control style compatibility casts

- Replaced the final explicit `any` casts in app source with each Gluestack style function's parameter type.
- Verification: `npm run lint` and `npm run typecheck` passed.

## 2026-10-04: Remove confirmed dead UI code and tooling dependencies

- Deleted the unused GuestLogin screen (its route redirects directly to Login), trimmed generated icon definitions to the three used by `TextInput`, and removed unused actionsheet exports.
- Removed four unused direct dev dependencies; Expo's ESLint preset continues to provide the plugins it uses.
- Made form-control internals private when they are consumed only within their wrapper module.
- Kept the Expo image-picker config plugin, which is referenced by `app.json`, and kept the repository's untracked tests untouched.
- Knip still reports `expo-updates` against `app.json`; there is no matching import, plugin entry, or `updates` config, so no package was added solely to suppress that inference.
- Made chat helper types private where they are only used inside their defining module.
- Verification: `npm run lint`, `npm run typecheck`, `npx expo export --platform android`, `git diff --check`, and the current Knip scan passed apart from documented app-config/user-test findings.

## 2026-10-04: Focus the remaining UI audit

- Updated the UI backlog to reflect the completed first visual pass and keep device-size layout/accessibility review as the next concrete step.
- Dropped a speculative shared-primitives task until a repeated UI need identifies a useful seam.

## 2026-10-04: Simplify Explore interest chip rendering

- Resolve each interest option once per chip and reuse its icon and label.
- Verification: `npm run lint` and `npm run typecheck` passed.

## 2026-10-04: Virtualize the feedback feed

- Replaced the growing `ScrollView` with `FlatList` pagination and extracted the repeated feedback row into a typed renderer.
- Kept loaded feedback visible when a later page fails, while retaining retry, loading, empty, and refresh states.
- Verification: `npm run lint` and `npm run typecheck` passed.

## 2026-10-04: Replace remaining unsafe feature error and options types

- Removed `any` from onboarding, referral, post-upload, chat-media, option-loading, and web icon-style handling.
- Reused Axios status and error guards so HTTP details remain available without unchecked response access.
- Verification: `npm run lint`, `npm run typecheck`, `npx expo export --platform android`, and `git diff --check` passed.

## 2026-10-04: Narrow onboarding form data

- Replaced onboarding form `any` records with unknown values and safely narrowed nested goal data.
- Used Zod's unknown fallback for fields without a specialized validator.
- Removed a leftover commented debug log from the field renderer.
- Verification: `npm run lint` and `npm run typecheck` passed.

## 2026-10-04: Replace unsafe screen and notification payload types

- Replaced auth mutation errors and community room mutation errors with `unknown`, using the shared user-facing error formatter for alerts.
- Reused existing chat room, notification, community room, and picker asset types instead of local `any` annotations.
- Narrowed notification metadata values to `unknown`.
- Verification: `npm run lint`, `npm run typecheck`, `npx expo export --platform android`, and `git diff --check` passed.

## 2026-10-04: Type and harden local session storage

- Added a minimal stored-user shape and guarded malformed MMKV user JSON instead of allowing parse failures or implicit `any` through the app.
- Parsed onboarding flags from their actual stored boolean strings, preserving an unknown state when no flag exists.

## 2026-10-04: Simplify and type the shared field editor

- Removed unused `form` and external loading props from the shared editor; it now owns its submit state and prevents duplicate saves.
- Replaced editor and profile field-list `any` types with unknown-value narrowing and shared profile types.
- Updated the editor heading to identify whether profile, preference, or account settings are being edited.
- Verification: `npm run lint`, `npm run typecheck`, `npx expo export --platform android`, and `git diff --check` passed.

## 2026-10-04: Tighten API payload types

- Replaced `any` payloads for profile updates and post edits with `object` and the shared post content type.
- Centralized React Native URI-file appends behind an explicit FormData bridge type, removing scattered multipart `any` casts.
- Verification: `npm run lint`, `npm run typecheck`, `npx expo export --platform android`, and `git diff --check` passed.

## 2026-10-04: Refine the post format chooser

- Replaced three repeated post cards with a scroll-safe, open format list and more specific prompt, photo, and writing cues.
- Removed fixed full-height wrappers so the chooser can adapt to shorter screens.
- Verification: `npm run lint`, `npm run typecheck`, `npx expo export --platform android`, and `git diff --check` passed.

## 2026-10-04: Clarify prompt creation states

- Added prompt category, prompt, and create-post payload types; removed `any` from prompt selection and creation.
- Separated prompt-fetch errors from empty categories with a retry action, and changed the prompt picker to an open, scan-friendly list.
- Verification: `npm run lint`, `npm run typecheck`, `npx expo export --platform android`, and `git diff --check` passed.

## 2026-10-04: Type chat room and socket payloads

- Added chat room, raw message, reaction, and edit-event shapes and used them for chat fetching and context state.
- Removed untyped realtime handlers and dead context error state; normalized message timestamps before they enter the UI model.
- Typed the chat header user data against the shared profile shape.
- Verification: `npm run lint`, `npm run typecheck`, `npx expo export --platform android`, and `git diff --check` passed.

## 2026-10-04: Refine account settings

- Changed contact and wallet settings from stacked cards to grouped, accessible rows.
- Typed account settings updates, removed untyped casts and unused screen state, and wired the editor loading state to its actual save request.
- Verification: `npm run lint`, `npm run typecheck`, `npx expo export --platform android`, and `git diff --check` passed.

## 2026-10-04: Type profile data and optimize profile images

- Added profile and post response types; removed `any` from profile data and post rendering/editing.
- Removed the profile editor's untyped user cast and changed its mutation value/error handling to `unknown`.
- Migrated profile photos and post images to `expo-image` with memory/disk caching and a short image transition.
- Preserved prompt post compatibility with both string and expanded-object prompt IDs.
- Removed the generated `VStack` wrapper after confirming it has no repository references.
- Verification: `npm run lint`, `npm run typecheck`, and `git diff --check` passed.

## 2026-10-04: Simplify preference editing rows

- Replaced repeated preference field cards with grouped, open rows that make unset choices easy to spot.
- Typed preference display and update values; removed the field-update `any` and TypeScript suppression branches.
- Verification: `npm run lint`, `npm run typecheck`, `npx expo export --platform android`, and `git diff --check` passed.

## 2026-10-04: Trim unused dependencies and refresh primary navigation

- Removed unreferenced picker, storage, camera, secure-store, font, symbols, UI adapter, and unconfigured formatter-plugin dependencies; retained packages that Expo or Gluestack still requires transitively and declared `clsx` directly where app code imports it.
- Removed disconnected matchmaking UI, unused selection/avatar/bottom-sheet wrappers, a stale feature-flag helper, and unreferenced API and utility exports.
- Replaced the obsolete Explore React context with a focused realtime event provider, keeping global match routing, community, profile-lock, credit, and inbox updates while dropping abandoned matchmaking state/actions.
- Removed unused template and legacy image/font assets after confirming they are absent from app configuration and source references.
- Switched frequently rendered chat, profile, game, logo, upload-preview, auth backdrop, and Explore backdrop images to `expo-image` for caching and stable list rendering.
- Converted the remaining chat/community hero and app-update artwork to `expo-image`; replaced legacy touchables in shared headers and the update prompt with `Pressable` feedback.
- Stabilized the notifications feed pagination callback to avoid recreating its end-reached handler during renders.
- Added an explicit inbox response type and removed `any` from the active/archive conversation list path.
- Stabilized inbox refresh and pagination handlers to keep the memoized feed props stable.
- Replaced unchecked Axios error casts with one typed HTTP status/message reader shared by query retry, auth, and error-copy flows.
- Corrected community creation/back destinations to the existing community detail route and removed casts from statically known navigation targets.
- Removed analytics/preference response `any` types and used Axios' header setter in the authenticated request interceptor.
- Typed notification navigation targets as Expo Router `Href` values, including route parameters for matches and communities.
- Redesigned onboarding as a step-led, safe-area-aware form with grouped fields, progress context, inline errors, and clear back/continue actions.
- Removed stale chat, notification, credit, and helper types/exports that had no consumers.
- Restyled the shared bottom navigation as a dark indigo dock with a gold active state, and aligned the status bar surface with the app palette.
- Verification: `npm run lint`, `npm run typecheck`, `npx expo install --check`, `npx expo export --platform android`, and `git diff --check` passed.

## 2026-10-04: Keep conversation controls visible during loading

- Moved conversation search and filter controls outside the loading/list content so they remain available while rooms are fetching.
- Kept the existing skeleton, error, pagination, and filter-sheet behavior intact.

## 2026-10-04: Prevent filter interaction rerenders

- Debounced conversation search before applying the server query.
- Kept filter-sheet selections local until Apply filters is pressed, avoiding a list/query refresh for every tap.

## 2026-10-04: Refine conversation filter sheet

- Reworked the filter sheet with clearer hierarchy, compact two-column sort choices, active-state icons, reset control, helper copy, and an explicit Apply filters action.
- Preserved server-backed search, unread filtering, and sorting behavior.

## 2026-10-04: Add server-backed conversation search and filters

- Added backend search, unread-only filtering, and sort parameters for active and archived inbox pagination.
- Added a shared Conversations search field and filter sheet for recent/oldest, compatibility, and distance ordering.
- Persisted Explore distance metadata into new conversation match notes so nearest/farthest sorting has a server-side value.

## 2026-10-04: Remove deprecated SafeAreaView usage

- Replaced the root SafeAreaView component with safe-area-context insets applied to a regular View.
- Preserved top, bottom, left, and right insets without relying on the deprecated component warning path.

## 2026-10-04: Add paginated inbox and feedback lists

- Added page metadata to active/archive inbox and received-feedback responses while preserving unpaginated callers.
- Added mobile infinite loading with end-reached/footer loaders for active chats, archived chats, and feedback.

## 2026-10-04: Gate chat profile visits with rewarded ads

- Internal chat profile navigation now shows the existing rewarded ad before opening the public profile route.
- Corrected the navigation target to the grouped public profile route.

## 2026-10-04: Add fresh profile compatibility

- Added an authenticated compatibility endpoint that recalculates the score from current preferences and answers.
- Added the score panel to public profiles with loading and unavailable states.

## 2026-10-04: Personalize public profile header

- Replaced the generic Match Profile title with the viewed user's nickname-based profile title.
- Added a safe User Profile fallback while profile data is loading or unavailable.

## 2026-10-04: Add Explore profile-completion footer

- Added a single post-results prompt after the final Explore profile card.
- Linked the prompt to profile editing with completion and verification-focused copy.

## 2026-10-03: Add paid Explore refresh

- Added a confirmation-gated force refresh that replaces the current Daily Explore list for 10 credits and excludes the current suggestions from the replacement pool.
- Added an idempotent backend refresh debit, refresh endpoint, client mutation, balance invalidation, and insufficient-balance handling.
- Fixed the ready state showing a stale red error panel over valid cached profiles after a failed background refetch.
- Fixed the backend credit-ledger index name collision that caused conversation and Explore requests to return a generic 500 error after adding the refresh ledger index.
- Verification: mobile lint, typecheck, and Explore state tests passed; backend focused tests still need refresh-specific coverage.

## 2026-10-03: Show shared profile interests

- Added an optional Interests section to the shared profile screen for both the owner profile and public user profiles.
- Interest chip labels and icons now resolve from the API-backed dynamic interest options; older values still render without an icon if no option metadata exists.
- Applied the same API-backed labels and icons to Daily Explore interest chips.
- The section uses the profile response after its existing visibility filtering, so hidden or unset interests are not exposed.
- Verification: `npm run lint` and `npm run typecheck` passed.

## 2026-10-03: Fix Explore card layout regression

- Restored explicit dimensions for the blurred profile image, prevented the editorial card from flex-growing with the list, and anchored interests, match rationale, and icon actions below the profile header.
- Verification: `npm run lint`, `npm run typecheck`, and `git diff --check` passed.

## 2026-10-03: Add Explore rejection and editorial card actions

- Refined Daily Explore cards around the supplied compatibility-card reference while retaining blurred images, nickname-only identity, verification, public metadata, interests, and match rationale.
- Replaced the wide Say hello control with an accessible icon action and added a left-side reject action with structured reasons and optional private feedback.
- Added the authenticated backend rejection endpoint, server-side daily-list authorization, immediate client cache removal, future-pair exclusion, and focused backend coverage. Usernames are no longer projected in Explore previews.
- Verification: mobile lint, typecheck, Explore state tests, and diff check passed; all 130 backend tests passed.

## 2026-10-03: Refine Explore result cards

- Changed ready Explore results to the app's soft-white canvas and replaced oversized photo cards with compact, rounded profile summaries.
- Privacy-blurred list avatars, removed the username fallback, and limited visible identity to nickname plus a verified badge.
- Added public age, gender, compatibility, and optional `distanceKm` metadata with a calmer match-note panel while preserving profile and conversation actions.
- Verification: `npm run lint`, `npm run typecheck`, `node --test tests/exploreState.test.cjs`, and `git diff --check` passed.

## 2026-10-03: Restore photo-led Explore design

- Restored the committed Explore screen's full-height relationship photograph, bouquet focal point, credit badge, and profile-completion prompt around the current daily Explore lifecycle.
- Kept daily credit unlocks, generation polling, pull-to-refresh, recovery actions, profile results, and conversation creation unchanged. Renamed the primary action to `Start exploring`.
- Added matching photographic loading, error, and empty states while retaining the virtualized results list.
- Verification: `npm run lint`, `npm run typecheck`, `node --test tests/exploreState.test.cjs`, and `git diff --check` passed.

## 2026-10-03: Authentication visual refresh

- Reworked the shared authentication shell into a safe-area-aware photographic brand intro with a warm raised form sheet and stronger editorial hierarchy.
- Aligned login, guest login, signup, reset, forgot-password, and set-password screens with consistent copy, pill actions, password guidance, accessible links, and icon-supported inline feedback.
- Expanded the design system with reusable spacing, radius, control, icon, and authentication guidance. No dependencies changed.
- Verification: `npm run lint`, `npm run typecheck`, and `git diff --check` passed.

## 2026-10-03: Daily Explore integration

- Replaced the availability-count/live-search screen with a 1-credit daily unlock and up to ten ranked profile cards, scores, public profile previews and cached match notes.
- Added authenticated Explore helpers, foreground/focus-aware generation polling, UTC reset handling, pull-to-refresh, credit invalidation, error recovery and session-scoped query caching.
- Say hello opens a real chat using the backend's selected-profile conversation endpoint. Server-side daily membership, availability and report checks protect this action; retries reuse a room without another credit charge.
- Retained socket listeners for chat, credits and community events. Discovery no longer requires a rewarded ad or notification/location permission prompt.
- Added the Daily Explore ledger label. No dependencies changed.
- Validation: `npm run lint` and `npm run typecheck` passed; all three `node --test tests/exploreState.test.cjs` checks passed. Android production export also passed (4,577 modules, Hermes bundle and assets). Backend validation passed all 129 tests, including 21 Explore cases. Device flows and live MongoDB/NVIDIA integration have not been exercised.

## 2026-10-03

- Corrected the ads update after native compilation failed: pinned react-native-google-mobile-ads from 16.5.0 back to 16.0.3, restoring Google Mobile Ads 24.9.0 instead of Kotlin-2.3-built 25.4.0. Expo SDK 54 retains Kotlin 2.1.20.
- Ads fix validation: the previously failing :react-native-google-mobile-ads:compileDebugKotlin task passed; npm run lint and npm run typecheck passed.
- Full native validation after the ads pin: app:assembleDebug passed for x86_64 and arm64-v8a (606 tasks; 18m 29s) and generated android/app/build/outputs/apk/debug/app-debug.apk. Installation and on-device ad loading were not tested.
- Confirmed the AdMob application ID is present in the native Android manifest through the existing Expo plugin; the library's app.json warning is not the cause of this compilation failure.

- Android export caught a flaw in the earlier image-size 2 override: Metro's getAssetData passes a file path, while v2 only accepts image bytes. Removed that override to restore bundling; audit is now 39 findings (3 moderate, 36 high). Expanded the compatibility test to exercise both byte and file-path APIs for all bundled images.

- Updated compatible dependencies within SDK 54: Gluestack 3, bottom sheet, form resolvers, navigation, React Query, NativeWind 4, icons, form/state libraries, OneSignal, Google Sign-In, ads, Reanimated 4.1, Socket.IO, and lint/format tooling. Preserved existing security overrides.
- Restricted safe-area-context to ~5.6.1 so future installs stay within SDK 54's supported minor. Held MMKV at 4.1.2 with Nitro 0.33.9; MMKV 4.3.2 uses Nitro code generation 0.35.9 and needs separate native compatibility validation.
- Switched API client creation to Axios's named create export to resolve the lint warning after updates without changing request behavior.
- Update validation: lint (no warnings), typecheck, Expo compatibility, top-level dependency tree, and both security consumer tests passed. Only MMKV remains below npm's Wanted versions; after removing the incompatible image-size override, audit is 39 findings.
- Added React Navigation native with Expo's recommended ^7.1.8 range and locked 7.5.0 to satisfy updated tabs/elements peers. Full-tree npm ls still reports an optional Ajv peer mismatch (this app uses only the Zod resolver) and missing peers of the unused react-native-multiple-select package. The repository's existing legacy-peer-deps=true setting remains unchanged.
- Final Android production export passed (4566 modules, image assets, Hermes bundle). Final Expo compatibility and navigation peer checks passed. Native compilation/device flows were not tested.

- Follow-up: scoped patched UUID 11.1.1 to xcode and image-size 2.0.4 to Metro, reducing the audit further to 38 findings (3 moderate, 35 high). Added runnable consumer compatibility checks in tests/securityDependencies.test.cjs.
- Follow-up validation: lint, typecheck, both consumer compatibility tests (1000 xcode identifiers and all 22 bundled images through Metro), and Expo dependency compatibility check passed. Native builds/device flows remain untested.
- Corrected the earlier compatibility assessment: image-size 2 retains a default function export consumed by Metro, and xcode's v4-only UUID use is compatible with UUID 11. No framework migration was needed for these fixes.
- Remaining roots: braces and node-forge (no published patches), plus decode-uri-component (patched release is ESM, incompatible with query-string 7's direct callable CommonJS require). Latest Expo Router still depends on query-string 7.

- Applied non-breaking audit updates (brace-expansion 1.1.21) and pinned transitive PostCSS to patched 8.5.28.
- Aligned expo-screen-capture with SDK 54 (~8.0.10) and updated expo-image-picker/expo-web-browser to Expo-recommended patches.
- Validation: lint, typecheck, Expo dependency compatibility check, and a Tailwind/PostCSS utility transform passed. Native builds and device navigation were not tested.
- Audit reduced from 53 to 51 findings (15 moderate, 36 high); unresolved roots are braces, decode-uri-component, image-size, node-forge, and uuid. Findings include dependent packages, not just vulnerable roots.
- Remaining fixes require upstream patches or a coordinated framework upgrade: braces/node-forge have no published safe versions; decoder 0.5 is ESM while query-string 7 requires CommonJS; image-size 2 changes the callable export Metro uses; uuid 11 is a major API change for xcode.

## 2026-08-05

- Switched the mobile verification API helper and profile/settings flows from the retired provider to HaloKYC while preserving the hosted-verification redirect response shape.
- Removed HaloKYC webhook-secret configuration and signature validation; webhook updates remain scoped to the matching user and active verification session.
- Verification after HaloKYC cutover: `npm run lint` passed; `npm run typecheck` passed.

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
