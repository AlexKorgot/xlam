'use client';

import { forwardRef, useImperativeHandle, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import Image from 'next/image';
import Logo from '@/src/lib/assets/logo.svg';

gsap.registerPlugin(useGSAP);

export interface AnimatedLogoHandle {
  setProgress: (progress: number) => void;
}

interface AnimatedLogoNewProps {
  variant?: 'desktop' | 'mobile';
  initialProgress?: number;
}

const logoVariants = {
  desktop: {
    centerWidthClass: 'w-[min(58vw,32rem)]',
    plateWidthClass: 'w-[95px]',
    logoWidthClass: 'w-[95px]',
    imageClassName: 'w-[95px] h-[48px] max-w-full',
    plateSizes: '(max-width: 768px) 11rem, 15.5rem',
  },
  mobile: {
    centerWidthClass: 'w-[min(68vw,22rem)]',
    plateWidthClass: 'w-[72px] sm:w-[82px]',
    logoWidthClass: 'w-[72px] sm:w-[82px]',
    imageClassName: 'w-[72px] h-auto max-w-full sm:w-[82px]',
    plateSizes: '8rem',
  },
} as const;

const LOGO_MORPH_DURATION = 0.86;

export const AnimatedLogoNew = forwardRef<AnimatedLogoHandle, AnimatedLogoNewProps>(
  function AnimatedLogoNew({ variant = 'desktop', initialProgress = 0 }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const centerLogoRef = useRef<HTMLDivElement>(null);
    const headerPlateRef = useRef<HTMLDivElement>(null);
    const headerLogoRef = useRef<HTMLDivElement>(null);
    const timelineRef = useRef<gsap.core.Timeline | null>(null);
    const progressRef = useRef(gsap.utils.clamp(0, 1, initialProgress));
    const styles = logoVariants[variant];

    useGSAP(
      (_context, contextSafe) => {
        if (!centerLogoRef.current || !headerPlateRef.current || !headerLogoRef.current) {
          return;
        }

        const buildTimeline = () => {
          if (!centerLogoRef.current || !headerPlateRef.current || !headerLogoRef.current) {
            return;
          }

          const centerRect = centerLogoRef.current.getBoundingClientRect();
          const headerRect = headerLogoRef.current.getBoundingClientRect();

          if (
            !centerRect.width ||
            !centerRect.height ||
            !headerRect.width ||
            !headerRect.height
          ) {
            return;
          }

          timelineRef.current?.kill();

          const x =
            headerRect.left +
            headerRect.width / 2 -
            (centerRect.left + centerRect.width / 2);
          const y =
            headerRect.top +
            headerRect.height / 2 -
            (centerRect.top + centerRect.height / 2);
          const scale = headerRect.width / centerRect.width;

          gsap.set(centerLogoRef.current, {
            x: 0,
            y: 0,
            scale: 1,
            autoAlpha: 1,
            transformOrigin: 'center center',
          });

          gsap.set(headerPlateRef.current, {
            autoAlpha: 1,
            y: 0,
            scale: 1,
          });

          gsap.set(headerLogoRef.current, {
            autoAlpha: 0,
            scale: 1,
            transformOrigin: 'center center',
          });

          timelineRef.current = gsap
            .timeline({
              paused: true,
              defaults: {
                ease: 'none',
              },
            })
            .to(
              centerLogoRef.current,
              {
                x,
                y,
                scale,
                duration: LOGO_MORPH_DURATION,
                ease: 'power2.inOut',
              },
              0,
            )
            .set(
              headerLogoRef.current,
              {
                autoAlpha: 1,
              },
              LOGO_MORPH_DURATION,
            )
            .set(
              centerLogoRef.current,
              {
                autoAlpha: 0,
              },
              LOGO_MORPH_DURATION,
            );

          timelineRef.current.progress(progressRef.current);
        };

        const syncTimeline = contextSafe ? contextSafe(buildTimeline) : buildTimeline;

        syncTimeline();
        window.addEventListener('resize', syncTimeline);

        return () => {
          window.removeEventListener('resize', syncTimeline);
          timelineRef.current?.kill();
        };
      },
      { scope: containerRef, dependencies: [variant] },
    );

    useImperativeHandle(ref, () => ({
      setProgress(progress: number) {
        progressRef.current = gsap.utils.clamp(0, 1, progress);
        timelineRef.current?.progress(progressRef.current);
      },
    }));

    return (
      <div ref={containerRef} className="relative">
        <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center">
          <div
            ref={centerLogoRef}
            className={styles.centerWidthClass}
            style={{
              transformOrigin: 'center center',
              willChange: 'transform, opacity',
            }}
          >
            <Image
              src={Logo}
              alt="XLAM Media"
              preload
              loading="eager"
              fetchPriority="high"
              unoptimized
              width={1100}
              height={560}
              sizes="(max-width: 768px) 68vw, 32rem"
              className="w-full"
              style={{ height: 'auto' }}
            />
          </div>
        </div>

        <div
          ref={headerPlateRef}
          className={styles.plateWidthClass}
          style={{ willChange: 'transform, opacity' }}
        >
          <div className="relative w-full">
            <div
              ref={headerLogoRef}
              className={`relative mx-auto ${styles.logoWidthClass}`}
              style={{ willChange: 'transform, opacity' }}
            >
              <Image
                src={Logo}
                alt="XLAM Media"
                unoptimized
                width={220}
                height={112}
                sizes="4.35rem"
                className={styles.imageClassName}
              />
            </div>
          </div>
        </div>
      </div>
    );
  },
);
