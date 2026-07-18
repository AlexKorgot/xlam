'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, PointerEvent as ReactPointerEvent, RefObject } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { GlitchBrandXIcon } from '@/src/components/ui/GlitchBrandXIcon';
import GlitchText from '@/src/components/ui/GlitchText/GlitchText';
import {
  FULLPAGE_SCROLL_EVENT,
  FULLPAGE_TOUCH_AXIS_LOCK_RATIO,
  FULLPAGE_TOUCH_SWIPE_THRESHOLD,
  getFullPageSwipeDirection,
} from '@/src/components/ui/FullPageScroll';
import { ModalPortal } from '@/src/components/ui/modal';
import { cinematicSlides } from './data';
import { getFilmStripChromeLayout } from './filmStripLayout';
import { SliderScene, type SliderPointerAction } from './SliderScene';
import type { CinematicOverlayState, CinematicSlide } from './types';
import dzenLogo from './assets/line/dzen.svg';
import merLogo from './assets/line/mer.svg';
import nikeLogo from './assets/line/nike.svg';

gsap.registerPlugin(useGSAP);

type CinematicVideoSliderProps = {
  className?: string;
};

type CinematicChromeStyle = CSSProperties & {
  '--cinematic-chrome-opacity': number;
};

type CinematicSectionStyle = CSSProperties & {
  '--cinematic-band-top': string;
  '--cinematic-band-bottom': string;
  '--cinematic-heading-top': string;
  '--cinematic-bottom-chrome-top': string;
  '--cinematic-bottom-chrome-gap': string;
};

const headingLead = '\u041d\u0410\u0428\u0418';
const headingAccent = '\u041f\u0420\u041e\u0415\u041a\u0422\u042b';
const openLabel = '\u0421\u043c\u043e\u0442\u0440\u0435\u0442\u044c';
const previousGlyph = '\u2039';
const nextGlyph = '\u203a';
const sectionScrollThreshold = 48;
const sectionScrollUnlockDelay = 700;
const openedSlideTransitionDuration = 0.96;
const openedSlideContentSwitchProgress = 0.42;
const openedSlideIncomingDuration = 0.32;
const openedSlideIncomingDelay =
  openedSlideTransitionDuration * (1 - openedSlideContentSwitchProgress) -
  openedSlideIncomingDuration -
  0.04;
const tickerLogos = [nikeLogo, merLogo, dzenLogo, nikeLogo, merLogo, dzenLogo];

const getFocusableElements = (container: HTMLElement) =>
  Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((element) => !element.hasAttribute('disabled') && !element.getAttribute('aria-hidden'));

function LogoTicker() {
  const tickerGroup = [...tickerLogos, ...tickerLogos];

  return (
    <div
      className="pointer-events-none w-full max-w-[1740px] overflow-hidden opacity-80 [mask-image:linear-gradient(to_right,transparent_0%,#000_10%,#000_90%,transparent_100%)]"
      aria-hidden="true"
    >
      <div className="flex w-max items-center [animation:cinematic-logo-ticker_18s_linear_infinite]">
        {[0, 1].map((groupIndex) => (
          <div
            key={groupIndex}
            className="flex shrink-0 items-center gap-9 pr-9 sm:gap-12 sm:pr-12"
          >
            {tickerGroup.map((logo, index) => (
              <Image
                key={`${groupIndex}-${index}-${logo.src}`}
                src={logo}
                alt=""
                className="h-5 w-auto max-w-none shrink-0 object-contain sm:h-6 md:h-7"
                draggable={false}
              />
            ))}
          </div>
        ))}
      </div>
      <style jsx global>{`
        @keyframes cinematic-logo-ticker {
          from {
            transform: translate3d(0, 0, 0);
          }

          to {
            transform: translate3d(-50%, 0, 0);
          }
        }
      `}</style>
    </div>
  );
}

