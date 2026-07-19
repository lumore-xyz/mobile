# Options & Dynamic Metadata

## Purpose

Provide backend-driven option lists and icon metadata for profile, onboarding, preferences, and display fields.

## Current Behavior

Options are fetched from status/options, cached with version handling, normalized, and used throughout forms/profile displays. Option icons are mapped to Lucide or image assets.

## Key Files

- Provider: `src/service/providers/OptionsProvider.tsx`
- Libraries: `src/libs/options.ts`, `src/libs/optionIcons.ts`, `src/libs/OptionIcon.tsx`
- Static data: `src/libs/languages.json`

## Data/API Dependencies

- `GET /status/options`
- Cached option version values.

## UX Requirements

Option labels/icons should be consistent across onboarding, profile, and preferences. Avoid emoji icons as structural UI.

## Open Questions

- Which options are backend-owned versus app-owned?

## Future Work

- Document option schema and fallback behavior.
- Add tests for option normalization.
