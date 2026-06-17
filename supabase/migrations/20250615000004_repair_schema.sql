create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  avatar_url text,
  preferred_lang text not null default 'en' check (preferred_lang in ('en', 'tl')),
  created_at timestamptz not null default now()
);

create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  price numeric(12, 2) not null check (price >= 0),
  image_url text,
  location text,
  created_at timestamptz not null default now()
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.listings (id) on delete set null,
  buyer_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (listing_id, buyer_id)
);

create table if not exists public.conversation_participants (
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  last_read_at timestamptz not null default now(),
  primary key (conversation_id, user_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(body) <= 2000),
  created_at timestamptz not null default now()
);

create table if not exists public.message_translations (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.messages (id) on delete cascade,
  target_lang text not null check (target_lang in ('en', 'tl')),
  translated_body text not null,
  created_at timestamptz not null default now(),
  unique (message_id, target_lang)
);

create index if not exists listings_seller_id_idx on public.listings (seller_id);
create index if not exists conversations_buyer_id_idx on public.conversations (buyer_id);
create index if not exists conversations_updated_at_idx on public.conversations (updated_at desc);
create index if not exists conversation_participants_user_id_idx
  on public.conversation_participants (user_id);
create index if not exists messages_conversation_id_created_at_idx
  on public.messages (conversation_id, created_at desc);

create or replace function public.is_conversation_participant(conv_id uuid, uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.conversation_participants
    where conversation_id = conv_id and user_id = uid
  );
$$;

grant execute on function public.is_conversation_participant(uuid, uuid) to authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.handle_new_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.conversations
  set updated_at = now()
  where id = new.conversation_id;
  return new;
end;
$$;

drop trigger if exists on_message_created on public.messages;
create trigger on_message_created
  after insert on public.messages
  for each row execute function public.handle_new_message();

alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.messages enable row level security;
alter table public.message_translations enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);

drop policy if exists "Authenticated users can view public profiles" on public.profiles;
create policy "Authenticated users can view public profiles"
  on public.profiles for select to authenticated using (true);

drop policy if exists "Users can view profiles in shared conversations" on public.profiles;
create policy "Users can view profiles in shared conversations"
  on public.profiles for select
  using (
    exists (
      select 1
      from public.conversation_participants cp1
      join public.conversation_participants cp2 on cp1.conversation_id = cp2.conversation_id
      where cp1.user_id = auth.uid() and cp2.user_id = profiles.id
    )
  );

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

drop policy if exists "Anyone authenticated can view listings" on public.listings;
create policy "Anyone authenticated can view listings"
  on public.listings for select to authenticated using (true);

drop policy if exists "Sellers can insert own listings" on public.listings;
create policy "Sellers can insert own listings"
  on public.listings for insert to authenticated with check (auth.uid() = seller_id);

drop policy if exists "Sellers can update own listings" on public.listings;
create policy "Sellers can update own listings"
  on public.listings for update to authenticated using (auth.uid() = seller_id);

drop policy if exists "Participants can view conversations" on public.conversations;
create policy "Participants can view conversations"
  on public.conversations for select to authenticated
  using (public.is_conversation_participant(id, auth.uid()));

drop policy if exists "Buyers can create conversations" on public.conversations;
create policy "Buyers can create conversations"
  on public.conversations for insert to authenticated with check (auth.uid() = buyer_id);

drop policy if exists "Participants can view participants" on public.conversation_participants;
create policy "Participants can view participants"
  on public.conversation_participants for select to authenticated
  using (public.is_conversation_participant(conversation_id, auth.uid()));

drop policy if exists "Users can insert participants for own conversations" on public.conversation_participants;
create policy "Users can insert participants for own conversations"
  on public.conversation_participants for insert to authenticated
  with check (
    user_id = auth.uid()
    or exists (
      select 1 from public.conversations c
      where c.id = conversation_id and c.buyer_id = auth.uid()
    )
  );

drop policy if exists "Users can update own read state" on public.conversation_participants;
create policy "Users can update own read state"
  on public.conversation_participants for update to authenticated
  using (user_id = auth.uid());

drop policy if exists "Participants can view messages" on public.messages;
create policy "Participants can view messages"
  on public.messages for select to authenticated
  using (public.is_conversation_participant(conversation_id, auth.uid()));

drop policy if exists "Participants can send messages" on public.messages;
create policy "Participants can send messages"
  on public.messages for insert to authenticated
  with check (
    sender_id = auth.uid()
    and public.is_conversation_participant(conversation_id, auth.uid())
  );

drop policy if exists "Participants can view translations" on public.message_translations;
create policy "Participants can view translations"
  on public.message_translations for select to authenticated
  using (
    exists (
      select 1 from public.messages m
      where m.id = message_id
        and public.is_conversation_participant(m.conversation_id, auth.uid())
    )
  );

drop policy if exists "Participants can cache translations" on public.message_translations;
create policy "Participants can cache translations"
  on public.message_translations for insert to authenticated
  with check (
    exists (
      select 1 from public.messages m
      where m.id = message_id
        and public.is_conversation_participant(m.conversation_id, auth.uid())
    )
  );

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;
end $$;
