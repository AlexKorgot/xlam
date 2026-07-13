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
import Image from 'next/image';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from 'react';
import adsModalImage from './assets/ads-modal.png';
import b2bModalImage from './assets/b2b-modal.png';
import brandModalImage from './assets/brand.png';
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
  videoSrc?: string;
  posterSrc: string;
  modal: ServiceModalContent;
  videoRefConfig?: VideoRefConfig;
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
  subtitle: 'От идеи до премьеры: разрабатываем, снимаем и выводим шоу в эфир',
  description:
    'Вам не нужно контролировать несколько подрядчиков и сводить их работу — мы все сделаем за вас. Берем на себя весь процесс: разработка, съёмка, постпродакшн и упаковка.',
  ctaIntro: 'Поговорим о проекте',
  ctaLabel: 'Оставить заявку',
  backgroundImage: showModalImage,
  features: [
    {
      title: 'Придумываем',
      description: 'Идея, концепция, формат, структура, сценарий',
    },
    {
      title: 'Собираем',
      description: 'Кастинг ведущих и гостей, локация-студия, смета, графика, музыка',
    },
    {
      title: 'Снимаем',
      description: 'Серийная съемка, режиссура, свет, звук, работа с гостями',
    },
    {
      title: 'Выпускаем',
      description: 'Монтаж, графика, цветокор, саунд-дизайн, упаковка для платформ',
    },
  ],
};

const adsModalContent: ServiceModalContent = {
  title: 'Реклама',
  subtitle: 'Делаем рекламу, которую пересылают друзьям ',
  description:
    'Реклама — это короткое кино, где нет случайных кадров: каждая секунда продумана, каждый образ работает на идею. Сопровождаем проект на всех стадиях — от брифа до финальной упаковки',
  ctaIntro: 'Поговорим о проекте',
  ctaLabel: 'Оставить заявку',
  backgroundImage: adsModalImage,
  features: [
    {
      title: 'Задача',
      description: 'Бриф, целевая аудитория, рынок, конкурентное поле',
    },
    {
      title: 'Идея',
      description: 'Концепция, сценарий, формат, раскадровка, смета',
    },
    {
      title: 'Производство',
      description: 'Кастинг, локации, съемка, режиссура, продюсирование',
    },
    {
      title: 'Постпродакшн',
      description: 'Монтаж, цветокор, графика, саунд-дизайн, адаптация и упаковка',
    },
  ],
};

const b2bModalContent: ServiceModalContent = {
  title: 'B2B Продукт',
  subtitle: 'Производим системный контент: имидж, продукт, коммуникация',
  description:
    'Знаем, что бизнесу всегда нужно «вчера». Строим визуальные системы: имиджевые ролики, продуктовые видео, корпоративный контент и  материалы для внутренних и внешних коммуникаций',
  ctaIntro: 'Поговорим о проекте',
  ctaLabel: 'Оставить заявку',
  backgroundImage: b2bModalImage,
  features: [
    {
      title: 'Стратегия',
      description: 'Бизнес-цель, формат, целевая аудитория, ТЗ',
    },
    {
      title: 'Идея',
      description: 'Концепция, структура, референсы, смета, питч',
    },
    {
      title: 'Производство',
      description: 'Съемка, графика, разработка всех материалов',
    },
    {
      title: 'Дистрибуция',
      description: 'Монтаж, графика, упаковка и адаптация под все каналы',
    },
  ],
};

const brandingModalContent: ServiceModalContent = {
  title: 'AI Контент',
  subtitle: 'СОЗДАЕМ ВИЗУАЛ НОВОГО ПОКОЛЕНИЯ С ПОМОЩЬЮ ИИ',
  description:
    'ИИ-контент под задачи любой сложности: быстро — когда время критично, масштабно — когда нужен объём, нестандартно — когда обычные решения не подходят.',
  ctaIntro: 'Поговорим о проекте',
  ctaLabel: 'Оставить заявку',
  backgroundImage: brandingModalImage,
  features: [
    {
      title: 'Архитектура',
      description: 'Задача, визуальная стратегия, мудборд, концепция, эталоны',
    },
    {
      title: 'Промтинг',
      description: 'Настройка моделей, воркфлоу, контроль персонажей, доводка',
    },
    {
      title: 'Генерация',
      description: 'Производство на стеке нейросетей: видео, фото, голос, звук',
    },
    {
      title: 'Сборка',
      description: 'Курация, монтаж, цветокор, саунд-дизайн, апскейл',
    },
  ],
};

