# Community Rooms

## Purpose

Let users discover and create location-based communities, then enter room-specific matching pools.

## Current Behavior

Community shows nearby rooms using user location, room cards, empty/loading/error states, room detail pages, room creation, room editing with image upload, pin/unpin, rejoin, leave pool, creator controls, start-match action, member lists, and realtime room pool updates.

## Key Files

- Routes: `src/app/community/index.tsx`, `src/app/community/create.tsx`, `src/app/community/[roomId].tsx`
- APIs/types: room helpers and `LocationRoomSummary` in `src/libs/apis.ts`
- Provider: `src/service/providers/LocationProvider.tsx`
- Socket constants: `EXPLORE_SOCKET_EVENTS`

## Data/API Dependencies

- `GET /rooms/nearby`
- `GET /rooms/:roomId`
- `POST /rooms`
- `PATCH /rooms/:roomId`
- `POST /rooms/:roomId/pin`
- `POST /rooms/:roomId/unpin`
- `POST /rooms/:roomId/rejoin`
- `POST /rooms/:roomId/leave-pool`
- `POST /rooms/:roomId/start-match`
- Socket events: `room_pool_updated`, `roomMatchFound`

## UX Requirements

Rooms should feel local, social, and inviting. Use photo-led cards and clear pool state. Avoid generic white list cards.

## Open Questions

- Should rooms be called Community, Rooms, or another product term consistently?
- Which users can edit/start matches beyond the creator?

## Future Work

- Fix current type mismatch: UI references `memberCount` and `locationLabel`, but `LocationRoomSummary` defines `pinnedCount`, `poolCount`, and `location.formattedAddress`.
- Add detailed room lifecycle states.
