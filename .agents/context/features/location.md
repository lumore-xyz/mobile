# Location

## Purpose

Power nearby users, nearby rooms, community creation, and distance-aware matching.

## Current Behavior

The app has a location provider, requests device location, exposes latitude/longitude/address/error state, reverse-geocodes through OpenStreetMap Nominatim, and can sync profile location to the backend.

## Key Files

- Provider: `src/service/providers/LocationProvider.tsx`
- Helpers: `src/libs/locationSync.ts`
- APIs: `getFormattedAddress`, `updateUserLocation`, `findNearbyUsers`, `fetchNearbyRooms`

## Data/API Dependencies

- Expo Location permission and coordinates.
- External reverse geocoding: `https://nominatim.openstreetmap.org/reverse`
- Backend profile location and nearby room/user endpoints.

## UX Requirements

Explain why location is needed. Show recoverable permission/error states. Never make the app look broken when location is unavailable.

## Open Questions

- What is the default behavior when users deny location permission?
- How often should location sync?

## Future Work

- Add privacy copy around exact versus approximate location.
- Cache last known location display.
