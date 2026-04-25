'use client';

import { forwardRef, useImperativeHandle, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { AnimatedLogoNew, type AnimatedLogoHandle } from '@/src/components/ui/AnimatedLogoNew';
import GlitchText from '@/src/components/ui/GlitchText/GlitchText';
import type { HeaderHandle } from '@/src/components/ui/Header/types';

gsap.registerPlugin(useGSAP);

const MENU_ITEM_SIZE = '20';

const desktopMenu = {
  left: ['Услуги', 'Портфолио'],
  right: ['Контакты', 'Связаться с нами'],
} as const;

interface HeaderDesktopProps {
  initialProgress?: number;
}

const HeaderDesktop = forwardRef<HeaderHandle, HeaderDesktopProps>(function HeaderDesktop(
  { initialProgress = 0 },
  ref,
) {
  const headerRef = useRef<HTMLElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<AnimatedLogoHandle>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const progressRef = useRef(gsap.utils.clamp(0, 1, initialProgress));

  useGSAP(
    () => {
      if (!leftRef.current || !rightRef.current) {
        return;
      }

      gsap.set([leftRef.current, rightRef.current], {
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
          [leftRef.current, rightRef.current],
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
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 hidden px-4 pt-5 sm:px-8 sm:pt-7 md:block">
      <div className="mx-auto w-full max-w-[1740px] px-[15px]">
        <header
          ref={headerRef}
          className="grid grid-cols-[1fr_auto_1fr] items-center font-normalidad font-medium uppercase"
        >
          <div
            ref={leftRef}
            className="pointer-events-auto flex items-center gap-[20px] text-white lg:gap-[32px]"
          >
            {desktopMenu.left.map((item) => (
              <GlitchText key={item} size={MENU_ITEM_SIZE}>
                {item}
              </GlitchText>
            ))}
          </div>

          <div className="pointer-events-none flex justify-center px-4">
            <AnimatedLogoNew
              ref={logoRef}
              variant="desktop"
              initialProgress={initialProgress}
            />
          </div>

          <div
            ref={rightRef}
            className="pointer-events-auto flex items-center justify-end gap-[20px] text-white lg:gap-[32px]"
          >
            {desktopMenu.right.map((item) => (
              <GlitchText key={item} size={MENU_ITEM_SIZE}>
                {item}
              </GlitchText>
            ))}
          </div>
        </header>
      </div>
    </div>
  );
});

export default HeaderDesktop;
