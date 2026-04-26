'use client';

import {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  type CSSProperties,
  type MutableRefObject,
} from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import Image, { type StaticImageData } from 'next/image';
import FullPageSection from '@/src/components/ui/FullPageSection';
import Spring from '@/src/lib/assets/main/spring.png';
import Sphere from '@/src/lib/assets/main/circle.png';
import StoneM from '@/src/lib/assets/main/m.png';
import GreenBrick from '@/src/lib/assets/main/lego_green.png';
import FurryX from '@/src/lib/assets/main/x.png';
import Shield from '@/src/lib/assets/main/sield.png';
import Tube from '@/src/lib/assets/main/tube.png';
import DarkBrick from '@/src/lib/assets/main/lego_dark.png';

export interface SecondSectionDesignHandle {
  setProgress: (progress: number) => void;
  playEnter: () => void;
  playExit: () => void;
}

type ArtKey =
  | 'spring'
  | 'sphere'
  | 'stoneM'
  | 'greenBrick'
  | 'furryX'
  | 'shield'
  | 'tube'
  | 'brick';

interface ArtItemConfig {
  key: ArtKey;
  src: StaticImageData;
  alt: string;
  className: string;
  imageClassName: string;
  left: number;
  top: number;
  size: number;
  depth: number;
  delay: number;
  startX: number;
  startY: number;
  startRotate: number;
  exitX: number;
  exitY: number;
  exitRotate: number;
}

const artItems: ArtItemConfig[] = [
  {
    key: 'spring',
    src: Spring,
    alt: 'Blue spring',
    className: 'absolute',
    imageClassName: 'w-full',
    left: 158,
    top: -225,
    size: 584,
    depth: 0.9,
    delay: 0,
    startX: -520,
    startY: -340,
    startRotate: -34,
    exitX: -460,
    exitY: -280,
    exitRotate: -24,
  },
  {
    key: 'sphere',
    src: Sphere,
    alt: 'Black sphere',
    className: 'absolute',
    imageClassName: 'w-full',
    left: 600,
    top: -13,
    size: 481,
    depth: 0.55,
    delay: 0.34,
    startX: 0,
    startY: -420,
    startRotate: 22,
    exitX: 0,
    exitY: -360,
    exitRotate: 18,
  },
  {
    key: 'stoneM',
    src: StoneM,
    alt: 'Stone M',
    className: 'absolute hidden md:block',
    imageClassName: 'w-full',
    left: 795,
    top: -277,
    size: 803,
    depth: 0.85,
    delay: 0.16,
    startX: 560,
    startY: -320,
    startRotate: 18,
    exitX: 560,
    exitY: -320,
    exitRotate: 18,
  },
  {
    key: 'greenBrick',
    src: GreenBrick,
    alt: 'Green brick',
    className: 'absolute',
    imageClassName: 'w-full rotate-[-34deg]',
    left: 431,
    top: -505,
    size: 886,
    depth: 0.7,
    delay: 0.08,
    startX: 80,
    startY: -460,
    startRotate: -20,
    exitX: 120,
    exitY: -520,
    exitRotate: -22,
  },
  {
    key: 'furryX',
    src: FurryX,
    alt: 'Green X',
    className: 'absolute',
    imageClassName: 'w-full',
    left: 25,
    top: 441,
    size: 830,
    depth: 0.8,
    delay: 0.52,
    startX: -500,
    startY: 420,
    startRotate: -40,
    exitX: -520,
    exitY: 420,
    exitRotate: -28,
  },
  {
    key: 'shield',
    src: Shield,
    alt: 'Shield',
    className: 'absolute hidden md:block',
    imageClassName: 'w-full',
    left: 556,
    top: 456,
    size: 524,
    depth: 0.45,
    delay: 0.7,
    startX: 0,
    startY: 420,
    startRotate: -24,
    exitX: 80,
    exitY: 380,
    exitRotate: 18,
  },
  {
    key: 'tube',
    src: Tube,
    alt: 'Metal tube',
    className: 'absolute hidden md:block',
    imageClassName: 'w-full rotate-[38deg]',
    left: 369,
    top: 603,
    size: 839,
    depth: 0.35,
    delay: 1.06,
    startX: -260,
    startY: 560,
    startRotate: 32,
    exitX: -220,
    exitY: 520,
    exitRotate: 22,
  },
  {
    key: 'brick',
    src: DarkBrick,
    alt: 'Dark brick',
    className: 'absolute',
    imageClassName: 'w-full rotate-[12deg]',
    left: 540,
    top: 270,
    size: 1095,
    depth: 0.65,
    delay: 0.88,
    startX: 560,
    startY: 460,
    startRotate: 26,
    exitX: 600,
    exitY: 460,
    exitRotate: 22,
  },
];

