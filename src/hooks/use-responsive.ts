import { useScreenDimensions } from '@/src/design-system/responsive';

export {
  REFERENCE_WIDTH,
  SMALL_SCREEN_BREAKPOINT,
  getContentWidth,
  getEffectiveWidth,
  getHorizontalPadding,
  getListingCardWidth,
  getScooterCardWidth,
  getTabBarBottomPadding,
  getTabBarHeight,
  getTabBarStyle,
  isSmallScreen,
  moderateScale,
  scale,
  wp,
} from '@/src/design-system/responsive';

/** Responsive layout dimensions, scaling helpers, and safe-area offsets. */
export function useResponsive() {
  return useScreenDimensions();
}
