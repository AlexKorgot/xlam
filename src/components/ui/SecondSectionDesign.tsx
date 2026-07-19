'use client';

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
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

type CssLength = number | string;

type HorizontalPosition =
  | {
      left: CssLength;
      right?: never;
    }
  | {
      right: CssLength;
      left?: never;
    };

type VerticalPosition =
  | {
      top: CssLength;
      bottom?: never;
    }
  | {
      bottom: CssLength;
      top?: never;
    };

type ArtBreakpoint = 'mobilePortrait' | 'mobileLandscape' | 'desktop';

type ArtLayout = {
  size: CssLength;
} & HorizontalPosition &
  VerticalPosition;

type ArtMotion = {
  startX: number;
  startY: number;
  startRotate: number;
  endRotate?: number;
  scaleX?: number;
  exitX: number;
  exitY: number;
  exitRotate: number;
};

type ArtItemConfig = {
  key: ArtKey;
  src: StaticImageData;
  alt: string;
  className: string;
  imageClassName: string;
  depth: number;
  delay: number;
  layouts: Record<ArtBreakpoint, ArtLayout>;
  motion: Record<ArtBreakpoint, ArtMotion>;
};

const artStages: Record<
  ArtBreakpoint,
  {
    width: number;
    height: number;
    className: string;
  }
> = {
  mobilePortrait: {
    width: 390,
    height: 760,
    className: 'scale-100',
  },
  mobileLandscape: {
    width: 844,
    height: 390,
    className: 'scale-100',
  },
  desktop: {
    width: 1710,
    height: 962,
    className:
      'scale-[0.46] sm:scale-[0.58] md:scale-[0.75] lg:scale-[0.84] xl:scale-[0.9] 2xl:scale-100',
  },
};

