-- MCP verification follow-up: remove legacy broad profile read and reduce helper oracle risk.

drop policy if exists "Authenticated users can view public profiles" on public.profiles;

create or replace function public.is_conversation_participant(conv_id uuid, uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select uid = (select auth.uid())
    and exists (
      select 1
      from public.conversation_participants
      where conversation_id = conv_id and user_id = uid
    );
$$;

grant execute on function public.is_conversation_participant(uuid, uuid) to authenticated;
revoke execute on function public.is_conversation_participant(uuid, uuid) from public, anon;
