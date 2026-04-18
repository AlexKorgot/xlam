'use client';

import FullPageSection from '@/src/components/ui/FullPageSection';
import {
  FULLPAGE_SCROLL_EVENT,
  FULLPAGE_SCROLL_IGNORE_ATTR,
} from '@/src/components/ui/FullPageScroll';
import useEmblaCarousel from 'embla-carousel-react';
import WheelGesturesPlugin from 'embla-carousel-wheel-gestures';
import { useEffect, useRef, type RefObject } from 'react';

type ServiceVideoRef = RefObject<HTMLVideoElement | null>;

type VideoRefConfig = {
  ref: ServiceVideoRef;
  handleMouseLeave: (ref: ServiceVideoRef) => () => void;
  handleMouseEnter: (ref: ServiceVideoRef) => () => void;
};

type ServiceSlide = {
  id: string;
  title: string;
  description: string;
  videoRefConfig: VideoRefConfig;
};

interface ServicesSliderSectionProps {
  allowSectionScrollOnEdges?: boolean;
}

const sliderVideoSrc = '/video/3_slider_content_video.mov';
const scrollIgnoreAttr = { [FULLPAGE_SCROLL_IGNORE_ATTR]: 'true' } as const;
const edgeWheelThreshold = 48;
const edgeWheelUnlockDelay = 700;

