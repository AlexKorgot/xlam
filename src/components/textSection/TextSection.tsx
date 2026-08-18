'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import FullPageSection from '@/src/components/ui/FullPageSection';
import {
  FULLPAGE_SCROLL_EVENT,
  FULLPAGE_SCROLL_IGNORE_ATTR,
  FULLPAGE_TOUCH_AXIS_LOCK_RATIO,
  FULLPAGE_TOUCH_SWIPE_THRESHOLD,
  getFullPageSwipeDirection,
} from '@/src/components/ui/FullPageScroll';
import { publicAssetPath } from '@/src/lib/publicAssetPath';

type ResponsiveImageAsset = {
  src: string;
  srcSet: string;
  sizes: string;
  width: number;
  height: number;
  sources?: ReadonlyArray<ResponsiveImageSource>;
};

type ResponsiveImageSource = {
  media: string;
  srcSet: string;
  sizes: string;
};

type ResponsiveImageVariant = readonly [number, `/${string}`];

const compactPortraitMedia = '(orientation: portrait) and (max-width: 399px)';
const tallPortraitMedia =
  '(orientation: portrait) and (min-width: 400px) and (max-width: 639px)';
const mobilePortraitMedia = '(orientation: portrait) and (max-width: 639px)';

const artworkImageSizes = [
  '(max-width: 399px) 1280px',
  '(max-width: 639px) 1920px',
  '(max-width: 1023px) 960px',
  '(max-width: 1279px) 1280px',
  '(max-width: 1535px) 1600px',
  '1920px',
].join(', ');

function responsiveImageAsset(
  variants: ReadonlyArray<ResponsiveImageVariant>,
  width: number,
  height: number,
  sizes: string,
  sources?: ReadonlyArray<ResponsiveImageSource>,
): ResponsiveImageAsset {
  const fallback = variants[variants.length - 1];

  if (!fallback) {
    throw new Error('A responsive image requires at least one source');
  }

  return {
    src: publicAssetPath(fallback[1]),
    srcSet: variants
      .map(([variantWidth, path]) => `${publicAssetPath(path)} ${variantWidth}w`)
      .join(', '),
    sizes,
    width,
    height,
    sources,
  };
}

function responsiveImageSource(
  media: string,
  variants: ReadonlyArray<ResponsiveImageVariant>,
): ResponsiveImageSource {
  return {
    media,
    srcSet: variants
      .map(([variantWidth, path]) => `${publicAssetPath(path)} ${variantWidth}w`)
      .join(', '),
    sizes: '100vw',
  };
}

function mobilePortraitSources(
  compactVariants: ReadonlyArray<ResponsiveImageVariant>,
  tallVariants: ReadonlyArray<ResponsiveImageVariant>,
) {
  return [
    responsiveImageSource(compactPortraitMedia, compactVariants),
    responsiveImageSource(tallPortraitMedia, tallVariants),
  ];
}

