# Changelogs

Record every meaningful repository change here after it is made. Keep entries newest first.

## 2026-10-11: Consolidate panel surface primitives

- Replaced separate paper and midnight wrapper components with one `SurfacePanel` using explicit `paper` and `midnight` variants, and removed both redundant wrapper files.

## 2026-10-11: Reuse raised paper panel surface

- Added a shared paper-panel primitive and applied it to repeated profile, settings, referral, credit, community, skeleton, and post-creation cards while preserving local spacing and layout classes.

## 2026-10-11: Extend midnight panel reuse

- Replaced 18 more duplicated midnight panel shells across post creation, settings, chat, games, community, notifications, and profile with the shared surface component.

## 2026-10-11: Reuse midnight panel surface

- Added a shared midnight panel primitive and reused it for credits, referral, feedback, and community hero surfaces while preserving caller-specific spacing and clipping.

## 2026-10-11: Share branded refresh control

- Added one reusable native refresh control for the app's shared spinner colors and applied it across community, chat, profile, discovery, credits, notifications, feedback, and referral surfaces.

## 2026-10-11: Share current-user post invalidation

- Reused one posts-feature helper after image, free-text, and prompt post creation, including the shared current-user lookup and profile post query key.

## 2026-10-11: Reuse profile post invalidation callback

- Reused one profile-post cache invalidator for both post edits and deletes in the profile action hook.

## 2026-10-11: Share profile update invalidation

- Reused one profile-feature helper for user profile and preference-match-count invalidation after profile field, visibility, and photo updates.

## 2026-10-11: Reuse profile refresh query scope

- Centralized the four queries invalidated by owner and public profile pull-to-refresh in one profile-screen helper.

## 2026-10-11: Centralize credit query invalidation

- Reused one credits feature helper to invalidate balance and history after claims, refreshes, and realtime credit updates.

## 2026-10-11: Stabilize profile post separators

- Reused a memoized separator component callback for the profile feed so `FlatList` does not receive a new separator function on every screen render.

## 2026-10-11: Share authentication completion flow

- Extracted Google sign-in into `useGoogleAuth` and reused `useCompleteAuthentication` for notification permission and onboarding routing across Google and credential sign-in/sign-up paths.

## 2026-10-11: Reuse profile refresh control

- Built the profile screen's refresh control once and passed it to either the loading skeleton or post list, removing duplicate setup while preserving refresh behavior.

## 2026-10-11: Reuse notification refresh invalidation

- Routed pull-to-refresh through the same notification cache invalidator used by read/delete mutations and removed the now-unneeded query-key re-export from the hook barrel.

## 2026-10-11: Losslessly recompress native PNG assets

- Recompressed the Expo app icon and notification logos without changing decoded pixels, reducing their combined source size by 12,324 bytes.
- Android export passed; its packaged files decreased by 2,627 bytes (the native app icon PNGs are compiled separately from the JS export).

## 2026-10-10: Stabilize Explore mutation callbacks

- Memoized credit cache invalidation and destructured the refresh pending flag so the refresh callback depends only on stable mutation methods and state.

## 2026-10-10: Stabilize community mutation callbacks

- Destructured stable mutation methods and pending states, avoiding whole-mutation dependencies and inline follow/rejoin handlers in the room action hook.

## 2026-10-10: Reuse community room edit reset

- Reused one callback to initialize title, description, tags, and cover-image draft state when editing starts or is canceled.

## 2026-10-10: Centralize community query invalidation

- Reused one community-feature helper for the shared root-query invalidation in room list, room detail, and realtime events; inbox refresh scopes remain separate.

## 2026-10-10: Remove unused community action input

- Removed the unused `isFollowed` parameter from `useCommunityRoomActions` and its call site; the room screen still uses that state for membership UI.

## 2026-10-10: Separate community match copy formatting

- Moved match-result message construction into its own typed utility and reused the existing `StartLocationRoomMatchResult` contract instead of repeating its shape inline in the room action hook.

## 2026-10-10: Remove duplicate notification actions

- Kept delete haptics in the notification card only and passed the guarded pagination callback directly from its hook to the list.

## 2026-10-10: Replace unused bundled PNGs with lossless WebP assets

- Converted seven app-imported illustrations and wordmarks to pixel-identical WebP, updated their imports and profile trait keys, then removed the now-unreferenced PNG originals. This saves 31,427 source-asset bytes; app icon and native configuration PNGs remain unchanged.
- Android export passed and reduced packaged files by 31,444 bytes; the Hermes bundle changed by -24 bytes.

## 2026-10-10: Share safe mutation error alerts

- Added one user-safe alert helper and reused it for the repeated default error flow in Explore and community actions.
- Android export passed; helper reuse reduced duplicate code with a 176-byte Hermes bundle increase (4,528,080 to 4,528,256 bytes).
- The full non-source-map export remains 64,954 bytes (1.306%) smaller than the pre-image-optimization audit snapshot.

## 2026-10-10: Separate Explore data and action hooks

- Moved focus/app-state-aware query loading and reset timing into `useDailyExploreQuery`; moved unlock, refresh, conversation, and rejection workflows into `useDailyExploreActions`. The public `useDailyExplore` result remains the screen-facing composition layer.
- Lint and typecheck passed. Same-configuration Android export increased the Hermes bundle by 1,392 bytes (4,526,688 to 4,528,080 bytes).

## 2026-10-10: Reduce bundled WebP image sizes

- Re-encoded the login photo, community cover, and update artwork, saving 66,518 bytes combined (about 20%) while retaining SSIM scores of 0.9826, 0.9852, and 0.9910 respectively.
- Android export verification reduced the packaged files (excluding source maps) from 4,973,882 to 4,907,360 bytes; the Hermes JS bundle stayed effectively unchanged.

## 2026-10-10: Remove the Explore match-note separator

- Explicitly remove border styling from the match-note container and text column so no vertical hairline appears between the sparkle icon and rationale.

## 2026-10-10: Split notification hooks by responsibility

- Separated notification list loading, unread-count loading, and read/delete mutations into focused hook modules; shared notification-query invalidation across the mutations.

## 2026-10-10: Keep Explore utility functions focused

- Split retry-delay parsing, expiry checks, and error-action selection into separate named utilities within the Explore feature.
- Same-configuration Android export completed at 4,526,692 bytes across 2,721 modules (1,796 bytes above the earlier audit snapshot); source-map inspection shows app-authored modules remain under 11.1 KB each.

## 2026-10-10: Keep profile queries separate from API transport

- Moved post and preference fetch requests into the profile API module, leaving their hooks responsible for React Query state and cache keys.

## 2026-10-10: Reuse inbox list invalidation

- Added one chat-feature helper to refresh active and archived inbox lists together and reused it across socket, message, and chat-ending flows.

## 2026-10-10: Centralize community query keys

- Reused one community query-key factory for the directory filters, room detail, and realtime invalidation paths.

## 2026-10-10: Keep chat composer above the keyboard

- Replaced the custom global keyboard offset measurement with React Native `KeyboardAvoidingView`, using platform-appropriate padding/height behavior so chat input stays visible while typing.
- Verification: `npm run lint` and `npm run typecheck` passed.

## 2026-10-10: Separate location context, hook, and provider

- Moved the context and `useLocation` consumer out of the tracking provider so each module owns one location concern.

## 2026-10-10: Narrow location sync effect dependencies

- Destructured the stable location mutation callback so the sync effect no longer depends on the full mutation result object.

## 2026-10-10: Stabilize global provider context values

- Memoized location and confetti context values so provider-local updates do not notify consumers when exposed values are unchanged.

## 2026-10-10: Separate address parsing from the location provider

