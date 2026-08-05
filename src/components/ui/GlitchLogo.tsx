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
import { remoteImageAsset } from '@/src/lib/mediaAssetPath';

const Logo = remoteImageAsset('/logo.svg', 110, 56);

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
const HERO_MEDIA_PLATE_CLIP = 'inset(55.75% 0.42% 3.18% 0 round 1.62%)';

const layerStyle: CSSProperties = {
  position: 'absolute',
  inset: 0,
  opacity: 0,
  visibility: 'hidden',
  pointerEvents: 'none',
};

const sliceLayerStyle: CSSProperties = {
  position: 'absolute',
  inset: 0,
  zIndex: 1,
  pointerEvents: 'none',
};

const createColorMaskStyle = (color: string): CSSProperties => ({
  position: 'absolute',
  inset: 0,
  backgroundColor: color,
  WebkitMaskImage: `url(${Logo.src})`,
  maskImage: `url(${Logo.src})`,
  WebkitMaskPosition: 'center',
  maskPosition: 'center',
  WebkitMaskRepeat: 'no-repeat',
  maskRepeat: 'no-repeat',
  WebkitMaskSize: '100% 100%',
  maskSize: '100% 100%',
});

export const GlitchLogo = forwardRef<GlitchLogoHandle, GlitchLogoProps>(
  function GlitchLogo({ intensity, width, height, sizes, className }, ref) {
    const rootRef = useRef<HTMLDivElement>(null);
    const topRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const redRef = useRef<HTMLDivElement>(null);
    const blueRef = useRef<HTMLDivElement>(null);
    const greenRef = useRef<HTMLDivElement>(null);
    const mediaBlackRef = useRef<HTMLDivElement>(null);
    const mediaGreenRef = useRef<HTMLDivElement>(null);
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
        if (
          !topRef.current ||
          !bottomRef.current ||
          !redRef.current ||
          !blueRef.current ||
          !greenRef.current
        ) {
          return;
        }

        const slices = [topRef.current, bottomRef.current];
        const channels = [redRef.current, blueRef.current, greenRef.current];
        const mediaLayers = intensity === 'hero'
          ? [mediaBlackRef.current, mediaGreenRef.current]
          : [];

        if (mediaLayers.some((layer) => !layer)) {
          return;
        }

        const k = intensity === 'hero' ? 1.5 : 0.7;

        gsap.set(slices, {
          x: 0,
          skewX: 0,
          opacity: 1,
          transformOrigin: intensity === 'hero' ? 'center 25.23%' : 'center center',
        });
        gsap.set(channels, { x: 0, autoAlpha: 0 });
        gsap.set(mediaLayers, { autoAlpha: 0 });

        const timeline = gsap.timeline({
              paused: true,
              defaults: { ease: 'power4.inOut' },
              onComplete: () => {
                gsap.set(slices, { x: 0, skewX: 0, opacity: 1 });
                gsap.set(channels, { x: 0, autoAlpha: 0 });
                gsap.set(mediaLayers, { autoAlpha: 0 });
              },
            })
          .to(slices, { skewX: 15, duration: 0.1 })
          .to(slices, { skewX: 0, duration: 0.04 })
          .to(slices, { opacity: 0.2, duration: 0.04 })
          .to(slices, { opacity: 1, duration: 0.04 })
          .to(slices, { x: -4 * k, duration: 0.04 })
          .to(slices, { x: 0, duration: 0.04 })
          .to(slices, { x: 2 * k, duration: 0.015 })
          .to(slices, { x: -2 * k, duration: 0.015 })
          .to(slices, { x: 0, duration: 0.015 })
          .add('split', 0)
          .to(topRef.current, { x: -3 * k, duration: 0.18 }, 'split')
          .to(bottomRef.current, { x: 3 * k, duration: 0.18 }, 'split')
          .set(redRef.current, { x: -3 * k, autoAlpha: 0.78 }, 'split')
          .set(blueRef.current, { x: 2.5 * k, autoAlpha: 0.72 }, 'split')
          .set(greenRef.current, { x: 1 * k, autoAlpha: 1 }, 'split')
          .set(redRef.current, { autoAlpha: 0 }, 0.08)
          .set(blueRef.current, { autoAlpha: 0 }, 0.12)
          .set(greenRef.current, { autoAlpha: 0 }, 0.14)
          .set(greenRef.current, { x: 0, autoAlpha: 1 }, 0.14)
          .set(greenRef.current, { autoAlpha: 0 }, 0.26)
          .to(topRef.current, { x: 0, duration: 0.2 })
          .to(bottomRef.current, { x: 0, duration: 0.2 });

        if (intensity === 'hero' && mediaBlackRef.current && mediaGreenRef.current) {
          timeline
            .set(mediaBlackRef.current, { autoAlpha: 1 }, 0)
            .set(mediaBlackRef.current, { autoAlpha: 0 }, 0.04)
            .set(mediaGreenRef.current, { autoAlpha: 1 }, 0.04)
            .set(mediaGreenRef.current, { autoAlpha: 0 }, 0.09)
            .set(mediaBlackRef.current, { autoAlpha: 1 }, 0.09)
            .set(mediaBlackRef.current, { autoAlpha: 0 }, 0.14)
            .set(mediaGreenRef.current, { autoAlpha: 1 }, 0.14)
            .set(mediaGreenRef.current, { autoAlpha: 0 }, 0.26)
            .set(mediaBlackRef.current, { autoAlpha: 1 }, 0.26)
            .set(mediaBlackRef.current, { autoAlpha: 0 }, 0.32);
        }

        timelineRef.current = timeline;

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
    const channelClipPath = isHero
      ? `inset(0 0 ${HERO_WORDMARK_BOTTOM})`
      : 'inset(0)';
    const topClipPath = isHero ? 'inset(0 0 78.81%)' : 'inset(0 0 58%)';
    const bottomClipPath = isHero
      ? `inset(20.69% 0 ${HERO_WORDMARK_BOTTOM})`
      : 'inset(41% 0 0)';

    return (
      <div
        ref={rootRef}
        className="relative w-full"
        role={isHero ? undefined : 'img'}
        aria-label={isHero ? undefined : 'XLAM Media'}
      >
        {isHero ? (
          <Image
            {...imageProps}
            alt="XLAM Media"
            fetchPriority="high"
            onLoad={handleBaseImageLoad}
            style={{ clipPath: `inset(${HERO_MEDIA_TOP} 0 0)` }}
          />
        ) : (
          <Image
            {...imageProps}
            alt=""
            aria-hidden="true"
            fetchPriority="high"
            onLoad={handleBaseImageLoad}
            style={{ visibility: 'hidden' }}
          />
        )}

        <div className="absolute inset-0 w-full">
          <div
            ref={topRef}
            aria-hidden="true"
            style={{ ...sliceLayerStyle, clipPath: topClipPath }}
          >
            <Image {...imageProps} alt="" />
          </div>
          <div
            ref={bottomRef}
            aria-hidden="true"
            style={{ ...sliceLayerStyle, clipPath: bottomClipPath }}
          >
            <Image {...imageProps} alt="" />
          </div>

          <div
            ref={redRef}
            aria-hidden="true"
            style={{
              ...layerStyle,
              zIndex: 0,
              clipPath: channelClipPath,
              mixBlendMode: 'screen',
            }}
          >
            <span style={createColorMaskStyle('#ff0000')} />
          </div>
          <div
            ref={blueRef}
            aria-hidden="true"
            style={{
              ...layerStyle,
              zIndex: 0,
              clipPath: channelClipPath,
              mixBlendMode: 'screen',
            }}
          >
            <span style={createColorMaskStyle('#2f7cff')} />
          </div>
          <div
            ref={greenRef}
            aria-hidden="true"
            style={{
              ...layerStyle,
              zIndex: 0,
              clipPath: channelClipPath,
              mixBlendMode: 'screen',
            }}
          >
            <span style={createColorMaskStyle('#66ff66')} />
          </div>
          {isHero ? (
            <>
              <div
                ref={mediaBlackRef}
                aria-hidden="true"
                style={{
                  ...layerStyle,
                  zIndex: 2,
                  clipPath: `inset(${HERO_MEDIA_TOP} 0 0)`,
                  filter: 'invert(1)',
                }}
              >
                <Image {...imageProps} alt="" />
              </div>
              <div
                ref={mediaGreenRef}
                aria-hidden="true"
                style={{
                  ...layerStyle,
                  zIndex: 2,
                  backgroundColor: '#66ff66',
                  clipPath: HERO_MEDIA_PLATE_CLIP,
                  mixBlendMode: 'multiply',
                }}
              />
            </>
          ) : null}
        </div>
      </div>
    );
  },
);