function getOrCreateRef<T>(store: MutableRefObject<Record<string, T | null>>, key: string) {
  if (!(key in store.current)) {
    store.current[key] = null;
  }

  return (node: T | null) => {
    store.current[key] = node;
  };
}

export const SecondSectionDesign = forwardRef<SecondSectionDesignHandle>(
  function SecondSectionDesign(_props, ref) {
    const sectionRef = useRef<HTMLElement>(null);
    const titleRef = useRef<HTMLDivElement>(null);
    const artRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const parallaxRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const timelineRef = useRef<gsap.core.Timeline | null>(null);
    const scatterTimelineRef = useRef<gsap.core.Timeline | null>(null);
    const titleNodeRef = useRef<HTMLDivElement | null>(null);
    const progressRef = useRef(0);

    const lines = useMemo(
      () => [
        'НАШ ПРОДАКШН НАЧИНАЕТСЯ',
        'С ИДЕЙ, КОТОРЫЕ ДРУГИЕ БЫ',
        'ВЫБРОСИЛИ',
      ],
      [],
    );

    useGSAP(
      () => {
        if (!sectionRef.current || !titleRef.current) {
          return;
        }

        const timeline = gsap.timeline({
          paused: true,
          defaults: {
            ease: 'power3.out',
          },
        });

        gsap.set(titleRef.current, {
          autoAlpha: 0,
          scale: 0,
          xPercent: -50,
          yPercent: -50,
          transformOrigin: 'center center',
        });

        titleNodeRef.current = titleRef.current;

        artItems.forEach((item) => {
          const artNode = artRefs.current[item.key];

          if (!artNode) {
            return;
          }

          gsap.set(artNode, {
            x: item.startX,
            y: item.startY,
            rotate: item.startRotate,
            autoAlpha: 0,
          });

          timeline.to(
            artNode,
            {
              x: 0,
              y: 0,
              rotate: 0,
              autoAlpha: 1,
              duration: 1.18,
              ease: 'power2.out',
            },
            item.delay,
          );
        });

        timelineRef.current = timeline;
        timeline.progress(progressRef.current);

        const parallaxControllers = artItems
          .map((item) => {
            const node = parallaxRefs.current[item.key];

            if (!node) {
              return null;
            }

            return {
              depth: item.depth,
              xTo: gsap.quickTo(node, 'x', {
                duration: 0.55,
                ease: 'power3.out',
              }),
              yTo: gsap.quickTo(node, 'y', {
                duration: 0.55,
                ease: 'power3.out',
              }),
            };
          })
          .filter(Boolean);

        const handlePointerMove = (event: PointerEvent) => {
          if (!sectionRef.current || progressRef.current < 0.96) {
            return;
          }

          const rect = sectionRef.current.getBoundingClientRect();
          const x = (event.clientX - rect.left) / rect.width - 0.5;
          const y = (event.clientY - rect.top) / rect.height - 0.5;

          parallaxControllers.forEach((controller) => {
            if (!controller) {
              return;
            }

            controller.xTo(x * controller.depth * 42);
            controller.yTo(y * controller.depth * 34);
          });
        };

        const resetParallax = () => {
          parallaxControllers.forEach((controller) => {
            if (!controller) {
              return;
            }

            controller.xTo(0);
            controller.yTo(0);
          });
        };

        sectionRef.current.addEventListener('pointermove', handlePointerMove);
        sectionRef.current.addEventListener('pointerleave', resetParallax);

        return () => {
          sectionRef.current?.removeEventListener('pointermove', handlePointerMove);
          sectionRef.current?.removeEventListener('pointerleave', resetParallax);
          timelineRef.current?.kill();
          scatterTimelineRef.current?.kill();
        };
      },
      { scope: sectionRef },
    );

    useImperativeHandle(ref, () => ({
      setProgress(progress: number) {
        scatterTimelineRef.current?.kill();
        progressRef.current = gsap.utils.clamp(0, 1, progress);
        const revealProgress = gsap.utils.mapRange(0.46, 1, 0, 1, progressRef.current);
        timelineRef.current?.progress(gsap.utils.clamp(0, 1, revealProgress));

        if (titleNodeRef.current) {
          const titleProgress = gsap.utils.clamp(
            0,
            1,
            gsap.utils.mapRange(0.52, 0.94, 0, 1, progressRef.current),
          );
          const easedTitleProgress = gsap.parseEase('power2.out')(titleProgress);

          gsap.set(titleNodeRef.current, {
            autoAlpha: easedTitleProgress,
            scale: easedTitleProgress,
            xPercent: -50,
            yPercent: -50,
          });
        }
      },
      playEnter() {
        scatterTimelineRef.current?.kill();

        const timeline = gsap.timeline({
          defaults: {
            duration: 0.82,
            ease: 'power3.out',
          },
        });

        artItems.forEach((item) => {
          const artNode = artRefs.current[item.key];

          if (!artNode) {
            return;
          }

          timeline.to(
            artNode,
            {
              x: 0,
              y: 0,
              rotate: 0,
              autoAlpha: 1,
            },
            item.delay * 0.22,
          );
        });

        if (titleNodeRef.current) {
          timeline.to(
            titleNodeRef.current,
            {
              autoAlpha: 1,
              scale: 1,
              xPercent: -50,
              yPercent: -50,
              duration: 0.62,
            },
            0.12,
          );
        }

        scatterTimelineRef.current = timeline;
      },
      playExit() {
        scatterTimelineRef.current?.kill();

        const timeline = gsap.timeline({
          defaults: {
            duration: 0.74,
            ease: 'power3.inOut',
          },
        });

        artItems.forEach((item) => {
          const artNode = artRefs.current[item.key];

          if (!artNode) {
            return;
          }

          timeline.to(
            artNode,
            {
              x: item.exitX,
              y: item.exitY,
              rotate: item.exitRotate,
              autoAlpha: 0,
            },
            item.delay * 0.08,
          );
        });

        if (titleNodeRef.current) {
          timeline.to(
            titleNodeRef.current,
            {
              autoAlpha: 0,
              scale: 0.92,
              xPercent: -50,
              yPercent: -58,
              duration: 0.58,
            },
            0,
          );
        }

        scatterTimelineRef.current = timeline;
      },
    }));
   
    return (
      <FullPageSection
        id="production"
        className="relative overflow-hidden bg-black p-0"
      >
        <section
          ref={sectionRef}
          className="relative h-full w-full overflow-hidden"
        >
          <div className="pointer-events-none absolute inset-0 z-10 mx-auto w-full max-w-[1710px] overflow-visible">
            <div className="absolute left-1/2 top-1/2 h-[962px] w-[1710px] origin-center -translate-x-1/2 -translate-y-1/2 scale-[0.46] sm:scale-[0.58] md:scale-[0.75] lg:scale-[0.84] xl:scale-[0.9] 2xl:scale-100">
              {artItems.map((item) => (
                <div
                  key={item.key}
                  ref={getOrCreateRef(artRefs, item.key)}
                  className={`${item.className} pointer-events-none`}
                  style={
                    {
                      left: item.left,
                      top: item.top,
                      width: item.size,
                      height: item.size,
                      willChange: 'transform, opacity',
                    } as CSSProperties
                  }
                >
                  <div
                    ref={getOrCreateRef(parallaxRefs, item.key)}
                    style={{ willChange: 'transform' }}
                  >
                    <Image
                      src={item.src}
                      alt=""
                      aria-hidden="true"
                      unoptimized
                      loading={item.key === 'greenBrick' ? 'eager' : 'lazy'}
                      className={item.imageClassName}
                      sizes="(max-width: 1710px) 100vw, 1710px"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            ref={titleRef}
            className="absolute left-1/2 top-1/2 z-30 flex w-[88%] max-w-[1100px] flex-col items-center px-4 py-[14svh] text-center lg:w-[57%]"
            data-safe-zone="heading"
            style={{ willChange: 'transform, opacity' }}
          >
            <h2
              aria-label={lines.join(' ')}
              className="text-[clamp(2rem,3.125vw,3.75rem)] font-bold uppercase leading-[1.21] text-white"
            >
              {lines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h2>
          </div>
        </section>
      </FullPageSection>
    );
  },
);