- Moved the pure formatted-address parser into the location feature and updated profile trait building to import it directly, keeping profile domain code independent of provider and native location modules.

## 2026-10-10: Centralize referral and feedback query keys

- Reused feature-owned keys in referral and feedback queries and their pull-to-refresh handlers.

## 2026-10-10: Centralize This-or-That query keys

- Reused feature query keys for question loading and user answer refreshes across the game and profile screens.

## 2026-10-10: Share profile field row rendering

- Unified the standard and custom lifestyle rows through one `ProfileField` call, keeping only the lifestyle content conditional.

## 2026-10-10: Centralize profile posts and preferences query keys

- Reused profile key factories across profile loading, edits, post creation, and refresh flows; skipped preference requests when no user ID is available.

## 2026-10-10: Reuse accessible single-choice chips

- Extracted the shared selectable chip UI and reused it for chat reporting and Explore feedback, preserving each sheet's compact or comfortable sizing and selection behavior.

## 2026-10-10: Keep profile API calls out of the user query hook

- Moved profile fetch, field update, and visibility update requests into the profile API module; shared the post-update cache invalidation across both mutations.

## 2026-10-10: Centralize profile user query keys

- Added a shared profile query-key factory and reused it for profile fetching, mutations, refresh flows, onboarding updates, Explore credit refreshes, and realtime profile-lock events.

## 2026-10-10: Centralize daily Explore query keys

- Added one feature query-key factory and reused its memoized key for daily Explore reads, refresh invalidation, unlock results, and forced-refresh results.

## 2026-10-10: Remove match-note divider from Explore cards

- Explicitly reset the match-note container border so the decorative star sits beside the copy without a vertical separator.

## 2026-10-10: Narrow community detail list items by shape

- Used the presence of `participants` to distinguish chat rows from member rows, removing two type casts and keeping the row renderer independent of the active tab.

## 2026-10-10: Extract community detail helpers

- Moved room coordinate validation and normalized entity ID comparison out of the community detail route into focused utilities.

## 2026-10-10: Reuse profile field rows for preferences

- Added a compact list variant to the shared editable `ProfileField` row and reused it in preference sections, removing the duplicated pressable/value/chevron layout while preserving profile and preference row styles and empty-state labels.

## 2026-10-10: Reuse profile section metadata across renders

- Memoized profile and preference section models against their source user/preferences data, avoiding rebuilding field arrays and formatted values on unrelated rerenders.

## 2026-10-10: Separate chat message lifecycle

- Moved message history loading, message state, and socket-listener wiring into `useChatMessages`; `ChatContext` retains room identity, lifecycle, and chat actions.
- Reused the shared inbox query keys when refreshing active and archived conversations.

## 2026-10-10: Centralize inbox query keys

- Added one chat feature query-key registry for inbox prefixes, filtered active/archive lists, and community-room chat.
- Reused it across inbox routes, chat context, community routes, and realtime invalidation to prevent cache keys from drifting.

## 2026-10-10: Reuse chat timestamp formatter

- Reused one module-level `Intl.DateTimeFormat` for message timestamps rather than constructing the locale/options formatting path for every rendered message.

## 2026-10-10: Derive notification list state in one pass

- Consolidated unread detection, unread count, and unread-only list selection into one memoized pass over loaded notifications.
- The all-notifications list reuses the original array; the unread view allocates only its filtered rows.
- Stabilized `loadMore` against the pagination fields it uses instead of the whole changing React Query result object.

## 2026-10-10: Remove unresolved icon aliases

- Removed eight arrow aliases whose target keys are absent from the local Lucide registry; they could never render an icon.
- Verified no app call sites reference the removed aliases. The registry continues to use its supported icon set for local and server-provided option icons.

## 2026-10-10: Bound rendering for large multi-select option lists

- Added search-first rendering for option lists over 30 entries, keeping selected choices visible and limiting matching chip rows to 40.
- Updated onboarding and profile editing feature docs to describe the shared picker behavior.
- Targeted ESLint for `MultiSelectChipInput.tsx` and `ProfileCard.tsx`, plus `npm run typecheck`, passed. `npm run lint` is blocked by Windows `EPERM` while handling Expo's ESLint cache; running ESLint across the repo without cache reaches three existing `__dirname` `no-undef` errors in test files.

## 2026-10-10: Virtualize prompt browsing

- Replaced eager prompt rendering in a `ScrollView` with a tuned `FlatList`, since the category endpoint returns all active prompts.
- Extracted the prompt row and answer sheet; the list component now owns fetching, selection, and submission coordination.
- Preserved loading, retry, empty states, editor defaults, visibility choice, and post submission flow.
- `npm run lint` and `npm run typecheck` pass. Android export succeeds with a 7,238,958-byte Hermes bundle, 3,433 bytes above the prior export across this and the intervening chat helper change; the difference is recorded without attributing it to either change.

## 2026-10-10: Extract chat date grouping

- Moved pure message-by-day grouping from `ChatMessages` into `groupMessagesByDate` and removed the unused date-string prop from `MessageGroup`.
- Preserved local-day grouping, chronological group order, and message order within each group.
- `npm run lint` and `npm run typecheck` pass.

## 2026-10-10: Virtualize community detail rows

- Replaced the room detail page's nested, non-scrolling `FlatList`s inside a `ScrollView` with one virtualized list that switches between members and chats.
- Moved the community overview and section tabs into the list header, and kept the creator sheet mounted alongside the list.
- `npm run lint` and `npm run typecheck` pass. Android export succeeds at 7,235,525 bytes, 88 bytes below the prior export; this refactor is primarily a list-rendering performance improvement.

## 2026-10-10: Separate community creator modes

- Split the creator sheet's edit form and creator action menu into focused components; the sheet now owns only the sheet shell, header, and mode selection.
- Preserved the existing field validation, cover selection, save/cancel actions, and start-match behavior.
- `npm run lint` and `npm run typecheck` pass. Android export succeeds with a 7,235,613-byte Hermes bundle. This is 6,643 bytes above the earlier 7,228,970-byte export across multiple intervening edits, so the difference is not attributed to this component split.

## 2026-10-10: Move shared filter chip to UI components

- Moved the filter chip out of the community feature folder and into shared UI so both community discovery and chat inbox can use it without cross-feature imports.
- The component's rendering and styles are unchanged. `npm run lint` and `npm run typecheck` pass.

## 2026-10-10: Isolate inbox search toolbar

- Moved conversation search draft/debounce and active-filter chips into `InboxSearchToolbar`, leaving inbox loading, list rendering, and filtering sheet orchestration in `InboxList`.
- Search placeholder, 350 ms debounce, clear action, filter button, and active-filter labels are preserved.
- `npm run lint` and `npm run typecheck` pass.

## 2026-10-10: Remove match-note separator

- Set the Explore match-note panel's left border width to zero to remove the unwanted vertical separator while preserving the sparkle icon and copy layout.
- `npm run lint` and `npm run typecheck` pass.

## 2026-10-10: Separate onboarding flow from screen UI

- Moved onboarding state, field validation, referral persistence, API submission, and completion navigation into `useOnboardingFlow`; the screen now composes the step UI and binds flow outputs.
- Existing step order, validation behavior, API calls, and copy are preserved. Validation results will be added after checks.

## 2026-10-10: Remove redundant age wrapper

- Reused `getAgeFromDate` at all five display call sites and deleted `calculateAge`, which only added an optional-value fallback none of its callers used.
- Typecheck and lint pass. Android export succeeds with a 7,228,970-byte Hermes bundle, down 402 bytes from the previous export.

## 2026-10-10: Virtualize profile posts

