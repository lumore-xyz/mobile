# Create Post

## Purpose

Provide a hub for users to create expressive profile/social content.

## Current Behavior

The create-post route lets users choose between prompt posts, image posts, and free-text posts. Supporting APIs handle prompt, image, text, update, delete, and fetch-by-id flows.

## Key Files

- Routes: `src/app/create-post/index.tsx`, `src/app/create-post/_layout.tsx`
- APIs: post helpers in `src/libs/apis.ts`
- Media permission: `src/hooks/useMediaPermision.ts`

## Data/API Dependencies

- `POST /post`
- `PUT /post/:postId`
- `DELETE /post/:postId`
- `GET /post/:postId`

## UX Requirements

Creation should feel expressive, not form-heavy. Use large touch targets and clear visibility controls.

## Open Questions

- Where do created posts surface besides profile?

## Future Work

- Document post visibility values.
- Add draft/unsaved-change behavior.
