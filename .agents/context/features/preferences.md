# Preferences

## Purpose

Let users define who they want to meet and how matching should be tuned.

## Current Behavior

Preference editing supports interested-in, age range, distance, goals, and option-driven fields. Preference completion and match availability are surfaced in related screens.

## Key Files

- Route: `src/app/(subpage)/edit-preference.tsx`
- Screen: `src/screens/EditPreference.tsx`
- Hook: `src/hooks/useUserPrefrence.ts`
- Schemas: `src/schemas/preferenceSchema.ts`, `src/lib/settingsValidators.ts`
- APIs: `updateUserPreferences`, `fetchPreferenceMatchCount`

## Data/API Dependencies

- `GET /profile/:userId/preferences`
- `PATCH /profile/:userId/preferences`
- `GET /status/match-available-count`
- Dynamic options from `OptionsProvider`.

## UX Requirements

Use sliders/ranges with clear labels, helper text, and immediate readable summaries. Avoid making preferences feel like a long form.

## Open Questions

- Should preference changes immediately affect active matchmaking pools?

## Future Work

- Add a preference impact preview.
- Add tests for preference validation/building.
