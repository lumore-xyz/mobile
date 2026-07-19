# Rules for AI Agents

All AI agents must read this file before making changes in this repository.

## Required Context

Before planning or editing, read the relevant context files:

- `.agents/context/RULES.md`: required operating rules.
- `.agents/context/ARCHITECTURE.md`: current project structure and stack.
- `.agents/context/DESIGN_SYSTEM.md`: required for any UI, layout, motion, color, or component work.
- `.agents/context/REQUIREMENTS.md`: product requirements and direction.
- `.agents/context/FEATURES.md`: index for detailed feature documentation.
- `.agents/context/TODOS.md`: planned work and backlog.
- `.agents/context/DECISIONS.md`: accepted technical/product decisions.
- `.agents/context/CHANGELOGS.md`: recent change history.

## What To Do

- Keep changes scoped and consistent with the existing Expo Router React Native app.
- Prefer existing helpers, providers, contexts, tokens, and component patterns.
- Use TypeScript and functional React components for new app code.
- Use NativeWind/Tailwind classes consistently with nearby files.
- Use `Pressable` for new touch interactions and provide proper accessibility roles/labels.
- Respect safe areas, dynamic text, touch target minimums, and contrast requirements.
- Update `CHANGELOGS.md` after every meaningful change.
- Update `TODOS.md`, `REQUIREMENTS.md`, or `DECISIONS.md` when plans, requirements, or decisions change.

## What To Avoid

- Do not overwrite user changes or revert unrelated files.
- Do not add raw hardcoded colors when a semantic token should exist.
- Do not make generic, boxy, corporate UI for Lumore.
- Do not use emojis as structural icons.
- Do not create broad refactors when a targeted change is enough.
- Do not introduce new dependencies without a clear reason and user-visible benefit.
- Do not hide verification failures; document blockers plainly.

## Quality Gates

After every code or configuration change, run:

```bash
npm run lint
npm run typecheck
```

If documentation-only changes are made, these checks are still preferred. If they are not run, state why in the final response and in `CHANGELOGS.md` when relevant.

## Context Locations

- Design system: `.agents/context/DESIGN_SYSTEM.md`
- Architecture: `.agents/context/ARCHITECTURE.md`
- Changelog: `.agents/context/CHANGELOGS.md`
- Todos: `.agents/context/TODOS.md`
- Requirements: `.agents/context/REQUIREMENTS.md`
- Features index: `.agents/context/FEATURES.md`
- Feature details: `.agents/context/features`
- Decisions: `.agents/context/DECISIONS.md`
