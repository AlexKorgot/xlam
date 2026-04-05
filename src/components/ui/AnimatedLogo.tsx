'use client';

import { forwardRef, useImperativeHandle, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import Image from 'next/image';
import Logo from '@/src/lib/assets/logo.svg';
import HeaderPlate from '@/src/lib/assets/main/rectangle.png';

export interface AnimatedLogoHandle {
  setProgress: (progress: number) => void;
}

export const AnimatedLogo = forwardRef<AnimatedLogoHandle>(function AnimatedLogo(
  _props,
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const centerLogoRef = useRef<HTMLDivElement>(null);
  const headerPlateRef = useRef<HTMLDivElement>(null);
  const headerLogoRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const progressRef = useRef(0);

  useGSAP(
    () => {
      if (!centerLogoRef.current || !headerPlateRef.current || !headerLogoRef.current) {
        return;
      }

      const syncTimeline = () => {
        if (!centerLogoRef.current || !headerPlateRef.current || !headerLogoRef.current) {
          return;
        }

        timelineRef.current?.kill();

        const centerRect = centerLogoRef.current.getBoundingClientRect();
        const headerRect = headerLogoRef.current.getBoundingClientRect();

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

      syncTimeline();
      window.addEventListener('resize', syncTimeline);

      return () => {
        window.removeEventListener('resize', syncTimeline);
        timelineRef.current?.kill();
      };
    },
    { scope: containerRef },
  );

  useImperativeHandle(ref, () => ({
    setProgress(progress: number) {
      progressRef.current = gsap.utils.clamp(0, 1, progress);
      timelineRef.current?.progress(progressRef.current);
    },
  }));

  return (
    <div ref={containerRef}>
      <div
        className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center"
      >
        <div
          ref={centerLogoRef}
          className="w-[min(58vw,32rem)]"
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
            sizes="(max-width: 768px) 58vw, 32rem"
            className="w-full"
            style={{ height: 'auto' }}
          />
        </div>
      </div>

      <div
        ref={headerPlateRef}
        className="pointer-events-none fixed left-1/2 top-0 z-40 -translate-x-1/2"
        style={{ willChange: 'transform, opacity' }}
      >
        <div className="relative w-[11rem] sm:w-[13rem] lg:w-[15.5rem]">
          <Image
            src={HeaderPlate}
            alt=""
            unoptimized
            width={895}
            height={367}
            sizes="(max-width: 768px) 11rem, 15.5rem"
            className="w-full"
            style={{ height: 'auto' }}
          />
          <div
            ref={headerLogoRef}
            className="absolute inset-x-0 bottom-[18%] mx-auto w-[3.5rem] sm:w-[4rem] lg:w-[4.75rem]"
            style={{ willChange: 'transform, opacity' }}
          >
            <Image
              src={Logo}
              alt="XLAM Media"
              unoptimized
              width={220}
              height={112}
              sizes="4.35rem"
              className="w-full"
              style={{ height: 'auto' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
});
