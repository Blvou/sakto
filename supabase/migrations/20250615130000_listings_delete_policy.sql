-- Allow sellers to delete their own listings

drop policy if exists "Sellers can delete own listings" on public.listings;

create policy "Sellers can delete own listings"
  on public.listings for delete
  to authenticated
  using (auth.uid() = seller_id);
