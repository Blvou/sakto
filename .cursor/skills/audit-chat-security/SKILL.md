---
name: audit-chat-security
description: >-
  Audits Sakto chat security (Supabase RLS, BOLA/IDOR, Realtime WebSocket,
  sensitive data exposure, mobile API auth). Use when reviewing chat features,
  messages, conversations, translate Edge Function, message receipts, or when
  the user asks for chat security check, BOLA test, or IDOR audit.
---

# Chat Security Audit (Sakto)

Adapted from Anthropic Cybersecurity Skills for this Expo + Supabase chat stack.

## Quick start

```bash
npm run audit:chat          # static + live (if .env configured)
npm run audit:chat:static   # migrations + client code only
npm run audit:chat:live     # BOLA/IDOR probes against Supabase
```

For live tests, add two confirmed accounts to `.env`:

```env
AUDIT_CHAT_USER_A_EMAIL=...
AUDIT_CHAT_USER_A_PASSWORD=...
AUDIT_CHAT_USER_B_EMAIL=...
AUDIT_CHAT_USER_B_PASSWORD=...
```

Without these, live audit tries ephemeral signUp (may hit Supabase email rate limits).

## Attack surface (this project)

| Resource | Client path | ID param | RLS / guard |
|----------|-------------|----------|-------------|
| `messages` | `src/features/chat/api/messages.ts` | `conversation_id`, `message_id` | `is_conversation_participant` |
| `conversations` | `api/conversations.ts` | `conversation_id`, `listing_id` | participant or `buyer_id` |
| `conversation_participants` | receipts, read state | `conversation_id` | participant check |
| `message_translations` | `cacheTranslation` | `message_id` | via message → conversation |
| `message_receipts` | `api/receipts.ts` | `message_id` | recipient + participant |
| RPC `get_conversation_previews` | `fetchConversations` | `p_user_id` | `auth.uid() = p_user_id` |
| RPC `get_unread_total` | `fetchUnreadTotal` | `p_user_id` | `auth.uid() = p_user_id` |
| Realtime | `use-realtime-messages.ts` | channel `messages:{id}` | RLS on `postgres_changes` |
| Edge `translate` | `translateMessage` | JWT in `Authorization` | `getUser()` gate |

## Workflow

1. **Run automated audit** — `npm run audit:chat`
2. **Read report** — failures are 🔴 critical, warnings 🟡
3. **Manual follow-ups** (if live tests pass):
   - Burp/mitm: intercept Supabase REST as User B, swap `conversation_id` UUIDs
   - Realtime: subscribe to another user's `messages:{uuid}` channel
4. **Fix** — prefer RLS/SQL fixes over client-only checks; update migrations via `supabase-migration` skill

## Checklist (OWASP API1 / chat)

- [ ] User B cannot `select` messages from User A's `conversation_id`
- [ ] User B cannot `insert` with `sender_id` ≠ `auth.uid()`
- [ ] User B cannot call RPC with another user's `p_user_id`
- [ ] User B cannot read/write `message_translations` for foreign messages
- [ ] User B cannot upsert `message_receipts` for conversations they are not in
- [ ] `translate` rejects unauthenticated requests
- [ ] Client `select()` lists explicit columns (no `*`)
- [ ] No secrets in `EXPO_PUBLIC_*` or committed `.env`

## Report format

```markdown
# Chat Security Audit

## Summary
- Static: X passed, Y failed
- Live: X passed, Y failed (or skipped)

## Findings
### 🔴 Critical
- ...

### 🟡 Warning
- ...

## Recommendations
1. ...
```

## Source skills (upstream)

Based on [Anthropic-Cybersecurity-Skills](https://github.com/mukul975/Anthropic-Cybersecurity-Skills):

- `testing-api-for-broken-object-level-authorization` → live BOLA probes
- `testing-websocket-api-security` → Realtime subscription checks
- `testing-mobile-api-authentication` → session/JWT isolation
- `exploiting-excessive-data-exposure-in-api` → column allowlists
- `testing-for-sensitive-data-exposure` → env + storage patterns

Details: [reference.md](reference.md)
