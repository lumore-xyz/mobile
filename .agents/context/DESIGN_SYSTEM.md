# Lumore Design System

> Source of truth for Lumore mobile UI. Page-specific overrides may live in `design-system/lumore/pages/[page].md` and override this file.

## Brand Core

Lumore blends two archetypes: **Lover** and **Outlaw**. Lover brings warmth, intimacy, desire, softness, and emotional safety. Outlaw brings confidence, independence, bold choices, and a little tension. The result should feel like a modern dating app for people who want connection without the generic swipe-app sameness.

Design keywords: classy, smooth, intimate, magnetic, expressive, premium, warm, bold, slightly rebellious.

Avoid keywords: boxy, corporate, sterile, childish, cluttered, generic profile-card app, harsh dashboard UI.

## Color System

Use the existing Lumore palette, but shift usage so it feels premium rather than loud.

| Token    | Hex       | Use                                         |
| -------- | --------- | ------------------------------------------- |
| `cream`  | `#F1E9DA` | App background, soft sections               |
| `ink`    | `#0A0A09` | Primary text, deep overlays                 |
| `indigo` | `#2E294E` | Editorial text, dark surfaces               |
| `gold`   | `#FFD400` | Spark moments, badges, selected states      |
| `rose`   | `#D90368` | Primary emotional action, match/love states |
| `violet` | `#541388` | Premium CTA, chat accents, brand depth      |
| `white`  | `#FAFAFA` | Raised surfaces                             |

### Color Rules

- Primary CTA: use `violet` for trust/premium actions and `rose` for emotional actions.
- Use `gold` sparingly: highlights, streaks, credits, selected chips, celebration details.
- Backgrounds should be warm cream, not flat white, except for form fields and elevated sheets.
- Dark moments should use indigo/ink with rose or gold accents.
- Do not scatter raw hex values in components. Add semantic tokens first.

## Shape & Surface Language

Lumore should not feel boxy. Replace generic rectangles with intentional curves and layered surfaces.

- Cards: use `24-32px` radius for profile, match, community, and feature surfaces.
- Buttons/chips: use pill radius (`999px`) for actions, filters, tags, and status.
- Inputs: use `18-22px` radius with visible labels and gentle borders.
- Bottom sheets: use large top radius (`28-32px`) and strong scrim (`40-60%` black).
- Avoid nested cards, sharp `rounded-lg` utility defaults, heavy borders, and repeated white boxes on cream.

Preferred surface stack:

- Page background: `cream`
- Raised surface: `white`
- Soft accent surface: `violet/5`, `rose/5`, or `gold/15`
- Divider/border: `ink/8` or tokenized neutral

## Typography

Use a refined geometric sans direction. Keep current font setup if changing fonts is not in scope, but design toward:

- Display/headlines: confident, rounded-geometric, `700-900`.
- Body: readable, human, `400-500`.
- Labels: small, clear, `500-700`, never overtracked.

Type scale:

- Hero/profile name: `32-40`
- Screen title: `24-30`
- Section title: `18-22`
- Body: `15-17`
- Metadata: `12-13`

Avoid all-caps body copy, tiny gray text, and oversized headings inside compact cards.

## Component Direction

### Profile Cards

Want: immersive photo-first cards with rounded corners, soft gradient/scrim only for text legibility, pill metadata, and one clear primary action.

Avoid: square white info blocks, too many badges, text floating without contrast, generic dating-card clones.

### Buttons

Want: pill buttons, tactile press feedback, icon plus label for important actions, `150-250ms` transitions, haptics for match/send/success.

Avoid: rectangular CTAs, multiple competing primary buttons, disabled buttons that still look tappable.

### Forms

Want: calm, guided, progressive disclosure. Group related profile questions, show persistent labels, and use helper text for sensitive fields.

Avoid: placeholder-only labels, long intimidating forms, errors only at the top.

### Navigation

Want: bottom nav with no more than five items, consistent icon family, visible active state using violet/rose plus label weight.

Avoid: icon-only navigation, hidden primary actions, changing nav placement by screen.

### Chat

Want: soft message bubbles, asymmetric but balanced alignment, warm match-note moments, clear reply/edit states, media with stable dimensions.

Avoid: hard square bubbles, gray-on-gray text, cramped metadata, low-contrast timestamps.

## Motion & Interaction

Motion should feel smooth and seductive, not busy.

- Tap feedback within `80-150ms`.
- Micro-interactions: `150-300ms`.
- Screen/sheet transitions: `250-400ms`.
- Animate opacity and transform only.
- Use subtle spring scale on cards/buttons (`0.97-1.00`) and stagger profile lists by `30-50ms`.
- Respect reduced motion.

## Accessibility & Mobile Quality

- Touch targets must be at least `44x44pt`; add `hitSlop` for icon buttons.
- Use `Pressable` for new touch interactions.
- Add `accessibilityRole` and `accessibilityLabel` to icon-only controls.
- Maintain contrast: primary text `4.5:1`, secondary text `3:1`.
- Support safe areas for headers, bottom nav, sheets, and sticky CTAs.
- Test dynamic text size; prefer wrapping over truncation.

## Wants

- Warm premium romance with a confident edge.
- Photo-led layouts with editorial typography.
- Soft cream base, dark indigo depth, rose/violet emotion, gold surprise.
- Pill-shaped actions and filters.
- Fewer, stronger CTAs per screen.
- Meaningful iconography from Lucide or existing vector assets.
- Empty/loading states that feel personal and calm.

## Avoid

- Boxy `rounded-lg` cards and repeated bordered white panels.
- Generic gray SaaS styling.
- Random hardcoded colors.
- Emoji as structural icons.
- Decorative motion that does not explain state.
- Low-contrast beige-on-white or gray-on-cream text.
- Dense profile metadata walls.
- Swipe-only critical actions without visible alternatives.