export function ServicesSliderSection({
  allowSectionScrollOnEdges = false,
}: ServicesSliderSectionProps) {

  const haandleLeave = (ref: ServiceVideoRef) => {
    return () => {
      const video = ref.current;
      if (!video) {
        return;
      }

      video.pause();
      video.currentTime = 0;
    };
  }

  const handleEnter = (ref: ServiceVideoRef) => {
    return () => {
      void ref.current?.play().catch(() => undefined);
    };
  }

  const slides: ServiceSlide[] = [
    {
      id: 'show',
      title: 'ШОУ ПОД КЛЮЧ',
      description:
        'ОТ ИДЕИ ДО ПРЕМЬЕРЫ, РАЗРАБАТЫВАЕМ, СНИМАЕМ И ВЫВОДИМ ШОУ В ЭФИР.',
      videoRefConfig: {
        ref: useRef<HTMLVideoElement | null>(null),
        handleMouseLeave: (ref) => haandleLeave(ref),
        handleMouseEnter: (ref) => handleEnter(ref)
      },
    },
    {
      id: 'ads',
      title: 'РЕКЛАМА',
      description:
        'РАЗРАБАТЫВАЕМ РЕКЛАМНЫЕ ВИДЕО, УСИЛИВАЕМ БРЕНД И ПРИВОДИМ К РЕЗУЛЬТАТУ.',
      videoRefConfig: {
        ref: useRef<HTMLVideoElement | null>(null),
        handleMouseLeave: (ref) => haandleLeave(ref),
        handleMouseEnter: (ref) => handleEnter(ref)
      },
    },
    {
      id: 'b2b',
      title: 'B2B КОНТЕНТ',
      description:
        'ПРОИЗВОДИМ СИСТЕМНЫЙ КОНТЕНТ ДЛЯ БИЗНЕСА: ИМИДЖ, ПРОДУКТ, КОММУНИКАЦИИ.',
      videoRefConfig: {
        ref: useRef<HTMLVideoElement | null>(null),
        handleMouseLeave: (ref) => haandleLeave(ref),
        handleMouseEnter: (ref) => handleEnter(ref)
      },
    },
    {
      id: 'branding',
      title: 'БРЕНДИНГ',
      description:
        'ФОРМИРУЕМ ВИЗУАЛЬНЫЙ ЯЗЫК БРЕНДА И УПАКОВЫВАЕМ ЕГО В КОНТЕНТ.',
      videoRefConfig: {
        ref: useRef<HTMLVideoElement | null>(null),
        handleMouseLeave: (ref) => haandleLeave(ref),
        handleMouseEnter: (ref) => handleEnter(ref)
      },
    },
    {
      id: 'show1',
      title: 'ШОУ ПОД КЛЮЧ',
      description:
          'ОТ ИДЕИ ДО ПРЕМЬЕРЫ, РАЗРАБАТЫВАЕМ, СНИМАЕМ И ВЫВОДИМ ШОУ В ЭФИР.',
      videoRefConfig: {
        ref: useRef<HTMLVideoElement | null>(null),
        handleMouseLeave: (ref) => haandleLeave(ref),
        handleMouseEnter: (ref) => handleEnter(ref)
      },
    },
    {
      id: 'ads2',
      title: 'РЕКЛАМА',
      description:
          'РАЗРАБАТЫВАЕМ РЕКЛАМНЫЕ ВИДЕО, УСИЛИВАЕМ БРЕНД И ПРИВОДИМ К РЕЗУЛЬТАТУ.',
      videoRefConfig: {
        ref: useRef<HTMLVideoElement | null>(null),
        handleMouseLeave: (ref) => haandleLeave(ref),
        handleMouseEnter: (ref) => handleEnter(ref)
      },
    },
    {
      id: 'b2b3',
      title: 'B2B КОНТЕНТ',
      description:
          'ПРОИЗВОДИМ СИСТЕМНЫЙ КОНТЕНТ ДЛЯ БИЗНЕСА: ИМИДЖ, ПРОДУКТ, КОММУНИКАЦИИ.',
      videoRefConfig: {
        ref: useRef<HTMLVideoElement | null>(null),
        handleMouseLeave(ref) {
          return () => {
            const video = ref.current;
            if (!video) {
              return;
            }

            video.pause();
            video.currentTime = 0;
          };
        },
        handleMouseEnter(ref) {
          return () => {
            void ref.current?.play().catch(() => undefined);
          };
        },
      },
    },
    {
      id: 'branding4',
      title: 'БРЕНДИНГ',
      description:
          'ФОРМИРУЕМ ВИЗУАЛЬНЫЙ ЯЗЫК БРЕНДА И УПАКОВЫВАЕМ ЕГО В КОНТЕНТ.',
      videoRefConfig: {
        ref: useRef<HTMLVideoElement | null>(null),
        handleMouseLeave: (ref) => haandleLeave(ref),
        handleMouseEnter: (ref) => handleEnter(ref)
      },
    },
  ];

  const wheelBridgeDirectionRef = useRef<'up' | 'down' | null>(null);
  const wheelBridgeDeltaRef = useRef(0);
  const wheelBridgeLockRef = useRef(false);
  const wheelBridgeTimeoutRef = useRef<number | null>(null);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: false,
      align: 'center',
      containScroll: 'trimSnaps',
      dragFree: false,
      skipSnaps: false,
      slidesToScroll: 2,
      duration: 45,
    },
    [WheelGesturesPlugin({ forceWheelAxis: 'y' })],
  );

  useEffect(() => {
    if (!emblaApi) {
      return;
    }

    const viewportNode = emblaApi.rootNode();

    const resetWheelBridge = () => {
      wheelBridgeDirectionRef.current = null;
      wheelBridgeDeltaRef.current = 0;
    };

    const unlockWheelBridge = () => {
      wheelBridgeLockRef.current = false;
    };

    const queueWheelBridgeUnlock = () => {
      if (wheelBridgeTimeoutRef.current) {
        window.clearTimeout(wheelBridgeTimeoutRef.current);
      }

      wheelBridgeTimeoutRef.current = window.setTimeout(() => {
        unlockWheelBridge();
      }, edgeWheelUnlockDelay);
    };

    const handleWheel = (event: WheelEvent) => {
      if (!allowSectionScrollOnEdges) {
        resetWheelBridge();
        return;
      }

      const dominantDelta =
        Math.abs(event.deltaY) >= Math.abs(event.deltaX)
          ? event.deltaY
          : event.deltaX;

      if (Math.abs(dominantDelta) < 4) {
        return;
      }

      const direction = dominantDelta > 0 ? 'down' : 'up';
      const hasScrollableSnaps = emblaApi.scrollSnapList().length > 1;
      const canScrollInsideSlider =
        direction === 'down'
          ? emblaApi.canScrollNext()
          : emblaApi.canScrollPrev();

      if (hasScrollableSnaps && canScrollInsideSlider) {
        resetWheelBridge();
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      if (wheelBridgeLockRef.current) {
        return;
      }

      if (wheelBridgeDirectionRef.current !== direction) {
        wheelBridgeDeltaRef.current = 0;
      }

      wheelBridgeDirectionRef.current = direction;
      wheelBridgeDeltaRef.current += Math.abs(dominantDelta);

      if (wheelBridgeDeltaRef.current < edgeWheelThreshold) {
        return;
      }

      wheelBridgeLockRef.current = true;
      resetWheelBridge();
      queueWheelBridgeUnlock();

      window.dispatchEvent(
        new CustomEvent(FULLPAGE_SCROLL_EVENT, {
          detail: { direction },
        }),
      );
    };

    viewportNode.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      viewportNode.removeEventListener('wheel', handleWheel);

      if (wheelBridgeTimeoutRef.current) {
        window.clearTimeout(wheelBridgeTimeoutRef.current);
        wheelBridgeTimeoutRef.current = null;
      }

      unlockWheelBridge();
      resetWheelBridge();
    };
  }, [allowSectionScrollOnEdges, emblaApi]);

  return (
    <FullPageSection id="services" className="items-stretch bg-black pt-30 text-white">
      <div className="flex h-full w-full max-w-[1570px] flex-col items-center justify-center">
        <div className="embda__wrapper w-full h-[clamp(343px,70vh,643px)]">
          <div className="embla h-full">
            <div
              className="h-full overflow-hidden"
              ref={emblaRef}
              {...scrollIgnoreAttr}
            >
              <div className="embla__container ml-[-22px] flex h-full touch-pan-y touch-pinch-zoom">
                {slides.map((slide) => (
                  <div
                    key={slide.id}
                    className="embla__slide relative h-full min-w-0 flex-none basis-1/4 pl-[22px] "
                  >
                    <video
                      ref={slide.videoRefConfig.ref}
                      className="h-full w-full object-cover "
                      src={sliderVideoSrc}
                      playsInline
                      loop
                      muted
                      onMouseEnter={slide.videoRefConfig.handleMouseEnter(slide.videoRefConfig.ref)}
                      onMouseLeave={slide.videoRefConfig.handleMouseLeave(slide.videoRefConfig.ref)}
                      preload="metadata"
                    />
                    <div className="absolute bottom-0 px-1.5 text-center">
                      <p className='text-[12px]'>{slide.description}</p>
                      <h4 className="text-[30px] font-black text-[#63ff45]">
                        {slide.title}
                      </h4>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="text-center" data-reveal>
          <p className="text-[25px] font-bold uppercase leading-[1.14] mt-[50px] text-white">
            ЗАНИМАЕМСЯ ВСЕМИ ЭТАПАМИ СОЗДАНИЯ ПРОДУКТА: ПИШЕМ СЦЕНАРИИ, ОРГАНИЗУЕМ СЪЕМКИ, ВИДЕОСЪЕМКИ, МОНТАЖ, САУНД ДИЗАЙН, И СОЗДАЕМ ВСЕ АНИМАЦИИ
          </p>
          <p className="text-[157px] leading-[0.99] tracking-[0.08em] font-black uppercase  text-white">
            ХЛАМ MEDI<span className="text-[#63ff45]">A</span>
          </p>
        </div>
      </div>
    </FullPageSection>
  );
}
