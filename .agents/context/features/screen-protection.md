# Global Screen Protection

## Purpose

Reduce privacy risk by preventing screen capture where supported.

## Current Behavior

The root layout calls `useGlobalScreenProtection`, which invokes `expo-screen-capture` prevention once for the app lifecycle. Android has stronger enforcement; iOS limitations are acknowledged in comments.

## Key Files

- `src/app/_layout.tsx`
- `src/hooks/useGlobalScreenProtection.ts`

## Data/API Dependencies

- `expo-screen-capture`

## UX Requirements

Protection should be silent unless failures need debugging. Do not interrupt users with privacy warnings unless product explicitly requires it.

## Open Questions

- Should screen protection be global or limited to sensitive screens?

## Future Work

- Add environment or debug override if QA needs screenshots.
