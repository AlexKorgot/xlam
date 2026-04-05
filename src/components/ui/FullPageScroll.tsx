'use client';

import { ReactNode, useCallback, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Observer } from 'gsap/all';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(Observer);

export const FULLPAGE_SCROLL_IGNORE_ATTR = 'data-fullpage-scroll-ignore';
export const FULLPAGE_SCROLL_EVENT = 'fullpage-scroll-request';

type ScrollRequestDetail = {
  direction: 'up' | 'down';
};

interface FullPageScrollProps {
  children: ReactNode;
  animationDuration?: number;
  progressCallback?: (value: number) => void;
  sectionChangeCallback?: (index: number) => void;
  targetSection?: number;
}

export default function FullPageScroll({
  children,
  animationDuration = 0.95,
  progressCallback,
  sectionChangeCallback,
  targetSection,
}: FullPageScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef<HTMLElement[]>([]);
  const currentIndexRef = useRef(0);
  const isScrollingRef = useRef(false);
  const animationRef = useRef<gsap.core.Timeline | null>(null);

  const getRevealElements = (section?: HTMLElement) =>
    section
      ? Array.from(section.querySelectorAll<HTMLElement>('[data-reveal]'))
      : [];

  const syncProgress = useCallback((
    startIndex: number,
    targetIndex: number,
    tweenProgress: number,
  ) => {
    if (!progressCallback) {
      return;
    }

    const shouldTrackProgress =
      (startIndex === 0 && targetIndex === 1) ||
      (startIndex === 1 && targetIndex === 0);

    if (!shouldTrackProgress) {
      return;
    }

    const isMovingForward = targetIndex > startIndex;
    progressCallback(isMovingForward ? tweenProgress : 1 - tweenProgress);
  }, [progressCallback]);

  const scrollToSection = useCallback(
    (index: number) => {
      if (!containerRef.current || !sectionsRef.current[index] || isScrollingRef.current) {
        return;
      }

      isScrollingRef.current = true;

    const startIndex = currentIndexRef.current;
    const isMovingForward = index > startIndex;
    const currentSection = sectionsRef.current[startIndex];
    const nextSection = sectionsRef.current[index];
    const currentReveal = getRevealElements(currentSection);
    const nextReveal = getRevealElements(nextSection);

    animationRef.current?.kill();

    if (nextReveal.length > 0) {
      gsap.set(nextReveal, {
        autoAlpha: 0,
        y: isMovingForward ? 64 : -64,
      });
    }

    animationRef.current = gsap.timeline({
      defaults: {
        ease: 'power3.inOut',
      },
      onComplete: () => {
        currentIndexRef.current = index;
        sectionChangeCallback?.(index);
        syncProgress(startIndex, index, 1);
        isScrollingRef.current = false;
      },
    });

    if (currentReveal.length > 0) {
      animationRef.current.to(
        currentReveal,
        {
          autoAlpha: 0,
          y: isMovingForward ? -42 : 42,
          duration: 0.28,
          stagger: 0.04,
        },
        0,
      );
    }

    animationRef.current.to(
      containerRef.current,
      {
        y: -index * window.innerHeight,
        duration: animationDuration,
        onUpdate: function updateProgress() {
          syncProgress(startIndex, index, this.progress());
        },
      },
      0,
    );

      if (nextReveal.length > 0) {
        animationRef.current.to(
          nextReveal,
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.52,
            stagger: 0.06,
            ease: 'power2.out',
            clearProps: 'transform',
          },
          0.24,
        );
      }
    },
    [animationDuration, sectionChangeCallback, syncProgress],
  );

  const handleScrollDown = useCallback(() => {
    const nextIndex = currentIndexRef.current + 1;

    if (nextIndex < sectionsRef.current.length) {
      scrollToSection(nextIndex);
    }
  }, [scrollToSection]);

  const handleScrollUp = useCallback(() => {
    const prevIndex = currentIndexRef.current - 1;

    if (prevIndex >= 0) {
      scrollToSection(prevIndex);
    }
  }, [scrollToSection]);

  const shouldIgnoreEvent = (event: Event) => {
    const target = event.target as HTMLElement | null;

    if (!target) {
      return false;
    }

    return Boolean(
      target.closest<HTMLElement>(`[${FULLPAGE_SCROLL_IGNORE_ATTR}]`),
    );
  };

  useGSAP(
    () => {
      if (!containerRef.current) {
        return;
      }

      sectionsRef.current = Array.from(containerRef.current.children) as HTMLElement[];
      sectionChangeCallback?.(0);
      progressCallback?.(0);

      sectionsRef.current.forEach((section, index) => {
        const reveal = getRevealElements(section);

        if (reveal.length > 0) {
          gsap.set(reveal, {
            autoAlpha: index === 0 ? 1 : 0,
            y: index === 0 ? 0 : 64,
          });
        }
      });

      const observer = Observer.create({
        type: 'wheel,touch,pointer',
        onDown: handleScrollDown,
        onUp: handleScrollUp,
        wheelSpeed: 1,
        tolerance: 14,
        preventDefault: true,
        ignoreCheck: (event) => shouldIgnoreEvent(event),
      });

      const handleResize = () => {
        if (containerRef.current) {
          gsap.set(containerRef.current, {
            y: -currentIndexRef.current * window.innerHeight,
          });
        }
      };

      const handleKeyDown = (event: KeyboardEvent) => {
        if (
          event.key === 'ArrowDown' ||
          event.key === 'PageDown' ||
          event.key === ' '
        ) {
          event.preventDefault();
          handleScrollDown();
        }

        if (event.key === 'ArrowUp' || event.key === 'PageUp') {
          event.preventDefault();
          handleScrollUp();
        }
      };

      window.addEventListener('resize', handleResize);
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        observer.kill();
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('keydown', handleKeyDown);
        animationRef.current?.kill();
      };
    },
    { dependencies: [animationDuration] },
  );

  useGSAP(
    () => {
      if (
        typeof targetSection !== 'number' ||
        Number.isNaN(targetSection) ||
        targetSection === currentIndexRef.current ||
        targetSection < 0 ||
        targetSection >= sectionsRef.current.length
      ) {
        return;
      }

      scrollToSection(targetSection);
    },
    { dependencies: [targetSection] },
  );

  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<ScrollRequestDetail>;
      if (customEvent.detail?.direction === 'down') {
        handleScrollDown();
      } else if (customEvent.detail?.direction === 'up') {
        handleScrollUp();
      }
    };

    window.addEventListener(FULLPAGE_SCROLL_EVENT, handler as EventListener);
    return () => {
      window.removeEventListener(FULLPAGE_SCROLL_EVENT, handler as EventListener);
    };
  }, [handleScrollDown, handleScrollUp]);

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <div
        ref={containerRef}
        className="absolute left-0 top-0 w-full"
        style={{ willChange: 'transform' }}
      >
        {children}
      </div>
    </div>
  );
}