function OpenedSheetBody({
  slide,
  titleRef,
  titleId,
}: {
  slide: CinematicSlide;
  titleRef?: RefObject<HTMLHeadingElement | null>;
  titleId?: string;
}) {
  const previews = slide.opened.previews?.slice(0, 2) ?? [];
  const previewPlaceholderCount = Math.max(1, Math.min(slide.opened.thumbnailCount, 2));
  const visibleServices = slide.opened.services.slice(0, 8);
  const primaryServices = visibleServices.slice(0, 3);
  const secondaryServices = visibleServices.slice(3, 8);

  return (
    <div className="grid min-w-0 gap-7 lg:gap-y-10 min-[1920px]:grid-cols-[minmax(0,0.9fr)_minmax(0,0.78fr)] min-[1920px]:items-start min-[1920px]:gap-x-[clamp(1.25rem,2vw,3rem)]">
      <div className="min-w-0">
        <div data-case-heading className="opacity-0">
          <p className="mb-2 text-[10px] font-black uppercase leading-none tracking-[0.24em] text-white/58 lg:mb-3 lg:text-[clamp(2rem,3vw,4.1rem)] lg:tracking-normal lg:text-white lg:drop-shadow-[0_4px_20px_rgba(0,0,0,0.65)]">
            {slide.opened.titleLead}
          </p>
          <h3
            ref={titleRef}
            id={titleId}
            tabIndex={titleRef ? -1 : undefined}
            className="max-w-[18ch] text-[2.1rem] font-black uppercase leading-[0.88] text-[#66ff66] outline-none drop-shadow-[0_18px_48px_rgba(0,0,0,0.74)] sm:text-[3.3rem] lg:max-w-none lg:text-[clamp(4rem,6vw,8.45rem)]"
          >
            {slide.opened.titleAccent}
          </h3>
        </div>

        <p
          data-case-content
          className="mt-6 max-w-[64rem] text-[15px] font-black leading-[1.08] text-white opacity-0 drop-shadow-[0_4px_20px_rgba(0,0,0,0.45)] transition-[color] duration-300 sm:text-[18px] lg:mt-8 lg:max-w-[52rem] lg:text-[clamp(1.1rem,1.28vw,1.5rem)]"
        >
          {slide.opened.body}
        </p>

        {slide.opened.secondaryBody ? (
          <p
            data-case-content
            className="mt-7 max-w-[30rem] text-[15px] font-medium leading-[1.18] text-white/84 opacity-0 transition-[color] duration-300 sm:text-[18px] lg:mt-[clamp(2.2rem,5vh,4.5rem)] lg:max-w-[52rem] lg:text-[clamp(1.02rem,1.15vw,1.38rem)]"
          >
            {slide.opened.secondaryBody}
          </p>
        ) : null}

        <div data-case-content className="mt-7 opacity-0 lg:mt-[clamp(2.2rem,5vh,4.5rem)]">
          <div className="grid w-full gap-y-[11px] lg:gap-y-3">
            <div className="grid grid-cols-3 gap-x-2 gap-y-[11px] lg:gap-x-5 lg:gap-y-3">
              {primaryServices.map((service, index) => (
                <span
                  key={`${service}-${index}`}
                  className="flex min-h-7 min-w-0 items-center justify-center border border-white/60 px-2 py-1 text-center text-[9px] font-black uppercase leading-[1.05] text-white shadow-[0_4px_18px_rgba(0,0,0,0.38)] transition-colors duration-300 sm:text-[10px] lg:bg-transparent lg:px-3 lg:text-[12px] lg:backdrop-blur-[1px]"
                >
                  <span className="line-clamp-2 min-w-0 break-words">
                    {service}
                  </span>
                </span>
              ))}
            </div>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,8rem),1fr))] gap-x-2 gap-y-[11px] min-[1920px]:gap-x-3 min-[1920px]:gap-y-3">
              {secondaryServices.map((service, index) => (
                <span
                  key={`${service}-${index + primaryServices.length}`}
                  className="flex min-h-7 min-w-0 items-center justify-center border border-white/60 px-2 py-1 text-center text-[9px] font-black uppercase leading-[1.05] text-white shadow-[0_4px_18px_rgba(0,0,0,0.38)] transition-colors duration-300 sm:text-[10px] lg:bg-transparent lg:px-3 lg:text-[12px] lg:backdrop-blur-[1px]"
                >
                  <span className="line-clamp-2 min-w-0 break-words">
                    {service}
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid min-w-0 gap-7 lg:self-end min-[1920px]:pt-[clamp(7.25rem,22.5vh,15rem)]">
        <div
          data-case-content
          className="grid grid-cols-1 justify-items-stretch gap-3 opacity-0 sm:grid-cols-2 sm:gap-4 lg:w-full lg:grid-cols-2 lg:gap-5"
        >
          {previews.length > 0 ? previews.map((preview) => (
            <div
              key={typeof preview.src === 'string' ? preview.src : preview.src.src}
              className="relative aspect-[412/208] w-full max-w-[412px] overflow-hidden rounded-[6px] lg:max-w-none"
            >
              <Image
                src={preview.src}
                alt={preview.alt}
                fill
                loading="eager"
                unoptimized
                sizes="(max-width: 639px) calc(100vw - 40px), (max-width: 1023px) 50vw, 45vw"
                className="object-cover object-bottom"
              />
            </div>
          )) : Array.from({ length: previewPlaceholderCount }).map((_, index) => (
            <div
              key={index}
              className="relative aspect-[412/208] w-full max-w-[412px] overflow-hidden rounded-[6px] bg-transparent lg:max-w-none"
            >
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CinematicVideoSlider({ className = '' }: CinematicVideoSliderProps) {
  const rootRef = useRef<HTMLElement | null>(null);
  const canvasHostRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<SliderScene | null>(null);
  const chromeRef = useRef<HTMLDivElement | null>(null);
  const labelRef = useRef<HTMLDivElement | null>(null);
  const detailsRef = useRef<HTMLDivElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const sheetContentRef = useRef<HTMLDivElement | null>(null);
  const measureSheetContentRef = useRef<HTMLDivElement | null>(null);
  const sheetTitleRef = useRef<HTMLHeadingElement | null>(null);
  const sheetScrollRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const openTriggerRef = useRef<HTMLElement | null>(null);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const sheetTouchStartRef = useRef<{ x: number; y: number; scrollTop: number } | null>(null);
  const sectionTouchStartRef = useRef<{ x: number; y: number } | null>(null);
  const wheelBridgeDirectionRef = useRef<'up' | 'down' | null>(null);
  const wheelBridgeDeltaRef = useRef(0);
  const wheelBridgeLockRef = useRef(false);
  const wheelBridgeTimeoutRef = useRef<number | null>(null);
  const wasOpenedVisibleRef = useRef(false);
  const isSheetVisibleRef = useRef(false);
  const previousSheetContentHeightRef = useRef<number | null>(null);
  const sheetContentHeightTweenRef = useRef<gsap.core.Tween | null>(null);
  const openedSlidingContentRevealedRef = useRef(false);
  const overlayStateRef = useRef<CinematicOverlayState>('slider');
  const [activeIndex, setActiveIndex] = useState(0);
  const [pendingOpenedIndex, setPendingOpenedIndex] = useState<number | null>(null);
  const [overlayState, setOverlayState] = useState<CinematicOverlayState>('slider');
  const [reducedMotion, setReducedMotion] = useState(false);
  const [sectionStyle, setSectionStyle] = useState<CinematicSectionStyle>({
    '--cinematic-band-top': '38%',
    '--cinematic-band-bottom': '62%',
    '--cinematic-heading-top': '18%',
    '--cinematic-bottom-chrome-top': '68%',
    '--cinematic-bottom-chrome-gap': '20px',
  });
  const slides = useMemo(() => cinematicSlides, []);
  const activeSlide = slides[activeIndex];
  const slideCount = slides.length;
  const previousSlide = slides[(activeIndex - 1 + slideCount) % slideCount];
  const nextSlide = slides[(activeIndex + 1) % slideCount];
  const pendingOpenedSlide = pendingOpenedIndex === null ? null : slides[pendingOpenedIndex];
  const isOpened = overlayState === 'opened' || overlayState === 'opening' || overlayState === 'openedSliding';
  const isDetailsLayerVisible = isOpened || overlayState === 'closing';
  const isChromeVisible = overlayState === 'slider' || overlayState === 'sliding';

  const handleOpen = useCallback(() => {
    openTriggerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    sceneRef.current?.open();
  }, []);

  const handlePointerAction = useCallback((action: SliderPointerAction | null) => {
    if (action === 'open') {
      handleOpen();
      return;
    }

    if (action === 'previous') {
      sceneRef.current?.previous();
      return;
    }

    if (action === 'next') {
      sceneRef.current?.next();
    }
  }, [handleOpen]);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReducedMotion(media.matches);

    sync();
    media.addEventListener('change', sync);

    return () => {
      media.removeEventListener('change', sync);
    };
  }, []);

  useEffect(() => {
    const host = canvasHostRef.current;

    if (!host) {
      return;
    }

    const scene = new SliderScene(host, {
      slides,
      reducedMotion,
      onActiveSlideChange: setActiveIndex,
      onOverlayStateChange: setOverlayState,
      onOpenedSlideTargetChange: setPendingOpenedIndex,
    });

    sceneRef.current = scene;

    const canvas = scene.getCanvasElement();
    const handlePointerDown = (event: PointerEvent) => {
      pointerStartRef.current = { x: event.clientX, y: event.clientY };
    };
    const handlePointerUp = (event: PointerEvent) => {
      const start = pointerStartRef.current;

      pointerStartRef.current = null;

      if (!start) {
        return;
      }

      handlePointerAction(scene.getPointerGestureAction(start.x, start.y, event.clientX, event.clientY));
    };
    const handlePointerCancel = () => {
      pointerStartRef.current = null;
    };

    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointercancel', handlePointerCancel);

    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointercancel', handlePointerCancel);
      scene.dispose();
      sceneRef.current = null;
    };
  }, [handlePointerAction, reducedMotion, slides]);

  useEffect(() => {
    const root = rootRef.current;

    if (!root) {
      return;
    }

    const syncChromeLayout = () => {
      const rect = root.getBoundingClientRect();
      const width = Math.max(1, rect.width);
      const height = Math.max(1, rect.height);
      const layout = getFilmStripChromeLayout(width, height);

      setSectionStyle({
        '--cinematic-band-top': `${layout.bandTop}px`,
        '--cinematic-band-bottom': `${layout.bandBottom}px`,
        '--cinematic-heading-top': `${layout.headingTop}px`,
        '--cinematic-bottom-chrome-top': `${layout.bottomChromeTop}px`,
        '--cinematic-bottom-chrome-gap': `${layout.bottomChromeGap}px`,
      });
    };

    syncChromeLayout();

    const resizeObserver = new ResizeObserver(syncChromeLayout);
    resizeObserver.observe(root);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    overlayStateRef.current = overlayState;
  }, [overlayState]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        sceneRef.current?.close();
      }

      if (event.key === 'ArrowLeft') {
        if (overlayStateRef.current === 'opened') {
          sceneRef.current?.previousOpened();
          return;
        }

        sceneRef.current?.previous();
      }

      if (event.key === 'ArrowRight') {
        if (overlayStateRef.current === 'opened') {
          sceneRef.current?.nextOpened();
          return;
        }

        sceneRef.current?.next();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handlePrevious = useCallback(() => {
    sceneRef.current?.previous();
  }, []);

  const handleNext = useCallback(() => {
    sceneRef.current?.next();
  }, []);

  const handleOpenedPrevious = useCallback(() => {
    if (overlayState !== 'opened') {
      return;
    }

    sceneRef.current?.previousOpened();
  }, [overlayState]);

  const handleOpenedNext = useCallback(() => {
    if (overlayState !== 'opened') {
      return;
    }

    sceneRef.current?.nextOpened();
  }, [overlayState]);

  const handleClose = useCallback(() => {
    sceneRef.current?.close();
  }, []);

  useEffect(() => {
    if (!isDetailsLayerVisible || !sheetRef.current) {
      return;
    }

    const sheet = sheetRef.current;
    const focusTimer = window.setTimeout(() => {
      (sheetTitleRef.current ?? closeButtonRef.current ?? sheet).focus();
    }, reducedMotion ? 0 : 900);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        handleClose();
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const focusableElements = getFocusableElements(sheet);

      if (focusableElements.length === 0) {
        event.preventDefault();
        sheet.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
        return;
      }

      if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleClose, isDetailsLayerVisible, reducedMotion]);

  useEffect(() => {
    if (isDetailsLayerVisible) {
      return;
    }

    openTriggerRef.current?.focus();
    openTriggerRef.current = null;
  }, [isDetailsLayerVisible]);

  const handleSheetPointerDown = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'touch') {
      return;
    }

    sheetTouchStartRef.current = {
      x: event.clientX,
      y: event.clientY,
      scrollTop: sheetScrollRef.current?.scrollTop ?? 0,
    };
  }, []);

  const handleSheetPointerUp = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'touch') {
      return;
    }

    const start = sheetTouchStartRef.current;
    sheetTouchStartRef.current = null;

    if (!start || start.scrollTop > 0) {
      return;
    }

    const deltaX = event.clientX - start.x;
    const deltaY = event.clientY - start.y;

    if (deltaY > 56 && Math.abs(deltaY) > Math.abs(deltaX) * 1.3) {
      handleClose();
    }
  }, [handleClose]);

  useEffect(() => {
    const root = rootRef.current;

    if (!root || !isChromeVisible) {
      return;
    }

    const resetWheelBridge = () => {
      wheelBridgeDirectionRef.current = null;
      wheelBridgeDeltaRef.current = 0;
    };

    const unlockWheelBridge = () => {
      wheelBridgeLockRef.current = false;
    };

    const queueWheelBridgeUnlock = () => {
      if (wheelBridgeTimeoutRef.current) {
        window.clearTimeout(wheelBridgeTimeoutRef.current);
      }

      wheelBridgeTimeoutRef.current = window.setTimeout(() => {
        unlockWheelBridge();
      }, sectionScrollUnlockDelay);
    };

    const requestSectionScroll = (direction: 'up' | 'down') => {
      window.dispatchEvent(
        new CustomEvent(FULLPAGE_SCROLL_EVENT, {
          detail: { direction },
        }),
      );
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

      if (wheelBridgeLockRef.current) {
        return;
      }

      if (wheelBridgeDirectionRef.current !== direction) {
        wheelBridgeDeltaRef.current = 0;
      }

      wheelBridgeDirectionRef.current = direction;
      wheelBridgeDeltaRef.current += Math.abs(dominantDelta);

      if (wheelBridgeDeltaRef.current < sectionScrollThreshold) {
        return;
      }

      wheelBridgeLockRef.current = true;
      resetWheelBridge();
      queueWheelBridgeUnlock();
      requestSectionScroll(direction);
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (event.pointerType !== 'touch') {
        return;
      }

      sectionTouchStartRef.current = { x: event.clientX, y: event.clientY };
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (event.pointerType !== 'touch') {
        return;
      }

      const start = sectionTouchStartRef.current;
      sectionTouchStartRef.current = null;

      if (!start || wheelBridgeLockRef.current) {
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

      wheelBridgeLockRef.current = true;
      queueWheelBridgeUnlock();
      requestSectionScroll(getFullPageSwipeDirection(deltaY));
    };

    const handlePointerCancel = () => {
      sectionTouchStartRef.current = null;
    };

    root.addEventListener('wheel', handleWheel, { passive: false });
    root.addEventListener('pointerdown', handlePointerDown);
    root.addEventListener('pointerup', handlePointerUp);
    root.addEventListener('pointercancel', handlePointerCancel);

    return () => {
      root.removeEventListener('wheel', handleWheel);
      root.removeEventListener('pointerdown', handlePointerDown);
      root.removeEventListener('pointerup', handlePointerUp);
      root.removeEventListener('pointercancel', handlePointerCancel);

      if (wheelBridgeTimeoutRef.current) {
        window.clearTimeout(wheelBridgeTimeoutRef.current);
        wheelBridgeTimeoutRef.current = null;
      }

      sectionTouchStartRef.current = null;
      unlockWheelBridge();
      resetWheelBridge();
    };
  }, [isChromeVisible]);

  useGSAP(
    () => {
      if (!chromeRef.current || !detailsRef.current || !sheetRef.current || !sheetContentRef.current) {
        return;
      }

      const sheet = sheetRef.current;
      const sheetContent = sheetContentRef.current;
      const contentItems = sheet.querySelectorAll('[data-case-content]');
      const headingItems = sheet.querySelectorAll('[data-case-heading]');
      const usesDesktopModalMotion = window.innerWidth >= 1024;
      const shouldAnimateSheetContentHeight = window.innerWidth >= 1024 && !reducedMotion;

      gsap.to(chromeRef.current, {
        '--cinematic-chrome-opacity': isChromeVisible ? 1 : 0,
        duration: reducedMotion ? 0.01 : 0.36,
        ease: 'power2.out',
      });

      if (overlayState === 'openedSliding') {
        wasOpenedVisibleRef.current = false;

        const isIncomingOpenedContent = pendingOpenedIndex === activeIndex;

        if (shouldAnimateSheetContentHeight && previousSheetContentHeightRef.current === null) {
          const nextHeight = measureSheetContentRef.current?.getBoundingClientRect().height ?? null;
          const previousHeight = sheetContent.getBoundingClientRect().height;

          previousSheetContentHeightRef.current = previousHeight;

          if (nextHeight !== null) {
            sheetContentHeightTweenRef.current?.kill();
            gsap.set(sheetContent, { height: previousHeight });
            sheetContentHeightTweenRef.current = gsap.to(sheetContent, {
              height: nextHeight,
              duration: 0.96,
              ease: 'power3.inOut',
              overwrite: 'auto',
              onComplete: () => {
                gsap.set(sheetContent, { height: 'auto' });
                previousSheetContentHeightRef.current = null;
                sheetContentHeightTweenRef.current = null;
              },
            });
          }
        }

        if (isIncomingOpenedContent) {
          openedSlidingContentRevealedRef.current = true;

          gsap.fromTo(
            headingItems,
            { autoAlpha: 0, y: reducedMotion ? 0 : 10 },
            {
              autoAlpha: 1,
              y: 0,
              duration: reducedMotion ? 0.01 : openedSlideIncomingDuration,
              stagger: 0.035,
              ease: 'power2.out',
              delay: reducedMotion ? 0 : openedSlideIncomingDelay,
              overwrite: 'auto',
            },
          );

          gsap.fromTo(
            contentItems,
            { autoAlpha: 0, y: reducedMotion ? 0 : 14 },
            {
              autoAlpha: 1,
              y: 0,
              duration: reducedMotion ? 0.01 : openedSlideIncomingDuration,
              stagger: 0.035,
              ease: 'power2.out',
              delay: reducedMotion ? 0 : openedSlideIncomingDelay,
              overwrite: 'auto',
            },
          );
        } else {
          openedSlidingContentRevealedRef.current = false;

          gsap.to(headingItems, {
            autoAlpha: 0,
            y: reducedMotion ? 0 : -6,
            duration: reducedMotion ? 0.01 : 0.18,
            ease: 'power2.out',
            overwrite: 'auto',
          });

          gsap.to(contentItems, {
            autoAlpha: 0,
            y: reducedMotion ? 0 : -10,
            duration: reducedMotion ? 0.01 : 0.22,
            ease: 'power2.out',
            overwrite: 'auto',
          });
        }

        return;
      }

      if (isOpened) {
        if (overlayState === 'opened' && wasOpenedVisibleRef.current) {
          return;
        }

        wasOpenedVisibleRef.current = true;

        const wasSheetVisible = isSheetVisibleRef.current;
        const contentDelay = wasSheetVisible ? 0.04 : overlayState === 'opened' ? 0 : 0.62;

        if (!sheetContentHeightTweenRef.current && shouldAnimateSheetContentHeight && wasSheetVisible && previousSheetContentHeightRef.current !== null) {
          const previousHeight = previousSheetContentHeightRef.current;

          gsap.set(sheetContent, { height: 'auto' });

          const nextHeight = sheetContent.getBoundingClientRect().height;

          gsap.set(sheetContent, { height: previousHeight });
          gsap.to(sheetContent, {
            height: nextHeight,
            duration: 0.42,
            ease: 'power2.inOut',
            delay: 0.02,
            overwrite: 'auto',
            onComplete: () => {
              gsap.set(sheetContent, { height: 'auto' });
              previousSheetContentHeightRef.current = null;
            },
          });
        } else if (!sheetContentHeightTweenRef.current) {
          gsap.set(sheetContent, { height: 'auto' });
          previousSheetContentHeightRef.current = null;
        }

        if (!wasSheetVisible) {
          isSheetVisibleRef.current = true;

          gsap.fromTo(
            sheet,
            {
              autoAlpha: 0,
              scale: reducedMotion || !usesDesktopModalMotion ? 1 : 0.985,
              y: reducedMotion || !usesDesktopModalMotion ? 0 : 24,
              yPercent: reducedMotion || usesDesktopModalMotion ? 0 : 100,
            },
            {
              autoAlpha: 1,
              scale: 1,
              y: 0,
              yPercent: 0,
              duration: reducedMotion ? 0.01 : 0.62,
              ease: 'power3.out',
              delay: overlayState === 'opened' ? 0 : 0.18,
            },
          );
        } else {
          gsap.set(sheet, { autoAlpha: 1, scale: 1, y: 0, yPercent: 0 });
        }

        if (openedSlidingContentRevealedRef.current && wasSheetVisible) {
          gsap.set([headingItems, contentItems], { autoAlpha: 1, y: 0 });
          openedSlidingContentRevealedRef.current = false;
        } else {
          gsap.fromTo(
            headingItems,
            { autoAlpha: 0, y: reducedMotion ? 0 : wasSheetVisible ? 6 : 12 },
            {
              autoAlpha: 1,
              y: 0,
              duration: reducedMotion ? 0.01 : 0.26,
              stagger: 0.035,
              ease: 'power2.out',
              delay: contentDelay,
            },
          );

          gsap.fromTo(
            contentItems,
            { autoAlpha: 0, y: reducedMotion ? 0 : 12 },
            {
              autoAlpha: 1,
              y: 0,
              duration: reducedMotion ? 0.01 : 0.3,
              stagger: 0.035,
              ease: 'power2.out',
              delay: contentDelay,
            },
          );
        }
        return;
      }

      wasOpenedVisibleRef.current = false;
      isSheetVisibleRef.current = false;
      previousSheetContentHeightRef.current = null;
      sheetContentHeightTweenRef.current?.kill();
      sheetContentHeightTweenRef.current = null;
      openedSlidingContentRevealedRef.current = false;

      gsap.to(sheet, {
        autoAlpha: 0,
        scale: reducedMotion || !usesDesktopModalMotion ? 1 : 0.985,
        y: reducedMotion || !usesDesktopModalMotion ? 0 : 24,
        yPercent: reducedMotion || usesDesktopModalMotion ? 0 : 100,
        duration: reducedMotion ? 0.01 : 0.44,
        ease: 'power3.in',
      });

      gsap.set(sheetContent, { clearProps: 'height' });

      gsap.to(contentItems, {
        autoAlpha: 0,
        y: reducedMotion ? 0 : 24,
        duration: reducedMotion ? 0.01 : 0.58,
        stagger: 0.06,
        ease: 'power2.out',
      });

      gsap.to(headingItems, {
        autoAlpha: 0,
        y: reducedMotion ? 0 : 12,
        duration: reducedMotion ? 0.01 : 0.36,
        ease: 'power2.out',
      });
    },
    { scope: rootRef, dependencies: [activeIndex, isChromeVisible, isOpened, overlayState, pendingOpenedIndex, reducedMotion] },
  );

  useGSAP(
    () => {
      if (!labelRef.current || !isChromeVisible) {
        return;
      }

      gsap.fromTo(
        labelRef.current.querySelectorAll('[data-slide-label]'),
        { autoAlpha: 0, y: reducedMotion ? 0 : 8 },
        {
          autoAlpha: 1,
          y: 0,
          duration: reducedMotion ? 0.01 : 0.34,
          stagger: 0.035,
          ease: 'power2.out',
        },
      );
    },
    { scope: rootRef, dependencies: [activeIndex, isChromeVisible, reducedMotion] },
  );

  return (
    <section
      ref={rootRef}
      data-fullpage-scroll-ignore
      className={`font-normalidad group relative isolate h-full min-h-0 w-full overflow-hidden bg-black text-white ${className}`}
      aria-label="Cinematic project slider"
      style={sectionStyle}
    >
      <div className="pointer-events-none absolute inset-0 z-[-2] bg-black" />
      <div className="pointer-events-none absolute left-1/2 top-[17.5svh] z-[-1] h-[68svh] w-[86vw] -translate-x-1/2 rounded-[50%] bg-[#458294] opacity-55 blur-[220px] md:top-[17.5vh] md:h-[68vh] md:w-[85.5vw] md:blur-[275px]" />
      <div className="pointer-events-none absolute inset-0 z-[-1] bg-[radial-gradient(ellipse_85%_55%_at_50%_46%,rgba(69,130,148,0.42)_0%,rgba(69,130,148,0.22)_34%,rgba(0,0,0,0)_72%)]" />

      <div ref={canvasHostRef} className="absolute inset-0 z-0 cursor-pointer touch-manipulation" />

      <div
        ref={chromeRef}
        className="pointer-events-none absolute inset-0 z-10"
        style={{ '--cinematic-chrome-opacity': 1 } as CinematicChromeStyle}
      >
        <div className="absolute inset-x-0 top-0 z-10 min-[1000px]:hidden">
          <div className="flex h-[var(--header-offset)] w-full items-center justify-center px-4 text-center opacity-[var(--cinematic-chrome-opacity)]">
            <h2 className="max-w-[9.5rem] text-[1.18rem] font-black uppercase leading-[0.9] drop-shadow-[0_10px_24px_rgba(0,0,0,0.65)]">
              <span className="block">{headingLead}</span>
              <span className="block text-[#66ff66]">{headingAccent}</span>
            </h2>
          </div>
        </div>

        <div
          className="absolute left-1/2 z-10 hidden w-full px-5 text-center opacity-[var(--cinematic-chrome-opacity)] min-[1000px]:block"
          style={{
            top: 'var(--cinematic-heading-top)',
            transform: 'translate(-50%, calc(-100% - 50px))',
          }}
        >
          <h2 className="text-[2rem] font-black uppercase leading-none drop-shadow-[0_12px_30px_rgba(0,0,0,0.55)] md:text-[2.35rem] xl:text-[3rem]">
            {headingLead} <span className="text-[#66ff66]">{headingAccent}</span>
          </h2>
        </div>

        <div
          className="absolute inset-x-0 z-10 flex flex-col items-center px-6 text-center opacity-[var(--cinematic-chrome-opacity)]"
          style={{
            top: 'var(--cinematic-bottom-chrome-top)',
            gap: 'var(--cinematic-bottom-chrome-gap)',
          }}
        >
          <div ref={labelRef} className="w-full">
            <p data-slide-label className="mx-auto mb-2 max-w-[28rem] text-[9px] font-black uppercase leading-none text-white/88 drop-shadow-[0_6px_16px_rgba(0,0,0,0.65)] md:text-[10px]">
              {activeSlide.eyebrow}
            </p>
            <h3
              data-slide-label
              className="mx-auto max-w-[34rem] text-[1rem] font-black uppercase leading-none text-[#66ff66] drop-shadow-[0_10px_22px_rgba(0,0,0,0.62)] md:text-[1.35rem] xl:text-[1.875rem]"
            >
              {activeSlide.title}
            </h3>
          </div>

          <div className="pointer-events-auto hidden items-center gap-5 opacity-[0.48] transition-opacity duration-300 group-hover:opacity-[0.9] focus-within:opacity-100 min-[800px]:flex">
            <button
              type="button"
              className="grid h-9 w-9 place-items-center rounded-full border border-white/18 text-lg font-black text-white/58 transition-colors hover:border-[#66ff66]/55 hover:text-[#66ff66] focus-visible:border-[#66ff66] focus-visible:text-[#66ff66] md:h-10 md:w-10"
              onClick={handlePrevious}
              aria-label="Previous project"
            >
              <GlitchText size="18">{previousGlyph}</GlitchText>
            </button>
            <button
              type="button"
              className="h-9 border border-white/20 px-6 text-[9px] font-black uppercase tracking-[0.28em] text-white/78 transition-colors hover:border-[#66ff66]/60 hover:text-[#66ff66] focus-visible:border-[#66ff66] focus-visible:text-[#66ff66] md:h-10 md:px-7 md:text-[10px]"
              onClick={handleOpen}
            >
              <GlitchText>
                {openLabel}
              </GlitchText>
            </button>
            <button
              type="button"
              className="grid h-9 w-9 place-items-center rounded-full border border-white/18 text-lg font-black text-white/58 transition-colors hover:border-[#66ff66]/55 hover:text-[#66ff66] focus-visible:border-[#66ff66] focus-visible:text-[#66ff66] md:h-10 md:w-10"
              onClick={handleNext}
              aria-label="Next project"
            >
              <GlitchText size="18">{nextGlyph}</GlitchText>
            </button>
          </div>
          <LogoTicker />
        </div>
      </div>

      <ModalPortal>
        <div
          ref={detailsRef}
          className={`fixed inset-0 z-[80] transition-opacity duration-300 ${
            isDetailsLayerVisible ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
          }`}
          aria-hidden={!isDetailsLayerVisible}
        >
        <button
          type="button"
          className="absolute inset-0 bg-black/34 backdrop-blur-[1px] sm:bg-black/58 sm:backdrop-blur-[2px] lg:bg-transparent lg:backdrop-blur-none"
          onClick={handleClose}
          aria-label="Close project details"
          tabIndex={-1}
        />

        <div className="absolute inset-x-0 bottom-0 top-[calc(var(--header-offset)+0.5rem)] z-30 flex max-h-[calc(var(--fullpage-height,100svh)-var(--header-offset)-0.5rem)] items-start justify-center px-3 pb-3 sm:px-5 sm:pb-5 lg:inset-0 lg:max-h-[var(--fullpage-height,100svh)] lg:items-stretch lg:px-6 lg:pb-5 lg:pt-[calc(var(--header-offset)+0.5rem)] xl:px-8 [@media_(max-width:999.98px)_and_(orientation:landscape)]:inset-0 [@media_(max-width:999.98px)_and_(orientation:landscape)]:max-h-[var(--fullpage-height,100svh)] [@media_(max-width:999.98px)_and_(orientation:landscape)]:items-stretch [@media_(max-width:999.98px)_and_(orientation:landscape)]:px-0 [@media_(max-width:999.98px)_and_(orientation:landscape)]:pb-0">
          <div
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cinematic-project-title"
            tabIndex={-1}
            className="relative flex max-h-[calc(var(--fullpage-height,100svh)-var(--header-offset)-1rem)] w-full max-w-[94rem] flex-col overflow-hidden rounded-[8px] border border-white/16 bg-[#030707]/88 text-white opacity-0 shadow-[0_30px_120px_rgba(0,0,0,0.78)] outline-none backdrop-blur-xl sm:max-h-[calc(var(--fullpage-height,100svh)-var(--header-offset)-1.5rem)] sm:bg-[#030707]/82 lg:h-full lg:max-h-none lg:max-w-full lg:rounded-none lg:border-transparent lg:bg-transparent lg:shadow-none lg:backdrop-blur-none [@media_(max-width:999.98px)_and_(orientation:landscape)]:h-full [@media_(max-width:999.98px)_and_(orientation:landscape)]:max-h-none [@media_(max-width:999.98px)_and_(orientation:landscape)]:max-w-none [@media_(max-width:999.98px)_and_(orientation:landscape)]:rounded-none [@media_(max-width:999.98px)_and_(orientation:landscape)]:border-0 [@media_(max-width:999.98px)_and_(orientation:landscape)]:bg-[#030707]/74 [@media_(max-width:999.98px)_and_(orientation:landscape)]:shadow-none"
            onPointerDown={handleSheetPointerDown}
            onPointerUp={handleSheetPointerUp}
            onPointerCancel={() => {
              sheetTouchStartRef.current = null;
            }}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_22%_12%,rgba(102,255,102,0.12),rgba(102,255,102,0)_28%),linear-gradient(180deg,rgba(0,0,0,0.24),rgba(0,0,0,0.62))] lg:bg-none" aria-hidden="true" />

            <div ref={sheetContentRef} className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
              <div className="mx-auto mt-3 h-1 w-14 rounded-full bg-white/28 lg:hidden [@media_(max-width:999.98px)_and_(orientation:landscape)]:hidden" aria-hidden="true" />

              <div className="z-40 flex justify-end border-b border-white/10 px-5 pb-4 pt-4 sm:px-7 lg:pointer-events-none lg:absolute lg:right-0 lg:top-0 lg:border-b-0 lg:p-0 [@media_(max-width:999.98px)_and_(orientation:landscape)]:absolute [@media_(max-width:999.98px)_and_(orientation:landscape)]:right-3 [@media_(max-width:999.98px)_and_(orientation:landscape)]:top-3 [@media_(max-width:999.98px)_and_(orientation:landscape)]:border-b-0 [@media_(max-width:999.98px)_and_(orientation:landscape)]:p-0">
                <button
                  ref={closeButtonRef}
                  type="button"
                  className="pointer-events-auto flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center border border-white/24 bg-black/52 font-black uppercase leading-none text-white/78 transition-colors hover:border-[#66ff66]/65 hover:text-[#66ff66] focus-visible:border-[#66ff66] focus-visible:text-[#66ff66] md:h-11 md:w-11 lg:bg-black/24 lg:backdrop-blur-sm [@media_(max-width:999.98px)_and_(orientation:landscape)]:h-9 [@media_(max-width:999.98px)_and_(orientation:landscape)]:w-9 [@media_(max-width:999.98px)_and_(orientation:landscape)]:bg-black/42 [@media_(max-width:999.98px)_and_(orientation:landscape)]:backdrop-blur-sm"
                  onClick={handleClose}
                  aria-label="Close project"
                >
                  <GlitchBrandXIcon className="cursor-pointer" fill="white" />
                </button>
              </div>

              <div
                ref={sheetScrollRef}
                className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 [scrollbar-width:none] sm:px-7 lg:max-w-none lg:px-0 lg:py-0 [&::-webkit-scrollbar]:hidden [@media_(max-width:999.98px)_and_(orientation:landscape)]:px-4 [@media_(max-width:999.98px)_and_(orientation:landscape)]:py-3 [@media_(max-width:999.98px)_and_(orientation:landscape)]:pr-14"
              >
                <div className="lg:flex lg:min-h-full lg:flex-col lg:justify-end lg:pb-5 2xl:pb-[30px] [@media_(max-width:999.98px)_and_(orientation:landscape)]:pb-2">
                  <OpenedSheetBody slide={activeSlide} titleRef={sheetTitleRef} titleId="cinematic-project-title" />
                </div>
              </div>
            </div>

            <nav
              data-case-detail
              className="sticky bottom-0 z-30 mt-auto grid shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-3 border-t border-white/10 px-5 py-3 sm:gap-4 sm:px-7 lg:border-t-0 lg:px-0 lg:py-0 [@media_(max-width:999.98px)_and_(orientation:landscape)]:gap-2 [@media_(max-width:999.98px)_and_(orientation:landscape)]:px-4 [@media_(max-width:999.98px)_and_(orientation:landscape)]:py-1.5"
              aria-label="Opened project navigation"
            >
              <button
                type="button"
                className="flex h-14 w-full min-w-0 items-center gap-3 text-left text-[11px] font-medium leading-none text-white transition-colors hover:text-[#66ff66] focus-visible:text-[#66ff66] disabled:pointer-events-none disabled:text-white/32 sm:text-sm lg:px-4 [@media_(max-width:999.98px)_and_(orientation:landscape)]:h-10 [@media_(max-width:999.98px)_and_(orientation:landscape)]:gap-2"
                onClick={handleOpenedPrevious}
                disabled={overlayState === 'openedSliding'}
              >
                <span className="text-4xl leading-none text-[#66ff66]">
                  <GlitchText size="36">{previousGlyph}</GlitchText>
                </span>
                <span className="min-w-0 truncate leading-none">
                  <GlitchText size="14">{previousSlide.opened.navLabel}</GlitchText>
                </span>
              </button>

              <div className="flex h-14 min-w-0 items-center justify-center px-4 text-center text-[14px] font-medium leading-none text-[#66ff66] sm:text-[22px] lg:px-0 [@media_(max-width:999.98px)_and_(orientation:landscape)]:h-10 [@media_(max-width:999.98px)_and_(orientation:landscape)]:px-2 [@media_(max-width:999.98px)_and_(orientation:landscape)]:text-[13px]">
                <span className="min-w-0 truncate leading-none">
                  <GlitchText size="22">{activeSlide.opened.navLabel}</GlitchText>
                </span>
              </div>

              <button
                type="button"
                className="flex h-14 w-full min-w-0 items-center justify-end gap-3 text-right text-[11px] font-medium leading-none text-white transition-colors hover:text-[#66ff66] focus-visible:text-[#66ff66] disabled:pointer-events-none disabled:text-white/32 sm:text-sm lg:px-4 [@media_(max-width:999.98px)_and_(orientation:landscape)]:h-10 [@media_(max-width:999.98px)_and_(orientation:landscape)]:gap-2"
                onClick={handleOpenedNext}
                disabled={overlayState === 'openedSliding'}
              >
                <span className="min-w-0 truncate leading-none">
                  <GlitchText size="14">{nextSlide.opened.navLabel}</GlitchText>
                </span>
                <span className="text-4xl leading-none text-[#66ff66]">
                  <GlitchText size="36">{nextGlyph}</GlitchText>
                </span>
              </button>
            </nav>
          </div>

          {pendingOpenedSlide ? (
            <div
              ref={measureSheetContentRef}
              aria-hidden="true"
              className="pointer-events-none invisible absolute inset-x-3 top-[calc(var(--header-offset)+0.5rem)] flex max-h-[calc(var(--fullpage-height,100svh)-var(--header-offset)-1rem)] max-w-[94rem] flex-col overflow-hidden text-white sm:inset-x-5 sm:max-h-[calc(var(--fullpage-height,100svh)-var(--header-offset)-1.5rem)] lg:inset-x-6 lg:top-[calc(var(--header-offset)+0.5rem)] lg:mx-auto lg:h-[calc(var(--fullpage-height,100svh)-var(--header-offset)-2rem)] lg:max-h-none lg:max-w-full xl:inset-x-8 [@media_(max-width:999.98px)_and_(orientation:landscape)]:inset-0 [@media_(max-width:999.98px)_and_(orientation:landscape)]:h-[var(--fullpage-height,100svh)] [@media_(max-width:999.98px)_and_(orientation:landscape)]:max-h-none [@media_(max-width:999.98px)_and_(orientation:landscape)]:max-w-none"
            >
              <div className="mx-auto mt-3 h-1 w-14 rounded-full bg-white/28 lg:hidden [@media_(max-width:999.98px)_and_(orientation:landscape)]:hidden" aria-hidden="true" />

              <div className="z-40 flex justify-end border-b border-white/10 px-5 pb-4 pt-4 sm:px-7 lg:pointer-events-none lg:absolute lg:right-0 lg:top-0 lg:border-b-0 lg:p-0 [@media_(max-width:999.98px)_and_(orientation:landscape)]:absolute [@media_(max-width:999.98px)_and_(orientation:landscape)]:right-3 [@media_(max-width:999.98px)_and_(orientation:landscape)]:top-3 [@media_(max-width:999.98px)_and_(orientation:landscape)]:border-b-0 [@media_(max-width:999.98px)_and_(orientation:landscape)]:p-0">
                <div className="h-10 shrink-0 border border-white/24 bg-black/52 px-4 md:h-11 md:px-5 lg:bg-black/24 lg:backdrop-blur-sm [@media_(max-width:999.98px)_and_(orientation:landscape)]:h-9 [@media_(max-width:999.98px)_and_(orientation:landscape)]:px-4" />
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 [scrollbar-width:none] sm:px-7 lg:max-w-none lg:px-0 lg:py-0 [&::-webkit-scrollbar]:hidden [@media_(max-width:999.98px)_and_(orientation:landscape)]:px-4 [@media_(max-width:999.98px)_and_(orientation:landscape)]:py-3 [@media_(max-width:999.98px)_and_(orientation:landscape)]:pr-14">
                <div className="lg:flex lg:min-h-full lg:flex-col lg:justify-end lg:pb-5 2xl:pb-[30px] [@media_(max-width:999.98px)_and_(orientation:landscape)]:pb-2">
                  <OpenedSheetBody slide={pendingOpenedSlide} />
                </div>
              </div>
            </div>
          ) : null}
        </div>
        </div>
      </ModalPortal>
    </section>
  );
}