const brandModalContent: ServiceModalContent = {
  title: 'Брендинг',
  subtitle: 'Бренд как структура, а не набор красивых элементов',
  description:
    'Знаем, как айдентика живет в кадре, потому что сами снимаем шоу и рекламу. Делаем бренды, которые работают не только на бумаге, но и на экране. От стратегии до моушна и CGI.',
  ctaIntro: 'Поговорим о проекте?',
  ctaLabel: 'Оставить заявку',
  backgroundImage: brandModalImage,
  features: [
    {
      title: 'Исследование',
      description: 'Рынок, конкуренты, аудитория, миссия, тон, визуальный аудит.',
    },
    {
      title: 'Стратегия',
      description: 'Позиционирование, платформа бренда, ключевые сообщения.',
    },
    {
      title: 'Айдентика',
      description: 'Логобук, брендбук, типографика, фирменный стиль.',
    },
    {
      title: 'Производство',
      description: 'Предпечатная подготовка, 3D-графика, CGI.',
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
        'ОТ ИДЕИ ДО ПРЕМЬЕРЫ: РАЗРАБАТЫВАЕМ, СНИМАЕМ И ВЫВОДИМ ШОУ В ЭФИР',
      modal: showModalContent,
      videoSrc: publicAssetPath('/video/services/3.mp4'),
      posterSrc: publicAssetPath('/video/services/posters/3.png'),
      videoRefConfig: {
        ref: useRef<HTMLVideoElement | null>(null),
        handleMouseLeave: (ref) => handleLeave(ref),
        handleMouseEnter: (ref) => handleEnter(ref),
      },
    },
    {
      id: 'b2b',
      title: 'B2B ПРОДУКТ',
      description:
          'ПРОИЗВОДИМ СИСТЕМНЫЙ КОНТЕНТ: ИМИДЖ, ПРОДУКТ, КОММУНИКАЦИИ',
      modal: b2bModalContent,
      videoSrc: publicAssetPath('/video/services/2.mp4'),
      posterSrc: publicAssetPath('/video/services/posters/2.png'),
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
        'ДЕЛАЕМ РЕКЛАМУ, КОТОРУЮ ПЕРЕСЫЛАЮТ ДРУЗЬЯМ',
      modal: adsModalContent,
      videoSrc: publicAssetPath('/video/services/4.mp4'),
      posterSrc: publicAssetPath('/video/services/posters/4.png'),
      videoRefConfig: {
        ref: useRef<HTMLVideoElement | null>(null),
        handleMouseLeave: (ref) => handleLeave(ref),
        handleMouseEnter: (ref) => handleEnter(ref),
      },
    },
    {
      id: 'branding',
      title: 'AI КОНТЕНТ',
      description:
        'СОЗДАЕМ ВИЗУАЛ НОВОГО ПОКОЛЕНИЯ С ПОМОЩЬЮ ИИ',
      modal: brandingModalContent,
      videoSrc: publicAssetPath('/video/services/1.mp4'),
      posterSrc: publicAssetPath('/video/services/posters/1.png'),
      videoRefConfig: {
        ref: useRef<HTMLVideoElement | null>(null),
        handleMouseLeave: (ref) => handleLeave(ref),
        handleMouseEnter: (ref) => handleEnter(ref),
      },
    },
    {
      id: 'brand',
      title: 'БРЕНДИНГ',
      description:
        'ФОРМИРУЕМ ВИЗУАЛЬНЫЙ ЯЗЫК БРЕНДА И УПАКОВЫВАЕМ ЕГО В КОНТЕНТ',
      modal: brandModalContent,
      posterSrc: publicAssetPath('/video/services/posters/5.png'),
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
      <FullPageSection id="services" className="items-stretch bg-black px-4 py-[clamp(1rem,4vh,3rem)] text-white sm:px-8 min-[1000px]:pt-[var(--header-offset)]">
        <div
          ref={sectionContentRef}
          className="flex h-full min-h-0 w-full max-w-[1740px] flex-col items-center justify-center gap-[clamp(0.75rem,2vh,2rem)] px-[15px]"
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
                      onMouseEnter={
                        slide.videoRefConfig
                          ? slide.videoRefConfig.handleMouseEnter(slide.videoRefConfig.ref)
                          : undefined
                      }
                      onMouseLeave={
                        slide.videoRefConfig
                          ? slide.videoRefConfig.handleMouseLeave(slide.videoRefConfig.ref)
                          : undefined
                      }
                    >
                      <div className="relative h-full w-full overflow-hidden">
                        {slide.videoSrc && slide.videoRefConfig ? (
                          <video
                            ref={slide.videoRefConfig.ref}
                            className="pointer-events-none h-full w-full object-cover"
                            src={slide.videoSrc}
                            poster={slide.posterSrc}
                            playsInline
                            loop
                            muted
                            preload={
                              preloadedSlideIndexes.has(index) ? 'metadata' : 'none'
                            }
                          />
                        ) : (
                          <Image
                            className="pointer-events-none object-cover"
                            src={slide.posterSrc}
                            alt=""
                            fill
                            sizes="(min-width: 1000px) 25vw, (min-width: 600px) 33vw, 50vw"
                            priority={preloadedSlideIndexes.has(index)}
                          />
                        )}
                        <div
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[118px] min-[1000px]:h-[174px]"
                          style={{
                            background:
                              'linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.16) 34%, rgba(0, 0, 0, 0.52) 66%, rgba(0, 0, 0, 0.86) 100%)',
                            WebkitMaskImage:
                              'linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.14) 24%, rgba(0, 0, 0, 0.62) 48%, #000 82%, #000 100%)',
                            maskImage:
                              'linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.14) 24%, rgba(0, 0, 0, 0.62) 48%, #000 82%, #000 100%)',
                          }}
                        />
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] flex w-full flex-col items-center px-1.5 text-center min-[1000px]:pb-[25px]">
                          <p className="hidden max-w-[250px] text-[12px] leading-[1.12] min-[1000px]:block">{slide.description}</p>
                          <h4 className="text-[22px] font-black leading-none text-[#63ff45] [text-shadow:-4px_5px_18px_rgba(0,0,0,0.82)] min-[1000px]:text-[30px]">
                            {slide.title}
                          </h4>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="min-h-0 text-center" data-reveal>
            <p className="max-w-[1000px] m-auto text-[clamp(0.875rem,2.2vw,1.5625rem)] font-bold uppercase leading-[1.14] text-white mb-4">
              берем на себя все этапы создания продукта: сценарий, съемка, монтаж, саунд-дизайн и графика
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
