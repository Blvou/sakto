# Sakto (Expo RN)

Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any code.

## Run

```bash
npm install
npm start          # or: npx expo start
npm run android    # launch Android emulator
npm run ios        # launch iOS simulator
npm run web        # web preview
```

In the Expo dev server terminal: press `a` for Android, `i` for iOS.

## Structure

| Path | Purpose |
|------|---------|
| `app/` | Expo Router screens (`(tabs)`, `(auth)`, dynamic routes) |
| `src/features/<feature>/` | FSD slices: `api/`, `hooks/`, `components/`, `types.ts` |
| `src/lib/supabase.ts` | Single Supabase client — do not create new instances |
| `src/lib/query-client.ts` | TanStack Query client + offline persist |
| `src/lib/database.types.ts` | Generated Supabase types |
| `src/providers/` | App-wide providers |
| `supabase/migrations/` | SQL schema + RLS policies |
| `supabase/functions/` | Edge functions |

Existing features: `auth`, `chat`, `home`.

## Env

Copy `.env.example` → `.env` and set:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

Never commit `.env`. Use `isSupabaseConfigured` from `src/lib/supabase.ts` to guard unconfigured builds.

## Before DB changes

1. Add a new migration in `supabase/migrations/` (timestamp prefix, e.g. `20250615120000_add_notifications.sql`)
2. Enable RLS on every new table
3. Add policies for `select` / `insert` / `update` as needed
4. Update `src/lib/database.types.ts` (or regenerate via `supabase gen types typescript`)
5. Wire API in `src/features/<feature>/api/`, hooks with TanStack Query, UI last

Use the `supabase-migration` skill for the full checklist.

## UX contracts

- **Loading:** skeletons on lists and grids; spinners only on buttons and blocking modals.
- **Empty:** every list screen uses `EmptyState` with a clear CTA — never a blank screen.
- **Error:** toast for transient failures; `ErrorState` with retry on full-screen list fetches.
- **Copy:** English UI copy in product screens.
- **Touch:** minimum 44px tap targets; status uses icon + text (`StatusBadge`), not color alone.
- **Auth:** use `useRequireAuth()` before book/list flows; redirect to login with `returnTo`.

Reusable UI lives in `src/design-system/components/` (`EmptyState`, `ErrorState`, `ScreenHeader`, `StatusBadge`, `ListSkeleton`).

## Cursor agent workflow

### Modes

| Mode | Use when |
|------|----------|
| **Ask** | Understand code, architecture — no file edits |
| **Plan** | Multi-file feature, unclear scope — review plan before Build |
| **Agent** | Concrete implementation, bugfix, shell commands |
| **Debug** | Runtime bugs (network, state) that static analysis misses |

One task per chat. Start a new chat when switching topics.

### Prompt template

```
[Goal] What should exist when done.

[Scope] @src/features/chat/ — only these files unless needed.

[Constraints] TanStack Query, no new deps, match existing NativeWind styles.

[Done when] Pull-to-refresh works; skeleton on loading; friendly error toast.
```

`@` mention files you already know. Skip `@` when unsure — agent will search.

While agent runs: `Enter` queues a follow-up; `Ctrl+Enter` interrupts.

### Plan → Build practice

Copy into **Plan** mode to practice the workflow:

```
Add a "typing…" indicator in the chat thread.

Scope:
- @src/features/chat/hooks/use-realtime-messages.ts — Supabase Realtime presence or broadcast
- @src/features/chat/components/ChatHeader.tsx — show when other user is typing
- @app/chat/[id].tsx — wire hook + debounced input events from MessageInput

Constraints:
- No new npm packages
- Debounce typing events (~1s) to save bandwidth on 3G
- Hide indicator when user leaves the screen

Done when:
- Typing shows for the other participant within ~2s
- Indicator clears ~3s after they stop
- No extra re-renders on the message list
```

Review the generated plan, edit if needed, then click **Build**. If wrong — revert checkpoint, refine plan, rebuild.
