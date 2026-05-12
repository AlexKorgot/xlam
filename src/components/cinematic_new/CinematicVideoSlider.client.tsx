'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Container } from '@/src/components/ui/grid/Container';
import { cinematicSlides } from './data';
import { SliderScene } from './SliderScene';
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

export function CinematicVideoSlider({ className = '' }: CinematicVideoSliderProps) {
  const rootRef = useRef<HTMLElement | null>(null);
  const canvasHostRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<SliderScene | null>(null);
  const chromeRef = useRef<HTMLDivElement | null>(null);
  const labelRef = useRef<HTMLDivElement | null>(null);
  const detailsRef = useRef<HTMLDivElement | null>(null);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [overlayState, setOverlayState] = useState<CinematicOverlayState>('slider');
  const [reducedMotion, setReducedMotion] = useState(false);
  const slides = useMemo(() => cinematicSlides, []);
  const activeSlide = slides[activeIndex];
  const slideCount = slides.length;
  const previousSlide = slides[(activeIndex - 1 + slideCount) % slideCount];
  const nextSlide = slides[(activeIndex + 1) % slideCount];
  const isOpened = overlayState === 'opened' || overlayState === 'opening';
  const isChromeVisible = overlayState === 'slider' || overlayState === 'sliding';

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

      scene.handlePointerGesture(start.x, start.y, event.clientX, event.clientY);
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
  }, [reducedMotion, slides]);

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

  const handleOpen = useCallback(() => {
    sceneRef.current?.open();
  }, []);

  useGSAP(
    () => {
      if (!chromeRef.current || !detailsRef.current) {
        return;
      }

      const detailItems = detailsRef.current.querySelectorAll('[data-case-detail]');

      gsap.to(chromeRef.current, {
        '--cinematic-chrome-opacity': isChromeVisible ? 1 : 0,
        duration: reducedMotion ? 0.01 : 0.36,
        ease: 'power2.out',
      });

      if (isOpened) {
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

      gsap.to(detailItems, {
        autoAlpha: 0,
        y: reducedMotion ? 0 : 16,
        duration: reducedMotion ? 0.01 : 0.24,
        ease: 'power2.out',
      });
    },
    { scope: rootRef, dependencies: [isChromeVisible, isOpened, overlayState, reducedMotion] },
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
      className={`font-normalidad group relative isolate h-[100svh] min-h-[620px] w-full overflow-hidden bg-black text-white ${className}`}
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
            {openLabel}
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
        className={`absolute inset-0 z-20 py-7 transition-opacity duration-300 ${
          isOpened ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-hidden={!isOpened}
      >
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[42svh] bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,8,8,0.72)_44%,rgba(0,8,8,0.96)_100%)] backdrop-blur-[2px]" />

        <Container>
          <div className="relative grid min-h-[calc(100svh-3.5rem)] grid-rows-[1fr_auto] gap-5">
            <div className="grid content-end gap-5 pb-[3.2svh] lg:gap-8">
              <div className="grid gap-5 lg:grid-cols-[minmax(0,50.4rem)_minmax(28rem,1fr)] lg:items-end lg:gap-20">
                <div data-case-detail className="opacity-0">
                  <h3 className="max-w-[16ch] text-[2.5rem] font-black uppercase leading-[0.88] text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.65)] sm:text-[4.75rem] lg:max-w-none lg:text-[clamp(4.4rem,7.25vw,9.1rem)]">
                    <span className="block text-[0.56em]">{activeSlide.opened.titleLead}</span>
                    <span className="block whitespace-nowrap text-[#66ff66]">{activeSlide.opened.titleAccent}</span>
                  </h3>

                  <p className="mt-5 max-w-[54rem] text-[15px] font-medium leading-[1.1] text-white drop-shadow-[0_4px_18px_rgba(0,0,0,0.7)] sm:text-[18px] lg:text-[22px]">
                    {activeSlide.opened.body}
                  </p>
                </div>

                <div data-case-detail className="opacity-0 lg:pb-3">
                  <div className="grid grid-cols-2 gap-x-2 gap-y-[11px] sm:grid-cols-5 lg:ml-auto lg:max-w-[54rem]">
                    {[...activeSlide.opened.services, ...activeSlide.opened.services].map((service, index) => (
                      <span
                        key={`${service}-${index}`}
                        className="flex h-7 min-w-0 items-center justify-center border border-white/82 px-2 text-center text-[9px] font-black uppercase leading-none text-white shadow-[0_4px_18px_rgba(0,0,0,0.38)] sm:text-[10px] lg:w-[8.35rem]"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-[26.5rem_minmax(0,1fr)] lg:items-start lg:gap-20">
                {activeSlide.opened.secondaryBody ? (
                  <p
                    data-case-detail
                    className="max-w-[26rem] text-[15px] font-medium leading-[1.1] text-white opacity-0 drop-shadow-[0_4px_18px_rgba(0,0,0,0.7)] sm:text-[18px] lg:text-[22px]"
                  >
                    {activeSlide.opened.secondaryBody}
                  </p>
                ) : (
                  <div />
                )}

                <div
                  data-case-detail
                  className="grid grid-cols-2 justify-items-stretch gap-4 opacity-0 sm:grid-cols-4 sm:gap-5 lg:gap-5"
                >
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="relative aspect-[412/208] w-full max-w-[412px] overflow-hidden bg-black/45 shadow-[0_18px_46px_rgba(0,0,0,0.42)]"
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
              className="relative z-30 grid grid-cols-[1fr_auto_1fr] items-center gap-4 pb-[2.1svh] opacity-0"
              aria-label="Opened project navigation"
            >
              <button
                type="button"
                className="flex h-14 w-full min-w-0 items-center gap-3 text-left text-[11px] font-medium text-white transition-colors hover:text-[#66ff66] focus-visible:text-[#66ff66] sm:text-sm"
                onClick={handleOpenedPrevious}
              >
                <span className="text-4xl leading-none text-[#66ff66]">{previousGlyph}</span>
                <span className="truncate">{previousSlide.opened.navLabel}</span>
              </button>

              <div className="min-w-0 text-center text-[14px] font-medium text-[#66ff66] sm:text-[22px]">
                <span className="truncate">{activeSlide.opened.navLabel}</span>
              </div>

              <button
                type="button"
                className="flex h-14 w-full min-w-0 items-center justify-end gap-3 text-right text-[11px] font-medium text-white transition-colors hover:text-[#66ff66] focus-visible:text-[#66ff66] sm:text-sm"
                onClick={handleOpenedNext}
              >
                <span className="truncate">{nextSlide.opened.navLabel}</span>
                <span className="text-4xl leading-none text-[#66ff66]">{nextGlyph}</span>
              </button>
            </nav>
          </div>
        </Container>
      </div>
    </section>
  );
}