const GeneralBackground = responsiveImageAsset(
  [
    [640, '/text-section/general-bg-640.1a4a8308.webp'],
    [1280, '/text-section/general-bg-1280.e76b5076.webp'],
    [1920, '/text-section/general-bg-1920.3b819715.webp'],
  ],
  1920,
  1080,
  '110vw',
  [
    responsiveImageSource(mobilePortraitMedia, [
      [499, '/text-section/general-bg-portrait-499w.webp'],
    ]),
  ],
);
const BlueTop = responsiveImageAsset(
  [
    [960, '/text-section/blue-top-960.c74bd856.webp'],
    [1280, '/text-section/blue-top-1280.8e3bf504.webp'],
    [1600, '/text-section/blue-top-1600.de3cc32e.webp'],
    [1920, '/text-section/blue-top-1920.d16430d7.webp'],
  ],
  1920,
  890,
  artworkImageSizes,
  mobilePortraitSources(
    [
      [390, '/text-section/blue-top-portrait-compact-390w.webp'],
      [723, '/text-section/blue-top-portrait-compact-723w.webp'],
    ],
    [[491, '/text-section/blue-top-portrait-tall-491w.webp']],
  ),
);
const BlueBottom = responsiveImageAsset(
  [
    [960, '/text-section/blue-bottom-960.d420c908.webp'],
    [1280, '/text-section/blue-bottom-1280.2950fd7c.webp'],
    [1600, '/text-section/blue-bottom-1600.17e19a54.webp'],
    [1920, '/text-section/blue-bottom-1920.a044f322.webp'],
  ],
  1920,
  730,
  artworkImageSizes,
  mobilePortraitSources(
    [
      [390, '/text-section/blue-bottom-portrait-compact-390w.webp'],
      [647, '/text-section/blue-bottom-portrait-compact-647w.webp'],
    ],
    [[402, '/text-section/blue-bottom-portrait-tall-402w.webp']],
  ),
);
const GreenTop = responsiveImageAsset(
  [
    [960, '/text-section/green-top-960.b93e5c76.webp'],
    [1280, '/text-section/green-top-1280.463c12a9.webp'],
    [1600, '/text-section/green-top-1600.ec6fe53f.webp'],
    [1920, '/text-section/green-top-1920.5d249b36.webp'],
  ],
  1920,
  970,
  artworkImageSizes,
  mobilePortraitSources(
    [
      [390, '/text-section/green-top-portrait-compact-390w.webp'],
      [756, '/text-section/green-top-portrait-compact-756w.webp'],
    ],
    [[472, '/text-section/green-top-portrait-tall-472w.webp']],
  ),
);
const GreenBottom = responsiveImageAsset(
  [
    [960, '/text-section/green-bottom-960.aa0b47e1.webp'],
    [1280, '/text-section/green-bottom-1280.10eea08d.webp'],
    [1600, '/text-section/green-bottom-1600.c7a7d31c.webp'],
    [1920, '/text-section/green-bottom-1920.a89bb186.webp'],
  ],
  1920,
  840,
  artworkImageSizes,
  mobilePortraitSources(
    [
      [390, '/text-section/green-bottom-portrait-compact-390w.webp'],
      [655, '/text-section/green-bottom-portrait-compact-655w.webp'],
    ],
    [[409, '/text-section/green-bottom-portrait-tall-409w.webp']],
  ),
);
const GrayTop = responsiveImageAsset(
  [
    [960, '/text-section/gray-top-960.3edc0f39.webp'],
    [1280, '/text-section/gray-top-1280.22956276.webp'],
    [1600, '/text-section/gray-top-1600.72a616d5.webp'],
    [1920, '/text-section/gray-top-1920.98abfdff.webp'],
  ],
  1920,
  930,
  artworkImageSizes,
  mobilePortraitSources(
    [
      [390, '/text-section/gray-top-portrait-compact-390w.webp'],
      [788, '/text-section/gray-top-portrait-compact-788w.webp'],
    ],
    [[513, '/text-section/gray-top-portrait-tall-513w.webp']],
  ),
);
const GrayBottom = responsiveImageAsset(
  [
    [960, '/text-section/gray-bottom-960.99be0117.webp'],
    [1280, '/text-section/gray-bottom-1280.77c44961.webp'],
    [1600, '/text-section/gray-bottom-1600.ad260154.webp'],
    [1920, '/text-section/gray-bottom-1920.1fd9ac97.webp'],
  ],
  1920,
  820,
  artworkImageSizes,
  mobilePortraitSources(
    [
      [390, '/text-section/gray-bottom-portrait-compact-390w.webp'],
      [666, '/text-section/gray-bottom-portrait-compact-666w.webp'],
    ],
    [[399, '/text-section/gray-bottom-portrait-tall-399w.webp']],
  ),
);

type TextSlide = {
  id: string;
  lines: string[];
  topImage: ResponsiveImageAsset;
  bottomImage: ResponsiveImageAsset;
  imagePosition?: TextSlideImagePositionConfig;
};

type TextSlideImagePosition = {
  top: string;
  bottom: string;
  topHeight: string;
  bottomHeight: string;
};

type TextSlideImagePositionBreakpoint =
  | 'base'
  | 'xs'
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | '2xl'
  | '3xl'
  | '4xl'
  | '5xl'
  | '6xl';

type ResponsivePositionValue = string | Partial<Record<TextSlideImagePositionBreakpoint, string>>;

type TextSlideImagePositionConfig = Partial<{
  top: ResponsivePositionValue;
  bottom: ResponsivePositionValue;
  topHeight: ResponsivePositionValue;
  bottomHeight: ResponsivePositionValue;
}>;

interface TextSectionProps {
  intervalMs?: number;
  isActive?: boolean;
}

interface ResponsiveImageProps {
  asset: ResponsiveImageAsset;
  className: string;
}

function ResponsiveImage({ asset, className }: ResponsiveImageProps) {
  return (
    <picture className="contents">
      {asset.sources?.map((source) => (
        <source
          key={source.media}
          type="image/webp"
          media={source.media}
          srcSet={source.srcSet}
          sizes={source.sizes}
        />
      ))}
      <img
        src={asset.src}
        srcSet={asset.srcSet}
        sizes={asset.sizes}
        width={asset.width}
        height={asset.height}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        className={className}
      />
    </picture>
  );
}

