'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
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
const closeLabel = '\u0417\u0430\u043a\u0440\u044b\u0442\u044c';
const resumeLabel = '\u0417\u0430\u043f\u0443\u0441\u0442\u0438\u0442\u044c \u0432\u0438\u0434\u0435\u043e';
const previousGlyph = '\u2039';
const nextGlyph = '\u203a';

export function CinematicVideoSlider({ className = '' }: CinematicVideoSliderProps) {
  const rootRef = useRef<HTMLElement | null>(null);
  const canvasHostRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<SliderScene | null>(null);
  const chromeRef = useRef<HTMLDivElement | null>(null);
  const labelRef = useRef<HTMLDivElement | null>(null);
  const detailsRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [overlayState, setOverlayState] = useState<CinematicOverlayState>('slider');
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const slides = useMemo(() => cinematicSlides, []);
  const activeSlide = slides[activeIndex];
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
      onAutoplayBlocked: () => setAutoplayBlocked(true),
    });

    sceneRef.current = scene;

    const canvas = scene.getCanvasElement();
    const handlePointerUp = (event: PointerEvent) => {
      scene.handlePointer(event.clientX, event.clientY);
    };

    canvas.addEventListener('pointerup', handlePointerUp);

    return () => {
      canvas.removeEventListener('pointerup', handlePointerUp);
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

  const handleOpen = useCallback(() => {
    sceneRef.current?.open();
  }, []);

  const handleClose = useCallback(() => {
    sceneRef.current?.close();
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
      className={`font-normalidad group relative isolate h-[100svh] min-h-[620px] w-full overflow-hidden bg-[#458294] text-white ${className}`}
      aria-label="Cinematic project slider"
    >
      {/*<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(102,255,102,0.045)_0%,rgba(24,64,65,0.3)_30%,rgba(0,0,0,0)_64%)]" />*/}
      {/*<div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.62)_0%,rgba(0,0,0,0.12)_42%,rgba(0,0,0,0.62)_100%)]" />*/}
      {/*<div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.88)_0%,rgba(0,0,0,0.28)_18%,rgba(0,0,0,0)_50%,rgba(0,0,0,0.32)_82%,rgba(0,0,0,0.9)_100%)]" />*/}

      <div ref={canvasHostRef} className="absolute inset-0 z-0 cursor-pointer touch-manipulation" />

      <div
        ref={chromeRef}
        className="pointer-events-none absolute inset-0 z-10"
        style={{ '--cinematic-chrome-opacity': 1 } as CinematicChromeStyle}
      >
        <div className="absolute left-1/2 top-[16.5svh] z-10 w-full -translate-x-1/2 px-5 text-center opacity-[var(--cinematic-chrome-opacity)]">
          <h2 className="text-[2rem] font-black uppercase leading-none md:text-[2.75rem] xl:text-[3.75rem]">
            {headingLead} <span className="text-[#66ff66]">{headingAccent}</span>
          </h2>
        </div>

        <div
          ref={labelRef}
          className="absolute inset-x-0 top-[calc(50%+16svh)] z-10 px-6 text-center opacity-[var(--cinematic-chrome-opacity)] md:top-[calc(50%+17svh)]"
        >
          <p data-slide-label className="mx-auto mb-2 max-w-[28rem] text-[9px] font-black uppercase leading-none text-white md:text-[10px]">
            {activeSlide.eyebrow}
          </p>
          <h3
            data-slide-label
            className="mx-auto max-w-[34rem] text-[1rem] font-black uppercase leading-none text-[#66ff66] md:text-[1.35rem] xl:text-[1.875rem]"
          >
            {activeSlide.title}
          </h3>
        </div>

        <div className="pointer-events-auto absolute bottom-[4.5svh] left-1/2 z-20 flex -translate-x-1/2 items-center gap-5 opacity-0 transition-opacity duration-300 group-hover:opacity-[calc(var(--cinematic-chrome-opacity)*0.72)] focus-within:opacity-[var(--cinematic-chrome-opacity)]">
          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-full border border-white/12 bg-white/[0.04] text-lg font-black text-white/48 backdrop-blur-md transition-colors hover:border-[#66ff66]/55 hover:text-[#66ff66] focus-visible:border-[#66ff66] focus-visible:text-[#66ff66] md:h-10 md:w-10"
            onClick={handlePrevious}
            aria-label="Previous project"
          >
            {previousGlyph}
          </button>
          <button
            type="button"
            className="h-9 border border-white/14 bg-white/[0.055] px-6 text-[9px] font-black uppercase tracking-[0.28em] text-white/74 backdrop-blur-md transition-colors hover:border-[#66ff66]/60 hover:text-[#66ff66] focus-visible:border-[#66ff66] focus-visible:text-[#66ff66] md:h-10 md:px-7 md:text-[10px]"
            onClick={handleOpen}
          >
            {openLabel}
          </button>
          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-full border border-white/12 bg-white/[0.04] text-lg font-black text-white/48 backdrop-blur-md transition-colors hover:border-[#66ff66]/55 hover:text-[#66ff66] focus-visible:border-[#66ff66] focus-visible:text-[#66ff66] md:h-10 md:w-10"
            onClick={handleNext}
            aria-label="Next project"
          >
            {nextGlyph}
          </button>
        </div>
      </div>

      <div
        ref={detailsRef}
        className={`pointer-events-none absolute inset-0 z-20 flex items-end px-6 pb-8 sm:px-10 lg:px-16 ${
          isOpened ? 'pointer-events-auto' : ''
        }`}
        aria-hidden={!isOpened}
      >
        <div className="grid w-full items-end gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="max-w-5xl">
            <p data-case-detail className="mb-4 text-xs font-black uppercase tracking-[0.28em] text-[#66ff66] opacity-0">
              {activeSlide.client} / {activeSlide.year}
            </p>
            <h3
              data-case-detail
              className="max-w-[13ch] text-[3rem] font-black uppercase leading-[0.88] opacity-0 md:text-[5.5rem] xl:text-[8rem]"
            >
              {activeSlide.title}
            </h3>
            <p
              data-case-detail
              className="mt-6 max-w-2xl text-sm font-medium uppercase leading-relaxed text-white/78 opacity-0 sm:text-base"
            >
              {activeSlide.description}
            </p>
          </div>

          <aside data-case-detail className="opacity-0">
            <div className="mb-5 flex flex-wrap gap-2">
              {activeSlide.tags.map((tag) => (
                <span
                  key={tag}
                  className="border border-white/22 px-3 py-2 text-[10px] font-black uppercase text-white/78"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 text-[10px] font-black uppercase text-white/58">
              <div className="border border-white/16 p-4">
                <span className="mb-2 block text-white/34">Format</span>
                Case film
              </div>
              <div className="border border-white/16 p-4">
                <span className="mb-2 block text-white/34">Motion</span>
                Live cut
              </div>
            </div>

            <button
              type="button"
              className="mt-5 h-11 w-full border border-white/55 px-5 text-[11px] font-black uppercase text-white transition-colors hover:border-[#66ff66] hover:text-[#66ff66] focus-visible:border-[#66ff66] focus-visible:text-[#66ff66]"
              onClick={handleClose}
            >
              {closeLabel}
            </button>

            {autoplayBlocked ? (
              <button
                type="button"
                className="mt-3 w-full border border-[#66ff66]/60 px-4 py-3 text-[10px] font-black uppercase text-[#66ff66]"
                onClick={handleOpen}
              >
                {resumeLabel}
              </button>
            ) : null}
          </aside>
        </div>
      </div>
    </section>
  );
}
