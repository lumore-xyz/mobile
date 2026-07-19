# Architecture

## Overview

Lumore Mobile is an Expo Router React Native application for dating, chat, community rooms, profile management, credits, notifications, and lightweight games. The app uses TypeScript, NativeWind/Tailwind classes, Gluestack UI primitives, React Query for server state, Socket.IO for realtime flows, OneSignal for notifications, and Expo modules for native capabilities.

## Runtime Stack

- App shell: Expo SDK 54, React Native 0.81, React 19.
- Routing: `expo-router` with file-based routes in `src/app`.
- Styling: NativeWind/Tailwind tokens from `tailwind.config.js`, plus local constants in `src/libs/constants/theme.ts`.
- Data fetching: `@tanstack/react-query`, API helpers in `src/service`.
- Realtime: Socket contexts and chat events in `src/service/context` and `src/domain/chat`.
- Forms and validation: `react-hook-form`, Zod schemas in `src/schemas` and `src/lib`.
- Native integrations: Google Sign-In, OneSignal, location, image picker/camera, secure storage, ads, haptics, audio.

## Source Layout

- `src/app`: Expo Router route entries and route groups.
- `src/screens`: screen-level UI and orchestration used by route files.
- `src/components`: reusable UI, layout, auth, profile, notification, and explore/chat components.
- `src/components/ui`: shared low-level UI primitives and Gluestack wrappers.
- `src/service`: API clients, storage, providers, contexts, query setup, analytics, and app-update logic.
- `src/domain`: domain-specific pure logic and shared types, currently focused on chat.
- `src/features`: feature bundles, currently onboarding.
- `src/hooks`: reusable hooks for user, notifications, ads, media permissions, app updates, and preferences.
- `src/libs` and `src/lib`: app constants, option/icon helpers, validators, feature flags, and utility libraries.
- `src/utils`: general helpers, formatting, haptics, audio waveform, and user-facing errors.
- `assets`: static images and fonts.
- `android`: native Android project generated/maintained by Expo prebuild workflows.

## Design Context

The canonical design source is `.agents/context/DESIGN_SYSTEM.md`. It defines the Lumore Lover + Outlaw brand direction, palette, shape language, motion rules, accessibility expectations, and UI anti-patterns.

## Quality Gates

After code changes, run:

- `npm run lint`
- `npm run typecheck`

There is no committed `npm test` script at this time. Add focused tests when introducing testable logic or risky behavior.
