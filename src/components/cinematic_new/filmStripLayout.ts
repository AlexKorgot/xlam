export type FilmStripLayoutConfig = {
  centerWidthRatio: number;
  centerMaxWidthRatio: number;
  centerAspect: number;
  maxHeightRatio: number;
  tallDesktopMinHeight?: {
    minViewportHeight: number;
    height: number;
    maxHeightRatio: number;
  };
  gap: {
    min: number;
    max: number;
    ratio: number;
  };
  sideVisibleRatio: number;
  sideScale: number;
  sideRotationY: number;
  bend: {
    center: number;
    side: number;
    buffer: number;
  };
  edgeCurve: {
    center: number;
    side: number;
    buffer: number;
  };
  hiddenOffset: number;
};

export type FilmStripFrameMetrics = {
  config: FilmStripLayoutConfig;
  centerWidth: number;
  centerHeight: number;
  gap: number;
  sideVisibleWidth: number;
  sideWidth: number;
  sideHeight: number;
};

export type FilmStripChromeLayout = FilmStripFrameMetrics & {
  isMobile: boolean;
  isCompactLandscape: boolean;
  bandY: number;
  bandTop: number;
  bandBottom: number;
  headingTop: number;
  bottomChromeTop: number;
  bottomChromeGap: number;
};

export const FILM_STRIP_MOBILE_BREAKPOINT = 1000;

export const DESKTOP_FILM_STRIP_LAYOUT: FilmStripLayoutConfig = {
  centerWidthRatio: 0.78,
  centerMaxWidthRatio: 0.82,
  centerAspect: 16 / 6.4,
  maxHeightRatio: 0.54,
  tallDesktopMinHeight: {
    minViewportHeight: 960,
    height: 650,
    maxHeightRatio: 0.64,
  },
  gap: {
    min: 20,
    max: 70,
    ratio: 0.026,
  },
  sideVisibleRatio: 0.34,
  sideScale: 1.02,
  sideRotationY: 0.055,
  bend: {
    center: 56,
    side: 62,
    buffer: 68,
  },
  edgeCurve: {
    center: 14,
    side: 18,
    buffer: 22,
  },
  hiddenOffset: 2.5,
};

export const MOBILE_FILM_STRIP_LAYOUT: FilmStripLayoutConfig = {
  centerWidthRatio: 0.9,
  centerMaxWidthRatio: 0.92,
  centerAspect: 9 / 15.2,
  maxHeightRatio: 0.7,
  gap: {
    min: 12,
    max: 24,
    ratio: 0.035,
  },
  sideVisibleRatio: 0.28,
  sideScale: 1,
  sideRotationY: 0.04,
  bend: {
    center: 42,
    side: 52,
    buffer: 58,
  },
  edgeCurve: {
    center: 10,
    side: 14,
    buffer: 16,
  },
  hiddenOffset: 2.5,
};

export const COMPACT_LANDSCAPE_FILM_STRIP_LAYOUT: FilmStripLayoutConfig = {
  centerWidthRatio: 0.78,
  centerMaxWidthRatio: 0.84,
  centerAspect: 16 / 7.6,
  maxHeightRatio: 0.58,
  gap: {
    min: 14,
    max: 32,
    ratio: 0.032,
  },
  sideVisibleRatio: 0.3,
  sideScale: 1,
  sideRotationY: 0.045,
  bend: {
    center: 44,
    side: 54,
    buffer: 60,
  },
  edgeCurve: {
    center: 10,
    side: 14,
    buffer: 16,
  },
  hiddenOffset: 2.5,
};

export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export function isFilmStripMobileViewport(width: number) {
  return width < FILM_STRIP_MOBILE_BREAKPOINT;
}

export function isFilmStripCompactLandscapeViewport(width: number, height: number) {
  return isFilmStripMobileViewport(width) && width > height;
}

