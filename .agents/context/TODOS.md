# Todos

Track planned work here. Move completed items to `CHANGELOGS.md` with a short result summary.

## Planned

- Validate MMKV/Nitro together before updating MMKV beyond 4.1.2: native Android/iOS builds and existing storage read/write checks. SDK 54 maintenance retained Nitro 0.33.9; MMKV 4.3.2 uses generator 0.35.9.

- Reassess remaining npm audit roots (braces, decode-uri-component, image-size, node-forge) when upstream fixes land. As of 2026-10-03: 39 dependent-package findings remain. Latest Expo Router still depends on query-string 7. Metro needs its image file-path caller migrated before adopting image-size 2. Remove the scoped UUID override once xcode adopts a patched version, running tests/securityDependencies.test.cjs and an Android export.

- Review the new palette and typography in Explore/profile, chat, onboarding, edit-profile, and community at device sizes; fix any clipping, text scaling, contrast, or touch-target issues found.
- Add a lightweight testing strategy for validation helpers, service logic, and navigation-critical flows.

## Backlog

- Add page-specific design-system overrides under `.agents/context/pages` if individual screens need special rules.
- Document backend/API contract assumptions used by the mobile app.
- Add screenshots or visual QA notes for redesigned screens.
