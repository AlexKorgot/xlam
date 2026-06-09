'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from 'react';
import type { StaticImageData } from 'next/image';
import Image from 'next/image';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import FullPageSection from '@/src/components/ui/FullPageSection';
import {
  FULLPAGE_SCROLL_EVENT,
  FULLPAGE_SCROLL_IGNORE_ATTR,
  FULLPAGE_TOUCH_AXIS_LOCK_RATIO,
  FULLPAGE_TOUCH_SWIPE_THRESHOLD,
  getFullPageSwipeDirection,
} from '@/src/components/ui/FullPageScroll';
import GeneralBackground from './assets/img/general_bg.png';
import BlueTop from './assets/img/blue_top.png';
import BlueBottom from './assets/img/blue_bottom.png';
import GreenTop from './assets/img/green_top.png';
import GreenBottom from './assets/img/green_bottom.png';
import GrayTop from './assets/img/gray_top.png';
import GrayBottom from './assets/img/gray_bottom.png';

type TextSlide = {
  id: string;
  lines: string[];
  topImage: StaticImageData;
  bottomImage: StaticImageData;
};

interface TextSectionProps {
  intervalMs?: number;
}

const scrollIgnoreAttr = { [FULLPAGE_SCROLL_IGNORE_ATTR]: 'true' } as const;
const slideWheelThreshold = 48;
const slideInputUnlockDelay = 700;

const slides: TextSlide[] = [
  {
    id: 'smooth',
    lines: ['В идеальном мире все гладко,', 'но гладкое', 'не запоминается'],
    topImage: BlueTop,
    bottomImage: BlueBottom,
  },
  {
    id: 'noise',
    lines: ['Мы не делаем идеально', '- мы делаем интересно'],
    topImage: GreenTop,
    bottomImage: GreenBottom,
  },
  {
    id: 'idea',
    lines: ['Если ваш бренд готов', 'Перестать быть аккуратным', 'и стать настоящим'],
    topImage: GrayTop,
    bottomImage: GrayBottom,
  },
];