const artItems: ArtItemConfig[] = [
  {
    key: 'spring',
    src: Spring,
    alt: 'Blue spring',
    className: 'absolute',
    imageClassName: 'w-full',
    depth: 0.9,
    delay: 0,
    layouts: {
      mobilePortrait: {
        left: -30,
        top: 0,
        size: 220,
      },
      mobileLandscape: {
        left: 160,
        top: -70,
        size: 210,
      },
      desktop: {
        left: 158,
        top: -225,
        size: 584,
      },
    },
    motion: {
      mobilePortrait: {
        startX: -160,
        startY: -120,
        startRotate: 100,
        endRotate: 280,
        exitX: -220,
        exitY: -150,
        exitRotate: 420,
      },
      mobileLandscape: {
        startX: -130,
        startY: -90,
        startRotate: 100,
        endRotate: 280,
        exitX: -180,
        exitY: -120,
        exitRotate: 420,
      },
      desktop: {
        startX: -460,
        startY: -300,
        startRotate: 100,
        endRotate: 280,
        exitX: -520,
        exitY: -340,
        exitRotate: 420,
      },
    },
  },
  {
    key: 'sphere',
    src: Sphere,
    alt: 'Black sphere',
    className: 'absolute z-2',
    imageClassName: 'w-full',
    depth: 0.55,
    delay: 0.34,
    layouts: {
      mobilePortrait: {
        left: 'calc(50% - 140px)',
        top: 100,
        size: 280,
      },
      mobileLandscape: {
        left: 'calc(50% - 82px)',
        top: 30,
        size: 164,
      },
      desktop: {
        left: 'calc(50% - 240px)',
        top: -25,
        size: 480,
      },
    },
    motion: {
      mobilePortrait: {
        startX: 0,
        startY: -150,
        startRotate: -18,
        exitX: 0,
        exitY: -180,
        exitRotate: 22,
      },
      mobileLandscape: {
        startX: 0,
        startY: -110,
        startRotate: -18,
        exitX: 0,
        exitY: -135,
        exitRotate: 22,
      },
      desktop: {
        startX: 0,
        startY: -320,
        startRotate: -18,
        exitX: 0,
        exitY: -360,
        exitRotate: 22,
      },
    },
  },
  {
    key: 'stoneM',
    src: StoneM,
    alt: 'Stone M',
    className: 'absolute',
    imageClassName: 'w-full',
    depth: 0.85,
    delay: 0.16,
    layouts: {
      mobilePortrait: {
        right: -80,
        top: 50,
        size: 300,
      },
      mobileLandscape: {
        right: 0,
        top: -40,
        size: 400,
      },
      desktop: {
        right: 'calc(10% - 100px)',
        top: -100,
        size: 803,
      },
    },
    motion: {
      mobilePortrait: {
        startX: 170,
        startY: -110,
        startRotate: 16,
        exitX: 220,
        exitY: -140,
        exitRotate: 24,
      },
      mobileLandscape: {
        startX: 160,
        startY: -100,
        startRotate: 16,
        exitX: 210,
        exitY: -130,
        exitRotate: 24,
      },
      desktop: {
        startX: 460,
        startY: -260,
        startRotate: 16,
        exitX: 540,
        exitY: -320,
        exitRotate: 24,
      },
    },
  },
  {
    key: 'greenBrick',
    src: GreenBrick,
    alt: 'Green brick',
    className: 'absolute z-1',
    imageClassName: 'w-full rotate-[-34deg]',
    depth: 0.7,
    delay: 0.08,
    layouts: {
      mobilePortrait: {
        left: 'calc(50% - 80px)',
        top: -60,
        size: 220,
      },
      mobileLandscape: {
        left: 'calc(50% - 102px)',
        top: -90,
        size: 204,
      },
      desktop: {
        left: 'calc(50% - 200px)',
        top: -200,
        size: 400,
      },
    },
    motion: {
      mobilePortrait: {
        startX: 24,
        startY: -110,
        startRotate: -18,
        exitX: 48,
        exitY: -140,
        exitRotate: -28,
      },
      mobileLandscape: {
        startX: 18,
        startY: -80,
        startRotate: -18,
        exitX: 38,
        exitY: -105,
        exitRotate: -28,
      },
      desktop: {
        startX: 32,
        startY: -220,
        startRotate: -18,
        exitX: 72,
        exitY: -280,
        exitRotate: -28,
      },
    },
  },
  {
    key: 'furryX',
    src: FurryX,
    alt: 'Green X',
    className: 'absolute',
    imageClassName: 'w-full',
    depth: 0.8,
    delay: 0.52,
    layouts: {
      mobilePortrait: {
        left: 0,
        bottom: -4,
        size: 230,
      },
      mobileLandscape: {
        left: 180,
        bottom: -60,
        size: 190,
      },
      desktop: {
        left: 'calc(10%)',
        bottom: -170,
        size: 500,
      },
    },
    motion: {
      mobilePortrait: {
        startX: -170,
        startY: 170,
        startRotate: -64,
        scaleX: -1,
        endRotate: -20,
        exitX: -220,
        exitY: 210,
        exitRotate: -82,
      },
      mobileLandscape: {
        startX: -130,
        startY: 100,
        startRotate: -64,
        scaleX: -1,
        endRotate: -20,
        exitX: -180,
        exitY: 130,
        exitRotate: -82,
      },
      desktop: {
        startX: -360,
        startY: 300,
        startRotate: -64,
        scaleX: -1,
        endRotate: -20,
        exitX: -420,
        exitY: 360,
        exitRotate: -82,
      },
    },
  },
  {
    key: 'shield',
    src: Shield,
    alt: 'Shield',
    className: 'absolute',
    imageClassName: 'w-full',
    depth: 0.45,
    delay: 0.7,
    layouts: {
      mobilePortrait: {
        left: 127,
        bottom: 80,
        size: 250,
      },
      mobileLandscape: {
        left: 'calc(50% - 115px)',
        bottom: 0,
        size: 230,
      },
      desktop: {
        left: 556,
        top: 456,
        size: 524,
      },
    },
    motion: {
      mobilePortrait: {
        startX: 12,
        startY: 150,
        startRotate: -18,
        exitX: 55,
        exitY: 180,
        exitRotate: 18,
      },
      mobileLandscape: {
        startX: 8,
        startY: 100,
        startRotate: -18,
        exitX: 42,
        exitY: 125,
        exitRotate: 18,
      },
      desktop: {
        startX: 20,
        startY: 320,
        startRotate: -18,
        exitX: 80,
        exitY: 360,
        exitRotate: 18,
      },
    },
  },
  {
    key: 'tube',
    src: Tube,
    alt: 'Metal tube',
    className: 'absolute',
    imageClassName: 'w-full rotate-[38deg]',
    depth: 0.35,
    delay: 1.06,
    layouts: {
      mobilePortrait: {
        left: 70,
        bottom: -100,
        size: 230,
      },
      mobileLandscape: {
        left: 'calc(50% - 92px)',
        bottom: '-24%',
        size: 184,
      },
      desktop: {
        left: 'calc(50% - 270px)',
        bottom: -290,
        size: 539,
      },
    },
    motion: {
      mobilePortrait: {
        startX: -45,
        startY: 180,
        startRotate: -42,
        exitX: -80,
        exitY: 220,
        exitRotate: -178,
        endRotate: -130,
      },
      mobileLandscape: {
        startX: -34,
        startY: 120,
        startRotate: -42,
        exitX: -62,
        exitY: 150,
        exitRotate: -178,
        endRotate: -130,
      },
      desktop: {
        startX: -90,
        startY: 360,
        startRotate: -42,
        exitX: -150,
        exitY: 420,
        exitRotate: -178,
        endRotate: -130,
      },
    },
  },
  {
    key: 'brick',
    src: DarkBrick,
    alt: 'Dark brick',
    className: 'absolute',
    imageClassName: 'w-full rotate-[12deg]',
    depth: 0.65,
    delay: 0.88,
    layouts: {
      mobilePortrait: {
        right: -100,
        bottom: -70,
        size: 280,
      },
      mobileLandscape: {
        right: 130,
        bottom: -110,
        size: 280,
      },
      desktop: {
        right: 110,
        bottom: -250,
        size: 700,
      },
    },
    motion: {
      mobilePortrait: {
        startX: 170,
        startY: 170,
        startRotate: -210,
        exitX: 230,
        exitY: 220,
        exitRotate: -320,
        endRotate: -260,
      },
      mobileLandscape: {
        startX: 135,
        startY: 115,
        startRotate: -210,
        exitX: 185,
        exitY: 150,
        exitRotate: -320,
        endRotate: -260,
      },
      desktop: {
        startX: 360,
        startY: 320,
        startRotate: -210,
        exitX: 440,
        exitY: 380,
        exitRotate: -320,
        endRotate: -260,
      },
    },
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

function getRevealProgress(progress: number) {
  return gsap.utils.clamp(0, 1, gsap.utils.mapRange(0.46, 1, 0, 1, progress));
}

function syncTitleProgress(titleNode: HTMLDivElement, progress: number) {
  const titleProgress = gsap.utils.clamp(
    0,
    1,
    gsap.utils.mapRange(0.52, 0.94, 0, 1, progress),
  );
  const easedTitleProgress = gsap.parseEase('power2.out')(titleProgress);

  gsap.set(titleNode, {
    autoAlpha: easedTitleProgress,
    scale: easedTitleProgress,
    xPercent: -50,
    yPercent: -50,
  });
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
    const [artBreakpoint, setArtBreakpoint] = useState<ArtBreakpoint>('desktop');
    const activeArtStage = artStages[artBreakpoint];

    const lines = useMemo(
      () => [
        'НАШ ПРОДАКШН НАЧИНАЕТСЯ',
        'С ИДЕЙ, КОТОРЫЕ ДРУГИЕ БЫ',
        'ВЫБРОСИЛИ',
      ],
      [],
    );

    useEffect(() => {
      const syncBreakpoint = () => {
        const { innerWidth, innerHeight } = window;

        if (innerWidth >= 768) {
          setArtBreakpoint('desktop');
          return;
        }

        setArtBreakpoint(
          innerWidth > innerHeight ? 'mobileLandscape' : 'mobilePortrait',
        );
      };

      syncBreakpoint();
      window.addEventListener('resize', syncBreakpoint);
      window.visualViewport?.addEventListener('resize', syncBreakpoint);

      return () => {
        window.removeEventListener('resize', syncBreakpoint);
        window.visualViewport?.removeEventListener('resize', syncBreakpoint);
      };
    }, []);

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
        syncTitleProgress(titleRef.current, progressRef.current);

        artItems.forEach((item) => {
          const artNode = artRefs.current[item.key];

          if (!artNode) {
            return;
          }

          const motion = item.motion[artBreakpoint];

          gsap.set(artNode, {
            x: motion.startX,
            y: motion.startY,
            rotate: motion.startRotate,
            scaleX: motion.scaleX ?? 1,
            autoAlpha: 0,
          });

          timeline.to(
            artNode,
            {
              x: 0,
              y: 0,
              rotate: motion.endRotate ?? 0,
              scaleX: motion.scaleX ?? 1,
              autoAlpha: 1,
              duration: 1.18,
              ease: 'power2.out',
            },
            item.delay,
          );
        });

        timelineRef.current = timeline;
        timeline.progress(getRevealProgress(progressRef.current));

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
      { scope: sectionRef, dependencies: [artBreakpoint], revertOnUpdate: true },
    );

    useImperativeHandle(ref, () => ({
      setProgress(progress: number) {
        scatterTimelineRef.current?.kill();
        progressRef.current = gsap.utils.clamp(0, 1, progress);
        timelineRef.current?.progress(getRevealProgress(progressRef.current));

        if (titleNodeRef.current) {
          syncTitleProgress(titleNodeRef.current, progressRef.current);
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

          const motion = item.motion[artBreakpoint];

          timeline.to(
            artNode,
            {
              x: 0,
              y: 0,
              rotate: motion.endRotate ?? 0,
              scaleX: motion.scaleX ?? 1,
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

          const motion = item.motion[artBreakpoint];

          timeline.to(
            artNode,
            {
              x: motion.exitX,
              y: motion.exitY,
              rotate: motion.exitRotate,
              scaleX: motion.scaleX ?? 1,
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
            <div
              className={`absolute left-1/2 top-1/2 origin-center -translate-x-1/2 -translate-y-1/2 ${activeArtStage.className}`}
              style={{
                width: activeArtStage.width,
                height: activeArtStage.height,
              }}
            >
              {artItems.map((item) => {
                const layout = item.layouts[artBreakpoint];

                return (
                  <div
                    key={item.key}
                    ref={getOrCreateRef(artRefs, item.key)}
                    className={`${item.className} pointer-events-none`}
                    style={
                      {
                        left: layout.left,
                        right: layout.right,
                        top: layout.top,
                        bottom: layout.bottom,
                        width: layout.size,
                        height: layout.size,
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
                        loading="eager"
                        className={item.imageClassName}
                        sizes="(max-width: 1710px) 100vw, 1710px"
                      />
                    </div>
                  </div>
                );
              })}
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
              <span className="block">{lines[0]}</span>
              <span className="block">
                С <span className="text-[#66FF66]">ИДЕЙ</span>, КОТОРЫЕ ДРУГИЕ БЫ
              </span>
              <span className="block">{lines[2]}</span>
            </h2>
          </div>
        </section>
      </FullPageSection>
    );
  },
);
