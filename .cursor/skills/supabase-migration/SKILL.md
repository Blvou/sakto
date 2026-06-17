---
name: supabase-migration
description: Adds Supabase SQL migrations with RLS policies and wires them into the Expo app. Use when creating or altering database tables, adding RLS, writing migrations in supabase/migrations/, or when the user mentions schema changes, new tables, or database types.
---

# Supabase Migration Checklist

Follow this order. Do not skip RLS.

## 1. Migration file

Create `supabase/migrations/<YYYYMMDDHHMMSS>_<snake_case_name>.sql`.

Naming: lexicographic timestamp prefix so migrations apply in order.

```sql
-- Example: notifications table
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index notifications_user_id_created_at_idx
  on public.notifications (user_id, created_at desc);
```

Patterns from this project:
- `uuid` PKs with `gen_random_uuid()`
- FK to `public.profiles (id)` for user-owned rows
- `timestamptz not null default now()` for timestamps
- Indexes on FK + common sort/filter columns

## 2. RLS (required)

```sql
alter table public.<table> enable row level security;

create policy "Users read own rows"
  on public.<table> for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users insert own rows"
  on public.<table> for insert
  to authenticated
  with check (auth.uid() = user_id);
```

Reuse helpers when applicable:
- `public.is_conversation_participant(conv_id, uid)` — chat-related tables

Test mentally: can user A read user B's rows? Should be **no**.

## 3. Realtime (if needed)

Only for tables the app subscribes to:

```sql
alter publication supabase_realtime add table public.<table>;
```

Chat messages already use realtime on `public.messages`.

## 4. Update TypeScript types

Extend `src/lib/database.types.ts` `Database['public']['Tables']` for the new table, or regenerate:

```bash
supabase gen types typescript --project-id <id> > src/lib/database.types.ts
```

## 5. API layer

Add functions in `src/features/<feature>/api/<resource>.ts`:
- Use `supabase` from `@/src/lib/supabase` only
- Return typed data; throw on `error`
- Validate user input with Zod before insert/update

## 6. TanStack Query hooks

In `src/features/<feature>/hooks/`:
- `queryKey` in feature `types.ts` (`chatQueryKeys` pattern)
- `useQuery` for reads, `useMutation` for writes
- `enabled: !!userId` when auth-gated
- Invalidate related keys in `onSuccess`

## 7. UI

- Loading: skeleton (not spinner-only)
- Error: friendly message + retry; toast via `sonner-native` on mutation failure
- No direct Supabase calls in components

## Verification

- [ ] Migration is idempotent-safe (new file, not editing old migrations)
- [ ] RLS enabled + policies for every operation the app uses
- [ ] Types match SQL columns
- [ ] Hook + API covered; UI handles `isLoading` / `isError`
- [ ] Remind user to apply migration: `supabase db push` or dashboard SQL editor
