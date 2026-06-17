# Sakto MVP Bike Rental Spec

## MVP Goal
Sakto MVP supports a rental flow without online payments: renters browse bikes, request dates, owners approve or decline requests, and both sides track booking status in-app.

## Implemented Scope
- Separate rental domain in Supabase: `vehicles`, `vehicle_photos`, `vehicle_availability_blocks`, `bookings`.
- RLS baseline for rental tables, vehicle photo storage, and known chat/profile security gaps.
- Typed Expo feature slice: `src/features/rentals/`.
- Home bike section backed by rental vehicles with mock fallback when Supabase env is missing.
- Real scooter detail flow: load vehicle, calculate total, create `pending` booking request.
- Publish scooter path now creates a `vehicle` instead of closing the screen.
- Renter and owner booking screens: `/bookings` and `/bookings/owner`.
- Search MVP: controlled text input, bike results, marketplace filtering, empty/error states.

## Deferred From MVP
- Online payments, escrow, payouts.
- Full KYC/verification and reviews.
- Push notifications.
- Geospatial search and advanced availability calendar.
- Vehicle photo picker/upload UI. Storage/RLS is ready, but current publish flow submits no photos.
- Chat conversation linked directly to a booking. Existing marketplace chat remains intact; booking screens currently handle owner/renter status workflow.

## Build Prompts

### Vehicle Photo Upload
```text
[Goal] Add vehicle photo upload to scooter publishing.
[Scope] app/publish/index.tsx, src/features/rentals/api/vehicles.ts, src/features/rentals/hooks/use-create-vehicle.ts, Supabase Storage helpers if needed.
[Constraints] Use expo-image-picker, expo-image for previews, vehicle-photos bucket, no direct Supabase calls from UI, max 10 photos, friendly error toasts.
[Done when] user can pick photos, publish a bike, cover photo appears on Home/Search/detail, and tsc passes.
```

### Booking Chat Handoff
```text
[Goal] Connect booking requests to chat between renter and vehicle owner.
[Scope] supabase/migrations/, src/features/chat/api/conversations.ts, src/features/rentals/hooks/use-bookings.ts, app/scooter/[id].tsx, app/bookings/.
[Constraints] Preserve existing listing chat behavior. Add vehicle/booking conversation support with RLS membership checks. No client-only authorization.
[Done when] after creating a booking, renter can open chat with owner; owner can open chat from incoming request; existing listing chats still work.
```

### Availability Calendar
```text
[Goal] Add MVP date availability checks for vehicles.
[Scope] src/features/rentals/api/bookings.ts, src/features/rentals/api/vehicles.ts, app/scooter/[id].tsx, supabase/migrations/.
[Constraints] Prevent overlapping confirmed bookings at DB level if possible; keep UI simple for low-end Android. No hourly booking.
[Done when] unavailable dates cannot be requested and owner-approved bookings block future overlapping requests.
```

### Rental QA Audit
```text
[Goal] Audit rental RLS for BOLA/IDOR before MVP launch.
[Scope] supabase/migrations/, src/features/rentals/api/, app/bookings/.
[Constraints] Test with two users. User A must not read or mutate User B's private bookings. Owner can only update own vehicle bookings.
[Done when] static review plus live Supabase probes pass, findings are documented, and any RLS fixes are added in a new migration.
```
