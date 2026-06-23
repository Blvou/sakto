-- Guests and other users must read seller avatars via storage public URLs.

drop policy if exists "Users can read own avatar objects" on storage.objects;
drop policy if exists "Avatar images are publicly accessible" on storage.objects;

create policy "Avatar images are publicly accessible"
  on storage.objects for select
  to public
  using (bucket_id = 'avatars');
