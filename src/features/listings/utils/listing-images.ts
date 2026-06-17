const DEMO_IMAGE_MAP: Record<string, number> = {
  'a0000000-0000-4000-8000-000000000001': require('../../../../assets/listings/l1.png'),
  'a0000000-0000-4000-8000-000000000002': require('../../../../assets/listings/l2.png'),
  'a0000000-0000-4000-8000-000000000003': require('../../../../assets/listings/l3.png'),
  'a0000000-0000-4000-8000-000000000004': require('../../../../assets/listings/l4.png'),
  'a0000000-0000-4000-8000-000000000005': require('../../../../assets/listings/l5.png'),
  'a0000000-0000-4000-8000-000000000006': require('../../../../assets/listings/l6.png'),
};

const PLACEHOLDER = require('../../../../assets/listings/l1.png');

export function resolveListingImage(
  listingId: string,
  imageUrl: string | null
): number | { uri: string } {
  if (imageUrl) return { uri: imageUrl };
  return DEMO_IMAGE_MAP[listingId] ?? PLACEHOLDER;
}
