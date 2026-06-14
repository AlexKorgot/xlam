'use client';

import FullPageSection from '@/src/components/ui/FullPageSection';
import {
  FULLPAGE_SCROLL_EVENT,
  FULLPAGE_SCROLL_IGNORE_ATTR,
  FULLPAGE_TOUCH_AXIS_LOCK_RATIO,
  FULLPAGE_TOUCH_SWIPE_THRESHOLD,
  getFullPageSwipeDirection,
} from '@/src/components/ui/FullPageScroll';
import { publicAssetPath } from '@/src/lib/publicAssetPath';
import useEmblaCarousel from 'embla-carousel-react';
import WheelGesturesPlugin from 'embla-carousel-wheel-gestures';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from 'react';
import adsModalImage from './assets/ads-modal.png';
import b2bModalImage from './assets/b2b-modal.png';
import brandingModalImage from './assets/branding-modal.png';
import showModalImage from './assets/show-modal.png';
import {
  ServiceModal,
  type ServiceModalContent,
} from './ServiceModal';

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
  videoSrc: string;
  modal: ServiceModalContent;
  videoRefConfig: VideoRefConfig;
};

interface ServicesSliderSectionProps {
  allowSectionScrollOnEdges?: boolean;
}

const scrollIgnoreAttr = { [FULLPAGE_SCROLL_IGNORE_ATTR]: 'true' } as const;
const edgeWheelThreshold = 48;
const edgeWheelUnlockDelay = 700;
const initialPreloadedSlideCount = 4;

const showModalContent: ServiceModalContent = {
  title: 'Шоу под ключ',
  subtitle: 'Мы создаём шоу с нуля — от идеи до выхода в эфир',
  description:
    'Берём на себя весь процесс: разработка формата, сценарий, продакшн и пост. Запускаем проекты, готовые к платформам и дистрибуции.',
  ctaIntro: 'Поговорим о проекте',
  ctaLabel: 'Оставить заявку',
  backgroundImage: showModalImage,
  features: [
    {
      title: 'Разработка',
      description: 'Создание формата шоу, сценария, структуры выпусков.',
    },
    {
      title: 'Продакшн',
      description: 'Ведущие, гости, операторы, режиссеры, техническая команда.',
    },
    {
      title: 'Команда',
      description: 'Организация съёмок, постановка света, камеры, звук.',
    },
    {
      title: 'Монтаж',
      description: 'Монтаж, графика, цветокоррекция, звук, титры.',
    },
  ],
};

const adsModalContent: ServiceModalContent = {
  title: 'Реклама',
  subtitle: 'Разрабатываем рекламный контент для роста бренда',
  description:
    'Создаём ролики, кампании и визуальные форматы, которые помогают бренду говорить с аудиторией точнее и заметнее.',
  ctaIntro: 'Поговорим о проекте',
  ctaLabel: 'Оставить заявку',
  backgroundImage: adsModalImage,
  features: [
    {
      title: 'Концепция',
      description: 'Идея, сценарий, визуальный тон и структура рекламного сообщения.',
    },
    {
      title: 'Съёмка',
      description: 'Продакшн, команда, локации, свет, звук и режиссура.',
    },
    {
      title: 'Адаптация',
      description: 'Версии для разных каналов, платформ и рекламных задач.',
    },
    {
      title: 'Пост',
      description: 'Монтаж, графика, цвет, звук и финальная упаковка ролика.',
    },
  ],
};

const b2bModalContent: ServiceModalContent = {
  title: 'B2B контент',
  subtitle: 'Производим системный контент для бизнеса',
  description:
    'Помогаем компаниям объяснять продукты, усиливать имидж и выстраивать понятную коммуникацию с партнёрами и клиентами.',
  ctaIntro: 'Поговорим о проекте',
  ctaLabel: 'Оставить заявку',
  backgroundImage: b2bModalImage,
  features: [
    {
      title: 'Стратегия',
      description: 'Определяем задачи, аудиторию, формат и регулярность контента.',
    },
    {
      title: 'Производство',
      description: 'Снимаем интервью, кейсы, продуктовые и имиджевые материалы.',
    },
    {
      title: 'Упаковка',
      description: 'Адаптируем контент под сайт, презентации, соцсети и продажи.',
    },
    {
      title: 'Система',
      description: 'Собираем контент в понятную линейку для регулярной коммуникации.',
    },
  ],
};

