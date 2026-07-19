# Profile Editing

## Purpose

Let users maintain profile identity, profile image, field visibility, and account settings.

## Current Behavior

Users can edit profile fields, update profile image, change visibility per field, check username availability, open user settings, and delete account.

## Key Files

- Screens: `src/screens/EditProfile.tsx`, `src/screens/EditUserSettings.tsx`
- Components: `src/components/profile/ProfileImagePicker.tsx`, `src/components/profile/FieldEditorSheet.tsx`, `src/components/profile/FieldEditorContent.tsx`, `src/components/profile/ProfileFieldsList.tsx`, `src/components/profile/ProfileField.tsx`
- Hooks: `src/hooks/useUsernameAvailability.ts`, `src/hooks/useUser.ts`
- APIs: `updateUserData`, `uploadProfilePicture`, `updateFieldVisibility`, `deleteAccount`

## Data/API Dependencies

- `PATCH /profile/:userId`
- `PATCH /profile/:userId/update-profile-picture`
- `PATCH /profile/:userId/visibility`
- `DELETE /profile/:userId`
- `GET /auth/check-username/:username`

## UX Requirements

Use bottom sheets with strong scrims for editing. Keep destructive account actions visually separated and confirmed.

## Open Questions

- What account deletion confirmation language is required?
- Which fields need extra privacy explanations?

## Future Work

- Add unsaved-change confirmation.
- Add validation detail docs for each profile field.