function preloadResponsiveImage(asset: ResponsiveImageAsset) {
  const matchingSource = asset.sources?.find((source) =>
    window.matchMedia(source.media).matches,
  );
  const image = new Image();

  image.decoding = 'async';
  image.fetchPriority = 'low';
  image.sizes = matchingSource?.sizes ?? asset.sizes;
  image.srcset = matchingSource?.srcSet ?? asset.srcSet;
  image.src = asset.src;

  return image.decode().catch(() => undefined);
}

const scrollIgnoreAttr = { [FULLPAGE_SCROLL_IGNORE_ATTR]: 'true' } as const;
const slideWheelThreshold = 48;
const slideInputUnlockDelay = 700;
const imagePositionBreakpoints: Array<{
  key: Exclude<TextSlideImagePositionBreakpoint, 'base'>;
  minWidth: number;
}> = [
  { key: 'xs', minWidth:  400 },
  { key: 'sm', minWidth: 640 },
  { key: 'md', minWidth: 768 },
  { key: 'lg', minWidth: 1024 },
  { key: 'xl', minWidth: 1280 },
  { key: '2xl', minWidth: 1536 },
  { key: '3xl', minWidth: 1920 },
  { key: '4xl', minWidth: 2240 },
  { key: '5xl', minWidth: 2560 },
  { key: '6xl', minWidth: 3000 },
];
const defaultImagePosition: TextSlideImagePosition = {
  top: '0',
  bottom: '0',
  topHeight: 'clamp(320px, 46.35vw, 890px)',
  bottomHeight: 'clamp(260px, 38.02vw, 730px)',
};

const baseSlides: TextSlide[] = [
  {
    id: 'smooth',
    lines: ['В идеальном мире все гладко,', 'но гладкое', 'не запоминается'],
    topImage: BlueTop,
    bottomImage: BlueBottom,
    imagePosition: {
      top: {
        base: defaultImagePosition.top,
        xs: '0',
        sm: '0',
        md: '0',
        lg: '0',
        xl: '0',
        '2xl': '0',
        '3xl': '0',
      },
      bottom: {
        base: defaultImagePosition.bottom,
        xs: '0',
        sm: '0',
        md: '0',
        lg: '0',
        xl: '0',
        '2xl': '0',
        '3xl': '0',
      },
      topHeight: {
        base: '480px',
        xs: '750px',
        sm: '360px',
        md: '420px',
        lg: '520px',
        xl: '590px',
        '2xl': '710px',
        '3xl': 'max(80dvh, 40vw)',
      },
      bottomHeight: {
        base: '440px',
        xs: '750px',
        sm: '300px',
        md: '350px',
        lg: '430px',
        xl: '490px',
        '2xl': '585px',
        '3xl': 'max(60dvh, 29vw)',
      },
    },
  },
  {
    id: 'noise',
    lines: ['Не','Работаем по правилам','индустрии', '- мы пишем новые'],
    topImage: GreenTop,
    bottomImage: GreenBottom,
    imagePosition: {
      top: {
        base: defaultImagePosition.top,
        sm: '0',
        md: '0',
        lg: '0',
        xl: '0',
        '2xl': '0',
        '3xl': '0',
      },
      bottom: {
        base: defaultImagePosition.bottom,
        sm: '0',
        md: '0',
        lg: '0',
        xl: '0',
        '2xl': '0',
        '3xl': '0',
      },
      topHeight: {
        base: '500px',
        xs: '850px',
        sm: '360px',
        md: '420px',
        lg: '520px',
        xl: '590px',
        '2xl': '710px',
        '3xl': 'max(82dvh, 41vw)',
      },
      bottomHeight: {
        base: '500px',
        xs: '850px',
        sm: '300px',
        md: '350px',
        lg: '500px',
        xl: '590px',
        '2xl': '680px',
        '3xl': 'max(77dvh, 39vw)',
      },
    },
  },
  {
    id: 'idea',
    lines: ['Если ваш бренд готов', 'Перестать быть аккуратным', 'и стать настоящим'],
    topImage: GrayTop,
    bottomImage: GrayBottom,
    imagePosition: {
      top: {
        base: defaultImagePosition.top,
        sm: '0',
        md: '0',
        lg: '0',
        xl: '0',
        '2xl': '0',
        '3xl': '0',
      },
      bottom: {
        base: defaultImagePosition.bottom,
        sm: '0',
        md: '0',
        lg: '0',
        xl: '0',
        '2xl': '0',
        '3xl': '0',
      },
      topHeight: {
        base: '460px',
        xs: '750px',
        sm: '360px',
        md: '420px',
        lg: '520px',
        xl: '590px',
        '2xl': '710px',
        '3xl': 'max(83dvh, 42vw)',
      },
      bottomHeight: {
        base: '480px',
        xs: '850px',
        sm: '300px',
        md: '350px',
        lg: '430px',
        xl: '490px',
        '2xl': '585px',
        '3xl': 'max(65dvh, 32vw)',
      },
    },
  },
];

