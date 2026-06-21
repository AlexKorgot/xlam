'use client';

import { ReactNode, useCallback, useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import gsap from 'gsap';
import { Observer } from 'gsap/all';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(Observer);

export const FULLPAGE_SCROLL_IGNORE_ATTR = 'data-fullpage-scroll-ignore';
export const FULLPAGE_SCROLL_EVENT = 'fullpage-scroll-request';
export const FULLPAGE_SECTION_REVEAL_DELAY = 0.24;
export const FULLPAGE_TOUCH_SWIPE_THRESHOLD = 18;
export const FULLPAGE_TOUCH_AXIS_LOCK_RATIO = 1.12;

export const getFullPageSwipeDirection = (deltaY: number) =>
  deltaY < 0 ? 'down' : 'up';

type ScrollRequestDetail = {
  behavior?: 'smooth' | 'instant';
  direction?: 'up' | 'down';
  targetId?: string;
  targetIndex?: number;
};

interface FullPageScrollProps {
  children: ReactNode;
  animationDuration?: number;
  beforeTransitionCallback?: (startIndex: number, targetIndex: number) => boolean | void;
  progressCallback?: (value: number) => void;
  sectionChangeCallback?: (index: number) => void;
  transitionStartCallback?: (startIndex: number, targetIndex: number) => void;
  targetSection?: number;
}

export default function FullPageScroll({
  children,
  animationDuration = 0.95,
  beforeTransitionCallback,
  progressCallback,
  sectionChangeCallback,
  transitionStartCallback,
  targetSection,
}: FullPageScrollProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef<HTMLElement[]>([]);
  const currentIndexRef = useRef(0);
  const isScrollingRef = useRef(false);
  const animationRef = useRef<gsap.core.Timeline | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const fullPageHeightRef = useRef(0);

  const getViewportHeight = useCallback(() => {
    const visualHeight = window.visualViewport?.height;

    if (visualHeight && visualHeight > 0) {
      return visualHeight;
    }

    return window.innerHeight;
  }, []);

  const syncFullPageHeight = useCallback(() => {
    const nextHeight = getViewportHeight();

    if (!nextHeight || nextHeight <= 0) {
      return;
    }

    fullPageHeightRef.current = nextHeight;
    viewportRef.current?.style.setProperty('--fullpage-height', `${nextHeight}px`);

    if (containerRef.current) {
      gsap.set(containerRef.current, {
        y: -currentIndexRef.current * nextHeight,
      });
    }
  }, [getViewportHeight]);

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

  const syncProgressForIndex = useCallback((index: number) => {
    progressCallback?.(index > 0 ? 1 : 0);
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

    if (beforeTransitionCallback?.(startIndex, index) === false) {
      isScrollingRef.current = false;
      return;
    }

    transitionStartCallback?.(startIndex, index);

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
        y: -index * (fullPageHeightRef.current || getViewportHeight()),
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
          FULLPAGE_SECTION_REVEAL_DELAY,
        );
      }
    },
    [
      animationDuration,
      beforeTransitionCallback,
      getViewportHeight,
      sectionChangeCallback,
      syncProgress,
      transitionStartCallback,
    ],
  );

  const jumpToSection = useCallback(
    (index: number) => {
      if (!containerRef.current || !sectionsRef.current[index]) {
        return;
      }

      animationRef.current?.kill();
      isScrollingRef.current = false;

      sectionsRef.current.forEach((section, sectionIndex) => {
        const reveal = getRevealElements(section);

        if (reveal.length === 0) {
          return;
        }

        if (sectionIndex === index) {
          gsap.set(reveal, {
            autoAlpha: 1,
            y: 0,
            clearProps: 'transform',
          });

          return;
        }

        gsap.set(reveal, {
          autoAlpha: 0,
          y: 64,
        });
      });

      gsap.set(containerRef.current, {
        y: -index * (fullPageHeightRef.current || getViewportHeight()),
      });

      currentIndexRef.current = index;
      sectionChangeCallback?.(index);
      syncProgressForIndex(index);
    },
    [getViewportHeight, sectionChangeCallback, syncProgressForIndex],
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

      syncFullPageHeight();
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

      const root = containerRef.current;

      const observer = Observer.create({
        target: root,
        type: 'wheel',
        onDown: handleScrollDown,
        onUp: handleScrollUp,
        wheelSpeed: 1,
        tolerance: 14,
        preventDefault: true,
        ignoreCheck: (event) => shouldIgnoreEvent(event),
      });

      const handlePointerDown = (event: PointerEvent) => {
        if (event.pointerType !== 'touch' || shouldIgnoreEvent(event)) {
          return;
        }

        touchStartRef.current = { x: event.clientX, y: event.clientY };
      };

      const handlePointerUp = (event: PointerEvent) => {
        if (event.pointerType !== 'touch' || shouldIgnoreEvent(event)) {
          return;
        }

        const start = touchStartRef.current;
        touchStartRef.current = null;

        if (!start) {
          return;
        }

        const deltaX = event.clientX - start.x;
        const deltaY = event.clientY - start.y;
        const isVerticalSwipe =
          Math.abs(deltaY) > FULLPAGE_TOUCH_SWIPE_THRESHOLD &&
          Math.abs(deltaY) > Math.abs(deltaX) * FULLPAGE_TOUCH_AXIS_LOCK_RATIO;

        if (!isVerticalSwipe) {
          return;
        }

        if (getFullPageSwipeDirection(deltaY) === 'down') {
          handleScrollDown();
          return;
        }

        handleScrollUp();
      };

      const handlePointerCancel = () => {
        touchStartRef.current = null;
      };

      const handleResize = () => {
        syncFullPageHeight();
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

      root.addEventListener('pointerdown', handlePointerDown);
      root.addEventListener('pointerup', handlePointerUp);
      root.addEventListener('pointercancel', handlePointerCancel);
      window.addEventListener('resize', handleResize);
      window.visualViewport?.addEventListener('resize', handleResize);
      window.visualViewport?.addEventListener('scroll', handleResize);
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        observer.kill();
        root.removeEventListener('pointerdown', handlePointerDown);
        root.removeEventListener('pointerup', handlePointerUp);
        root.removeEventListener('pointercancel', handlePointerCancel);
        window.removeEventListener('resize', handleResize);
        window.visualViewport?.removeEventListener('resize', handleResize);
        window.visualViewport?.removeEventListener('scroll', handleResize);
        window.removeEventListener('keydown', handleKeyDown);
        touchStartRef.current = null;
        animationRef.current?.kill();
      };
    },
    { dependencies: [animationDuration, syncFullPageHeight] },
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
      const targetIndexFromId =
        typeof customEvent.detail?.targetId === 'string'
          ? sectionsRef.current.findIndex(
              (section) => section.id === customEvent.detail?.targetId,
            )
          : -1;
      const targetIndex =
        typeof customEvent.detail?.targetIndex === 'number'
          ? customEvent.detail.targetIndex
          : targetIndexFromId;

      if (
        targetIndex >= 0 &&
        targetIndex < sectionsRef.current.length
      ) {
        if (customEvent.detail?.behavior === 'instant') {
          jumpToSection(targetIndex);
        } else {
          scrollToSection(targetIndex);
        }

        return;
      }

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
  }, [handleScrollDown, handleScrollUp, jumpToSection, scrollToSection]);

  return (
    <div
      ref={viewportRef}
      className="relative w-full overflow-hidden"
      style={{ height: 'var(--fullpage-height, 100svh)' } as CSSProperties}
    >
      <div
        ref={containerRef}
        className="absolute left-0 top-0 w-full touch-none"
        style={{ willChange: 'transform' }}
      >
        {children}
      </div>
    </div>
  );
}
