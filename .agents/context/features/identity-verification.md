# Identity Verification

## Purpose

Allow users to verify identity and increase trust in dating/referral flows.

## Current Behavior

Profile/settings reflect verified or pending state. Starting verification calls the backend and opens a Didit verification URL in the system browser.

## Key Files

- Screens: `src/screens/Settings.tsx`, `src/screens/Profile.tsx`
- API: `startDiditVerification`

## Data/API Dependencies

- `POST /didit/create-verification`
- User fields: `isVerified`, `verificationStatus`
- `expo-web-browser`

## UX Requirements

Explain what verification does and what status means. Disable repeated start actions while pending or loading.

## Open Questions

- What rewards/features are gated by verification?
- How is failed/rejected verification surfaced?

## Future Work

- Add verification status detail states.
- Add product copy for trust/safety.
