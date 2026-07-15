'use client';

import { forwardRef, useImperativeHandle, useRef } from 'react';
import type {
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
} from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useContactModal } from '@/src/components/ui/contact-modal';
import { publicAssetPath } from '@/src/lib/publicAssetPath';

const TAGLINE =
  'Мы делаем шоу для платформ, рекламу для брендов и контент для бизнеса. Такие дела.';

const onlyBgVideo = publicAssetPath('/video/only_bg.mp4');
const EXPANDED_PLAY_BUTTON_TAP_THRESHOLD = 10;
const mobileXClipPath =
  'polygon(99.943% 100%, 66.277% 48.911%, 91.502% 0%, 65.893% 0%, 49.971% 24.158%, 34.050% 0%, 8.440% 0%, 33.666% 48.911%, 0% 100%, 39.996% 100%, 49.971% 80.693%, 59.947% 100%)';

gsap.registerPlugin(useGSAP);

export interface MobileXHeroSectionHandle {
  revealExpandedVideo: () => void;
  hideExpandedVideo: () => void;
  fadeExpandedVideoOut: () => void;
  fadeExpandedVideoIn: () => void;
  isExpandedVideoVisible: () => boolean;
}

export const MobileXHeroSection = forwardRef<MobileXHeroSectionHandle>(function MobileXHeroSection(
  _props,
  ref,
) {
  const { openContactModal } = useContactModal();
  const rootRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const expandedVideoFrameRef = useRef<HTMLDivElement | null>(null);
  const expandedVideoRef = useRef<HTMLVideoElement | null>(null);
  const expandedPlayButtonRef = useRef<HTMLButtonElement | null>(null);
  const expandedPlayButtonTimeoutRef = useRef<number | null>(null);
  const expandedPlayButtonPointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const expandedTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const isExpandedVideoVisibleRef = useRef(false);
  const isExpandedVideoPlayingRef = useRef(false);
  const shouldSuppressExpandedPlayClickRef = useRef(false);
  useGSAP(
    () => {
      gsap.set(expandedVideoFrameRef.current, {
        autoAlpha: 0,
        clipPath: 'inset(26% 12% 24% 12%)',
        filter: 'blur(12px)',
        scale: 0.78,
        transformOrigin: 'center center',
      });
      gsap.set(expandedPlayButtonRef.current, {
        autoAlpha: 0,
        scale: 0.94,
        transformOrigin: 'center center',
      });
    },
    { scope: rootRef },
  );

  const clearExpandedPlayButtonTimeout = () => {
    if (expandedPlayButtonTimeoutRef.current === null) {
      return;
    }

    window.clearTimeout(expandedPlayButtonTimeoutRef.current);
    expandedPlayButtonTimeoutRef.current = null;
  };

  const showExpandedPlayButton = () => {
    gsap.to(expandedPlayButtonRef.current, {
      autoAlpha: 1,
      scale: 1,
      duration: 0.28,
      ease: 'power2.out',
      overwrite: 'auto',
    });
  };

  const hideExpandedPlayButton = () => {
    gsap.to(expandedPlayButtonRef.current, {
      autoAlpha: 0,
      scale: 0.94,
      duration: 0.38,
      ease: 'sine.out',
      overwrite: 'auto',
    });
  };

  const syncExpandedPlayButtonState = () => {
    const button = expandedPlayButtonRef.current;

    if (!button) {
      return;
    }

    button.dataset.playing = isExpandedVideoPlayingRef.current ? 'true' : 'false';
    button.setAttribute(
      'aria-label',
      isExpandedVideoPlayingRef.current ? 'Pause video' : 'Play video',
    );
  };

  const playExpandedVideo = (video: HTMLVideoElement) => {
    video.play().catch(() => {
      isExpandedVideoPlayingRef.current = false;
      syncExpandedPlayButtonState();
      clearExpandedPlayButtonTimeout();
      showExpandedPlayButton();
    });
  };

  const pauseExpandedVideo = (video: HTMLVideoElement) => {
    video.pause();
    isExpandedVideoPlayingRef.current = false;
    syncExpandedPlayButtonState();
    clearExpandedPlayButtonTimeout();
    showExpandedPlayButton();
  };

  const resetExpandedVideoPlayback = () => {
    const video = expandedVideoRef.current;

    if (video) {
      video.pause();

      if (video.currentTime !== 0) {
        video.currentTime = 0;
      }
    }

    isExpandedVideoPlayingRef.current = false;
    syncExpandedPlayButtonState();
    clearExpandedPlayButtonTimeout();
    gsap.set(expandedPlayButtonRef.current, {
      autoAlpha: 1,
      scale: 1,
    });
  };

  const handleExpandedVideoPlay = () => {
    const video = expandedVideoRef.current;

    if (!video) {
      return;
    }

    if (!video.paused) {
      pauseExpandedVideo(video);
      return;
    }

    playExpandedVideo(video);
  };

  const handleExpandedPlayButtonPointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    expandedPlayButtonPointerStartRef.current = {
      x: event.clientX,
      y: event.clientY,
    };
    shouldSuppressExpandedPlayClickRef.current = false;
  };

  const handleExpandedPlayButtonPointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const start = expandedPlayButtonPointerStartRef.current;

    if (!start) {
      return;
    }

    const deltaX = event.clientX - start.x;
    const deltaY = event.clientY - start.y;

    if (Math.hypot(deltaX, deltaY) > EXPANDED_PLAY_BUTTON_TAP_THRESHOLD) {
      shouldSuppressExpandedPlayClickRef.current = true;
    }
  };

  const handleExpandedPlayButtonPointerCancel = () => {
    expandedPlayButtonPointerStartRef.current = null;
    shouldSuppressExpandedPlayClickRef.current = false;
  };

  const handleExpandedPlayButtonClick = (event: ReactMouseEvent<HTMLButtonElement>) => {
    expandedPlayButtonPointerStartRef.current = null;

    if (shouldSuppressExpandedPlayClickRef.current) {
      event.preventDefault();
      event.stopPropagation();
      shouldSuppressExpandedPlayClickRef.current = false;
      return;
    }

    event.stopPropagation();
    handleExpandedVideoPlay();
  };

  const handleExpandedVideoEnded = () => {
    resetExpandedVideoPlayback();
    showExpandedPlayButton();
  };

  const handleExpandedVideoPause = () => {
    if (!isExpandedVideoVisibleRef.current) {
      return;
    }

    isExpandedVideoPlayingRef.current = false;
    syncExpandedPlayButtonState();
    clearExpandedPlayButtonTimeout();
    showExpandedPlayButton();
  };

  const handleExpandedVideoPlayEvent = () => {
    if (!isExpandedVideoVisibleRef.current) {
      return;
    }

    isExpandedVideoPlayingRef.current = true;
    syncExpandedPlayButtonState();
    clearExpandedPlayButtonTimeout();
    hideExpandedPlayButton();
  };

  const handleExpandedVideoFrameClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    event.preventDefault();

    if ((event.target as HTMLElement | null)?.closest('button')) {
      return;
    }

    const video = expandedVideoRef.current;

    if (!video || video.paused) {
      showExpandedPlayButton();
      return;
    }

    pauseExpandedVideo(video);
  };

  useGSAP(
    () => () => {
      clearExpandedPlayButtonTimeout();
      expandedTimelineRef.current?.kill();
      expandedVideoRef.current?.pause();
      expandedTimelineRef.current = null;
    },
    { scope: rootRef },
  );

  useImperativeHandle(ref, () => ({
    revealExpandedVideo() {
      const expandedFrame = expandedVideoFrameRef.current;
      const expandedVideo = expandedVideoRef.current;

      if (!expandedFrame || !expandedVideo || isExpandedVideoVisibleRef.current) {
        return;
      }

      isExpandedVideoVisibleRef.current = true;
      clearExpandedPlayButtonTimeout();
      expandedTimelineRef.current?.kill();
      expandedTimelineRef.current = gsap.timeline({
        defaults: {
          ease: 'power2.out',
        },
      });

      expandedTimelineRef.current
        .to(contentRef.current, {
          autoAlpha: 0,
          filter: 'blur(14px)',
          scale: 0.97,
          duration: 0.55,
          transformOrigin: 'center center',
        }, 0)
        .to(expandedFrame, {
          autoAlpha: 1,
          clipPath: 'inset(0% 0% 0% 0%)',
          filter: 'blur(0px)',
          scale: 1,
          duration: 0.92,
        }, 0.08);
      expandedTimelineRef.current.to(expandedPlayButtonRef.current, {
        autoAlpha: 0,
        scale: 0.94,
        duration: 0.2,
        ease: 'power2.out',
      }, 0.44);
      playExpandedVideo(expandedVideo);
    },
    hideExpandedVideo() {
      const expandedFrame = expandedVideoFrameRef.current;

      expandedTimelineRef.current?.kill();
      isExpandedVideoVisibleRef.current = false;
      isExpandedVideoPlayingRef.current = false;
      clearExpandedPlayButtonTimeout();
      syncExpandedPlayButtonState();

      gsap.timeline({
        defaults: {
          ease: 'power2.out',
        },
      })
        .to(expandedFrame, {
          autoAlpha: 0,
          clipPath: 'inset(26% 12% 24% 12%)',
          filter: 'blur(12px)',
          scale: 0.78,
          duration: 0.48,
        }, 0)
        .to(expandedPlayButtonRef.current, {
          autoAlpha: 0,
          scale: 0.94,
          duration: 0.2,
        }, 0)
        .to(contentRef.current, {
          autoAlpha: 1,
          filter: 'blur(0px)',
          scale: 1,
          duration: 0.42,
          clearProps: 'visibility,opacity,filter,scale',
        }, 0.12)
        .call(() => {
          resetExpandedVideoPlayback();
          gsap.set(expandedPlayButtonRef.current, {
            autoAlpha: 0,
            scale: 0.94,
          });
        });
    },
    fadeExpandedVideoOut() {
      if (!isExpandedVideoVisibleRef.current) {
        return;
      }

      gsap.to(expandedVideoFrameRef.current, {
        autoAlpha: 0,
        duration: 0.75,
        ease: 'sine.out',
        overwrite: 'auto',
        onComplete: resetExpandedVideoPlayback,
      });
      gsap.to(expandedPlayButtonRef.current, {
        autoAlpha: 0,
        scale: 0.94,
        duration: 0.28,
        ease: 'sine.out',
        overwrite: 'auto',
      });
    },
    fadeExpandedVideoIn() {
      if (!isExpandedVideoVisibleRef.current) {
        return;
      }

      gsap.to(expandedVideoFrameRef.current, {
        autoAlpha: 1,
        clipPath: 'inset(0% 0% 0% 0%)',
        filter: 'blur(0px)',
        scale: 1,
        duration: 0.75,
        ease: 'sine.out',
        overwrite: 'auto',
      });
      gsap.to(expandedPlayButtonRef.current, {
        autoAlpha: isExpandedVideoPlayingRef.current ? 0 : 1,
        scale: isExpandedVideoPlayingRef.current ? 0.94 : 1,
        duration: 0.32,
        delay: 0.22,
        ease: 'sine.out',
        overwrite: 'auto',
      });
    },
    isExpandedVideoVisible() {
      return isExpandedVideoVisibleRef.current;
    },
  }));

  return (
    <section
      ref={rootRef}
      className="relative isolate flex h-full min-h-0 w-full overflow-hidden bg-black font-normalidad text-white min-[1000px]:hidden"
    >
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src={onlyBgVideo}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
      />

      <div className="absolute inset-0 bg-black/24" aria-hidden="true" />
      <div
        className="absolute inset-x-0 top-0 h-[18svh] bg-gradient-to-b from-black/70 via-black/24 to-transparent"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 bottom-0 h-[34svh] bg-gradient-to-t from-black/86 via-black/44 to-transparent"
        aria-hidden="true"
      />

      <div
        ref={expandedVideoFrameRef}
        className="absolute inset-0 z-10 overflow-hidden bg-black"
        onClick={handleExpandedVideoFrameClick}
      >
        <video
          ref={expandedVideoRef}
          className="h-full w-full scale-x-[-1] object-cover brightness-110 contrast-110"
          src={onlyBgVideo}
          muted
          playsInline
          preload="auto"
          onEnded={handleExpandedVideoEnded}
          onPause={handleExpandedVideoPause}
          onPlay={handleExpandedVideoPlayEvent}
        />
        <div className="absolute inset-0 bg-black/12" />
        <button
          ref={expandedPlayButtonRef}
          type="button"
          data-playing="false"
          className="group absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#66ff66] text-black opacity-0 shadow-[0_0_44px_rgba(102,255,102,0.42)] transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#66ff66]"
          aria-label="Play video"
          onClick={handleExpandedPlayButtonClick}
          onPointerDown={handleExpandedPlayButtonPointerDown}
          onPointerMove={handleExpandedPlayButtonPointerMove}
          onPointerCancel={handleExpandedPlayButtonPointerCancel}
        >
          <span
            aria-hidden="true"
            className="absolute ml-1 h-0 w-0 border-y-[10px] border-l-[16px] border-y-transparent border-l-black transition-[opacity,transform] duration-200 group-data-[playing=true]:scale-75 group-data-[playing=true]:opacity-0"
          />
          <span
            aria-hidden="true"
            className="absolute h-6 w-1.5 -translate-x-2 scale-75 bg-black opacity-0 transition-[opacity,transform] duration-200 group-data-[playing=true]:scale-100 group-data-[playing=true]:opacity-100"
          />
          <span
            aria-hidden="true"
            className="absolute h-6 w-1.5 translate-x-2 scale-75 bg-black opacity-0 transition-[opacity,transform] duration-200 group-data-[playing=true]:scale-100 group-data-[playing=true]:opacity-100"
          />
        </button>
      </div>

      <div
        ref={contentRef}
        className="relative z-20 flex h-full w-full flex-col items-center px-[30px] pb-[max(2rem,env(safe-area-inset-bottom))] pt-[calc(var(--header-offset)+0.75rem)]"
      >
        <div className="relative flex min-h-0 flex-1 items-center justify-center self-stretch">
          <div className="absolute left-1/2 top-1/2 aspect-[376/360] w-[min(88vw,calc(50svh*376/360),376px)] -translate-x-1/2 -translate-y-[52%]">
            <div
              className="absolute inset-0 overflow-hidden bg-white/10"
              style={{ clipPath: mobileXClipPath, WebkitClipPath: mobileXClipPath }}
              aria-hidden="true"
            >
              <video
                className="h-full w-full scale-x-[-1] object-cover brightness-125 contrast-110"
                src={onlyBgVideo}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
              />
            </div>
            <svg
              className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
              viewBox="0 0 376 360"
              role="img"
              aria-label="Зеркальная буква Х"
            >
              <defs>
                <filter id="mobile-x-hero-grain">
                  <feTurbulence
                    type="fractalNoise"
                    baseFrequency="0.72"
                    numOctaves="2"
                    seed="11"
                    result="grain"
                  />
                  <feColorMatrix in="grain" type="saturate" values="0" result="monoGrain" />
                  <feComponentTransfer>
                    <feFuncA type="table" tableValues="0 0.18" />
                  </feComponentTransfer>
                  <feComposite in2="SourceAlpha" operator="in" />
                </filter>
              </defs>

              <path
                d="M375.785 360L249.201 176.079L344.048 0H247.758L187.892 86.9703L128.026 0H31.7361L126.584 176.079L0 360H150.386L187.892 290.495L225.399 360H375.785Z"
                filter="url(#mobile-x-hero-grain)"
                fill="rgba(255,255,255,0.16)"
              />
            </svg>
          </div>

          <h1 className="relative z-10 mt-[8svh] w-full max-w-[23rem] text-center text-[clamp(3.35rem,17.5vw,4.85rem)] font-black uppercase leading-[0.86] tracking-normal drop-shadow-[0_12px_28px_rgba(0,0,0,0.58)] [@media_(max-width:999.98px)_and_(max-height:520px)]:hidden">
            <span className="block">ХЛАМ</span>
            <span className="block">
              MEDI<span className="text-[#66ff66]">A</span>
            </span>
          </h1>

          <p
            className="relative z-10 mt-[2svh] hidden max-w-full whitespace-nowrap text-center text-[clamp(2rem,8vw,3rem)] font-black uppercase leading-none tracking-normal drop-shadow-[0_12px_28px_rgba(0,0,0,0.62)] [@media_(max-width:999.98px)_and_(max-height:520px)]:block"
            aria-label="ХЛАМ MEDIA"
          >
            ХЛАМ MEDI<span className="text-[#66ff66]">A</span>
          </p>
        </div>

        <div className="relative z-20 w-full shrink-0 pb-[calc(0.75rem+env(safe-area-inset-bottom))] text-center">
          <p className="mx-auto max-w-[23rem] text-[clamp(1rem,4.1vw,1.1rem)] font-black uppercase leading-[1.12] text-white drop-shadow-[0_10px_24px_rgba(0,0,0,0.72)]">
            {TAGLINE}
          </p>

          <button
            type="button"
            className="mt-[22px] flex h-[54px] w-full items-center justify-center border border-white/88 bg-white/[0.08] px-5 text-center text-[clamp(1.05rem,4.5vw,1.25rem)] font-bold uppercase leading-none text-white shadow-[0_20px_70px_rgba(0,0,0,0.5),inset_0_0_32px_rgba(255,255,255,0.08)] backdrop-blur-[9px] transition-colors hover:border-[#66ff66] hover:text-[#66ff66] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            onClick={openContactModal}
          >
            Заказать проект
          </button>
        </div>
      </div>
    </section>
  );
});