const brandingModalContent: ServiceModalContent = {
  title: 'Брендинг',
  subtitle: 'Формируем визуальный язык бренда',
  description:
    'Создаём айдентику, графические принципы и контентную упаковку, чтобы бренд выглядел цельно во всех точках контакта.',
  ctaIntro: 'Поговорим о проекте',
  ctaLabel: 'Оставить заявку',
  backgroundImage: brandingModalImage,
  features: [
    {
      title: 'Аналитика',
      description: 'Изучаем бренд, аудиторию, контекст и визуальную среду.',
    },
    {
      title: 'Айдентика',
      description: 'Разрабатываем стиль, графику, типографику и визуальные правила.',
    },
    {
      title: 'Контент',
      description: 'Переносим бренд-систему в фото, видео и digital-форматы.',
    },
    {
      title: 'Гайд',
      description: 'Фиксируем принципы использования для команды и подрядчиков.',
    },
  ],
};

export function ServicesSliderSection({
  allowSectionScrollOnEdges = false,
}: ServicesSliderSectionProps) {
  const sectionContentRef = useRef<HTMLDivElement | null>(null);
  const [isSectionInView, setIsSectionInView] = useState(false);
  const [preloadedSlideIndexes, setPreloadedSlideIndexes] = useState<
    ReadonlySet<number>
  >(
    () =>
      new Set(
        Array.from({ length: initialPreloadedSlideCount }, (_, index) => index),
      ),
  );

  const handleLeave = (ref: ServiceVideoRef) => {
    return () => {
      const video = ref.current;
      if (!video) {
        return;
      }

      video.pause();
      video.currentTime = 0;
    };
  };

  const handleEnter = (ref: ServiceVideoRef) => {
    return () => {
      void ref.current?.play().catch(() => undefined);
    };
  };

  const slides: ServiceSlide[] = [
    {
      id: 'show',
      title: 'ШОУ ПОД КЛЮЧ',
      description:
        'ОТ ИДЕИ ДО ПРЕМЬЕРЫ: РАЗРАБАТЫВАЕМ, СНИМАЕМ И ВЫВОДИМ ШОУ В ЭФИР.',
      modal: showModalContent,
      videoSrc: publicAssetPath('/video/services/1.mp4'),
      videoRefConfig: {
        ref: useRef<HTMLVideoElement | null>(null),
        handleMouseLeave: (ref) => handleLeave(ref),
        handleMouseEnter: (ref) => handleEnter(ref),
      },
    },
    {
      id: 'ads',
      title: 'РЕКЛАМА',
      description:
        'РАЗРАБАТЫВАЕМ РЕКЛАМНЫЕ ВИДЕО, УСИЛИВАЕМ БРЕНД И ПРИВОДИМ К РЕЗУЛЬТАТУ.',
      modal: adsModalContent,
      videoSrc: publicAssetPath('/video/services/2.mp4'),
      videoRefConfig: {
        ref: useRef<HTMLVideoElement | null>(null),
        handleMouseLeave: (ref) => handleLeave(ref),
        handleMouseEnter: (ref) => handleEnter(ref),
      },
    },
    {
      id: 'b2b',
      title: 'B2B КОНТЕНТ',
      description:
        'ПРОИЗВОДИМ СИСТЕМНЫЙ КОНТЕНТ ДЛЯ БИЗНЕСА: ИМИДЖ, ПРОДУКТ, КОММУНИКАЦИИ.',
      modal: b2bModalContent,
      videoSrc: publicAssetPath('/video/services/3.mp4'),
      videoRefConfig: {
        ref: useRef<HTMLVideoElement | null>(null),
        handleMouseLeave: (ref) => handleLeave(ref),
        handleMouseEnter: (ref) => handleEnter(ref),
      },
    },
    {
      id: 'branding',
      title: 'БРЕНДИНГ',
      description:
        'ФОРМИРУЕМ ВИЗУАЛЬНЫЙ ЯЗЫК БРЕНДА И УПАКОВЫВАЕМ ЕГО В КОНТЕНТ.',
      modal: brandingModalContent,
      videoSrc: publicAssetPath('/video/services/4.mp4'),
      videoRefConfig: {
        ref: useRef<HTMLVideoElement | null>(null),
        handleMouseLeave: (ref) => handleLeave(ref),
        handleMouseEnter: (ref) => handleEnter(ref),
      },
    },
    {
      id: 'show1',
      title: 'ШОУ ПОД КЛЮЧ',
      description:
        'ОТ ИДЕИ ДО ПРЕМЬЕРЫ: РАЗРАБАТЫВАЕМ, СНИМАЕМ И ВЫВОДИМ ШОУ В ЭФИР.',
      modal: showModalContent,
      videoSrc: publicAssetPath('/video/services/1.mp4'),
      videoRefConfig: {
        ref: useRef<HTMLVideoElement | null>(null),
        handleMouseLeave: (ref) => handleLeave(ref),
        handleMouseEnter: (ref) => handleEnter(ref),
      },
    },
    {
      id: 'ads2',
      title: 'РЕКЛАМА',
      description:
        'РАЗРАБАТЫВАЕМ РЕКЛАМНЫЕ ВИДЕО, УСИЛИВАЕМ БРЕНД И ПРИВОДИМ К РЕЗУЛЬТАТУ.',
      modal: adsModalContent,
      videoSrc: publicAssetPath('/video/services/2.mp4'),
      videoRefConfig: {
        ref: useRef<HTMLVideoElement | null>(null),
        handleMouseLeave: (ref) => handleLeave(ref),
        handleMouseEnter: (ref) => handleEnter(ref),
      },
    },
    {
      id: 'b2b3',
      title: 'B2B КОНТЕНТ',
      description:
        'ПРОИЗВОДИМ СИСТЕМНЫЙ КОНТЕНТ ДЛЯ БИЗНЕСА: ИМИДЖ, ПРОДУКТ, КОММУНИКАЦИИ.',
      modal: b2bModalContent,
      videoSrc: publicAssetPath('/video/services/3.mp4'),
      videoRefConfig: {
        ref: useRef<HTMLVideoElement | null>(null),
        handleMouseLeave: (ref) => handleLeave(ref),
        handleMouseEnter: (ref) => handleEnter(ref),
      },
    },
    {
      id: 'branding4',
      title: 'БРЕНДИНГ',
      description:
        'ФОРМИРУЕМ ВИЗУАЛЬНЫЙ ЯЗЫК БРЕНДА И УПАКОВЫВАЕМ ЕГО В КОНТЕНТ.',
      modal: brandingModalContent,
      videoSrc: publicAssetPath('/video/services/4.mp4'),
      videoRefConfig: {
        ref: useRef<HTMLVideoElement | null>(null),
        handleMouseLeave: (ref) => handleLeave(ref),
        handleMouseEnter: (ref) => handleEnter(ref),
      },
    },
  ];

  const slideCount = slides.length;
  const [selectedSlideIndex, setSelectedSlideIndex] = useState<number | null>(null);
  const [renderedSlideIndex, setRenderedSlideIndex] = useState<number | null>(null);
  const renderedSlide =
    renderedSlideIndex === null ? null : slides[renderedSlideIndex];
  const activeSlideIndex = selectedSlideIndex ?? renderedSlideIndex;
  const previousSlide =
    activeSlideIndex === null
      ? null
      : slides[(activeSlideIndex - 1 + slideCount) % slideCount];
  const nextSlide =
    activeSlideIndex === null
      ? null
      : slides[(activeSlideIndex + 1) % slideCount];

  const openModal = useCallback((index: number) => {
    setRenderedSlideIndex(index);
    setSelectedSlideIndex(index);
  }, []);

  const closeModal = useCallback(() => {
    setSelectedSlideIndex(null);
  }, []);

  const showPreviousSlide = useCallback(() => {
    if (selectedSlideIndex === null) {
      return;
    }

    const previousIndex = (selectedSlideIndex - 1 + slideCount) % slideCount;
    setRenderedSlideIndex(previousIndex);
    setSelectedSlideIndex(previousIndex);
  }, [selectedSlideIndex, slideCount]);

  const showNextSlide = useCallback(() => {
    if (selectedSlideIndex === null) {
      return;
    }

    const nextIndex = (selectedSlideIndex + 1) % slideCount;
    setRenderedSlideIndex(nextIndex);
    setSelectedSlideIndex(nextIndex);
  }, [selectedSlideIndex, slideCount]);

  const handleModalAfterClose = useCallback(() => {
    setRenderedSlideIndex(null);
  }, []);

  const wheelBridgeDirectionRef = useRef<'up' | 'down' | null>(null);
  const wheelBridgeDeltaRef = useRef(0);
  const wheelBridgeLockRef = useRef(false);
  const wheelBridgeTimeoutRef = useRef<number | null>(null);
  const sectionTouchStartRef = useRef<{ x: number; y: number } | null>(null);

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

  const addPreloadedSlideIndexes = useCallback((indexes: number[]) => {
    if (indexes.length === 0) {
      return;
    }

    setPreloadedSlideIndexes((currentIndexes) => {
      const nextIndexes = new Set(currentIndexes);
      let hasNewIndex = false;

      indexes.forEach((index) => {
        if (!nextIndexes.has(index)) {
          nextIndexes.add(index);
          hasNewIndex = true;
        }
      });

      return hasNewIndex ? nextIndexes : currentIndexes;
    });
  }, []);

  const addVisibleSlidePreloads = useCallback(() => {
    if (!emblaApi) {
      addPreloadedSlideIndexes(
        Array.from({ length: initialPreloadedSlideCount }, (_, index) => index),
      );
      return;
    }

    addPreloadedSlideIndexes(emblaApi.slidesInView());
  }, [addPreloadedSlideIndexes, emblaApi]);

  useEffect(() => {
    const sectionContent = sectionContentRef.current;

    if (!sectionContent) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          return;
        }

        setIsSectionInView(true);
        addVisibleSlidePreloads();
      },
      { threshold: 0.28 },
    );

    observer.observe(sectionContent);

    return () => {
      observer.disconnect();
    };
  }, [addVisibleSlidePreloads]);

  useEffect(() => {
    if (!emblaApi || !isSectionInView) {
      return;
    }

    addVisibleSlidePreloads();

    emblaApi.on('select', addVisibleSlidePreloads);
    emblaApi.on('settle', addVisibleSlidePreloads);
    emblaApi.on('reInit', addVisibleSlidePreloads);

    return () => {
      emblaApi.off('select', addVisibleSlidePreloads);
      emblaApi.off('settle', addVisibleSlidePreloads);
      emblaApi.off('reInit', addVisibleSlidePreloads);
    };
  }, [addVisibleSlidePreloads, emblaApi, isSectionInView]);

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

    const requestSectionScroll = (direction: 'up' | 'down') => {
      window.dispatchEvent(
        new CustomEvent(FULLPAGE_SCROLL_EVENT, {
          detail: { direction },
        }),
      );
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (!allowSectionScrollOnEdges || event.pointerType !== 'touch') {
        return;
      }

      sectionTouchStartRef.current = { x: event.clientX, y: event.clientY };
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (!allowSectionScrollOnEdges || event.pointerType !== 'touch') {
        return;
      }

      const start = sectionTouchStartRef.current;
      sectionTouchStartRef.current = null;

      if (!start || wheelBridgeLockRef.current) {
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

      wheelBridgeLockRef.current = true;
      queueWheelBridgeUnlock();
      requestSectionScroll(getFullPageSwipeDirection(deltaY));
    };

    const handlePointerCancel = () => {
      sectionTouchStartRef.current = null;
    };

    viewportNode.addEventListener('wheel', handleWheel, { passive: false });
    viewportNode.addEventListener('pointerdown', handlePointerDown);
    viewportNode.addEventListener('pointerup', handlePointerUp);
    viewportNode.addEventListener('pointercancel', handlePointerCancel);

    return () => {
      viewportNode.removeEventListener('wheel', handleWheel);
      viewportNode.removeEventListener('pointerdown', handlePointerDown);
      viewportNode.removeEventListener('pointerup', handlePointerUp);
      viewportNode.removeEventListener('pointercancel', handlePointerCancel);

      if (wheelBridgeTimeoutRef.current) {
        window.clearTimeout(wheelBridgeTimeoutRef.current);
        wheelBridgeTimeoutRef.current = null;
      }

      sectionTouchStartRef.current = null;
      unlockWheelBridge();
      resetWheelBridge();
    };
  }, [allowSectionScrollOnEdges, emblaApi]);

  return (
    <>
      <FullPageSection id="services" className="items-stretch bg-black px-4 py-[clamp(1rem,4vh,3rem)] text-white sm:px-6">
        <div
          ref={sectionContentRef}
          className="flex h-full min-h-0 w-full max-w-[1570px] flex-col items-center justify-center gap-[clamp(0.75rem,2vh,2rem)]"
        >
          <div className="embla__wrapper h-[clamp(260px,58vh,560px)] max-h-[62%] w-screen min-[1000px]:w-full">
            <div className="embla h-full">
              <div
                className="h-full overflow-hidden"
                ref={emblaRef}
                {...scrollIgnoreAttr}
              >
                <div className="embla__container ml-[-9px] flex h-full touch-pan-y touch-pinch-zoom min-[1000px]:ml-[-22px]">
                  {slides.map((slide, index) => (
                    <button
                      type="button"
                      key={slide.id}
                      className="embla__slide relative h-full min-w-0 flex-none basis-[calc((100%+9px)/2)] cursor-pointer border-0 bg-transparent pb-0 pl-[9px] pr-0 pt-0 text-left text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#63ff45] min-[600px]:basis-[calc((100%+9px)/3)] min-[1000px]:basis-1/4 min-[1000px]:pl-[22px]"
                      aria-label={`Открыть услугу ${slide.title}`}
                      onClick={() => openModal(index)}
                      onMouseEnter={slide.videoRefConfig.handleMouseEnter(slide.videoRefConfig.ref)}
                      onMouseLeave={slide.videoRefConfig.handleMouseLeave(slide.videoRefConfig.ref)}
                    >
                      <video
                        ref={slide.videoRefConfig.ref}
                        className="pointer-events-none h-full w-full object-cover"
                        src={slide.videoSrc}
                        playsInline
                        loop
                        muted
                        preload={
                          preloadedSlideIndexes.has(index) ? 'metadata' : 'none'
                        }
                      />
                      <div className="pointer-events-none absolute bottom-0 px-1.5 text-center">
                        <p className="hidden text-[12px] min-[1000px]:block">{slide.description}</p>
                        <h4 className="text-[30px] font-black text-[#63ff45]">
                          {slide.title}
                        </h4>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="min-h-0 text-center" data-reveal>
            <p className="text-[clamp(0.875rem,2.2vw,1.5625rem)] font-bold uppercase leading-[1.14] text-white">
              ЗАНИМАЕМСЯ ВСЕМИ ЭТАПАМИ СОЗДАНИЯ ПРОДУКТА: ПИШЕМ СЦЕНАРИИ, ОРГАНИЗУЕМ СЪЕМКИ, ВИДЕОСЪЕМКИ, МОНТАЖ, САУНД ДИЗАЙН, И СОЗДАЕМ ВСЕ АНИМАЦИИ
            </p>
            <p className="whitespace-nowrap text-[clamp(2.75rem,9vw,9.8125rem)] font-black uppercase leading-[0.99] tracking-[0.04em] text-white sm:tracking-[0.08em]">
              ХЛАМ MEDI<span className="text-[#63ff45]">A</span>
            </p>
          </div>
        </div>
      </FullPageSection>
      {renderedSlide && previousSlide && nextSlide ? (
        <ServiceModal
          isOpen={selectedSlideIndex !== null}
          content={renderedSlide.modal}
          previousLabel={previousSlide.title}
          currentLabel={renderedSlide.title}
          nextLabel={nextSlide.title}
          onClose={closeModal}
          onPrevious={showPreviousSlide}
          onNext={showNextSlide}
          onAfterClose={handleModalAfterClose}
        />
      ) : null}
    </>
  );
}