- Replaced the profile's eager post mapping inside a `ScrollView` with a virtualized `FlatList`, preserving profile sections as its header and retaining pull-to-refresh and post action sheets.
- Memoized post cards with a stable action callback and isolated the post header and empty/loading state.
- Android export succeeds with a 7,229,372-byte Hermes bundle. Typecheck and lint pass; the endpoint still returns the full post array.

## 2026-10-10: Reuse authentication notices and method divider

- Extracted the identical accessible API error notice into `InlineErrorNotice` across five authentication screens.
- Extracted the repeated alternative sign-in divider into `AuthMethodDivider` for login and signup.
- Typecheck and lint pass for the changed files. Android Expo export succeeds; Hermes bundle is 7,228,134 bytes.

## 2026-10-10: Synchronize mobile dependency lockfile

- Removed stale lock entries for Moti, Framer Motion, and Expo System UI, which are absent from the current manifest and unused by mobile source; added the missing lock entries for declared `react-native-maps`.
- Kept `@expo/html-elements` because the Actionsheet uses its `H4` component. `npm ls`, TypeScript, direct ESLint source scan, and Android export pass. Expo’s lint wrapper could not update its cache file due to `EPERM`; the Hermes bundle is 7,479,821 bytes.

## 2026-10-10: Share chat profile-lock flow

- Consolidated lock/unlock validation, debug logging, analytics, and socket emission into one callback while retaining both public actions and exact event/activity values.
- Lint, typecheck, and Android export pass; Hermes bundle is 7,479,819 bytes, down 309 bytes from the previous export.

## 2026-10-10: Extract profile lifestyle chip

- Moved the drinking, smoking, and pet value chip out of `ProfileFieldsList` into `LifestyleChip.tsx` so the list composes a dedicated presentation component.
- Lint, typecheck, and Android export pass; Hermes bundle is 7,480,128 bytes, up 461 bytes from the previous export.

## 2026-10-10: Isolate mobile navigation tab item

- Moved the inline tab renderer into `MobileNavItem.tsx`; `MobileNav.tsx` now owns route selection and navigation while the item owns its visual and accessibility state.
- Lint, typecheck, and Android export pass; Hermes bundle is 7,479,667 bytes, down 228 bytes from the previous export.

## 2026-10-10: Remove redundant option-array copies

- Made default option arrays the exported mutable arrays directly, removing a second set of default bindings and the startup cloning pass. Dynamic option updates still mutate the same exported references in place.
- Lint, typecheck, and Android export pass; Hermes bundle is 7,479,895 bytes, down 286 bytes from the previous export.

## 2026-10-10: Remove the shared legacy API module

- Moved public options, HaloKYC verification, and received-feedback requests into their owning feature API modules, then deleted `src/libs/apis.ts` after checking all callers.
- Removed an empty stale import left in onboarding and refreshed feature/API documentation. Lint, typecheck, and Android export pass; the current Hermes bundle is 7,479,765 bytes.

## 2026-10-10: Isolate profile and preference loading states

- Moved the inline edit-profile and edit-preference skeletons into their own components, keeping the screens focused on editing behavior and composition.
- Lint, typecheck, and Android export pass; Hermes bundle is 7,480,181 bytes, 251 bytes above the prior export.

## 2026-10-10: Move account recovery APIs into authentication feature

- Moved password set/reset/email and username availability requests to `src/features/authentication/api.ts`; updated screens, onboarding, profile validation, and the username hook.
- Reduced `src/libs/apis.ts` from 129 to 100 lines and updated authentication references. Lint, typecheck, and Android export pass; Hermes bundle is 4,666,608 bytes, 176 bytes above the prior export.

## 2026-10-10: Move credits and referral APIs into feature modules

- Moved credit balance/history/claim requests and referral summary/apply requests into their respective feature API modules; updated Explore, credit, referral, and onboarding callers.
- Reduced `src/libs/apis.ts` from 166 to 129 lines and updated feature references. Lint, typecheck, and Android export pass; Hermes bundle is 4,666,432 bytes, 348 bytes above the prior export.

## 2026-10-10: Move This-or-That requests into its feature

- Moved question fetch/submit and answer APIs into `src/features/this-or-that/api.ts`, and updated both game screens and the profile answer section to use it.
- Reduced `src/libs/apis.ts` from 223 to 166 lines. Lint, typecheck, and Android export pass; Hermes bundle is 4,666,084 bytes, 196 bytes above the prior export.

## 2026-10-10: Move post APIs into the posts feature

- Moved prompt fetch/create, image/text creation, and post update/delete requests from the general API module into `src/features/posts/api.ts`; updated all callers to use the feature API.
- Reduced `src/libs/apis.ts` from 293 to 223 lines and updated feature/architecture references. Lint, typecheck, and Android export pass; Hermes bundle is 4,665,888 bytes, 180 bytes above the prior export.

## 2026-10-10: Extract community detail hero

- Moved the cover image, title/description, local tags, room stats, countdown, and header controls into `CommunityDetailHero`; callbacks keep navigation and mutations owned by the route.
- Reduced `src/app/community/[roomId].tsx` from 372 to 288 lines and removed its unused icon/style imports. Lint and typecheck pass; Android export succeeds. Hermes bundle is 4,665,708 bytes, up 716 bytes from the previous export due to the component boundary (rounds to 4.67 MB).

## 2026-10-10: Move chat message mapping into domain utilities

- Extracted raw message/reply normalization and chat room active-state rules from `ChatContext` into focused pure domain utilities.
- Reduced `ChatContext.tsx` from 326 to 252 lines and removed an unnecessary mapping callback. Lint, typecheck, and Android Expo export pass; Hermes bundle remains 4.66 MB.

## 2026-10-10: Extract community membership panel

- Moved membership/pool status copy and join, rejoin, and exit-pool controls into `CommunityMembershipPanel`; route-level action state and mutations stay in the detail route/hook.
- Reduced `src/app/community/[roomId].tsx` from 426 to 372 lines. Lint, typecheck, and Android Expo export pass; Hermes bundle remains 4.66 MB.

## 2026-10-10: Extract profile completion and compatibility cards

- Moved owner completion progress and public-profile compatibility presentation into focused components; the screen retains profile data, navigation, and verification behavior.
- Reduced `src/screens/Profile.tsx` from 308 to 238 lines and documented the extracted cards. Lint, typecheck, and Android Expo export pass; Hermes bundle remains 4.66 MB.

## 2026-10-10: Extract profile completion calculation

- Moved profile and preference completion percentages into a focused domain utility and moved `UserPreferences` to the profile domain types, removing hook-layer type dependencies from screens/components.
- Reduced `src/screens/Profile.tsx` from 371 to 308 lines. Lint, typecheck, and Android export pass; Hermes bundle remains 4.66 MB.

## 2026-10-10: Separate prompt browsing from prompt post creation

- Moved prompt fetching, loading/error/empty states, answer editing, and submission into `PromptPostList`; the route now handles category selection and page composition.
- Reduced `src/app/create-post/prompts.tsx` from 303 to 97 lines and documented the extracted component. Lint, typecheck, and Android export pass; Hermes bundle remains 4.66 MB.

## 2026-10-10: Extract community location picker

- Moved local address search results and Android map pin selection into `CommunityLocationPicker`; the creation route keeps search, selection, and creation state.
- Reduced `src/app/community/create.tsx` from 373 to 332 lines. Lint, typecheck, and Android Expo export pass; Hermes bundle remains 4.66 MB.

## 2026-10-10: Separate feedback screen data from presentation

- Replaced the screen's inline feedback cards and list states with focused card, skeleton, and list-header components; the screen now owns pagination, refresh, and rating aggregation.
- Added the presentation components to the feedback feature's key-file documentation. Lint, typecheck, and Android Expo export pass; Hermes bundle remains 4.66 MB.

## 2026-10-10: Resize small raster icons for their rendered sizes

