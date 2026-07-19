# Authentication

## Purpose

Allow users to create an account, sign in, recover access, maintain a session, and sign out.

## Current Behavior

Lumore supports email/password login, email/password signup, Google Sign-In, forgot-password email requests, password reset by token, setting a new password, access/refresh token storage, token refresh, and logout. `guest-login.tsx` currently redirects to login.

## Key Files

- Routes: `src/app/login.tsx`, `src/app/signup.tsx`, `src/app/forgot-password.tsx`, `src/app/reset-password.tsx`, `src/app/set-new-password.tsx`, `src/app/guest-login.tsx`
- Screens: `src/screens/Login.tsx`, `src/screens/Signup.tsx`, `src/screens/ForgotPassword.tsx`, `src/screens/ResetPassword.tsx`, `src/screens/SetNewPassword.tsx`
- Services: `src/service/requests/auth.ts`, `src/service/auth-session.ts`, `src/service/google-signin.ts`, `src/service/storage.ts`, `src/service/api-client.ts`
- Components: `src/components/auth/GoogleAuthButton.tsx`, `src/components/auth/LegalAgreementText.tsx`, `src/components/VisibilityToggle.tsx`

## Data/API Dependencies

- `POST /auth/login`
- `POST /auth/signup`
- `POST /auth/google-signin`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `POST /auth/set-password`
- `POST /auth/refresh-token`
- OneSignal user login/alias sync after successful auth.

## UX Requirements

Use persistent labels, visible validation errors, password visibility toggles, loading states during auth calls, and clear recovery paths. Keep screens warm and premium per `DESIGN_SYSTEM.md`.

## Open Questions

- Should guest mode become a real limited experience or remain a redirect?
- What legal text/versioning must be captured at signup?

## Future Work

- Add auth form tests.
- Improve auth error normalization and localization.
