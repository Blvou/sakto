create table if not exists public.message_receipts (
  message_id uuid not null references public.messages (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  delivered_at timestamptz not null default now(),
  primary key (message_id, user_id)
);

create index if not exists message_receipts_user_id_idx on public.message_receipts (user_id);

alter table public.message_receipts enable row level security;

drop policy if exists "Participants can view message receipts" on public.message_receipts;
create policy "Participants can view message receipts"
  on public.message_receipts for select
  to authenticated
  using (
    exists (
      select 1
      from public.messages m
      where m.id = message_id
        and public.is_conversation_participant(m.conversation_id, auth.uid())
    )
  );

drop policy if exists "Recipients can mark messages delivered" on public.message_receipts;
create policy "Recipients can mark messages delivered"
  on public.message_receipts for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.messages m
      where m.id = message_id
        and m.sender_id <> auth.uid()
        and public.is_conversation_participant(m.conversation_id, auth.uid())
    )
  );

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'message_receipts'
  ) then
    alter publication supabase_realtime add table public.message_receipts;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'conversation_participants'
  ) then
    alter publication supabase_realtime add table public.conversation_participants;
  end if;
end $$;
