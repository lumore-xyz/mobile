# Prompt Posts

## Purpose

Let users answer guided prompts to enrich their profile and spark conversation.

## Current Behavior

Users can browse prompt categories, fetch prompts by selected categories, and create prompt-based posts.

## Key Files

- Route: `src/app/create-post/prompts.tsx`
- APIs: `fetchPromptCategories`, `fetchPromptsByCategories`, `createPromptPost`

## Data/API Dependencies

- `GET /prompt/categories`
- `GET /prompt/?category=...`
- `POST /post`

## UX Requirements

Prompts should feel playful and intimate. Keep category selection simple and avoid overwhelming users with too many choices.

## Open Questions

- Are prompt categories backend-defined only?
- Can users edit prompt answers after creation?

## Future Work

- Add detailed prompt selection state docs.
- Add empty state for no prompts in a category.
