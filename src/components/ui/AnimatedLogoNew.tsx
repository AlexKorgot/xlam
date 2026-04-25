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
    plateWidthClass: 'w-[11rem] sm:w-[13rem] lg:w-[15.5rem]',
    logoWidthClass: 'w-[3.5rem] sm:w-[4rem] lg:w-[4.75rem]',
    imageClassName: 'w-[95px] h-[48px] max-w-full',
    plateSizes: '(max-width: 768px) 11rem, 15.5rem',
  },
  mobile: {
    centerWidthClass: 'w-[min(68vw,22rem)]',
    plateWidthClass: 'w-[7.5rem] sm:w-[8.5rem]',
    logoWidthClass: 'w-[2.7rem] sm:w-[3rem]',
    imageClassName: 'w-[72px] h-auto max-w-full sm:w-[82px]',
    plateSizes: '8rem',
  },
} as const;

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
          });

          gsap.set(headerPlateRef.current, {
            autoAlpha: 0,
            y: -20,
            scale: 0.96,
          });

          gsap.set(headerLogoRef.current, {
            autoAlpha: 0,
            scale: 0.88,
          });

          timelineRef.current = gsap
            .timeline({
              paused: true,
              defaults: {
                ease: 'power3.inOut',
              },
            })
            .to(
              centerLogoRef.current,
              {
                keyframes: [
                  {
                    x: x * 0.92,
                    y: y * 0.92,
                    scale: scale * 1.05,
                    duration: 0.62,
                    ease: 'power3.inOut',
                  },
                  {
                    x,
                    y,
                    scale,
                    duration: 0.18,
                    ease: 'power2.out',
                  },
                ],
              },
              0,
            )
            .to(
              headerPlateRef.current,
              {
                autoAlpha: 1,
                y: 0,
                scale: 1,
                duration: 0.18,
                ease: 'power2.out',
              },
              0.66,
            )
            .to(
              headerLogoRef.current,
              {
                autoAlpha: 1,
                scale: 1,
                duration: 0.1,
                ease: 'power2.out',
              },
              0.76,
            )
            .to(
              centerLogoRef.current,
              {
                autoAlpha: 0,
                duration: 0.06,
                ease: 'power2.in',
              },
              0.78,
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
          <div className="relative aspect-[895/367] w-full">
            <div
              ref={headerLogoRef}
              className={`absolute inset-x-0 bottom-[18%] mx-auto ${styles.logoWidthClass}`}
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
