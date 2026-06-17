import { useMemo } from 'react';
import { Platform, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { spacing } from './tokens';

/** Design reference width (common mobile baseline). */
export const REFERENCE_WIDTH = 390;
/** iPhone SE and similar narrow layouts. */
export const SMALL_SCREEN_BREAKPOINT = 380;
const MIN_SCALE = 320 / REFERENCE_WIDTH;
const MAX_SCALE = 428 / REFERENCE_WIDTH;

export const GRID_COLUMNS = 2;
export const GRID_GAP = spacing.md;

/**
 * Resolve the layout width used for cards and padding.
 * On mobile web, visualViewport is more reliable than the layout viewport
 * when the viewport meta tag is missing or applied late.
 */
export function getEffectiveWidth(width: number): number {
  if (width <= 0) return REFERENCE_WIDTH;

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const visualWidth = window.visualViewport?.width;
    if (visualWidth != null && visualWidth > 0) {
      return Math.round(visualWidth);
    }

    const clientWidth = document.documentElement.clientWidth;
    if (clientWidth > 0 && clientWidth < width) {
      return clientWidth;
    }
  }

  return width;
}

function clampScale(width: number): number {
  const ratio = width / REFERENCE_WIDTH;
  return Math.min(Math.max(ratio, MIN_SCALE), MAX_SCALE);
}

/** Linear scale for layout dimensions (cards, spacing). */
export function scale(size: number, width: number): number {
  return Math.round(size * clampScale(width));
}

/** Width as a percentage of the screen (0–100). */
export function wp(percent: number, width: number): number {
  return Math.round((width * percent) / 100);
}

export function isSmallScreen(width: number): boolean {
  return width < SMALL_SCREEN_BREAKPOINT;
}

/** Moderate scale for typography — avoids over-shrinking on small screens. */
export function moderateScale(size: number, width: number, factor = 0.35): number {
  const ratio = clampScale(width);
  return Math.round(size + (size * (ratio - 1)) * factor);
}

export function getHorizontalPadding(width: number): number {
  return scale(spacing.md, width);
}

export function getContentWidth(width: number): number {
  const padding = getHorizontalPadding(width);
  return width - padding * 2;
}

export function getListingCardWidth(screenWidth: number): number {
  const padding = getHorizontalPadding(screenWidth);
  return (screenWidth - padding * 2 - GRID_GAP) / GRID_COLUMNS;
}

export function getScooterCardWidth(screenWidth: number): number {
  const contentWidth = getContentWidth(screenWidth);
  return Math.min(180, Math.round(contentWidth * 0.48));
}

/** Vertical space for icon + label inside the tab bar (excludes outer padding). */
const TAB_BAR_CONTENT_HEIGHT = 40;
const TAB_BAR_TOP_PADDING = 6;

/** Bottom padding below tab labels — uses safe area or a platform minimum. */
export function getTabBarBottomPadding(bottomInset: number): number {
  if (bottomInset > 0) return bottomInset;
  if (Platform.OS === 'web') return 12;
  if (Platform.OS === 'android') return 8;
  return 0;
}

/** Total tab bar height — keep in sync with `app/(tabs)/_layout.tsx` tabBarStyle. */
export function getTabBarHeight(bottomInset: number): number {
  return TAB_BAR_TOP_PADDING + TAB_BAR_CONTENT_HEIGHT + getTabBarBottomPadding(bottomInset);
}

export function getTabBarStyle(bottomInset: number) {
  const paddingBottom = getTabBarBottomPadding(bottomInset);
  return {
    height: TAB_BAR_TOP_PADDING + TAB_BAR_CONTENT_HEIGHT + paddingBottom,
    paddingTop: TAB_BAR_TOP_PADDING,
    paddingBottom,
  };
}

export function useScreenDimensions() {
  const { width: windowWidth, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  return useMemo(() => {
    const width = getEffectiveWidth(windowWidth);
    const horizontalPadding = getHorizontalPadding(width);
    const contentWidth = getContentWidth(width);
    const cardWidth = getListingCardWidth(width);
    const scooterCardWidth = getScooterCardWidth(width);
    const tabBarHeight = getTabBarHeight(insets.bottom);
    const scaleByWidth = (size: number) => scale(size, width);
    const moderateScaleByWidth = (size: number, factor?: number) =>
      moderateScale(size, width, factor);

    const wpByWidth = (percent: number) => wp(percent, width);

    return {
      width,
      screenWidth: width,
      windowWidth,
      height,
      screenHeight: height,
      insets,
      horizontalPadding,
      contentWidth,
      cardWidth,
      scooterCardWidth,
      tabBarHeight,
      isSmallScreen: isSmallScreen(width),
      scale: scaleByWidth,
      moderateScale: moderateScaleByWidth,
      wp: wpByWidth,
      screenHeaderPaddingTop: insets.top + scale(12, width),
      listBottomPadding: tabBarHeight + scale(72, width),
      fabBottom: tabBarHeight + scale(8, width),
    };
  }, [windowWidth, height, insets]);
}
