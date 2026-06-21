const DEMO_IMAGE_MAP: Record<string, number> = {
  'a0000000-0000-4000-8000-000000000001': require('../../../../assets/listings/l1.png'),
  'a0000000-0000-4000-8000-000000000002': require('../../../../assets/listings/l2.png'),
  'a0000000-0000-4000-8000-000000000003': require('../../../../assets/listings/l3.png'),
  'a0000000-0000-4000-8000-000000000004': require('../../../../assets/listings/l4.png'),
  'a0000000-0000-4000-8000-000000000005': require('../../../../assets/listings/l5.png'),
  'a0000000-0000-4000-8000-000000000006': require('../../../../assets/listings/l6.png'),
};

const PLACEHOLDER = require('../../../../assets/listings/l1.png');

export type ListingImageSource = number | { uri: string };

export function resolveListingImage(
  listingId: string,
  imageUrl: string | null,
  mediaUrls?: readonly string[] | null
): ListingImageSource {
  const firstRemote = mediaUrls?.[0] ?? imageUrl;
  if (firstRemote) return { uri: firstRemote };
  return DEMO_IMAGE_MAP[listingId] ?? PLACEHOLDER;
}

/** Returns only photos that belong to this listing — never mixed across cards. */
export function resolveListingImages(
  listingId: string,
  imageUrl: string | null,
  mediaUrls?: readonly string[] | null
): ListingImageSource[] {
  const remoteUrls: string[] = [];

  if (mediaUrls?.length) {
    for (const url of mediaUrls) {
      if (url && !remoteUrls.includes(url)) remoteUrls.push(url);
    }
  } else if (imageUrl) {
    remoteUrls.push(imageUrl);
  }

  if (remoteUrls.length > 0) {
    return remoteUrls.map((uri) => ({ uri }));
  }

  const demoImage = DEMO_IMAGE_MAP[listingId] ?? PLACEHOLDER;
  return [demoImage];
}
