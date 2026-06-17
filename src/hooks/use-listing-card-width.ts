import { useScreenDimensions } from '@/src/design-system/responsive';

/** Two-column listing grid width with responsive side padding and gutter. */
export function useListingCardWidth(): number {
  return useScreenDimensions().cardWidth;
}
