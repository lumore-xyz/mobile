# Image & Text Posts

## Purpose

Let users add profile/social content through images and free text.

## Current Behavior

Image posts support image upload with caption and visibility. Free-text posts support text and visibility. Shared helpers also support post update, delete, and fetch-by-id.

## Key Files

- Routes: `src/app/create-post/image.tsx`, `src/app/create-post/free-text.tsx`
- APIs: `createImagePost`, `createTextPost`, `updatePost`, `deletePost`, `getPostById`
- Hook: `src/hooks/useMediaPermision.ts`

## Data/API Dependencies

- `POST /post`
- `PUT /post/:postId`
- `DELETE /post/:postId`
- `GET /post/:postId`
- Multipart image upload.

## UX Requirements

Reserve image dimensions before upload, show loading/error/success states, and make visibility clear before posting.

## Open Questions

- What are allowed image formats and size limits?
- Should text posts have character limits?

## Future Work

- Add media compression guidance.
- Add edit post route documentation when UI exists.