const ideaSlide = baseSlides[baseSlides.length - 1];
const slides: TextSlide[] = [
  ...baseSlides,
  {
    ...ideaSlide,
    id: 'welcome',
    lines: ['Welcome'],
  },
];

const getActiveImagePositionBreakpoint = (): TextSlideImagePositionBreakpoint => {
  if (typeof window === 'undefined') {
    return 'base';
  }

  for (let index = imagePositionBreakpoints.length - 1; index >= 0; index -= 1) {
    const breakpoint = imagePositionBreakpoints[index];

    if (window.matchMedia(`(min-width: ${breakpoint.minWidth}px)`).matches) {
      return breakpoint.key;
    }
  }

  return 'base';
};

const resolveResponsivePositionValue = (
  value: ResponsivePositionValue | undefined,
  fallback: string,
  activeBreakpoint: TextSlideImagePositionBreakpoint,
) => {
  if (!value) {
    return fallback;
  }

  if (typeof value === 'string') {
    return value;
  }

  const activeBreakpointIndex =
    activeBreakpoint === 'base'
      ? -1
      : imagePositionBreakpoints.findIndex(
          (breakpoint) => breakpoint.key === activeBreakpoint,
        );

  for (let index = activeBreakpointIndex; index >= 0; index -= 1) {
    const breakpointValue = value[imagePositionBreakpoints[index].key];

    if (breakpointValue) {
      return breakpointValue;
    }
  }

  return value.base ?? fallback;
};

const resolveImagePosition = (
  config: TextSlideImagePositionConfig | undefined,
  activeBreakpoint: TextSlideImagePositionBreakpoint,
): TextSlideImagePosition => ({
  top: resolveResponsivePositionValue(
    config?.top,
    defaultImagePosition.top,
    activeBreakpoint,
  ),
  bottom: resolveResponsivePositionValue(
    config?.bottom,
    defaultImagePosition.bottom,
    activeBreakpoint,
  ),
  topHeight: resolveResponsivePositionValue(
    config?.topHeight,
    defaultImagePosition.topHeight,
    activeBreakpoint,
  ),
  bottomHeight: resolveResponsivePositionValue(
    config?.bottomHeight,
    defaultImagePosition.bottomHeight,
    activeBreakpoint,
  ),
});