export function getFilmStripLayoutConfig(width: number, height: number) {
  if (!isFilmStripMobileViewport(width)) {
    return DESKTOP_FILM_STRIP_LAYOUT;
  }

  return isFilmStripCompactLandscapeViewport(width, height)
    ? COMPACT_LANDSCAPE_FILM_STRIP_LAYOUT
    : MOBILE_FILM_STRIP_LAYOUT;
}

export function getFilmStripBandY(width: number, height: number) {
  if (!isFilmStripMobileViewport(width)) {
    return 10;
  }

  return isFilmStripCompactLandscapeViewport(width, height) ? 4 : -6;
}

export function getFilmStripFrameMetrics(width: number, height: number): FilmStripFrameMetrics {
  const config = getFilmStripLayoutConfig(width, height);
  const desiredCenterWidth = width * config.centerWidthRatio;
  const maxCenterWidth = width * config.centerMaxWidthRatio;
  const maxCenterHeight = height * config.maxHeightRatio;
  const centerWidthByRatio = Math.min(desiredCenterWidth, maxCenterWidth);
  const centerHeightByRatio = centerWidthByRatio / config.centerAspect;
  let centerHeight = Math.min(centerHeightByRatio, maxCenterHeight);

  if (config.tallDesktopMinHeight && height >= config.tallDesktopMinHeight.minViewportHeight) {
    const tallHeight = Math.min(
      config.tallDesktopMinHeight.height,
      height * config.tallDesktopMinHeight.maxHeightRatio,
      centerHeightByRatio,
    );

    centerHeight = Math.max(centerHeight, tallHeight);
  }

  const centerWidth =
    centerHeight < centerHeightByRatio ? centerHeight * config.centerAspect : centerWidthByRatio;
  const gap = clamp(width * config.gap.ratio, config.gap.min, config.gap.max);
  const visibleSpaceBesideCenter = Math.max(width / 2 - centerWidth / 2 - gap, 1);
  const sideVisibleWidth = visibleSpaceBesideCenter;
  const sideWidth = centerWidth;
  const sideHeight = centerHeight;

  return {
    config,
    centerWidth,
    centerHeight,
    gap,
    sideVisibleWidth,
    sideWidth,
    sideHeight,
  };
}

export function getFilmStripChromeLayout(width: number, height: number): FilmStripChromeLayout {
  const metrics = getFilmStripFrameMetrics(width, height);
  const isMobile = isFilmStripMobileViewport(width);
  const isCompactLandscape = isFilmStripCompactLandscapeViewport(width, height);
  const bandY = getFilmStripBandY(width, height);
  const bandCenterY = height / 2 - bandY;
  const bandTop = bandCenterY - metrics.centerHeight / 2;
  const bandBottom = bandCenterY + metrics.centerHeight / 2;
  const mobileBottomGap = clamp(height * (isCompactLandscape ? 0.026 : 0.018), 12, 24);
  const mobileBottomChromeGap = clamp(height * (isCompactLandscape ? 0.024 : 0.02), 14, 22);
  const mobileBottomChromeHeight = isCompactLandscape ? 96 : 112;
  const desktopBottomGap = clamp(height * 0.035, 24, 58);
  const desktopBottomChromeGap = clamp(height * 0.026, 20, 30);
  const desktopBottomChromeHeight = 122;
  const bottomChromeHeight = isMobile ? mobileBottomChromeHeight : desktopBottomChromeHeight;
  const bottomGap = isMobile ? mobileBottomGap : desktopBottomGap;
  const bottomChromeTop = Math.min(
    bandBottom + bottomGap,
    height - bottomChromeHeight - clamp(height * 0.018, 14, 28),
  );

  return {
    ...metrics,
    isMobile,
    isCompactLandscape,
    bandY,
    bandTop,
    bandBottom,
    headingTop: bandTop,
    bottomChromeTop,
    bottomChromeGap: isMobile ? mobileBottomChromeGap : desktopBottomChromeGap,
  };
}
