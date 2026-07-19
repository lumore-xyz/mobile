# UI Foundation

## Purpose

Provide shared UI primitives and layout components so screens look and behave consistently.

## Current Behavior

The app has shared primitives for buttons, text inputs, date/range/slider/select/multiselect controls, tabs, skeletons, actionsheets, bottom sheets, avatars, icons, keyboard-aware layout, auth layout, and notification/profile/chat components. Styling uses NativeWind classes and Gluestack wrappers. Semantic Lumore tokens cover surfaces, text, borders, and action roles; shared buttons and text fields use the brand's pill/soft-curve language.

## Key Files

- UI primitives: `src/components/ui`
- Layout: `src/components/layout`
- Icons: `src/libs/Icon.tsx`, `src/components/ui/icon`
- Theme: `tailwind.config.js`, `src/libs/constants/theme.ts`
- Design source: `.agents/context/DESIGN_SYSTEM.md`

## Data/API Dependencies

None directly. Components are used by feature screens that own data dependencies.

## UX Requirements

All new UI must follow `DESIGN_SYSTEM.md`: warm premium romance, softer surfaces, pill controls, accessible touch targets, consistent icon family, and reduced boxy white panels.

## Open Questions

- Should radius and motion values become explicit reusable tokens in addition to the current semantic color tokens?

## Future Work

- Create reusable profile card, pill button, soft card, and field row variants.
