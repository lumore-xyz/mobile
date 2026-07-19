# Repository Guidelines

## Agent Context

Before making changes, AI agents must read `.agents/context/RULES.md` and then any relevant files in `.agents/context`. The key sources are `ARCHITECTURE.md`, `DESIGN_SYSTEM.md`, `REQUIREMENTS.md`, `TODOS.md`, `DECISIONS.md`, and `CHANGELOGS.md`. Update `CHANGELOGS.md` after meaningful changes and record durable decisions in `DECISIONS.md`.

## Project Structure & Module Organization

This is an Expo Router React Native app. Route files live in `src/app`, including grouped routes such as `src/app/(subpage)`, `src/app/chat`, `src/app/community`, and `src/app/create-post`. Screen-level implementations are in `src/screens`, reusable UI in `src/components`, hooks in `src/hooks`, schemas in `src/schemas`, shared utilities in `src/utils`, and API/storage/provider code in `src/service`. Domain-specific logic belongs in `src/domain`, while feature bundles belong in `src/features`. Static images and fonts are stored in `assets`; native Android files are in `android`; Expo/EAS configuration is in `app.json` and `eas.json`.

## Build, Test, and Development Commands

- `npm start`: start the Expo development server.
- `npm run android`: build and run the app on Android through Expo.
- `npm run ios`: build and run the app on iOS through Expo.
- `npm run lint`: run Expo ESLint checks.
- `npm run typecheck`: run TypeScript with `tsc --noEmit`.

Install dependencies with `npm install` and keep `package-lock.json` committed when dependencies change.

## Coding Style & Naming Conventions

Use TypeScript for new app code and prefer `.tsx` for React components. Follow the existing style: two-space indentation, single quotes, semicolons, and functional components. Name components and screens in `PascalCase` (`AppUpdatePrompt.tsx`, `ChatHeader.tsx`), hooks with `use` prefixes (`useNotifications.ts`), and helper modules in descriptive camelCase (`formatDate.ts`). Use the `@/*` TypeScript path alias when it improves readability, and keep Tailwind/NativeWind class usage consistent with nearby components.

## Testing Guidelines

There is currently no `npm test` script or committed test suite. Before submitting changes, run `npm run lint` and `npm run typecheck`. When adding tests, colocate them near the code they cover or place feature-level tests beside the relevant module, using names like `ComponentName.test.tsx` or `helperName.test.ts`. Prioritize validation logic, data transforms, navigation-critical flows, and API/service behavior.

## Commit & Pull Request Guidelines

Recent history uses short imperative subjects and occasional Conventional Commit prefixes, for example `icon fix`, `feat: implement notifications feature with real-time updates`, and `feat(community): add CreateRoomScreen and RoomsScreen for community management`. Keep commits focused and describe the user-visible change.

Pull requests should include a concise summary, linked issue or task when available, screenshots or recordings for UI changes, and notes about configuration or dependency updates. Confirm `npm run lint` and `npm run typecheck` results in the PR description.

## Security & Configuration Tips

Do not commit secrets from `.secrets`, local Expo state from `.expo`, or machine-specific configuration. Keep API configuration centralized in `src/service/config.ts` and prefer existing service/request helpers over direct network calls inside components.