- Reduced the bouquet, Google mark, graduation, mask, and relationship PNGs to 192 px, 64 px, and 128 px targets matching their UI sizes. Packaged assets dropped from 97,611 to 32,625 bytes (about 65 KB saved) with PNG transparency preserved. Lint, typecheck, and Android export pass; Hermes bundle remains 4.66 MB.

## 2026-10-10: Reduce shared auth background payload

- Resized the shared background from 1024 × 1536 px to 768 × 1152 px and recompressed WebP at quality 80. The image is used beneath dark overlays in auth and discovery screens; packaged size dropped from 278,390 to 146,232 bytes (about 132 KB saved). Lint, typecheck, and Android export pass; Hermes bundle remains 4.66 MB.

## 2026-10-10: Reduce community cover fallback payload

- Resized the fallback cover from 1280 × 853 px to 1080 × 720 px and recompressed WebP for its card and detail-screen display sizes. Packaged asset size dropped from 187,852 to 125,524 bytes (about 62 KB saved). Lint, typecheck, and Android export pass; Hermes bundle remains 4.66 MB.

## 2026-10-10: Remove unused Expo System UI dependency

- Removed `expo-system-ui` from `package.json` and the lockfile after confirming there are no source or config references and it is not needed by another installed package. `npm ls --depth=0`, lint, typecheck, and Android export pass; Hermes bundle remains 4.66 MB.

## 2026-10-10: Reduce app update artwork payload

- Resized the transparent update hero to 768 × 914 px for its 250 dp display and recompressed WebP at quality 90. The packaged asset dropped from 507,208 to 55,790 bytes (about 451 KB saved) with transparency and aspect ratio preserved. Lint, typecheck, and Android export pass; Hermes JavaScript bundle remains 4.66 MB.

## 2026-10-10: Extract the Games hub benefit row

- Moved the repeated benefit presentation into `src/components/games/GameBenefitRow.tsx`, leaving `Games.tsx` responsible for the hub and navigation. Lint, typecheck, and Android export pass; Hermes bundle remains 4.66 MB.

## 2026-10-10: Reuse shared Settings sections and navigation rows

- Extracted the Settings hub’s section and navigation row into single-component files and reused one `SettingsSection` in both Settings screens with card/plain variants. Removed the duplicate panel markup and trivial `useMemo`; lint, typecheck, and Android export pass (4.66 MB Hermes bundle).

## 2026-10-10: Extract and cover onboarding API field errors

- Moved duplicate-field and referral-error mapping into a focused onboarding utility, reducing `Onboarding.tsx` from 357 to 284 lines. Added four Node tests for duplicate email/phone, referral, and unmatched errors. Tests, lint, typecheck, and Android export pass; Hermes bundle remains 4.66 MB.

## 2026-10-10: Extract account settings presentation components

- Moved account section panels and editable rows into individual components under `src/components/settings`; reduced `EditUserSettings.tsx` from 303 to 227 lines. Lint, typecheck, and Android export pass; Hermes bundle remains 4.66 MB.

## 2026-10-10: Separate Credits history presentation

- Moved the credit summary tile, ledger row, and ledger skeleton into focused one-component files under `src/components/credits`; reduced `Credits.tsx` from 315 to 232 lines. Lint, typecheck, and Android export pass; Hermes bundle remains 4.66 MB.

## 2026-10-10: Split app update prompt presentation

- Extracted version details, release notes, and actions into one-component files; `AppUpdatePrompt.tsx` now handles visibility, update state, and modal layout (420 to 213 lines). Removed memoization from its simple visibility boolean. Lint, typecheck, and Android export pass; Hermes bundle is 4.66 MB.

## 2026-10-10: Prune unused icons from the runtime registry

- Removed 19 unreferenced icon modules, added nine missing icon modules, and reused existing icons for nine compatible aliases. The registry now has 117 static icon imports instead of 127; lint, typecheck, and Android export pass. Hermes bundle: 4,656,604 bytes (4.66 MB), same rounded size as the prior recorded build.

## 2026-10-10: Remove match-note divider from Explore cards

- Made the match-note panel explicitly borderless so no divider appears between the sparkle icon and its text. Lint and typecheck pass.

## 2026-10-10: Split This-or-That answer components

- Moved the option choice card and loading skeleton into dedicated component files, reducing `ThisOrThat.tsx` from 330 to 229 lines.
- Switched choice photos to `expo-image` and replaced memoized progress with direct calculation. Lint, typecheck, and Android export pass (4.67 MB Hermes bundle).

## 2026-10-10: Extract This-or-That image picker card

- Moved the two-option image selector into `ThisOrThatImagePickerCard.tsx`; `ThisOrThatSubmit.tsx` now focuses on form state, image selection, and submission (319 to 244 lines).
- Replaced a memoized boolean readiness check with direct derivation. Lint, typecheck, and Android export pass (4.67 MB Hermes bundle).

## 2026-10-10: Share form field helper and error feedback

- Split `TextAreaInput` from `TextInput` into its own component file and extracted the duplicated helper/error rendering into `FormFieldFeedback`, reused by both inputs.
- Updated every multiline-input import. Lint, typecheck, and Android export pass; Hermes bundle remains 4.66 MB.

## 2026-10-10: Reuse Explore profile completion card

- Consolidated the profile-completion prompt used in both Explore's locked state and profile list footer into `ExploreProfileCompletionCard`; copy, accessibility labels, and surface styling remain configurable per state.
- Lint, typecheck, and Android export pass; Hermes bundle remains 4.66 MB.

## 2026-10-10: Separate Explore discovery states from profile list

- Reduced `Explore.tsx` from 384 to 220 lines by moving sign-in, loading, locked, empty, and error presentations into `ExploreDiscoveryState`; the shared error notice now has one component used by both Explore layouts.
- The screen retains daily Explore data, refresh actions, profile rendering, and navigation callbacks. Lint, typecheck, and Android export pass; Hermes bundle remains 4.66 MB.

## 2026-10-10: Remove unreferenced image assets

- Removed the unreferenced SVG wordmarks and `favicon.png` (about 66 KB total); verified no source/config references and the resolved Expo config has no web target.
- Android export still resolves the same 37 packaged assets and completes with a 4.66 MB Hermes bundle. Lint and typecheck pass.

## 2026-10-10: Separate Referral screen presentation pieces

- Reduced `Referral.tsx` from 388 to 271 lines by moving copy actions, section headings, status panels, and stat cards into one-component files under `src/components/referral`.
- Consolidated code/link clipboard handling into one handler. Lint, typecheck, and Android export pass; Hermes bundle remains 4.66 MB.

## 2026-10-10: Split Earn Credits presentation from claim flow

- Reduced `EarnCredits.tsx` from 445 to 220 lines by moving static credit information to `EarnCreditInformation` and placing its repeated rows, headers, quota pills, and status panels in focused components under `src/components/credits`.
- Rewarded-ad claim state and balance fetching remain in the screen. Android export completes at 4.66 MB; no measurable JS bundle reduction from this structural refactor.
- Verification: `npm run lint`, `npm run typecheck`, and Android Expo export with source maps.

## 2026-10-10: Split chat composer presentation components

- Reduced `ChatInput.tsx` from 383 to 262 lines by extracting the shared reply/edit notice, voice recording controls, pending image preview, and upload error notice into focused components.
- Reused one composer notice for both reply and edit states and replaced the duplicate reply-preview interface with `ChatReplyPreview`.
- Verification: `npm run lint`, `npm run typecheck`, and Android Expo export with source maps passed (4.66 MB Hermes bundle).

## 2026-10-10: Remove Explore match-note divider