export function TextSection({ intervalMs = 5000 }: TextSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const activeTextRef = useRef<HTMLHeadingElement>(null);
  const activeTopRef = useRef<HTMLDivElement>(null);
  const activeBottomRef = useRef<HTMLDivElement>(null);
  const incomingTextRef = useRef<HTMLHeadingElement>(null);
  const incomingTopRef = useRef<HTMLDivElement>(null);
  const incomingBottomRef = useRef<HTMLDivElement>(null);
  const backgroundXToRef = useRef<((value: number) => void) | null>(null);
  const backgroundYToRef = useRef<((value: number) => void) | null>(null);
  const activeIndexRef = useRef(0);
  const incomingIndexRef = useRef<number | null>(null);
  const wheelDirectionRef = useRef<'up' | 'down' | null>(null);
  const wheelDeltaRef = useRef(0);
  const inputLockRef = useRef(false);
  const inputUnlockTimeoutRef = useRef<number | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [incomingIndex, setIncomingIndex] = useState<number | null>(null);

  const activeSlide = slides[activeIndex];
  const incomingSlide = incomingIndex === null ? null : slides[incomingIndex];

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    incomingIndexRef.current = incomingIndex;
  }, [incomingIndex]);

  const requestParentSectionScroll = useCallback((direction: 'up' | 'down') => {
    window.dispatchEvent(
      new CustomEvent(FULLPAGE_SCROLL_EVENT, {
        detail: { direction },
      }),
    );
  }, []);

  const requestSlideDirection = useCallback(
    (direction: 'up' | 'down') => {
      if (incomingIndexRef.current !== null) {
        return;
      }

      const currentIndex = activeIndexRef.current;
      const nextIndex = direction === 'down' ? currentIndex + 1 : currentIndex - 1;

      if (nextIndex < 0 || nextIndex >= slides.length) {
        requestParentSectionScroll(direction);
        return;
      }

      setIncomingIndex(nextIndex);
    },
    [requestParentSectionScroll],
  );

  useEffect(() => {
    const sectionNode = sectionRef.current;

    if (!sectionNode) {
      return;
    }

    const resetWheelInput = () => {
      wheelDirectionRef.current = null;
      wheelDeltaRef.current = 0;
    };

    const unlockInput = () => {
      inputLockRef.current = false;
    };

    const queueInputUnlock = () => {
      if (inputUnlockTimeoutRef.current) {
        window.clearTimeout(inputUnlockTimeoutRef.current);
      }

      inputUnlockTimeoutRef.current = window.setTimeout(() => {
        unlockInput();
      }, slideInputUnlockDelay);
    };

    const handleWheel = (event: WheelEvent) => {
      const dominantDelta =
        Math.abs(event.deltaY) >= Math.abs(event.deltaX)
          ? event.deltaY
          : 0;

      if (Math.abs(dominantDelta) < 4) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const direction = dominantDelta > 0 ? 'down' : 'up';

      if (inputLockRef.current) {
        return;
      }

      if (wheelDirectionRef.current !== direction) {
        wheelDeltaRef.current = 0;
      }

      wheelDirectionRef.current = direction;
      wheelDeltaRef.current += Math.abs(dominantDelta);

      if (wheelDeltaRef.current < slideWheelThreshold) {
        return;
      }

      inputLockRef.current = true;
      resetWheelInput();
      queueInputUnlock();
      requestSlideDirection(direction);
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (event.pointerType !== 'touch') {
        return;
      }

      touchStartRef.current = { x: event.clientX, y: event.clientY };
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (event.pointerType !== 'touch') {
        return;
      }

      const start = touchStartRef.current;
      touchStartRef.current = null;

      if (!start || inputLockRef.current) {
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

      inputLockRef.current = true;
      queueInputUnlock();
      requestSlideDirection(getFullPageSwipeDirection(deltaY));
    };

    const handlePointerCancel = () => {
      touchStartRef.current = null;
    };

    sectionNode.addEventListener('wheel', handleWheel, { passive: false });
    sectionNode.addEventListener('pointerdown', handlePointerDown);
    sectionNode.addEventListener('pointerup', handlePointerUp);
    sectionNode.addEventListener('pointercancel', handlePointerCancel);

    return () => {
      sectionNode.removeEventListener('wheel', handleWheel);
      sectionNode.removeEventListener('pointerdown', handlePointerDown);
      sectionNode.removeEventListener('pointerup', handlePointerUp);
      sectionNode.removeEventListener('pointercancel', handlePointerCancel);

      if (inputUnlockTimeoutRef.current) {
        window.clearTimeout(inputUnlockTimeoutRef.current);
        inputUnlockTimeoutRef.current = null;
      }

      touchStartRef.current = null;
      unlockInput();
      resetWheelInput();
    };
  }, [requestSlideDirection]);

  useEffect(() => {
    if (slides.length < 2 || intervalMs <= 0) {
      return;
    }

    const timerId = window.setInterval(() => {
      if (incomingIndexRef.current !== null) {
        return;
      }

      setIncomingIndex((activeIndexRef.current + 1) % slides.length);
    }, intervalMs);

    return () => {
      window.clearInterval(timerId);
    };
  }, [intervalMs]);

  const getBackgroundParallaxTween = (
    axis: 'x' | 'y',
    targetRef: typeof backgroundXToRef,
  ) => {
    if (!targetRef.current && backgroundRef.current) {
      targetRef.current = gsap.quickTo(backgroundRef.current, axis, {
        duration: 0.7,
        ease: 'power3.out',
      });
    }

    return targetRef.current;
  };

  const handleBackgroundPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (!sectionRef.current) {
      return;
    }

    const rect = sectionRef.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    getBackgroundParallaxTween('x', backgroundXToRef)?.(x * 42);
    getBackgroundParallaxTween('y', backgroundYToRef)?.(y * 32);
  };

  const resetBackgroundParallax = () => {
    getBackgroundParallaxTween('x', backgroundXToRef)?.(0);
    getBackgroundParallaxTween('y', backgroundYToRef)?.(0);
  };

  useGSAP(
    () => {
      if (incomingIndex === null) {
        return;
      }

      const activeNodes = [
        activeTextRef.current,
        activeTopRef.current,
        activeBottomRef.current,
      ];
      const incomingNodes = [
        incomingTextRef.current,
        incomingTopRef.current,
        incomingBottomRef.current,
      ];

      if (activeNodes.some((node) => !node) || incomingNodes.some((node) => !node)) {
        return;
      }

      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const duration = reduceMotion ? 0.12 : 0.62;
      const artExitDistance = reduceMotion ? 0 : 190;
      const artEnterDistance = reduceMotion ? 0 : 190;
      const textExitScale = reduceMotion ? 1 : 1.65;
      const textEnterScale = reduceMotion ? 1 : 0.9;
      const timeline = gsap.timeline({
        defaults: {
          ease: 'power3.inOut',
        },
        onComplete: () => {
          setActiveIndex(incomingIndex);
          setIncomingIndex(null);
        },
      });

      gsap.set(incomingTextRef.current, {
        autoAlpha: 0,
        y: reduceMotion ? 0 : 36,
        scale: textEnterScale,
        filter: reduceMotion ? 'none' : 'blur(10px)',
      });
      gsap.set(incomingTopRef.current, {
        autoAlpha: 0,
        y: -artEnterDistance,
        scale: 1,
        transformOrigin: '50% 100%',
      });
      gsap.set(incomingBottomRef.current, {
        autoAlpha: 0,
        y: artEnterDistance,
        scale: 1,
        transformOrigin: '50% 0%',
      });

      timeline
        .to(
          activeTextRef.current,
          {
            autoAlpha: 0,
            y: reduceMotion ? 0 : -34,
            scale: textExitScale,
            filter: reduceMotion ? 'none' : 'blur(8px)',
            duration,
          },
          0,
        )
        .to(
          activeTopRef.current,
          {
            autoAlpha: 0,
            y: -artExitDistance,
            transformOrigin: '50% 100%',
            duration: duration * 1.08,
          },
          0,
        )
        .to(
          activeBottomRef.current,
          {
            autoAlpha: 0,
            y: artExitDistance,
            transformOrigin: '50% 0%',
            duration: duration * 1.08,
          },
          0,
        )
        .to(
          incomingTextRef.current,
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            filter: 'none',
            duration: duration * 0.9,
          },
          0.16,
        )
        .to(
          incomingTopRef.current,
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: duration * 0.96,
          },
          0.1,
        )
        .to(
          incomingBottomRef.current,
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: duration * 0.96,
          },
          0.1,
        );

      return () => {
        timeline.kill();
      };
    },
    { scope: sectionRef, dependencies: [incomingIndex] },
  );

  return (
    <FullPageSection id="text-section" className="items-stretch bg-white p-0">
      <section
        ref={sectionRef}
        className="relative h-full w-full overflow-hidden bg-white text-black"
        aria-label="XLAM Media statements"
        onPointerMove={handleBackgroundPointerMove}
        onPointerLeave={resetBackgroundParallax}
        {...scrollIgnoreAttr}
      >
        <div
          ref={backgroundRef}
          className="pointer-events-none absolute -inset-[5%] z-0 opacity-100"
          data-text-section-bg
          aria-hidden="true"
          style={{ willChange: 'transform' }}
        >
          <Image
            src={GeneralBackground}
            alt=""
            aria-hidden="true"
            fill
            loading="eager"
            className="object-cover"
            sizes="100vw"
          />
        </div>

        <SlideArtwork
          key={`active-${activeSlide.id}`}
          slide={activeSlide}
          textRef={activeTextRef}
          topRef={activeTopRef}
          bottomRef={activeBottomRef}
          layerClassName="z-10"
        />

        {incomingSlide ? (
          <SlideArtwork
            key={`incoming-${incomingSlide.id}`}
            slide={incomingSlide}
            textRef={incomingTextRef}
            topRef={incomingTopRef}
            bottomRef={incomingBottomRef}
            layerClassName="z-20"
          />
        ) : null}
      </section>
    </FullPageSection>
  );
}

