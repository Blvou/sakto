-- Backfill marketplace listing categories to Avito-style leaf slugs.
-- Safe to re-run: only updates rows still using legacy slugs.

-- Transport
UPDATE public.listings
SET category = 'auto-buy'
WHERE category = 'auto';

-- Real estate split by listing_type attribute
UPDATE public.listings
SET category = 'real-estate-rent'
WHERE category = 'real-estate'
  AND COALESCE(attributes->>'listing_type', 'For rent') = 'For rent';

UPDATE public.listings
SET category = 'real-estate-sale'
WHERE category = 'real-estate'
  AND attributes->>'listing_type' = 'For sale';

UPDATE public.listings
SET category = 'real-estate-rent'
WHERE category = 'real-estate';

-- Electronics → default leaf
UPDATE public.listings
SET category = 'electronics-phones'
WHERE category = 'electronics';

-- Home → furniture leaf
UPDATE public.listings
SET category = 'home-furniture'
WHERE category = 'home';

-- Clothing → women's leaf (legacy had no gender split)
UPDATE public.listings
SET category = 'clothing-women'
WHERE category = 'clothing';

-- Games → video games leaf
UPDATE public.listings
SET category = 'games-video'
WHERE category = 'games';

-- Parts split by part_type when possible
UPDATE public.listings
SET category = 'parts-moto'
WHERE category = 'parts'
  AND attributes->>'part_type' IN ('Engine', 'Body', 'Headlight', 'Tires', 'Battery');

UPDATE public.listings
SET category = 'parts-auto'
WHERE category = 'parts'
  AND attributes->>'part_type' = 'Electronics';

UPDATE public.listings
SET category = 'parts-accessories'
WHERE category = 'parts';

-- Catch-all legacy buckets
UPDATE public.listings
SET category = 'electronics-accessories'
WHERE category IN ('marketplace', 'more');
