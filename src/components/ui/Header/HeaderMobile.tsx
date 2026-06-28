'use client';

import { forwardRef, useImperativeHandle, useRef, type CSSProperties } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { AnimatedLogoNew, type AnimatedLogoHandle } from '@/src/components/ui/AnimatedLogoNew';
import BurgerButtonNew from '@/src/components/ui/BurgerButtonNew';
import type { HeaderHandle } from '@/src/components/ui/Header/types';

gsap.registerPlugin(useGSAP);

interface HeaderMobileProps {
  initialProgress?: number;
}

const getInitialMenuStyle = (progress: number): CSSProperties =>
  progress <= 0
    ? {
        opacity: 0,
        visibility: 'hidden',
        transform: 'translateY(-18px)',
      }
    : {
        opacity: 1,
        visibility: 'visible',
        transform: 'translateY(0)',
      };

const HeaderMobile = forwardRef<HeaderHandle, HeaderMobileProps>(function HeaderMobile(
  { initialProgress = 0 },
  ref,
) {
  const initialProgressValue = gsap.utils.clamp(0, 1, initialProgress);
  const headerRef = useRef<HTMLElement>(null);
  const logoSlotRef = useRef<HTMLDivElement>(null);
  const burgerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<AnimatedLogoHandle>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const progressRef = useRef(initialProgressValue);
  const initialMenuStyle = getInitialMenuStyle(initialProgressValue);

  useGSAP(
    () => {
      const media = gsap.matchMedia();

      media.add('(max-width: 999.98px)', () => {
        if (!burgerRef.current) {
          return undefined;
        }

        gsap.set(burgerRef.current, {
          autoAlpha: 0,
          y: -18,
        });

        timelineRef.current = gsap
          .timeline({
            paused: true,
            defaults: {
              ease: 'power2.out',
            },
          })
          .to(
            burgerRef.current,
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.24,
              stagger: 0.04,
            },
            0.58,
          );

        timelineRef.current.progress(progressRef.current);

        return () => {
          timelineRef.current?.kill();
          timelineRef.current = null;
        };
      });

      return () => {
        media.revert();
        timelineRef.current = null;
      };
    },
    { scope: headerRef },
  );

  useImperativeHandle(ref, () => ({
    setProgress(progress: number) {
      progressRef.current = gsap.utils.clamp(0, 1, progress);
      timelineRef.current?.progress(progressRef.current);
      logoRef.current?.setProgress(progressRef.current);
    },
  }));

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 px-4 pt-5 sm:px-8 sm:pt-7 min-[1000px]:hidden">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[calc(var(--header-offset)+4rem)] bg-transparent backdrop-blur-[8px]"
        style={{
          WebkitMaskImage:
            'linear-gradient(to bottom, #000 0%, #000 35%, rgba(0, 0, 0, 0.55) 58%, rgba(0, 0, 0, 0.16) 78%, transparent 100%)',
          maskImage:
            'linear-gradient(to bottom, #000 0%, #000 35%, rgba(0, 0, 0, 0.55) 58%, rgba(0, 0, 0, 0.16) 78%, transparent 100%)',
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-[calc(var(--header-offset)-0.5rem)] h-24 bg-transparent opacity-20 backdrop-blur-[30px]"
        style={{
          WebkitMaskImage:
            'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.08) 18%, rgba(0,0,0,0.5) 58%, transparent 100%)',
          maskImage:
            'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.08) 18%, rgba(0,0,0,0.5) 58%, transparent 100%)',
        }}
      />
      <div
        data-header-fill
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[var(--header-offset)] origin-left bg-[var(--accent)] opacity-0 shadow-[0_18px_54px_rgba(184,255,44,0.2)] [transform:scaleX(0)] transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
      />
      <div className="relative mx-auto w-full max-w-[1740px] px-[15px]">
        <header
          ref={headerRef}
          className="flex items-center justify-between font-normalidad font-medium uppercase"
        >
          <div ref={logoSlotRef} className="pointer-events-none">
            <AnimatedLogoNew
              ref={logoRef}
              variant="mobile"
              initialProgress={initialProgress}
            />
          </div>

          <div ref={burgerRef} className="pointer-events-auto" style={initialMenuStyle}>
            <BurgerButtonNew />
          </div>
        </header>
      </div>
    </div>
  );
});

export default HeaderMobile;