- Explicitly clear the match-note container's left border width and color so no vertical rule appears between the sparkle icon and introduction copy.
- Verification: `npx eslint src --no-cache` and `npm run typecheck` passed. `npm run lint` remains blocked by `EPERM` writing Expo's ESLint cache under `.expo/cache/eslint`.

## 2026-10-10: Separate chat safety actions from header

- Moved feedback/report actionsheet state, validation, API calls, and form UI into `ChatSafetySheet.tsx`.
- Reduced `ChatHeader.tsx` from 460 to 196 lines; the header now owns participant identity/navigation and profile lock controls.
- Verification: `npm run lint`, `npm run typecheck`, and Android Expo export with source maps passed (4.66 MB Hermes bundle).

## 2026-10-10: Separate chat composition workflows

- Reduced `ChatScreen.tsx` from 539 to 223 lines by extracting draft persistence, text/image sending, voice-message sending, client message IDs, and reply-preview mapping into focused hooks and utilities.
- Centralized the image-unlock message in chat feature constants so image upload and message sending share one source.
- Verification: `npm run lint`, `npm run typecheck`, and Android Expo export with source maps passed (4.65 MB Hermes bundle).

## 2026-10-10: Trim unused theme data and optimize bundled artwork

- Reduced the Gluestack provider palette config to the two indicator tokens actually used by UI styles, while retaining light and dark values.
- Replaced the single-use 833 KB transparent PNG update illustration and 346 KB community fallback JPEG with visually checked WebP assets at 507 KB and 188 KB; removed both unused originals, saving 484 KB across the two assets.
- Android bundle is 4.65 MB after the cleanup; the provider config trim saved a further 5.7 KB.
- Verification: Android Expo export with source maps, `npx eslint src --no-cache`, and `npm run typecheck` passed.

## 2026-10-10: Remove unused Tailwind palette safelist

- Removed the legacy safelist that generated thousands of default palette classes not referenced by app source; the configured `ui-*` theme and source-scanned classes remain.
- Reduced the Android Hermes bundle from 6.9 MB to 4.66 MB (about 2.24 MB / 32%) and the generated NativeWind Android registry from 1.67 MB to 31.7 KB.
- Verification: Android Expo export completed with source maps, `npx eslint src --no-cache`, and `npm run typecheck` passed.

## 2026-10-10: Remove Explore match note divider

- Explicitly remove any border from the compatibility note container so no vertical rule appears between the sparkle icon and the match copy.

## 2026-10-10: Type community cover image picker callback

- Annotated the selected image callback with Expo ImagePickerAsset to resolve implicit-any TypeScript diagnostics.
- Verification: uncached ESLint and `npm run typecheck` passed. `npm run lint` could not write its existing cache under `.expo/cache/eslint` due to a Windows `EPERM` error.

## 2026-10-10: Search and Select Local Community Locations

- Replaced implicit current-device location in Local community creation with Google Places address search and explicit result selection.
- Added authenticated backend endpoints for Places autocomplete, selected-place coordinates, and reverse geocoding; the Google key stays in backend environment configuration.
- Added Android map pin selection, wired to `GOOGLE_MAPS_ANDROID_KEY` at native build time. The map remains hidden until that app-restricted key is configured; search selection works independently.
- Added the SDK 54-compatible `react-native-maps` dependency.
- Verification: pending lint, typecheck, backend syntax, and Expo config checks.

## 2026-10-10: Add Local and Topic Communities

- Added a Local/Topic selector to community creation. Topic communities can be created without device location; Local remains the default and requires location.
- Added the community type to backend persistence and API responses, and included Topic communities in discovery even without a location point.
- Community cards and detail pages identify the type and omit location actions when a Topic community has no location.
- Matching eligibility is unchanged; location search/pin selection and interest-based ranking remain follow-up work.
- Verification: mobile `npm run lint` and `npm run typecheck` passed; backend `node --check` passed for changed JavaScript files.

## 2026-10-10: Resume Pending HaloKYC Verification

- Pending verification can be reopened from Profile or Settings; the backend reuses the saved HaloKYC session while it remains in `pending_upload`.
- Map HaloKYC `awaiting_credits`, `processing`, and `manual_review` to Lumore `processing`; the mobile actions show a waiting state and disable retries while processing.
- Verification: `npm run lint` and `npm run typecheck` passed; backend `node --check` passed.

## 2026-10-04: Create Lumore Play Store screenshot set

- Added eight 9:16 promotional screenshots using supplied app captures, Lumore colors, and concise feature headlines, plus an overview sheet and regeneration script.
- Replaced the exact community address in the supplied capture with a general nearby-area label.
- Verification: checked full-size poster renders and 1080 × 1920 exports; `npm run lint` and `npm run typecheck` passed.

## 2026-10-04: Replace deprecated Expo Image resize mode

- Set the profile photo's crop mode with Expo Image's `contentFit` prop instead of a deprecated `resizeMode` style.
- Verification: `npm run lint` and `npm run typecheck` passed.

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
# 2026-10-10: Diagnose community location search failures

- Preserve Google's safe status and HTTP code internally for community location errors, log them without request URLs or API keys, and show actionable setup guidance in the create-community form.
- Verification: `npm run lint`, `npm run typecheck`, and backend syntax checks.
# 2026-10-10: Reduce community location autocomplete requests

- Increased the location search debounce from 350 ms to 650 ms to wait longer for users to finish typing before requesting suggestions.
- Verification: `npm run lint` and `npm run typecheck`.
# 2026-10-10: Refine community creation copy and flow

- Clarified the Local and Topic choices, rewrote helper text around the member's intent, removed the duplicate location status from the hero, and moved location selection directly under community type.
- Removed the duplicate empty-cover Upload action and its unnecessary name progress bar.
- Verification: `npm run lint` and `npm run typecheck`.
# 2026-10-10: Tighten community location field spacing

- Removed the extra margins between the location search label and input, and changed the label to a readable light color on the dark panel. Other text fields keep their current spacing.
- Verification: `npm run lint` and `npm run typecheck`.
# 2026-10-10: Add community tags

- Added suggested Local/Topic tags and custom tags (up to five per community), with backend validation, persistence, and an index for future tag discovery.
- Creators can edit tags; community cards and detail pages display them. Existing communities default to no tags.
- Preference-based ranking and tag search remain follow-up work; matching eligibility is unchanged.
- Verification: mobile lint/typecheck and backend syntax checks.
# 2026-10-10: Add paginated community discovery

- Replaced the fixed nearby-only room list with server-paginated browsing of public Local and Topic communities, loading more as the user scrolls.
- Added combined search across community names, descriptions, and tags; Local/Topic/Nearby filters; and matching-pool high/low, newest, and nearest sorts. Default sort is the largest matching pool.
- Location is optional for global browsing and only needed for Nearby/Nearest. Nearby uses a 25 km radius.
- Verification: mobile lint/typecheck and backend syntax checks.

# 2026-10-10: Reuse auth inline error notice

- Extracted the identical accessible API error UI into `InlineErrorNotice` and reused it across login, signup, and password recovery screens.

# 2026-10-10: Remove Explore match-note divider

- Flattened the compatibility note's icon/text row and cleared the text edge border so no vertical line appears before the introduction copy.
- Verification: changed-file lint and `npm run typecheck`; full lint is blocked by existing `__dirname` errors in two test scripts and a generated Expo warning.

# 2026-10-10: Extract profile This or That section

- Moved the profile's This or That card into a focused component; its answer loading, empty state, carousel, and owner-only action remain unchanged.
- Reused Expo Image for answer photos and kept navigation and haptics owned by the profile screen.
- Verification: source-wide ESLint, `npm run typecheck`, and Android Expo export.

# 2026-10-10: Extract profile posts section