export function TextSection({ intervalMs = 5000, isActive = false }: TextSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const activeTextRef = useRef<HTMLHeadingElement>(null);
  const activeTopRef = useRef<HTMLDivElement>(null);
  const activeBottomRef = useRef<HTMLDivElement>(null);
  const incomingTextRef = useRef<HTMLHeadingElement>(null);
  const incomingTopRef = useRef<HTMLDivElement>(null);
  const incomingBottomRef = useRef<HTMLDivElement>(null);
  const backgroundXToRef = useRef<((value: number) => void) | null>(null);
  const backgroundYToRef = useRef<((value: number) => void) | null>(null);
  const activeIndexRef = useRef(0);
  const incomingIndexRef = useRef<number | null>(null);
  const wheelDirectionRef = useRef<'up' | 'down' | null>(null);
  const wheelDeltaRef = useRef(0);
  const inputLockRef = useRef(false);
  const inputUnlockTimeoutRef = useRef<number | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const preloadedSlideIdsRef = useRef(new Set<string>());
  const [activeIndex, setActiveIndex] = useState(0);
  const [incomingIndex, setIncomingIndex] = useState<number | null>(null);
  const [activeImagePositionBreakpoint, setActiveImagePositionBreakpoint] =
    useState<TextSlideImagePositionBreakpoint>('base');

  const activeSlide = slides[activeIndex];
  const incomingSlide = incomingIndex === null ? null : slides[incomingIndex];

  useEffect(() => {
    const updateActiveBreakpoint = () => {
      setActiveImagePositionBreakpoint(getActiveImagePositionBreakpoint());
    };

    updateActiveBreakpoint();

    const mediaQueries = imagePositionBreakpoints.map((breakpoint) =>
      window.matchMedia(`(min-width: ${breakpoint.minWidth}px)`),
    );

    mediaQueries.forEach((mediaQuery) => {
      mediaQuery.addEventListener('change', updateActiveBreakpoint);
    });

    return () => {
      mediaQueries.forEach((mediaQuery) => {
        mediaQuery.removeEventListener('change', updateActiveBreakpoint);
      });
    };
  }, []);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    incomingIndexRef.current = incomingIndex;
  }, [incomingIndex]);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    const currentSlide = slides[activeIndex];
    const nextSlide = slides[activeIndex + 1];

    if (!nextSlide || preloadedSlideIdsRef.current.has(nextSlide.id)) {
      return;
    }

    preloadedSlideIdsRef.current.add(nextSlide.id);

    const reusesCurrentArtwork =
      nextSlide.topImage === currentSlide.topImage &&
      nextSlide.bottomImage === currentSlide.bottomImage;

    if (reusesCurrentArtwork) {
      return;
    }

    void Promise.all([
      preloadResponsiveImage(nextSlide.topImage),
      preloadResponsiveImage(nextSlide.bottomImage),
    ]);
  }, [activeIndex, isActive]);

  const requestParentSectionScroll = useCallback((direction: 'up' | 'down') => {
    window.dispatchEvent(
      new CustomEvent(FULLPAGE_SCROLL_EVENT, {
        detail: { direction },
      }),
    );
  }, []);

  const requestSlideDirection = useCallback(
    (direction: 'up' | 'down') => {
      if (incomingIndexRef.current !== null) {
        return;
      }

      const currentIndex = activeIndexRef.current;
      const nextIndex = direction === 'down' ? currentIndex + 1 : currentIndex - 1;

      if (nextIndex < 0 || nextIndex >= slides.length) {
        requestParentSectionScroll(direction);
        return;
      }

      setIncomingIndex(nextIndex);
    },
    [requestParentSectionScroll],
  );

  useEffect(() => {
    const sectionNode = sectionRef.current;

    if (!sectionNode) {
      return;
    }

    const resetWheelInput = () => {
      wheelDirectionRef.current = null;
      wheelDeltaRef.current = 0;
    };

    const unlockInput = () => {
      inputLockRef.current = false;
    };

    const queueInputUnlock = () => {
      if (inputUnlockTimeoutRef.current) {
        window.clearTimeout(inputUnlockTimeoutRef.current);
      }

      inputUnlockTimeoutRef.current = window.setTimeout(() => {
        unlockInput();
      }, slideInputUnlockDelay);
    };

    const handleWheel = (event: WheelEvent) => {
      const dominantDelta =
        Math.abs(event.deltaY) >= Math.abs(event.deltaX)
          ? event.deltaY
          : 0;

      if (Math.abs(dominantDelta) < 4) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const direction = dominantDelta > 0 ? 'down' : 'up';

      if (inputLockRef.current) {
        return;
      }

      if (wheelDirectionRef.current !== direction) {
        wheelDeltaRef.current = 0;
      }

      wheelDirectionRef.current = direction;
      wheelDeltaRef.current += Math.abs(dominantDelta);

      if (wheelDeltaRef.current < slideWheelThreshold) {
        return;
      }

      inputLockRef.current = true;
      resetWheelInput();
      queueInputUnlock();
      requestSlideDirection(direction);
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (event.pointerType !== 'touch') {
        return;
      }

      touchStartRef.current = { x: event.clientX, y: event.clientY };
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (event.pointerType !== 'touch') {
        return;
      }

      const start = touchStartRef.current;
      touchStartRef.current = null;

      if (!start || inputLockRef.current) {
        return;
      }

      const deltaX = event.clientX - start.x;
      const deltaY = event.clientY - start.y;
      const isVerticalSwipe =
        Math.abs(deltaY) > FULLPAGE_TOUCH_SWIPE_THRESHOLD &&
        Math.abs(deltaY) > Math.abs(deltaX) * FULLPAGE_TOUCH_AXIS_LOCK_RATIO;

      if (!isVerticalSwipe) {
        return;
      }

      inputLockRef.current = true;
      queueInputUnlock();
      requestSlideDirection(getFullPageSwipeDirection(deltaY));
    };

    const handlePointerCancel = () => {
      touchStartRef.current = null;
    };

    sectionNode.addEventListener('wheel', handleWheel, { passive: false });
    sectionNode.addEventListener('pointerdown', handlePointerDown);
    sectionNode.addEventListener('pointerup', handlePointerUp);
    sectionNode.addEventListener('pointercancel', handlePointerCancel);

    return () => {
      sectionNode.removeEventListener('wheel', handleWheel);
      sectionNode.removeEventListener('pointerdown', handlePointerDown);
      sectionNode.removeEventListener('pointerup', handlePointerUp);
      sectionNode.removeEventListener('pointercancel', handlePointerCancel);

      if (inputUnlockTimeoutRef.current) {
        window.clearTimeout(inputUnlockTimeoutRef.current);
        inputUnlockTimeoutRef.current = null;
      }

      touchStartRef.current = null;
      unlockInput();
      resetWheelInput();
    };
  }, [requestSlideDirection]);

  useEffect(() => {
    if (slides.length < 2 || intervalMs <= 0) {
      return;
    }

    const timerId = window.setInterval(() => {
      if (incomingIndexRef.current !== null) {
        return;
      }

      setIncomingIndex((activeIndexRef.current + 1) % slides.length);
    }, intervalMs);

    return () => {
      window.clearInterval(timerId);
    };
  }, [intervalMs]);

  const getBackgroundParallaxTween = (
    axis: 'x' | 'y',
    targetRef: typeof backgroundXToRef,
  ) => {
    if (!targetRef.current && backgroundRef.current) {
      targetRef.current = gsap.quickTo(backgroundRef.current, axis, {
        duration: 0.7,
        ease: 'power3.out',
      });
    }

    return targetRef.current;
  };

  const handleBackgroundPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (!sectionRef.current) {
      return;
    }

    const rect = sectionRef.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    getBackgroundParallaxTween('x', backgroundXToRef)?.(x * 42);
    getBackgroundParallaxTween('y', backgroundYToRef)?.(y * 32);
  };

  const resetBackgroundParallax = () => {
    getBackgroundParallaxTween('x', backgroundXToRef)?.(0);
    getBackgroundParallaxTween('y', backgroundYToRef)?.(0);
  };

  useGSAP(
    () => {
      if (incomingIndex === null || !incomingSlide) {
        return;
      }

      const activeNodes = [
        activeTextRef.current,
        activeTopRef.current,
        activeBottomRef.current,
      ];
      const incomingNodes = [
        incomingTextRef.current,
        incomingTopRef.current,
        incomingBottomRef.current,
      ];

      if (activeNodes.some((node) => !node) || incomingNodes.some((node) => !node)) {
        return;
      }

      const duration = 0.62;
      const artExitDistance = 190;
      const artEnterDistance = 190;
      const textExitScale = 1.65;
      const textEnterScale = 0.9;
      const artMotionScale = 1.34;
      const isMobileViewport = window.matchMedia('(max-width: 639.98px)').matches;
      const textEnterY = isMobileViewport ? 8 : 36;
      const keepArtworkStatic =
        activeSlide.topImage === incomingSlide.topImage &&
        activeSlide.bottomImage === incomingSlide.bottomImage &&
        activeSlide.imagePosition === incomingSlide.imagePosition;
      const welcomeBase = incomingSlide.id === 'welcome'
        ? incomingTextRef.current?.querySelector<HTMLElement>('[data-welcome-glitch-base]') ?? null
        : null;
      const welcomeTop = incomingSlide.id === 'welcome'
        ? incomingTextRef.current?.querySelector<HTMLElement>('[data-welcome-glitch-top]') ?? null
        : null;
      const welcomeBottom = incomingSlide.id === 'welcome'
        ? incomingTextRef.current?.querySelector<HTMLElement>('[data-welcome-glitch-bottom]') ?? null
        : null;
      const welcomeWhite = incomingSlide.id === 'welcome'
        ? incomingTextRef.current?.querySelector<HTMLElement>('[data-welcome-glitch-white]') ?? null
        : null;
      const shouldAnimateWelcomeGlitch =
        welcomeBase &&
        welcomeTop &&
        welcomeBottom &&
        welcomeWhite &&
        !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const timeline = gsap.timeline({
        defaults: {
          ease: 'power3.inOut',
        },
        onComplete: () => {
          setActiveIndex(incomingIndex);
          setIncomingIndex(null);
        },
      });

      gsap.set(incomingTextRef.current, {
        autoAlpha: 0,
        y: textEnterY,
        scale: textEnterScale,
        filter: 'blur(10px)',
      });
      if (keepArtworkStatic) {
        gsap.set([incomingTopRef.current, incomingBottomRef.current], {
          autoAlpha: 1,
          y: 0,
          scale: 1,
        });
      } else {
        gsap.set(incomingTopRef.current, {
          autoAlpha: 0,
          y: -artEnterDistance,
          scale: artMotionScale,
          transformOrigin: '50% 100%',
        });
        gsap.set(incomingBottomRef.current, {
          autoAlpha: 0,
          y: artEnterDistance,
          scale: artMotionScale,
          transformOrigin: '50% 0%',
        });
      }

      timeline
        .to(
          activeTextRef.current,
          {
            autoAlpha: 0,
            y: -34,
            scale: textExitScale,
            filter: 'blur(8px)',
            duration,
          },
          0,
        )
        .to(
          incomingTextRef.current,
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            filter: 'none',
            duration: duration * 0.9,
          },
          0,
        );

      if (shouldAnimateWelcomeGlitch) {
        gsap.set([welcomeTop, welcomeBottom, welcomeWhite], { autoAlpha: 0, x: 0 });

        timeline
          .addLabel('welcomeGlitch', 0.3)
          .set([welcomeTop, welcomeBottom, welcomeWhite], { autoAlpha: 1 }, 'welcomeGlitch')
          .to(
            welcomeBase,
            {
              x: -8,
              skewX: 18,
              textShadow: '-2px 0 rgba(255,43,43,0.45), 3px 0 rgba(255,255,255,0.95), 7px 0 rgba(102,255,102,0.95)',
              duration: 0.055,
              ease: 'none',
            },
            'welcomeGlitch',
          )
          .to(welcomeTop, { x: -10, autoAlpha: 0.5, duration: 0.055, ease: 'none' }, 'welcomeGlitch')
          .to(welcomeBottom, { x: 12, autoAlpha: 0.95, duration: 0.055, ease: 'none' }, 'welcomeGlitch')
          .to(welcomeWhite, { x: 5, autoAlpha: 0.9, duration: 0.055, ease: 'none' }, 'welcomeGlitch')
          .to(
            welcomeBase,
            {
              x: 5,
              skewX: -10,
              textShadow: '-4px 0 rgba(255,255,255,0.85), 5px 0 rgba(102,255,102,0.9)',
              duration: 0.05,
              ease: 'none',
            },
            'welcomeGlitch+=0.09',
          )
          .to(welcomeTop, { x: 7, autoAlpha: 0.3, duration: 0.05, ease: 'none' }, 'welcomeGlitch+=0.09')
          .to(welcomeBottom, { x: -8, autoAlpha: 0.85, duration: 0.05, ease: 'none' }, 'welcomeGlitch+=0.09')
          .to(welcomeWhite, { x: -6, autoAlpha: 0.7, duration: 0.05, ease: 'none' }, 'welcomeGlitch+=0.09')
          .to(
            welcomeBase,
            {
              x: -3,
              skewX: 5,
              textShadow: '-1px 0 rgba(255,43,43,0.32), 2px 0 rgba(255,255,255,0.9), 4px 0 #66ff66',
              duration: 0.045,
              ease: 'none',
            },
            'welcomeGlitch+=0.18',
          )
          .to(welcomeTop, { x: -4, autoAlpha: 0.35, duration: 0.045, ease: 'none' }, 'welcomeGlitch+=0.18')
          .to(welcomeBottom, { x: 5, autoAlpha: 0.75, duration: 0.045, ease: 'none' }, 'welcomeGlitch+=0.18')
          .to(welcomeWhite, { x: 3, autoAlpha: 0.8, duration: 0.045, ease: 'none' }, 'welcomeGlitch+=0.18')
          .to(
            welcomeBase,
            {
              x: 0,
              skewX: 0,
              textShadow: 'none',
              duration: 0.12,
              ease: 'power2.out',
            },
            'welcomeGlitch+=0.28',
          )
          .to(
            [welcomeTop, welcomeBottom, welcomeWhite],
            { x: 0, autoAlpha: 0, duration: 0.12, ease: 'power2.out' },
            'welcomeGlitch+=0.28',
          );
      }

      if (!keepArtworkStatic) {
        timeline
          .to(
            activeTopRef.current,
            {
              autoAlpha: 0,
              y: -artExitDistance,
              scale: artMotionScale,
              transformOrigin: '50% 100%',
              duration: duration * 1.08,
            },
            0,
          )
          .to(
            activeBottomRef.current,
            {
              autoAlpha: 0,
              y: artExitDistance,
              scale: artMotionScale,
              transformOrigin: '50% 0%',
              duration: duration * 1.08,
            },
            0,
          )
          .to(
            incomingTopRef.current,
            {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              duration: duration * 0.96,
            },
            0,
          )
          .to(
            incomingBottomRef.current,
            {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              duration: duration * 0.96,
            },
            0,
          );
      }

      return () => {
        timeline.kill();
      };
    },
    { scope: sectionRef, dependencies: [incomingIndex] },
  );

  return (
    <FullPageSection id="text-section" className="items-stretch bg-white p-0">
      <section
        ref={sectionRef}
        className="relative h-full w-full overflow-hidden bg-white text-black"
        aria-label="XLAM Media statements"
        onPointerMove={handleBackgroundPointerMove}
        onPointerLeave={resetBackgroundParallax}
        {...scrollIgnoreAttr}
      >
        <div
          ref={backgroundRef}
          className="pointer-events-none absolute -inset-[5%] z-0 opacity-100"
          data-text-section-bg
          aria-hidden="true"
          style={{ willChange: 'transform' }}
        >
          <ResponsiveImage
            asset={GeneralBackground}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>

        <SlideArtwork
          key={`active-${activeSlide.id}`}
          slide={activeSlide}
          textRef={activeTextRef}
          topRef={activeTopRef}
          bottomRef={activeBottomRef}
          layerClassName="z-10"
          activeBreakpoint={activeImagePositionBreakpoint}
        />

        {incomingSlide ? (
          <SlideArtwork
            key={`incoming-${incomingSlide.id}`}
            slide={incomingSlide}
            textRef={incomingTextRef}
            topRef={incomingTopRef}
            bottomRef={incomingBottomRef}
            layerClassName="z-20"
            activeBreakpoint={activeImagePositionBreakpoint}
          />
        ) : null}
      </section>
    </FullPageSection>
  );
}

