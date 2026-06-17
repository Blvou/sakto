-- Speed up receipt lookups scoped to a conversation
create index if not exists messages_conversation_id_id_idx
  on public.messages (conversation_id, id);
