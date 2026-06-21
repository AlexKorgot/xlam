'use client';

import { forwardRef, useImperativeHandle, useRef, type CSSProperties } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { AnimatedLogoNew, type AnimatedLogoHandle } from '@/src/components/ui/AnimatedLogoNew';
import GlitchText from '@/src/components/ui/GlitchText/GlitchText';
import type { HeaderHandle } from '@/src/components/ui/Header/types';
import { useContactModal } from '@/src/components/ui/contact-modal';
import { FULLPAGE_SCROLL_EVENT } from '@/src/components/ui/FullPageScroll';

gsap.registerPlugin(useGSAP);

const MENU_ITEM_SIZE = '20';

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

const desktopMenu: Record<'left' | 'right', Array<{
  key: string;
  label: string;
  targetId: string;
}>> = {
  left: [
    { key: 'services', label: 'Услуги', targetId: 'services' },
    { key: 'projects', label: 'Портфолио', targetId: 'projects' },
  ],
  right: [
    { key: 'contacts', label: 'Контакты', targetId: 'text-section' },
  ],
} as const;

const jumpToFullPageSection = (targetId: string) => {
  window.dispatchEvent(
    new CustomEvent(FULLPAGE_SCROLL_EVENT, {
      detail: {
        behavior: 'instant',
        targetId,
      },
    }),
  );
};

interface HeaderDesktopProps {
  initialProgress?: number;
}

const HeaderDesktop = forwardRef<HeaderHandle, HeaderDesktopProps>(function HeaderDesktop(
  { initialProgress = 0 },
  ref,
) {
  const { openContactModal } = useContactModal();
  const initialProgressValue = gsap.utils.clamp(0, 1, initialProgress);
  const headerRef = useRef<HTMLElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<AnimatedLogoHandle>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const progressRef = useRef(initialProgressValue);
  const initialMenuStyle = getInitialMenuStyle(initialProgressValue);

  useGSAP(
    () => {
      const media = gsap.matchMedia();

      media.add('(min-width: 1000px)', () => {
        if (!leftRef.current || !rightRef.current) {
          return undefined;
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
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 hidden px-4 pt-5 sm:px-8 sm:pt-7 min-[1000px]:block">
      <div
        data-header-fill
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[var(--header-offset)] origin-left bg-[var(--accent)] opacity-0 shadow-[0_18px_54px_rgba(184,255,44,0.2)] [transform:scaleX(0)] transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
      />
      <div className="relative mx-auto w-full max-w-[1740px] px-[15px]">
        <header
          ref={headerRef}
          className="grid grid-cols-[1fr_auto_1fr] items-center font-normalidad font-medium uppercase"
        >
          <div
            ref={leftRef}
            className="pointer-events-auto flex items-center gap-[20px] text-white lg:gap-[32px]"
            style={initialMenuStyle}
          >
            {desktopMenu.left.map((item) => (
              <button
                key={item.key}
                type="button"
                className="uppercase"
                onClick={() => jumpToFullPageSection(item.targetId)}
              >
                <GlitchText size={MENU_ITEM_SIZE}>
                  {item.label}
                </GlitchText>
              </button>
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
            style={initialMenuStyle}
          >
            {desktopMenu.right.map((item) => (
              <button
                key={item.key}
                type="button"
                className="uppercase"
                onClick={() => jumpToFullPageSection(item.targetId)}
              >
                <GlitchText size={MENU_ITEM_SIZE}>
                  {item.label}
                </GlitchText>
              </button>
            ))}
            <button
              type="button"
              className="pointer-events-auto uppercase"
              onClick={openContactModal}
            >
              <GlitchText size={MENU_ITEM_SIZE}>
                Связаться с нами
              </GlitchText>
            </button>
          </div>
        </header>
      </div>
    </div>
  );
});

export default HeaderDesktop;
