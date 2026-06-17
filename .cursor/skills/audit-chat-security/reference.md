# Sakto Chat Security Reference

## Tables under audit

```
profiles ←→ conversation_participants ←→ conversations ←→ listings
                      ↓
                  messages ←→ message_translations
                      ↓
               message_receipts
```

## BOLA test matrix (live script)

| # | Actor | Action | Expected |
|---|-------|--------|----------|
| 1 | B | `messages.select` where A's `conversation_id` | 0 rows |
| 2 | B | `messages.insert` with A's `sender_id` | RLS error |
| 3 | B | `get_conversation_previews(A.id)` | 0 rows |
| 4 | B | `get_unread_total(A.id)` | 0 |
| 5 | B | `message_translations.select` for A's message | 0 rows |
| 6 | B | `conversation_participants.update` on A's row | 0 updated / error |
| 7 | B | `message_receipts.insert` for A's message | RLS error |

## Realtime (WebSocket)

Supabase Realtime uses `wss://<project>.supabase.co/realtime/v1/websocket`.

Client filter in `use-realtime-messages.ts`:

```ts
filter: `conversation_id=eq.${conversationId}`
```

Server must still enforce RLS on `postgres_changes` — client filter is not a security boundary.

Test: authenticated User B subscribes to User A's `conversation_id`; no INSERT events should arrive unless B is a participant.

## Sensitive data

- JWT in AsyncStorage via `src/lib/supabase.ts` — acceptable for mobile; ensure no service role key in app
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` is public by design; security = RLS
- `GOOGLE_TRANSLATE_API_KEY` must stay in Edge Function secrets only

## Translate Edge Function risks

File: `supabase/functions/translate/index.ts`

- ✅ Requires `Authorization` + `getUser()`
- ✅ `MAX_TEXT_LENGTH` cap
- ⚠️ `Access-Control-Allow-Origin: *` — OK for mobile; tighten if web clients added
