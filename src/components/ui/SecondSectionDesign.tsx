'use client';

import {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  type MutableRefObject,
} from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import Image, { type StaticImageData } from 'next/image';
import FullPageSection from '@/src/components/ui/FullPageSection';
import Spring from '@/src/lib/assets/main/spring.png';
import Sphere from '@/src/lib/assets/main/circle.png';
import StoneM from '@/src/lib/assets/main/m.png';
import FurryX from '@/src/lib/assets/main/x.png';
import Shield from '@/src/lib/assets/main/sield.png';
import Tube from '@/src/lib/assets/main/tube.png';
import DarkBrick from '@/src/lib/assets/main/lego_dark.png';

export interface SecondSectionDesignHandle {
  setProgress: (progress: number) => void;
}

type ArtKey =
  | 'spring'
  | 'sphere'
  | 'stoneM'
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
  depth: number;
  delay: number;
  startX: number;
  startY: number;
  startRotate: number;
}

const artItems: ArtItemConfig[] = [
  {
    key: 'spring',
    src: Spring,
    alt: 'Blue spring',
    className:
      'absolute left-[4%] top-[-9%] w-[42vw] max-w-[33rem] min-w-[15rem] md:left-[5%] lg:left-[12%] lg:top-[-8%]',
    imageClassName: 'w-full',
    depth: 0.9,
    delay: 0,
    startX: -520,
    startY: -340,
    startRotate: -34,
  },
  {
    key: 'sphere',
    src: Sphere,
    alt: 'Black sphere',
    className:
      'absolute left-[42.5%] top-[11%] w-[16vw] max-w-[12rem] min-w-[6.5rem] lg:left-[42.5%] lg:top-[11%]',
    imageClassName: 'w-full',
    depth: 0.55,
    delay: 0.34,
    startX: 0,
    startY: -420,
    startRotate: 22,
  },
  {
    key: 'stoneM',
    src: StoneM,
    alt: 'Stone M',
    className:
      'absolute right-[1%] top-[-6%] w-[42vw] max-w-[33rem] min-w-[15rem] md:right-[2%] lg:right-[9%] lg:top-[-5%]',
    imageClassName: 'w-full',
    depth: 0.85,
    delay: 0.16,
    startX: 560,
    startY: -320,
    startRotate: 18,
  },
  {
    key: 'furryX',
    src: FurryX,
    alt: 'Green X',
    className:
      'absolute left-[7%] bottom-[-31%] w-[39vw] max-w-[31rem] min-w-[13rem] md:left-[8%] lg:left-[12%] lg:bottom-[-28%]',
    imageClassName: 'w-full',
    depth: 0.8,
    delay: 0.52,
    startX: -500,
    startY: 420,
    startRotate: -40,
  },
  {
    key: 'shield',
    src: Shield,
    alt: 'Shield',
    className:
      'absolute left-[38.5%] bottom-[7%] w-[20vw] max-w-[14rem] min-w-[6.5rem] lg:left-[39%] lg:bottom-[7%]',
    imageClassName: 'w-full',
    depth: 0.45,
    delay: 0.7,
    startX: 0,
    startY: 420,
    startRotate: -24,
  },
  {
    key: 'tube',
    src: Tube,
    alt: 'Metal tube',
    className:
      'absolute left-[31%] bottom-[-36%] w-[28vw] max-w-[21rem] min-w-[9rem] lg:left-[32%] lg:bottom-[-33%]',
    imageClassName: 'w-full rotate-[38deg]',
    depth: 0.35,
    delay: 1.06,
    startX: -260,
    startY: 560,
    startRotate: 32,
  },
  {
    key: 'brick',
    src: DarkBrick,
    alt: 'Dark brick',
    className:
      'absolute right-[4%] bottom-[-26%] w-[37vw] max-w-[29rem] min-w-[12rem] md:right-[5%] lg:right-[10%] lg:bottom-[-23%]',
    imageClassName: 'w-full rotate-[12deg]',
    depth: 0.65,
    delay: 0.88,
    startX: 560,
    startY: 460,
    startRotate: 26,
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
        };
      },
      { scope: sectionRef },
    );

    useImperativeHandle(ref, () => ({
      setProgress(progress: number) {
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
          });
        }
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
          {artItems.map((item) => (
            <div
              key={item.key}
              ref={getOrCreateRef(artRefs, item.key)}
              className={item.className}
              style={{ willChange: 'transform, opacity' }}
            >
              <div
                ref={getOrCreateRef(parallaxRefs, item.key)}
                style={{ willChange: 'transform' }}
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  unoptimized
                  className={item.imageClassName}
                  sizes="(max-width: 1024px) 30vw, 18vw"
                />
              </div>
            </div>
          ))}

          <div
            ref={titleRef}
            className="absolute inset-x-0 top-[36%] z-20 mx-auto flex max-w-[80rem] flex-col items-center px-4 text-center sm:top-[37%] lg:top-[39%]"
            style={{ willChange: 'transform, opacity' }}
          >
            <h2 className="text-[clamp(2rem,4.4vw,4.15rem)] font-black uppercase leading-[0.9] tracking-[-0.05em] text-white">
              {lines.map((line) => (
                <span
                  key={line}
                  className="mx-auto block w-fit max-w-full px-1 md:whitespace-nowrap"
                >
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
