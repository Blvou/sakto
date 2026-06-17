# Rental Security Audit

Automated checks for Sakto bike rental RLS and BOLA/IDOR risks.

## Commands

```bash
npm run audit:rental          # static + live (if .env configured)
npm run audit:rental:static   # migrations + client code only
npm run audit:rental:live     # live Supabase probes
```

## Live test users

Reuse chat audit credentials in `.env`:

```env
AUDIT_CHAT_USER_A_EMAIL=...
AUDIT_CHAT_USER_A_PASSWORD=...
AUDIT_CHAT_USER_B_EMAIL=...
AUDIT_CHAT_USER_B_PASSWORD=...
```

## Scope

| Resource | Guard |
|----------|--------|
| `bookings` | RLS: `renter_id` / `owner_id` = `auth.uid()` |
| `vehicles` | RLS: active public read; owner manages own rows |
| `vehicle_availability_blocks` | RLS: owner write; active vehicle read |
| `get_or_create_booking_conversation` | RPC party membership check |
| `get_vehicle_blocked_dates` | Public availability for active vehicles (intentional) |
| `assert_vehicle_dates_available` | DB trigger on booking insert/update |

## Findings (2025-06-17)

| ID | Severity | Finding | Status |
|----|----------|---------|--------|
| R1 | Info | Overlap enforcement moved to DB trigger `bookings_assert_dates_available` | Fixed in `20250617140000_rental_availability_enforcement.sql` |
| R2 | Info | Booking chat uses `get_or_create_booking_conversation` with `auth.uid()` party check | Fixed in `20250617141000_booking_conversations.sql` |
| R3 | Info | Client `updateBookingStatus` still scopes by role — RLS remains source of truth | Accepted |

Run `npm run audit:rental` before launch and update this table if live probes fail.
