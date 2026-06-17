-- Advisor fixes after applying rental MVP schema remotely.

create index if not exists vehicle_availability_blocks_booking_id_idx
  on public.vehicle_availability_blocks (booking_id)
  where booking_id is not null;

drop policy if exists "Authenticated users can read vehicle photos" on storage.objects;

revoke execute on function public.handle_new_message() from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.is_conversation_participant(uuid, uuid) from public, anon;
