# Lumore Design System

> Canonical visual and interaction direction for every Lumore mobile flow. Feature pages may add narrow, documented exceptions, but should not establish competing brand systems.

## Brand Position

Lumore is a discreet, high-touch matchmaking club for accomplished people seeking a thoughtful, compatible partner. The app should feel selective through its curation, privacy, writing, and service—not through loud status symbols or claims about wealth, rank, or worth.

**Promise:** fewer, more considered introductions; room to show a whole person; privacy and respect at every step.

**Character:** cultivated, assured, intimate, discerning, welcoming, quietly sensual.

**Design references:** private members' lounge, beautifully typeset invitation, boutique hotel, contemporary portraiture. Use these as cues for restraint, material, and hospitality—not as literal props.

**Never:** nightclub neon, mass-market swipe-game tropes, corporate SaaS dashboards, fake exclusivity, conspicuous luxury clichés, snobbery, or decorative clutter.

## Experience Principles

1. **Curation over volume.** Make introductions feel considered. Give each profile and match rationale space; do not gamify people with urgency, streak pressure, or swipe-like scoreboards.
2. **Privacy feels designed in.** Explain visibility and identity choices in plain language. Avoid exposing private feedback, exact location, or sensitive preference data as decorative profile content.
3. **Confidence without performance.** Use elegant hierarchy and quality photography, not gold foil everywhere, ornate crests, or status badges.
4. **Hospitality in every state.** Loading, errors, empty lists, payment/credit confirmations, and account recovery should be calm, specific, and helpful.
5. **Warmth with boundaries.** Romance can be expressive; safety, consent, reporting, verification, and rejection must remain clear and neutral.

## Visual System

### Palette

This palette is implemented in `src/libs/constants/theme.ts` and mirrored by the `ui.*` NativeWind colors in `tailwind.config.js`. Use semantic token names in app code; keep the two foundations in sync when changing a value.

| Semantic role | Token | Use |
| --- | --- | --- |
| Porcelain | `#F7F4EE` | Main light canvas; warm, nearly neutral |
| Parchment | `#EAE3D7` | Subtle inset sections and separators |
| Midnight | `#17252B` | Primary dark surface and navigation |
| Forest | `#30463E` | Secondary brand depth, selected calm states |
| Aubergine | `#563B49` | Romantic accent, used sparingly |
| Champagne | `#C7A66A` | Fine highlights, verified/detail accents; never long text |
| Ink | `#242624` | Primary text on light surfaces |
| Slate | `#6D716D` | Secondary text on light surfaces |
| Paper | `#FFFEFB` | Raised form and reading surfaces |
| Danger | `#B4233D` (`ui-danger`) | Errors and destructive actions only |

Use Midnight/Forest with Paper text for dark surfaces; Porcelain/Paper with Ink text for light surfaces. Champagne is a small accent, not a generic success color. Reserve Aubergine for moments of emotional emphasis. Avoid gradients except over photography where needed for legibility.

The implementation exports `PALETTE`, `COLORS`, and semantic `THEME` roles. NativeWind provides matching classes such as `bg-ui-midnight`, `text-ui-ink`, and `border-ui-parchment`. Do not introduce the retired `light/shade/primary/highlight` color names in new UI.

### Typography

Use an editorial pairing: the platform serif (`font-display`) for occasional display moments and the native sans family for controls, body copy, and dense data. No custom font dependency is needed for this direction.

- Display: `28–36`, regular or medium; use sparingly on onboarding, key feature introductions, and profile names.
- Screen title: `24–30`, semibold; sentence case.
- Section title: `18–21`, semibold.
- Body: `15–17`, regular with comfortable line height.
- Metadata: `13–14`; keep readable and avoid low-contrast microcopy.
- Buttons and field labels: `14–16`, medium or semibold.

Use whitespace, alignment, and scale to establish hierarchy. Avoid all-caps paragraphs, exaggerated tracking, heavy black display weights, and multiple competing typefaces on one screen.

### Layout, Shape, and Material

- Phone gutters: `20–24`; compact controls may align to `16` where the screen needs room.
- Spacing rhythm: `8`, `12`, `16`, `24`, `32`.
- Inputs and compact controls: `14–18` corner radius. Primary cards and sheets: `20–28`. Pills are reserved for filters, compact metadata, and truly compact actions.
- Use open editorial layouts first. Add a surface only when it groups content or clarifies an action; one raised surface per hierarchy level.
- Prefer hairline warm dividers and restrained shadows. Avoid heavy outlines, nested cards, and repeated white rectangles.
- Keep photo crops intentional, stable, and large enough to feel personal. Use overlays only where text needs contrast.

