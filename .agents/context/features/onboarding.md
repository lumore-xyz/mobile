# Onboarding

## Purpose

Collect the minimum profile and preference data needed to make Lumore useful for dating and matching.

## Current Behavior

Onboarding is a multi-step flow covering intro details, contact/security, identity, preference tuning, and relationship intentions. It collects nickname, real name, birthday, phone, email, referral code, gender, interested-in, languages, preferred age range, distance, and primary/secondary/tertiary goals.

## Key Files

- Route: `src/app/(onboarding)/onboarding.tsx`
- Screen: `src/screens/Onboarding.tsx`
- Feature config/types/helpers: `src/features/onboarding`
- UI: `src/features/onboarding/OnboardingFieldRenderer.tsx`
- Schemas/options: `src/schemas/profileSchema.ts`, `src/schemas/preferenceSchema.ts`, `src/libs/options.ts`

## Data/API Dependencies

- Profile update through `updateUserData`.
- Preference update through `updateUserPreferences`.
- Username/referral option data where applicable.

## UX Requirements

Use progressive disclosure, visible labels, helper text, inline errors, and clear progress. Keep tone intimate and confident, not bureaucratic.

## Open Questions

- Which fields are mandatory by backend contract versus product preference?
- Should users be allowed to skip any onboarding steps?

## Future Work

- Add autosave/draft handling.
- Add analytics per onboarding step.
