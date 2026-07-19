# Games: This or That

## Purpose

Add playful personality expression and lightweight engagement through binary-choice prompts.

## Current Behavior

Users can open a games hub, answer This or That questions, view user answers on profiles, and submit custom questions with left/right text, images, and optional category.

## Key Files

- Routes: `src/app/(subpage)/games`, including `this-or-that` and submit routes
- Screens: `src/screens/Games.tsx`, `src/screens/ThisOrThat.tsx`, `src/screens/ThisOrThatSubmit.tsx`
- APIs: `fetchThisOrThatQuestions`, `fetchUserThisOrThatAnswers`, `submitThisOrThatAnswer`, `submitThisOrThatQuestion`

## Data/API Dependencies

- `GET /games/this-or-that/questions`
- `GET /games/this-or-that/answers/:userId`
- `POST /games/this-or-that/answers`
- `POST /games/this-or-that/questions`

## UX Requirements

This feature can be more playful, but should still feel premium. Use image dimensions, quick feedback, and haptics for selections.

## Open Questions

- Are submitted questions moderated before appearing?
- Should answers affect matching?

## Future Work

- Add moderation state docs.
- Add result/insight views.
