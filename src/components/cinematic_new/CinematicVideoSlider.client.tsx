'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import GlitchText from '@/src/components/ui/GlitchText/GlitchText';
import {
  FULLPAGE_SCROLL_EVENT,
  FULLPAGE_TOUCH_AXIS_LOCK_RATIO,
  FULLPAGE_TOUCH_SWIPE_THRESHOLD,
  getFullPageSwipeDirection,
} from '@/src/components/ui/FullPageScroll';
import { cinematicSlides } from './data';
import { SliderScene, type SliderPointerAction } from './SliderScene';
import type { CinematicOverlayState } from './types';

gsap.registerPlugin(useGSAP);

type CinematicVideoSliderProps = {
  className?: string;
};

type CinematicChromeStyle = CSSProperties & {
  '--cinematic-chrome-opacity': number;
};

const headingLead = '\u041d\u0410\u0428\u0418';
const headingAccent = '\u041f\u0420\u041e\u0415\u041a\u0422\u042b';
const openLabel = '\u0421\u043c\u043e\u0442\u0440\u0435\u0442\u044c';
const previousGlyph = '\u2039';
const nextGlyph = '\u203a';
const closeLabel = '\u0417\u0430\u043a\u0440\u044b\u0442\u044c';
const sectionScrollThreshold = 48;
const sectionScrollUnlockDelay = 700;

const getFocusableElements = (container: HTMLElement) =>
  Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((element) => !element.hasAttribute('disabled') && !element.getAttribute('aria-hidden'));

