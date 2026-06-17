-- Allow buyers to read conversations they created (needed for insert+returning
-- before conversation_participants rows exist).

drop policy if exists "Participants can view conversations" on public.conversations;
create policy "Participants can view conversations"
  on public.conversations for select
  to authenticated
  using (
    public.is_conversation_participant(id, auth.uid())
    or buyer_id = auth.uid()
  );