- Moved the profile posts heading, create action, loading state, post list, and empty state into a focused component; edit/delete flow remains owned by the profile screen.
- Verification: source-wide ESLint and `npm run typecheck`; full-repository lint reports existing `__dirname` errors in test scripts and a generated Expo warning.

# 2026-10-10: Extract profile summary card

- Moved profile identity, facts, bio, interests, and owner edit actions into a single presentation component. Navigation and haptics remain in the profile screen.
- Removed the screen's image and interest-rendering imports that were only needed by the extracted card.
- Verification: source-wide ESLint and `npm run typecheck`.

# 2026-10-10: Extract chat image upload flow

- Moved image picking, uploads, stale-request handling, discard behavior, and temporary-image cleanup into `useChatImageUpload`.
- Added the shared `PendingChatImage` type for the chat composer and upload hook; `ChatScreen` continues to own message sending and voice notes.
- Verification: source-wide ESLint and `npm run typecheck`.

# 2026-10-10: Remove unused Moti dependency

- Removed the unused direct `moti` dependency and its 13 otherwise-unneeded packages from the install graph.
- Android export succeeds; the JavaScript bundle remains 11.9 MB because Moti was never imported into the app bundle.
- Verification: Android Expo export, source-wide ESLint, and `npm run typecheck`.

# 2026-10-10: Extract chat voice recording lifecycle

- Moved audio recorder setup, microphone permissions, waveform sampling, validation, and recorder cleanup into `useVoiceRecorder`.
- Kept composer eligibility, voice upload, socket delivery, optimistic message creation, and analytics in `ChatScreen`.
- Verification: source-wide ESLint, `npm run typecheck`, and Android Expo export.

# 2026-10-10: Extract chat socket and typing lifecycles

- Moved room join/leave and connection listeners into `useChatRoomConnection`; moved partner and local typing events and timeout cleanup into `useChatTyping`.
- `ChatScreen` now composes these hooks and the focused image and voice hooks, down from 667 to 539 lines.
- Verification: source-wide ESLint, `npm run typecheck`, and Android Expo export.

# 2026-10-10: Extract profile quick actions

- Moved profile shortcut navigation and verification action presentation into `ProfileQuickActions`; verification API and haptic side effects remain in the screen.
- Verification: source-wide ESLint and `npm run typecheck`.

# 2026-10-10: Extract profile essentials and type its traits

- Moved the essentials card into `ProfileEssentialsSection` and created a typed trait builder for horizontal and vertical profile details.
- Removed the screen's loosely typed nullable trait arrays and non-null assertions.
- Verification: source-wide ESLint and `npm run typecheck`.

# 2026-10-10: Extract profile post action sheets

- Moved profile post action and edit sheet presentation into `ProfilePostActionSheets`; post mutations and confirmations remain in the screen.
- Centralized type-specific edit copy in `getProfilePostEditCopy` and removed repeated copy construction from the sheet props.
- Verification: source-wide ESLint and `npm run typecheck`.

# 2026-10-10: Move profile post workflow into a hook

- Moved post action/edit state, text/visibility setup, update/delete requests, confirmations, query invalidation, and haptic feedback into `useProfilePostActions`.
- `Profile.tsx` now coordinates the profile sections and verification flow without owning post mutations.
- Verification: source-wide ESLint and `npm run typecheck`.
# 2026-10-10: Remove match-note divider from Explore cards

- Removed the unintended left-border utility beside the match-note text so the copy sits cleanly beside the sparkle icon.
- Verification: source-wide ESLint and `npm run typecheck`.
# 2026-10-10: Separate chat socket handling from provider

- Moved chat realtime listeners into `useChatSocketListeners` and centralized sender ID, timestamp parsing, and incoming-message merge helpers in focused chat domain utilities.
- `ChatContext` is now 326 lines (previously 513); socket listener cleanup is explicit per event, including `chatEnded`.
- Verification: source-wide ESLint, `npm run typecheck`, and Android Expo export.
# 2026-10-10: Isolate community API and types

- Moved room discovery, creation, membership, and location search requests into `src/features/community/api.ts`; community response types now live in the feature types file.
- Extracted React Native URI-file handling into `appendNativeFile` and updated community call sites to import the focused feature module.
- Verification: source-wide ESLint, `npm run typecheck`, and Android Expo export (11.9 MB bundle; unchanged).

# 2026-10-10: Remove Explore match-note divider

- Explicitly removed left and other borders from the compatibility note container and copy column so no vertical separator appears between the sparkle icon and the introduction text.
- Updated the legacy API module to import `LocationWritePayload` from its new location feature module after typecheck exposed a stale import in the existing refactor.
- Verification: lint passed; typecheck rerun pending.

# 2026-10-10: Consolidate profile option fields

- Moved repeated single and multi-select profile field configurations into `ProfileOptionField`; retained custom text, range, lifestyle, and goal controls in the main editor.
- Reduced `FieldEditorContent.tsx` from 511 to 288 lines while preserving its existing field types and option values.
- Verification: source-wide ESLint, `npm run typecheck`, and Android Expo export (11.9 MB bundle; unchanged).

# 2026-10-10: Extract community detail actions

- Moved join/leave/rejoin, creator editing, cover-image picking, and start-match mutations with their confirmations into `useCommunityRoomActions`.
- Reduced the community detail route from 650 to 495 lines while leaving data loading, location actions, and page composition in the screen.
- Verification: source-wide ESLint, `npm run typecheck`, and Android Expo export.

# 2026-10-10: Extract community context card and tag formatting

- Moved topic-interest and local-location presentation into `CommunityContextCard`; the detail route now composes this section.
- Centralized community tag capitalization in `formatCommunityTag` and reused it in the picker, directory card, and detail screen.
- Reduced the community detail route from 495 to 428 lines.
- Verification: source-wide ESLint, `npm run typecheck`, and Android Expo export (11.9 MB bundle; unchanged).

# 2026-10-10: Isolate chat and inbox API

- Moved inbox pagination, room data, messages, uploads, and chat moderation requests into `src/features/chat/api.ts` with their summary types in the chat domain.
- Moved the generic paginated response type to its own domain utility and reduced `src/libs/apis.ts` from 469 to 293 lines.
- Verification: source-wide ESLint, `npm run typecheck`, and Android Expo export (11.9 MB bundle; unchanged).

# 2026-10-10: Isolate community location selection lifecycle

- Moved Places search debounce, session token, map region, place selection, reverse geocoding, and request-race handling from the community creation route into `useCommunityLocationSelection`.
- Preserved the one-second search debounce and prevent stale search/detail/geocode responses from overriding newer input or map selections.
- Verification: source-wide ESLint and `npm run typecheck` passed at the time of extraction; the later Expo lint wrapper hit `EPERM` writing its cache under `.expo/cache/eslint`.

# 2026-10-10: Separate option catalog from dynamic option persistence

- Moved the static profile and preference option data and its shared types into `src/libs/optionsCatalog.ts`.
- Kept `src/libs/options.ts` as the compatibility entry point and the focused dynamic-option validation, cache, and update utility.
- Verification: `npm run typecheck` and direct ESLint on both option modules passed.

# 2026-10-10: Isolate referral screen workflow

- Moved referral summary fetching, pending-code hydration, copy feedback, validation, submission, and persistence into `src/features/referrals/useReferral.ts`.
- Kept `Referral.tsx` focused on screen composition and added cleanup for the copied-state timer when the screen unmounts.
- Verification: `npm run lint` and `npm run typecheck` passed.

# 2026-10-10: Avoid duplicate onboarding query refreshes

