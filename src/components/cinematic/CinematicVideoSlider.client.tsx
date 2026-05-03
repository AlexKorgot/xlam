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

export function CinematicVideoSlider({ className = '' }: CinematicVideoSliderProps) {
  const rootRef = useRef<HTMLElement | null>(null);
  const canvasHostRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<SliderScene | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const detailsRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [overlayState, setOverlayState] = useState<CinematicOverlayState>('slider');
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const slides = useMemo(() => cinematicSlides, []);
  const activeSlide = slides[activeIndex];
  const isOpened = overlayState === 'opened' || overlayState === 'opening';

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
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleOpen = useCallback(() => {
    sceneRef.current?.open();
  }, []);

  const handleClose = useCallback(() => {
    sceneRef.current?.close();
  }, []);

  useGSAP(
    () => {
      if (!detailsRef.current || !overlayRef.current) {
        return;
      }

      const detailItems = detailsRef.current.querySelectorAll('[data-case-detail]');

      if (isOpened) {
        gsap.fromTo(
          detailItems,
          { autoAlpha: 0, y: reducedMotion ? 0 : 28 },
          {
            autoAlpha: 1,
            y: 0,
            duration: reducedMotion ? 0.01 : 0.62,
            stagger: 0.06,
            ease: 'power2.out',
            delay: overlayState === 'opened' ? 0 : 0.52,
          },
        );
        gsap.to(overlayRef.current, {
          '--cinematic-chrome-opacity': 0,
          duration: reducedMotion ? 0.01 : 0.42,
          ease: 'power2.out',
        });
        return;
      }

      gsap.to(detailItems, {
        autoAlpha: 0,
        y: reducedMotion ? 0 : 20,
        duration: reducedMotion ? 0.01 : 0.28,
        ease: 'power2.out',
      });
      gsap.to(overlayRef.current, {
        '--cinematic-chrome-opacity': 1,
        duration: reducedMotion ? 0.01 : 0.34,
        ease: 'power2.out',
      });
    },
    { scope: rootRef, dependencies: [isOpened, overlayState, reducedMotion, activeIndex] },
  );

  return (
    <section
      ref={rootRef}
      data-fullpage-scroll-ignore
      className={`font-normalidad relative isolate h-[100svh] min-h-[680px] w-full overflow-hidden bg-black text-white ${className}`}
      aria-label="Cinematic project slider"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(102,255,102,0.17)_0%,rgba(13,44,49,0.38)_28%,rgba(0,0,0,0)_60%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.76)_0%,rgba(0,0,0,0.12)_18%,rgba(0,0,0,0)_50%,rgba(0,0,0,0.18)_80%,rgba(0,0,0,0.78)_100%)]" />

      <div ref={canvasHostRef} className="absolute inset-0 z-0 cursor-pointer touch-manipulation" />

      <div
        ref={overlayRef}
        className="pointer-events-none absolute inset-0 z-10"
        style={{ '--cinematic-chrome-opacity': 1 } as CinematicChromeStyle}
      >

        <div className="absolute left-1/2 top-[12.5svh] z-10 w-full -translate-x-1/2 px-5 text-center opacity-[var(--cinematic-chrome-opacity)]">
          <p className="text-[clamp(2rem,5.1vw,4.1rem)] font-black uppercase leading-none">
            Наши <span className="text-[#66ff66]">проекты</span>
          </p>
        </div>

        <div className="absolute inset-x-0 bottom-[15.2svh] z-10 px-6 text-center opacity-[var(--cinematic-chrome-opacity)] sm:bottom-[17svh]">
          <p className="mx-auto mb-2 max-w-[28rem] text-[10px] font-medium uppercase leading-none text-white">
            {activeSlide.eyebrow}
          </p>
          <h2 className="mx-auto max-w-[34rem] text-[clamp(1.3rem,3vw,2.25rem)] font-black uppercase leading-[0.96] text-[#66ff66]">
            {activeSlide.title}
          </h2>
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
          <div className="max-w-4xl">
            <p data-case-detail className="mb-4 text-xs font-black uppercase tracking-[0.32em] text-[#66ff66] opacity-0">
              {activeSlide.client} / {activeSlide.year}
            </p>
            <h3
              data-case-detail
              className="max-w-[12ch] text-[clamp(3.2rem,9vw,8.5rem)] font-black uppercase leading-[0.86] opacity-0"
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
                WebGL case
              </div>
              <div className="border border-white/16 p-4">
                <span className="mb-2 block text-white/34">Motion</span>
                Live texture
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                className="h-11 flex-1 border border-[#66ff66] px-5 text-[11px] font-black uppercase text-[#66ff66] transition-colors hover:bg-[#66ff66] hover:text-black focus-visible:bg-[#66ff66] focus-visible:text-black"
              >
                Brief us
              </button>
              <button
                type="button"
                className="h-11 border border-white/55 px-5 text-[11px] font-black uppercase text-white transition-colors hover:border-[#66ff66] hover:text-[#66ff66] focus-visible:border-[#66ff66] focus-visible:text-[#66ff66]"
                onClick={handleClose}
              >
                Close
              </button>
            </div>

            {autoplayBlocked ? (
              <button
                type="button"
                className="mt-3 w-full border border-white/24 px-4 py-3 text-[10px] font-black uppercase text-white/68"
                onClick={handleOpen}
              >
                Tap to resume video
              </button>
            ) : null}
          </aside>
        </div>
      </div>
    </section>
  );
}
