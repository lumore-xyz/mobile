# Decisions

Record durable technical, product, and design decisions here. Newest entries go first.

## 2026-07-19: Semantic UI Roles Extend the Brand Palette

Decision: Keep the established Lumore palette and expose semantic surface, text, border, and action roles through both Tailwind and TypeScript theme constants.

Reason: Shared roles make app-wide polish consistent and reduce raw per-component color choices without changing the brand source of truth.

Impact: New shared UI should use semantic roles where available; premium actions use violet, emotional actions use rose, and gold remains a selective celebration accent.

## 2026-07-19: Agent Context Lives in `.agents/context`

Decision: Keep persistent AI-agent context in `.agents/context`.

Reason: The repository needs a predictable place for architecture, requirements, design rules, todos, changelogs, and decision history so future agents can start with the same project understanding.

Impact: Agents must read `.agents/context/RULES.md` first and then open the relevant context files before editing.

## 2026-07-19: Design System Uses Lover + Outlaw Brand Archetypes

Decision: Lumore UI direction combines Lover warmth with Outlaw confidence.

Reason: The app should feel like a premium modern dating product, not a generic boxy social app.

Impact: UI work must follow `.agents/context/DESIGN_SYSTEM.md`, including the existing palette, softer shapes, pill controls, tactile motion, and anti-boxy rules.

## Decision Template

```md
## YYYY-MM-DD: Title

Decision: What was decided.

Reason: Why this decision was made.

Impact: What future contributors and agents must do because of it.
```