- Replaced paired invalidation and refetch calls for the user and profile query keys with one awaited invalidation per key using `refetchType: "all"`.
- This keeps cached data stale when a refetch fails while avoiding cancel-and-repeat fetches on onboarding completion.
- Verification: `npm run typecheck` and direct ESLint on `src/screens/Onboarding.tsx` passed. `npm run lint` hit `EPERM` writing Expo's ESLint cache under `.expo/cache/eslint`.

# 2026-10-10: Share credit query ownership and refresh behavior

- Added a shared per-user credit-balance query so Explore, Credits, and Earn Credits reuse the same cached balance instead of making parallel queries under different keys.
- Centralized credit query keys and the duplicated pull-to-refresh lifecycle for the Credits and Earn Credits routes.
- Verification: `npm run lint` and `npm run typecheck` passed.

# 2026-10-10: Use explicit Zod namespace exports in mobile schemas

- Replaced namespace imports with the package's named `z` export across the seven mobile schema/validation modules.
- The like-for-like Android Hermes export decreased from 7,491,800 to 7,489,789 bytes (2,011 bytes); full locale modules remain in Metro's graph, so no larger locale-removal saving is claimed.
- Verification: `npm run typecheck`, direct ESLint on all seven changed files, and Android Expo export passed. `npm run lint` hit `EPERM` writing Expo's ESLint cache under `.expo/cache/eslint`.

# 2026-10-10: Remove stray divider beside Explore match note

- Removed the nested copy wrapper from the Explore profile card match note and placed its text directly in the icon row, eliminating the unwanted vertical rule while retaining the same spacing and wrapping behavior.
- Verification: `npm run lint` and `npm run typecheck` passed.

# 2026-10-10: Remove unused profile form dependencies

- Removed the unused React Hook Form and Zod resolver state from Edit Profile; the editor now reads current values from the profile query with the same date and height formatting.
- Made profile field and visibility updates await their mutations and query invalidations, so the editor closes after the refreshed profile is available.
- Removed unused direct dependencies `react-hook-form`, `@hookform/resolvers`, `moti`, and `expo-system-ui` after confirming there are no source or app-config references. The Android Hermes bundle measured 7,289,114 bytes, down 200,675 bytes from the prior 7,489,789-byte export.
- Verification: `npm run lint`, `npm run typecheck`, and Android Expo export passed. `npx expo install --check` could not complete because the environment could not reach the Expo registry.

# 2026-10-10: Keep static option consumers out of persistence module

- Redirected static option and type imports to `optionsCatalog.ts`; `options.ts` now remains an entry point for backend option caching and normalization, used directly by `OptionsProvider`.
- The Android Hermes export remained effectively unchanged (7,289,114 to 7,289,112 bytes), so this change is recorded as a dependency-boundary cleanup rather than a bundle-size win.
- Verification: `npm run lint`, `npm run typecheck`, and Android Expo export passed.

# 2026-10-10: Share profile completion counting

- Centralized profile and preference completion percentages and remaining-field counts in the profile domain helper; Edit Profile and Edit Preference now use the same field definitions and completeness rules as Profile.
- Verification: `npm run lint` and `npm run typecheck` passed.

# 2026-10-10: Consolidate shared form field composition

- Replaced the unused, general-purpose Gluestack FormControl wrapper set and its separate feedback component with one focused `FormField` used by text and multiline inputs. The field keeps the existing Gluestack state/accessibility context and shared label/helper/error presentation.
- Removed the 431-line wrapper module and redundant `FormFieldFeedback` component. Android Hermes output decreased by 13,051 bytes (7,289,112 to 7,276,061 bytes).
- Verification: `npm run lint`, `npm run typecheck`, and Android Expo export passed.

# 2026-10-10: Reuse profile section heading in field lists

- Extended the existing `SectionHeading` with an optional icon treatment and reused it across profile and preference detail sections, removing duplicated icon/title/description markup.
- Verification: `npm run lint` and `npm run typecheck` passed.

# 2026-10-10: Split textarea root and input components

- Moved the textarea root and input wrappers into separate component files, with their shared Gluestack context and style variants in dedicated modules and a small barrel export.
- Verification: `npm run lint` and `npm run typecheck` passed.

# 2026-10-10: Split input primitive wrappers

- Moved the input root, field, icon, and slot wrappers into single-component files. Their shared Gluestack setup and style variants remain in dedicated context and style modules; existing imports continue through the barrel.
- Verification: `npm run lint` and `npm run typecheck` passed.

# 2026-10-10: Remove unused HTML heading package from mobile bundle

- Replaced the actionsheet's non-exposed `H4` slot with a small native text component that retains the header accessibility role, then removed the otherwise-unused `@expo/html-elements` dependency.
- Updated the architecture summary to describe the current form stack without the removed React Hook Form dependency.
- Android Hermes output is 7,261,882 bytes, 14,179 bytes below the previous measurement; this reflects the cumulative component and dependency changes since that measurement.
- Verification: `npm run lint`, `npm run typecheck`, and Android Expo export passed.

# 2026-10-10: Remove the Explore match-note divider styling

- Removed redundant zero-width border overrides and the border utility from the match note container, leaving the star icon and explanation as an unseparated row.
- Verification: uncached ESLint and `npm run typecheck` passed; the Expo lint wrapper hit a Windows `EPERM` error writing its cache at that time.

# 2026-10-10: Split actionsheet wrappers into focused modules

- Separated each public actionsheet wrapper into its own component file, while keeping Gluestack composition and NativeWind interop in shared context and keeping variants in a shared style module.
- Preserved existing exports and wrapper props so current sheets continue using the same API.
- Verification: uncached ESLint and `npm run typecheck` passed. `npm run lint` could not write its existing cache under `.expo/cache/eslint` due to a Windows `EPERM` error.

# 2026-10-10: Consolidate repeated profile text-field rendering

- Replaced seven nearly identical text-input branches in the profile field editor with a shared label and placeholder config and one render path. Username validation remains specialized, and phone numbers still have whitespace removed.
- Verification: uncached ESLint on the changed file and `npm run typecheck` passed. The Expo lint wrapper remains unable to write its cache under `.expo/cache/eslint` due to Windows `EPERM`.

# 2026-10-10: Remove one-use field conversion helpers

- Removed four conversion helpers that were only called inside `FieldEditorContent`; the simple checks now sit at their use sites, avoiding extra utility indirection and keeping the editor module focused on its own behavior.
- Verification: `npm run lint` and `npm run typecheck` passed.

# 2026-10-10: Split password visibility icons and remove unused alert icon

- Moved the password visibility SVG icons into one-component files and retained their existing named barrel imports.
- Removed `AlertCircleIcon`, which had no references anywhere in app source.
- Verification: uncached ESLint on `src/components/ui/icon` and `npm run typecheck` passed. Expo lint hit a Windows `EPERM` error while writing its cache under `.expo/cache/eslint`.

# 2026-10-10: Separate post creation option and root layout components

- Moved the post format option into a dedicated component and mapped the three formats from data, keeping the current routes and appearance.
- Moved safe-area and provider content out of the Expo root layout so each file defines one React component; provider nesting and screen options are unchanged.
- Verification: uncached ESLint on changed files and `npm run typecheck` passed. Expo lint hit a Windows `EPERM` error writing its cache under `.expo/cache/eslint`.

# 2026-10-10: Separate room countdown formatting

- Moved the pure countdown string formatter into its own community feature utility; the reusable countdown component now handles only time state and display.
- Preserved existing seconds and minutes formatting.
- Verification: uncached ESLint on the changed files and `npm run typecheck` passed. Expo lint hit the Windows `EPERM` cache-write error.

# 2026-10-10: Split date input parsing and age helpers

- Moved typed date parsing, date-from-age calculation, and age-range validation out of the DateInput component into focused one-function utilities.
- Kept input formats, default dates, and age bounds unchanged.
- Verification: uncached ESLint on the changed files and `npm run typecheck` passed. Expo lint hit the Windows `EPERM` cache-write error.