interface SlideArtworkProps {
  slide: TextSlide;
  textRef: RefObject<HTMLHeadingElement | null>;
  topRef: RefObject<HTMLDivElement | null>;
  bottomRef: RefObject<HTMLDivElement | null>;
  layerClassName: string;
}

function SlideArtwork({
  slide,
  textRef,
  topRef,
  bottomRef,
  layerClassName,
}: SlideArtworkProps) {
  return (
    <div className={`pointer-events-none absolute inset-0 ${layerClassName}`}>
      <div
        ref={topRef}
        className="absolute left-1/2 top-[clamp(-190px,-9.9vw,-40px)] aspect-[1920/890] w-screen -translate-x-1/2"
        style={{ willChange: 'transform, opacity' }}
      >
        <Image
          src={slide.topImage}
          alt=""
          aria-hidden="true"
          fill
          loading="eager"
          className="object-cover object-bottom"
          sizes="100vw"
        />
      </div>

      <div
        ref={bottomRef}
        className="absolute bottom-[clamp(-190px,-9.9vw,-40px)] left-1/2 aspect-[1920/730] w-screen -translate-x-1/2"
        style={{ willChange: 'transform, opacity' }}
      >
        <Image
          src={slide.bottomImage}
          alt=""
          aria-hidden="true"
          fill
          loading="eager"
          className="object-cover object-top"
          sizes="100vw"
        />
      </div>

      <h2
        ref={textRef}
        className="absolute left-1/2 top-1/2 z-30 w-[min(88vw,1381px)] -translate-x-1/2 -translate-y-1/2 text-center text-[clamp(1.85rem,5.6vw,3.75rem)] font-black uppercase leading-[1.12] text-black sm:leading-[1.16] lg:leading-[1.21]"
        style={{ willChange: 'transform, opacity, filter' }}
      >
        {slide.lines.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </h2>
    </div>
  );
}