## Product Patterns

### Discovery and Profiles

Treat each introduction like a considered profile, not a game card. Lead with portrait and name; show only the metadata that helps a person decide whether to learn more. Present compatibility with a short, specific rationale, never as a judgment of someone's overall worth. Preserve product privacy rules such as nickname-only previews and deliberate blur where those are required.

Keep Say hello as the clear primary action and rejection as an equally understandable, lower-emphasis alternative. Both must be visible and accessible; no critical decision may depend on swiping. Avoid badge piles, public rejection signals, dense attribute grids, and artificial countdowns.

### Onboarding and Profile Editing

Make profile creation feel like a private conversation with a good host. Ask one coherent group at a time, show progress, explain why sensitive information is requested, and let users understand what will be public. Use persistent field labels, concise examples, optionality cues, and inline validation. Never imply a user is undesirable because a profile is incomplete.

### Authentication and Recovery

Reuse the existing photo-led shared shell: a composed brand introduction above a warm, readable form surface. Keep one dominant action per state, visible labels, nearby recovery/account-switch links, and calm inline feedback with icon plus text. State password requirements before submission. Maintain safe-area and keyboard behavior on short screens.

### Chat and Safety

Make conversation the most human, least decorated area of the app. Use soft, readable message surfaces, balanced alignment, clear delivery/reply/edit states, and stable media frames. Match notes should be brief and contextual. Reporting, blocking, leaving, and verification states need direct language and unambiguous confirmation; never bury safety controls in decorative menus.

### Community, Posts, and Games

Keep community rooms welcoming and place-led, with photography and useful local context. Let posts foreground the member's words and images. Games may add playful accents but should not change the overall brand, pressure users, or suggest that people are prizes.

### Credits, Notifications, and Settings

Treat credits as a transparent utility: show balance, cost, and consequence before a paid action. Use champagne sparingly for ledger or reward highlights. Notifications should prioritize event and next step; settings should favor clear grouped rows over dashboard tiles. Confirm irreversible actions with plain language.

### Navigation and Shared Controls

Keep the established five destinations and consistent icon family. The dark navigation dock may provide brand depth; selected state must be clear through icon and label treatment, not color alone. Use `Pressable` for new actions. Prefer labeled controls; icon-only actions need at least `44x44pt`, a hit area, and a descriptive accessibility label.

### Buttons and Forms

Use a filled Midnight or Forest action for the one primary action; use quiet text or outlined treatments for secondary actions. Reserve Aubergine for an emotional action when context calls for it. Disabled controls must look unavailable. Maintain visible field labels, useful helper text, specific inline errors, and a clear save/submit state.

### Loading, Empty, and Error States

Use understated skeletons or concise progress copy. Empty states should say what is missing and offer one useful next step. Errors should explain what happened, preserve entered work where possible, and provide a retry or recovery path. Do not use color alone to communicate state.

## Motion and Feedback

Motion should convey continuity and response, not theatrical luxury.

- Press feedback: immediate, subtle scale/opacity or color response.
- Micro-interactions: `150–250ms`; screen and sheet transitions: `250–350ms`.
- Prefer opacity and transform. Avoid repeated parallax, sparkle, and card-stacking effects.
- Use haptics only for meaningful events such as send, match, or successful completion.
- Respect reduced motion and never make motion the sole source of meaning.

## Accessibility and Mobile Quality

- Maintain at least `44x44pt` touch targets and add hit slop for small icon controls.
- Provide accessibility roles, labels, and selected/disabled state for controls; announce important success and error feedback.
- Target WCAG contrast: `4.5:1` for normal text and `3:1` for large text and essential non-text controls.
- Support safe areas, keyboard avoidance, screen readers, and larger dynamic text. Let content wrap rather than truncate essential information.
- Do not rely on color, blur, gesture, or animation alone for identity, state, or action.

## Content Voice

Write like a discreet, thoughtful host: warm, concise, composed, and specific. Use sentence case and contractions where natural. Invite rather than pressure. Explain costs, privacy, and next steps plainly. Avoid status-coded language, manipulative urgency, exaggerated romantic promises, jargon, and copy that ranks a person's desirability.

## Review Checklist

Before considering a screen aligned, confirm that it:

- Feels like Lumore through restraint, hospitality, and human photography—not a luxury costume.
- Has one obvious next step and understandable alternatives.
- Gives profiles and conversations room to breathe without hiding useful context.
- Explains privacy, cost, error, and safety states where they matter.
- Uses semantic tokens, accessible contrast, touch targets, labels, safe areas, and scalable text.
- Handles loading, empty, failure, and success states in the same visual language.