export function CinematicVideoSlider({ className = '' }: CinematicVideoSliderProps) {
  const rootRef = useRef<HTMLElement | null>(null);
  const canvasHostRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<SliderScene | null>(null);
  const chromeRef = useRef<HTMLDivElement | null>(null);
  const labelRef = useRef<HTMLDivElement | null>(null);
  const detailsRef = useRef<HTMLDivElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
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
  const [activeIndex, setActiveIndex] = useState(0);
  const [overlayState, setOverlayState] = useState<CinematicOverlayState>('slider');
  const [reducedMotion, setReducedMotion] = useState(false);
  const slides = useMemo(() => cinematicSlides, []);
  const activeSlide = slides[activeIndex];
  const slideCount = slides.length;
  const previousSlide = slides[(activeIndex - 1 + slideCount) % slideCount];
  const nextSlide = slides[(activeIndex + 1) % slideCount];
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
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        sceneRef.current?.close();
      }

      if (event.key === 'ArrowLeft') {
        sceneRef.current?.previous();
      }

      if (event.key === 'ArrowRight') {
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
    sceneRef.current?.previousOpened();
  }, []);

  const handleOpenedNext = useCallback(() => {
    sceneRef.current?.nextOpened();
  }, []);

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
      if (!chromeRef.current || !detailsRef.current || !sheetRef.current) {
        return;
      }

      const detailItems = detailsRef.current.querySelectorAll('[data-case-detail]');
      const sheet = sheetRef.current;

      gsap.to(chromeRef.current, {
        '--cinematic-chrome-opacity': isChromeVisible ? 1 : 0,
        duration: reducedMotion ? 0.01 : 0.36,
        ease: 'power2.out',
      });

      if (overlayState === 'openedSliding') {
        wasOpenedVisibleRef.current = false;

        gsap.to(detailItems, {
          autoAlpha: 0,
          y: reducedMotion ? 0 : -14,
          duration: reducedMotion ? 0.01 : 0.26,
          ease: 'power2.out',
        });
        return;
      }

      if (isOpened) {
        if (overlayState === 'opened' && wasOpenedVisibleRef.current) {
          return;
        }

        wasOpenedVisibleRef.current = true;

        gsap.fromTo(
          sheet,
          { autoAlpha: 0, yPercent: reducedMotion ? 0 : 100 },
          {
            autoAlpha: 1,
            yPercent: 0,
            duration: reducedMotion ? 0.01 : 0.62,
            ease: 'power3.out',
            delay: overlayState === 'opened' ? 0 : 0.18,
          },
        );

        gsap.fromTo(
          detailItems,
          { autoAlpha: 0, y: reducedMotion ? 0 : 24 },
          {
            autoAlpha: 1,
            y: 0,
            duration: reducedMotion ? 0.01 : 0.58,
            stagger: 0.06,
            ease: 'power2.out',
            delay: overlayState === 'opened' ? 0 : 0.62,
          },
        );
        return;
      }

      wasOpenedVisibleRef.current = false;

      gsap.to(sheet, {
        autoAlpha: 0,
        yPercent: reducedMotion ? 0 : 100,
        duration: reducedMotion ? 0.01 : 0.44,
        ease: 'power3.in',
      });

      gsap.to(detailItems, {
        autoAlpha: 0,
        y: reducedMotion ? 0 : 24,
        duration: reducedMotion ? 0.01 : 0.58,
        stagger: 0.06,
        ease: 'power2.out',
      });
    },
    { scope: rootRef, dependencies: [activeIndex, isChromeVisible, isOpened, overlayState, reducedMotion] },
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
        <div className="absolute left-1/2 top-[9.5svh] z-10 w-full -translate-x-1/2 px-5 text-center opacity-[var(--cinematic-chrome-opacity)] md:top-[10.5svh]">
          <h2 className="text-[2rem] font-black uppercase leading-none drop-shadow-[0_12px_30px_rgba(0,0,0,0.55)] md:text-[2.75rem] xl:text-[3.65rem]">
            {headingLead} <span className="text-[#66ff66]">{headingAccent}</span>
          </h2>
        </div>

        <div
          ref={labelRef}
          className="absolute inset-x-0 bottom-[12svh] z-10 px-6 text-center opacity-[var(--cinematic-chrome-opacity)] md:bottom-[13svh]"
        >
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

        <div className="pointer-events-auto absolute bottom-[4.5svh] left-1/2 z-20 flex -translate-x-1/2 items-center gap-5 opacity-[calc(var(--cinematic-chrome-opacity)*0.48)] transition-opacity duration-300 group-hover:opacity-[calc(var(--cinematic-chrome-opacity)*0.9)] focus-within:opacity-[var(--cinematic-chrome-opacity)]">
          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-full border border-white/18 bg-black/35 text-lg font-black text-white/58 backdrop-blur-md transition-colors hover:border-[#66ff66]/55 hover:text-[#66ff66] focus-visible:border-[#66ff66] focus-visible:text-[#66ff66] md:h-10 md:w-10"
            onClick={handlePrevious}
            aria-label="Previous project"
          >
            {previousGlyph}
          </button>
          <button
            type="button"
            className="h-9 border border-white/20 bg-black/35 px-6 text-[9px] font-black uppercase tracking-[0.28em] text-white/78 backdrop-blur-md transition-colors hover:border-[#66ff66]/60 hover:text-[#66ff66] focus-visible:border-[#66ff66] focus-visible:text-[#66ff66] md:h-10 md:px-7 md:text-[10px]"
            onClick={handleOpen}
          >
            <GlitchText>
              {openLabel}
            </GlitchText>
          </button>
          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-full border border-white/18 bg-black/35 text-lg font-black text-white/58 backdrop-blur-md transition-colors hover:border-[#66ff66]/55 hover:text-[#66ff66] focus-visible:border-[#66ff66] focus-visible:text-[#66ff66] md:h-10 md:w-10"
            onClick={handleNext}
            aria-label="Next project"
          >
            {nextGlyph}
          </button>
        </div>
      </div>

      <div
        ref={detailsRef}
        className={`absolute inset-0 z-20 transition-opacity duration-300 ${
          isDetailsLayerVisible ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-hidden={!isDetailsLayerVisible}
      >
        <button
          type="button"
          className="absolute inset-0 bg-black/58 backdrop-blur-[2px]"
          onClick={handleClose}
          aria-label="Close project details"
          tabIndex={-1}
        />

        <div className="absolute inset-x-0 bottom-0 z-30 flex max-h-[calc(var(--fullpage-height,100svh)-1rem)] items-end justify-center px-3 pb-3 sm:px-5 sm:pb-5 lg:px-8 lg:pb-8">
          <div
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cinematic-project-title"
            tabIndex={-1}
            className="max-h-[min(86svh,calc(var(--fullpage-height,100svh)-2rem))] w-full max-w-[76rem] overflow-hidden rounded-t-[1.35rem] border border-white/18 bg-[#050909]/94 text-white opacity-0 shadow-[0_-28px_90px_rgba(0,0,0,0.72)] outline-none backdrop-blur-xl lg:rounded-[1.35rem]"
            onPointerDown={handleSheetPointerDown}
            onPointerUp={handleSheetPointerUp}
            onPointerCancel={() => {
              sheetTouchStartRef.current = null;
            }}
          >
            <div className="mx-auto mt-3 h-1 w-14 rounded-full bg-white/28" aria-hidden="true" />

            <div className="grid grid-cols-[1fr_auto] items-start gap-4 border-b border-white/10 px-5 pb-4 pt-4 sm:px-7 lg:px-9">
              <div data-case-detail className="min-w-0 opacity-0">
                <p className="mb-2 text-[10px] font-black uppercase leading-none tracking-[0.24em] text-white/58">
                  {activeSlide.eyebrow}
                </p>
                <h3
                  ref={sheetTitleRef}
                  id="cinematic-project-title"
                  tabIndex={-1}
                  className="max-w-[18ch] text-[2.1rem] font-black uppercase leading-[0.88] outline-none sm:text-[3.3rem] lg:max-w-none lg:text-[clamp(3.6rem,6vw,7rem)]"
                >
                  <span className="block text-[0.56em]">{activeSlide.opened.titleLead}</span>
                  <span className="block text-[#66ff66]">{activeSlide.opened.titleAccent}</span>
                </h3>
              </div>

              <button
                ref={closeButtonRef}
                type="button"
                data-case-detail
                className="flex h-10 shrink-0 items-center justify-center border border-white/24 bg-black/38 px-4 font-black uppercase leading-none text-white/78 opacity-0 transition-colors hover:border-[#66ff66]/65 hover:text-[#66ff66] focus-visible:border-[#66ff66] focus-visible:text-[#66ff66] md:h-11 md:px-5"
                onClick={handleClose}
                aria-label="Close project"
              >
                <span className="flex h-full items-center justify-center leading-none [&>div>div]:flex [&>div>div]:items-center [&>div>div]:leading-none">
                  <GlitchText size="11">{closeLabel}</GlitchText>
                </span>
              </button>
            </div>

            <div
              ref={sheetScrollRef}
              className="max-h-[calc(var(--fullpage-height,100svh)-10.5rem)] overflow-y-auto overscroll-contain px-5 py-5 sm:px-7 lg:px-9 lg:py-7"
            >
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1.02fr)_minmax(22rem,0.78fr)] lg:gap-10">
                <div data-case-detail className="opacity-0">
                  <p className="max-w-[54rem] text-[15px] font-medium leading-[1.18] text-white/92 sm:text-[18px] lg:text-[21px]">
                    {activeSlide.opened.body}
                  </p>
                </div>

                <div data-case-detail className="opacity-0 lg:pb-3">
                  <div className="grid grid-cols-2 gap-x-2 gap-y-[11px] sm:grid-cols-3">
                    {[...activeSlide.opened.services, ...activeSlide.opened.services].map((service, index) => (
                      <span
                        key={`${service}-${index}`}
                        className="flex h-7 min-w-0 items-center justify-center border border-white/50 px-2 text-center text-[9px] font-black uppercase leading-none text-white shadow-[0_4px_18px_rgba(0,0,0,0.38)] sm:text-[10px]"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-7 grid gap-5 lg:grid-cols-[24rem_minmax(0,1fr)] lg:items-start lg:gap-10">
                {activeSlide.opened.secondaryBody ? (
                  <p
                    data-case-detail
                    className="max-w-[26rem] text-[15px] font-medium leading-[1.18] text-white/84 opacity-0 sm:text-[18px] lg:text-[20px]"
                  >
                    {activeSlide.opened.secondaryBody}
                  </p>
                ) : (
                  <div />
                )}

                <div
                  data-case-detail
                  className="grid grid-cols-2 justify-items-stretch gap-3 opacity-0 sm:grid-cols-4 sm:gap-4"
                >
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="relative aspect-[412/208] w-full max-w-[412px] overflow-hidden rounded-[6px] bg-black/45 shadow-[0_18px_46px_rgba(0,0,0,0.42)]"
                    >
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_36%,rgba(102,255,102,0.3),rgba(102,255,102,0)_28%),linear-gradient(112deg,rgba(22,121,132,0.78),rgba(8,12,13,0.44)_44%,rgba(176,116,70,0.58))]" />
                      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.12),rgba(255,255,255,0)_34%,rgba(0,0,0,0.28))]" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <nav
              data-case-detail
              className="relative z-30 grid grid-cols-[1fr_auto_1fr] items-center gap-4 border-t border-white/10 px-5 py-3 opacity-0 sm:px-7 lg:px-9"
              aria-label="Opened project navigation"
            >
              <button
                type="button"
                className="flex h-14 w-full min-w-0 items-center gap-3 text-left text-[11px] font-medium leading-none text-white transition-colors hover:text-[#66ff66] focus-visible:text-[#66ff66] sm:text-sm"
                onClick={handleOpenedPrevious}
              >
                <span className="text-4xl leading-none text-[#66ff66]">{previousGlyph}</span>
                <span className="min-w-0 truncate leading-none">{previousSlide.opened.navLabel}</span>
              </button>

              <div className="flex h-14 min-w-0 items-center justify-center text-center text-[14px] font-medium leading-none text-[#66ff66] sm:text-[22px]">
                <span className="min-w-0 truncate leading-none">{activeSlide.opened.navLabel}</span>
              </div>

              <button
                type="button"
                className="flex h-14 w-full min-w-0 items-center justify-end gap-3 text-right text-[11px] font-medium leading-none text-white transition-colors hover:text-[#66ff66] focus-visible:text-[#66ff66] sm:text-sm"
                onClick={handleOpenedNext}
              >
                <span className="min-w-0 truncate leading-none">{nextSlide.opened.navLabel}</span>
                <span className="text-4xl leading-none text-[#66ff66]">{nextGlyph}</span>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </section>
  );
}