interface SlideArtworkProps {
  slide: TextSlide;
  textRef: RefObject<HTMLHeadingElement | null>;
  topRef: RefObject<HTMLDivElement | null>;
  bottomRef: RefObject<HTMLDivElement | null>;
  layerClassName: string;
  activeBreakpoint: TextSlideImagePositionBreakpoint;
}

function SlideArtwork({
  slide,
  textRef,
  topRef,
  bottomRef,
  layerClassName,
  activeBreakpoint,
}: SlideArtworkProps) {
  const isWelcomeSlide = slide.id === 'welcome';
  const imagePosition = resolveImagePosition(slide.imagePosition, activeBreakpoint);
  const topImageStyle = {
    top: imagePosition.top,
    height: imagePosition.topHeight,
    willChange: 'transform, opacity',
  } as CSSProperties;
  const bottomImageStyle = {
    bottom: imagePosition.bottom,
    height: imagePosition.bottomHeight,
    willChange: 'transform, opacity',
  } as CSSProperties;

  return (
    <div className={`pointer-events-none absolute inset-0 ${layerClassName}`}>
      <div
        ref={topRef}
        className="absolute left-1/2 w-screen -translate-x-1/2"
        style={topImageStyle}
      >
        <ResponsiveImage
          asset={slide.topImage}
          className="absolute inset-0 h-full w-full object-cover object-bottom"
        />
      </div>

      <div
        ref={bottomRef}
        className="absolute left-1/2 w-screen -translate-x-1/2"
        style={bottomImageStyle}
      >
        <ResponsiveImage
          asset={slide.bottomImage}
          className="absolute inset-0 h-full w-full object-cover object-top"
        />
      </div>

      <div className="absolute left-1/2 top-1/2 z-30 w-[min(88vw,1381px)] -translate-x-1/2 -translate-y-1/2 text-center">
        <h2
          ref={textRef}
          className={
            isWelcomeSlide
              ? 'text-[clamp(3rem,10vw,9.375rem)] font-black uppercase leading-[0.9] text-black'
              : 'text-[clamp(1.85rem,5.6vw,3.75rem)] font-black uppercase leading-[1.12] text-black sm:leading-[1.16] lg:leading-[1.21]'
          }
          style={{ willChange: 'transform, opacity, filter' }}
        >
          {isWelcomeSlide ? (
            <span className="relative inline-block">
              <span
                data-welcome-glitch-base
                className="relative z-10 inline-block"
              >
                {slide.lines[0]}
              </span>
              <span
                aria-hidden="true"
                data-welcome-glitch-top
                className="absolute inset-0 z-20 inline-block text-[rgba(255,43,43,0.45)] opacity-0"
              >
                {slide.lines[0]}
              </span>
              <span
                aria-hidden="true"
                data-welcome-glitch-bottom
                className="absolute inset-0 z-20 inline-block text-[#66ff66] opacity-0"
              >
                {slide.lines[0]}
              </span>
              <span
                aria-hidden="true"
                data-welcome-glitch-white
                className="absolute inset-0 z-30 inline-block text-white opacity-0"
              >
                {slide.lines[0]}
              </span>
            </span>
          ) : (
            slide.lines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))
          )}
        </h2>
      </div>
    </div>
  );
}
