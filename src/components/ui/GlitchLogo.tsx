'use client';

import {
  forwardRef,
  useImperativeHandle,
  useRef,
  type CSSProperties,
} from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import Logo from '@/src/lib/assets/logo.svg';

gsap.registerPlugin(useGSAP);

export interface GlitchLogoHandle {
  play: () => void;
}

interface GlitchLogoProps {
  intensity: 'hero' | 'header';
  width: number;
  height: number;
  sizes: string;
  className: string;
}

const HERO_WORDMARK_BOTTOM = '49.54%';
const HERO_MEDIA_TOP = '55.75%';

const layerStyle: CSSProperties = {
  position: 'absolute',
  inset: 0,
  opacity: 0,
  visibility: 'hidden',
  pointerEvents: 'none',
};

export const GlitchLogo = forwardRef<GlitchLogoHandle, GlitchLogoProps>(
  function GlitchLogo({ intensity, width, height, sizes, className }, ref) {
    const rootRef = useRef<HTMLDivElement>(null);
    const redRef = useRef<HTMLDivElement>(null);
    const greenRef = useRef<HTMLDivElement>(null);
    const timelineRef = useRef<gsap.core.Timeline | null>(null);
    const imageReadyRef = useRef(false);
    const queuedPlayRef = useRef(false);

    const flushQueuedPlay = () => {
      if (!queuedPlayRef.current || !imageReadyRef.current || !timelineRef.current) {
        return;
      }

      queuedPlayRef.current = false;

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }

      timelineRef.current.restart();
    };

    useGSAP(
      () => {
        if (!redRef.current || !greenRef.current) {
          return;
        }

        const channels = [redRef.current, greenRef.current];
        const redAlpha = intensity === 'hero' ? 0.9 : 0.72;
        const greenAlpha = intensity === 'hero' ? 0.82 : 0.62;
        const channelFrames = intensity === 'hero'
          ? [
              ['inset(3% 0 82%)', 'inset(21% 0 66%)'],
              ['inset(28% 0 57%)', 'inset(8% 0 74%)'],
              [`inset(39% 0 ${HERO_WORDMARK_BOTTOM})`, 'inset(0 0 87%)'],
            ]
          : [
              ['inset(4% 0 80%)', 'inset(23% 0 61%)'],
              ['inset(43% 0 38%)', 'inset(64% 0 18%)'],
              ['inset(14% 0 63%)', 'inset(49% 0 30%)'],
            ];

        gsap.set(channels, { autoAlpha: 0 });

        timelineRef.current = gsap
          .timeline({
            paused: true,
            onComplete: () => {
              gsap.set(channels, { autoAlpha: 0 });
            },
          })
          .set(
            redRef.current,
            { autoAlpha: redAlpha, clipPath: channelFrames[0][0] },
            0,
          )
          .set(
            greenRef.current,
            { autoAlpha: greenAlpha, clipPath: channelFrames[0][1] },
            0.025,
          )
          .set(redRef.current, { autoAlpha: 0 }, 0.07)
          .set(greenRef.current, { autoAlpha: 0 }, 0.095)
          .set(
            redRef.current,
            { autoAlpha: redAlpha * 0.78, clipPath: channelFrames[1][0] },
            0.13,
          )
          .set(
            greenRef.current,
            { autoAlpha: greenAlpha * 0.82, clipPath: channelFrames[1][1] },
            0.155,
          )
          .set(redRef.current, { autoAlpha: 0 }, 0.215)
          .set(greenRef.current, { autoAlpha: 0 }, 0.235)
          .set(
            redRef.current,
            { autoAlpha: redAlpha * 0.62, clipPath: channelFrames[2][0] },
            0.28,
          )
          .set(
            greenRef.current,
            { autoAlpha: greenAlpha * 0.7, clipPath: channelFrames[2][1] },
            0.305,
          )
          .set(channels, { autoAlpha: 0 }, 0.38);

        flushQueuedPlay();

        return () => {
          timelineRef.current?.kill();
          timelineRef.current = null;
        };
      },
      { scope: rootRef, dependencies: [intensity] },
    );

    useImperativeHandle(ref, () => ({
      play() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          return;
        }

        if (!imageReadyRef.current || !timelineRef.current) {
          queuedPlayRef.current = true;
          return;
        }

        timelineRef.current.restart();
      },
    }));

    const handleBaseImageLoad = () => {
      imageReadyRef.current = true;
      flushQueuedPlay();
    };

    const imageProps = {
      src: Logo,
      unoptimized: true,
      width,
      height,
      sizes,
      className,
      draggable: false,
      loading: 'eager',
    } as const;
    const isHero = intensity === 'hero';
    const heroChannelClipPath = `inset(0 0 ${HERO_WORDMARK_BOTTOM})`;
    const redClipPath = isHero ? heroChannelClipPath : 'inset(8% 0 47%)';
    const greenClipPath = isHero ? heroChannelClipPath : 'inset(48% 0 10%)';

    return (
      <div ref={rootRef} className="relative w-full">
        {isHero && (
          <Image
            {...imageProps}
            alt="XLAM Media"
            fetchPriority="high"
            onLoad={handleBaseImageLoad}
            style={{ clipPath: `inset(${HERO_MEDIA_TOP} 0 0)` }}
          />
        )}

        <div
          className={isHero
            ? 'absolute inset-0 w-full'
            : 'relative w-full'}
        >
          <Image
            {...imageProps}
            alt={isHero ? '' : 'XLAM Media'}
            aria-hidden={isHero ? 'true' : undefined}
            fetchPriority="high"
            onLoad={isHero ? undefined : handleBaseImageLoad}
            style={isHero
              ? { clipPath: `inset(0 0 ${HERO_WORDMARK_BOTTOM})` }
              : undefined}
          />

          <div
            ref={redRef}
            aria-hidden="true"
            style={{
              ...layerStyle,
              clipPath: redClipPath,
              filter:
                'brightness(0) saturate(100%) invert(14%) sepia(99%) saturate(7494%) hue-rotate(359deg) brightness(105%) contrast(116%)',
              mixBlendMode: 'multiply',
            }}
          >
            <Image {...imageProps} alt="" />
          </div>
          <div
            ref={greenRef}
            aria-hidden="true"
            style={{
              ...layerStyle,
              clipPath: greenClipPath,
              filter:
                'brightness(0) saturate(100%) invert(76%) sepia(88%) saturate(1846%) hue-rotate(76deg) brightness(109%) contrast(119%)',
              mixBlendMode: 'multiply',
            }}
          >
            <Image {...imageProps} alt="" />
          </div>
        </div>
      </div>
    );
  },
);