# 2026-10-10: Separate notification relative-time formatting

- Moved relative-time label formatting into a single-function utility so `NotificationCard` only handles notification display and interaction.
- Kept the existing invalid-date handling and just-now/minute/hour/day thresholds.
- Verification: uncached ESLint on the changed files and `npm run typecheck` passed. Expo lint hit the Windows `EPERM` cache-write error.

# 2026-10-10: Reuse the parsed date in the shared formatter

- Updated `formatDate` to construct one `Date` instance and read its day, month, and year from that value instead of constructing three equivalent instances.
- Preserved the existing `DD/MM/YYYY` output.
- Verification: uncached ESLint on `formatDate.ts` and `npm run typecheck` passed. Expo lint hit the Windows `EPERM` cache-write error.

# 2026-10-10: Remove divider from Explore match note

- Explicitly disable the left border on the match-note container so no separator appears between its sparkles icon and note text.

# 2026-10-10: Reuse shared inbox time formatting

- Reused `formatTime` for today's inbox timestamps and added an optional locale argument so the inbox keeps its existing `en-US` output.

# 2026-10-10: Reuse voice duration formatting

- Reused the shared audio-duration formatter in recording controls, removing a second copy of the minutes-and-seconds calculation.

# 2026-10-10: Reuse chat message time formatting

- Routed message timestamps through `formatTime` with their existing `en-US`, 12-hour format options.
- Extended the shared formatter to accept optional `Intl.DateTimeFormatOptions`; callers that omit them keep the same display.
- Hoisted the default time options object so repeated message formatting reuses it.

# 2026-10-10: Share short month-and-day formatting

- Added one small date-label formatter used by inbox timestamps and match-note date chips, removing duplicated locale options and invalid-date handling.
- Preserved the inbox's today-as-time behavior and the match-note fallback label.
- Verification: uncached ESLint on the changed files and `npm run typecheck` passed. Expo lint hit the Windows `EPERM` cache-write error.

# 2026-10-10: Reuse clsx in the authentication layout

- Replaced the one-use `joinClassNames` helper with the already-installed `clsx` utility used by other app components.
- Verification: uncached ESLint on `AuthScreenLayout.tsx` and `npm run typecheck` passed. Expo lint hit the Windows `EPERM` cache-write error.

# 2026-10-10: Remove unused profile icon image assets

- Removed the unused cake and distance image imports and lookup entries from `Icon`, plus their unreferenced assets (1,702 source bytes total). Profile traits use Lucide icons for those fields.
- Verification: uncached ESLint on `src/libs/Icon.tsx` and `npm run typecheck` passed. Expo lint hit the Windows `EPERM` cache-write error.

# 2026-10-10: Record Android export size after cleanup

- Android Hermes export measured 7,266,615 bytes. It is 4,733 bytes larger than the earlier 7,261,882-byte export; that earlier build predates several later structural changes, so the difference is cumulative and is not attributed to any one edit.
- The removal of 1,702 bytes of source image assets is separate from the Hermes JavaScript bundle measurement.

# 2026-10-10: Remove the utility barrel

- Switched the remaining utility barrel consumers to direct imports of the single-purpose helper files, then removed the unused `src/utils/index.ts` re-export module.
- This makes utility dependencies explicit and avoids routing consumers through an aggregate entry point; it is a maintainability change, with no bundle-size claim.

# 2026-10-10: Separate HTTP status extraction

- Moved `getHttpErrorStatus` into its own utility module, leaving `userFacingError.ts` focused on user-safe message formatting.
- Updated the four status-helper consumers to use the dedicated import. Runtime behavior is unchanged.
- Removed the redundant `isVersionLessThan` wrapper and used the existing comparator at its two call sites.
- Extracted the repeated Explore refresh-time display into `formatTime`, preserving the existing locale and hour/minute options.
- Split onboarding initial-value construction, validation, and payload mapping into separate utilities; shared their small record guard and goal-field map.

# 2026-10-10: Recheck Android Hermes bundle size

- A fresh Android export measured 7,267,625 bytes for the Hermes bundle, 1,010 bytes above the earlier 7,266,615-byte measurement. The exports include multiple intervening source changes, so this difference is not attributed to any single cleanup.
- No bundle-size reduction is claimed from the utility/component organization work; the export confirms those changes are effectively neutral at this measurement scale.
- Reduced the language fallback dataset from full `{ code, name, nativeName }` objects to compact `[code, name]` tuples because only code and display name are consumed. Source data fell from 14,218 to 6,477 bytes; Android Hermes export size fell by 4,063 bytes (7,267,625 to 7,263,562) across otherwise unchanged source.
- Centralized option membership and capped option-array schema construction so profile and preference validation share the same checks and preserve their existing field-specific messages.

# 2026-10-10: Use Zod mini for app validation

- Migrated every app schema import to `zod/mini` checks and pipelines, and updated field editing to traverse mini object schemas.
- Android Hermes export measured 7,231,011 bytes, 32,551 bytes below the prior 7,263,562-byte export. The intervening option-schema deduplication is also in that interval, so the difference is recorded for the combined changes rather than attributed to Zod alone.
- `npm run lint` and `npm run typecheck` passed.
- Reused a shared date-to-age utility in onboarding and profile validation, removing two duplicate age calculations while keeping validation checks and messages unchanged.

# 2026-10-10: Separate dynamic option response parsing

- Moved options payload and version extraction into a focused parser so `OptionsProvider` handles fetching, cache updates, and provider state only.
- Preserved the supported response envelopes and array filtering.

# 2026-10-10: Remove Explore match-note divider

- Removed the obsolete left-border override from the match-note layout so the sparkle and explanation render without a separator.

# 2026-10-10: Remove unused option catalog re-exports

- Removed static catalog re-exports from the dynamic options module; app consumers already import the catalog directly from `optionsCatalog`.

# 2026-10-10: Simplify supported option icon validation

- Replaced a one-entry library allowlist and wrapper predicate with a direct Lucide check, preserving the same remote-option validation behavior.

# 2026-10-10: Derive dynamic option keys from registry

- Derived `DynamicOptionKey` from the option registry instead of maintaining a second manual list, preventing payload types and supported catalogs from drifting apart.

# 2026-10-10: Share plain-object validation

- Moved the onboarding plain-object guard into `src/utils/isRecord.ts` and reused it in stored-user parsing, dynamic-options response parsing, remote option validation, and profile field editing.
- Kept the Axios user-facing error check separate because it intentionally accepts arrays as objects.

# 2026-10-10: Share chat audio metadata normalization

- Reused one chat-domain helper for audio duration and waveform normalization in full-message and reply-preview mapping.
- Preserved the existing numeric conversion, finite-waveform filtering, and null fallbacks.

# 2026-10-10: Centralize chat sender fallback resolution

- Extended `getChatSenderId` to accept the raw `senderId` fallback and reused it in message, reply-preview, and socket-log mapping.
- Existing reaction sender resolution still calls the helper without a fallback.

# 2026-10-10: Reuse profile editor single-select groups

- Added a config-driven single-select field group used by lifestyle and goal editing, removing six repeated field layouts while preserving per-field options and copy.
- Hoisted the static field metadata so it is not rebuilt on each field value render.

# 2026-10-10: Centralize chat attachment labels

- Reused one message-type label helper for image and audio previews across reply mapping, reply UI, and inbox preview decoding.
- Kept the inbox precedence rule that image wins when either preview or message type is image.

# 2026-10-10: Reuse profile interest chips

- Extracted the shared interest lookup, icon, label, and chip rendering for profile summary and Explore cards, retaining their two existing visual variants.


