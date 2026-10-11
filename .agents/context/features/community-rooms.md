# Community Rooms

## Purpose

Let users discover and create local or topic-based communities, then enter room-specific matching pools.

## Current Behavior

Community browses all public active Local and Topic rooms with infinite pagination. It defaults to matching-pool size descending and supports search across names, descriptions, and tags; Local/Topic/Nearby filters; and pool-size, newest, and nearest sorting. Room cards, empty/loading/error states, room details, creation and editing with image upload and up to five suggested or custom tags, pin/unpin, rejoin, leave pool, creator controls, matching, members, and realtime pool updates are supported. Tags are persisted and shown on cards and details. Device location is only required for Nearby and Nearest; Topic rooms do not need a location.

Room details use a single virtualized list for pool members or matched chats, with the room overview and section controls rendered as the list header.

## Key Files

- Routes: `src/app/community/index.tsx`, `src/app/community/create.tsx`, `src/app/community/[roomId].tsx`
- Local place search and Android map pin picker: `src/components/community/CommunityLocationPicker.tsx`
- Detail cover, title, tags, stats, and header actions: `src/components/community/CommunityDetailHero.tsx`
- Membership status and join/leave-pool actions: `src/components/community/CommunityMembershipPanel.tsx`
- Creator controls, community edit form, and match actions: `src/components/community/CommunityCreatorSheet.tsx`, `CommunityEditForm.tsx`, `CommunityCreatorActions.tsx`
- APIs/types: `src/features/community/api.ts` and community domain types
- Room detail helpers: `src/features/community/getRoomCoordinates.ts`, `src/utils/helpers/isSameEntityId.ts`
- Provider: `src/service/providers/LocationProvider.tsx`
- Socket constants: `EXPLORE_SOCKET_EVENTS`

## Data/API Dependencies

- `GET /rooms/nearby` (paginated directory; `page`, `limit`, `search`, `type`, `nearby`, and `sort` query parameters)
- `GET /rooms/:roomId`
- `POST /rooms`
- `POST /rooms/location-search`, `POST /rooms/location-details`, `POST /rooms/location-reverse-geocode`
- Room creation accepts `type: "local" | "topic"`; location is required only for local rooms.
- Room creation and editing accept up to five tags, each up to 24 characters.
- `PATCH /rooms/:roomId`
- `POST /rooms/:roomId/pin`
- `POST /rooms/:roomId/unpin`
- `POST /rooms/:roomId/rejoin`
- `POST /rooms/:roomId/leave-pool`
- `POST /rooms/:roomId/start-match`
- Socket events: `room_pool_updated`, `roomMatchFound`

Local community location selection uses Google Places search through the authenticated backend. Android map pin selection uses `react-native-maps` and appears when `GOOGLE_MAPS_ANDROID_KEY` is present at native build time. Keep the backend `GOOGLE_MAPS_KEY` in backend environment secrets.

## UX Requirements

Rooms should feel local, social, and inviting. Use photo-led cards and clear pool state. Avoid generic white list cards.

## Open Questions

- Should rooms be called Community, Rooms, or another product term consistently?
- Which users can edit/start matches beyond the creator?

## Future Work

- Fix current type mismatch: UI references `memberCount` and `locationLabel`, but `LocationRoomSummary` defines `pinnedCount`, `poolCount`, and `location.formattedAddress`.
- Add detailed room lifecycle states.
- Use community tags with member interests for personalized discovery ranking; current room matching eligibility does not use tags.
