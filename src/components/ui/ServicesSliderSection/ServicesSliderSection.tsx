'use client';

import FullPageSection from '@/src/components/ui/FullPageSection';
import {
  FULLPAGE_SCROLL_EVENT,
  FULLPAGE_SCROLL_IGNORE_ATTR,
} from '@/src/components/ui/FullPageScroll';
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
  modal: ServiceModalContent;
  videoRefConfig: VideoRefConfig;
};

interface ServicesSliderSectionProps {
  allowSectionScrollOnEdges?: boolean;
}

const sliderVideoSrc = '/video/3_slider_content_video.mov';
const scrollIgnoreAttr = { [FULLPAGE_SCROLL_IGNORE_ATTR]: 'true' } as const;
const edgeWheelThreshold = 48;
const edgeWheelUnlockDelay = 700;

const showModalContent: ServiceModalContent = {
  title: 'Шоу под ключ',
  subtitle: 'Мы создаём шоу с нуля — от идеи до выхода в эфир',
  description:
    'Берём на себя весь процесс: разработка формата, сценарий, продакшн и пост. Запускаем проекты, готовые к платформам и дистрибуции.',
  ctaIntro: 'Поговорим о вашей идее',
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
  ctaIntro: 'Поговорим о вашей идее',
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
  ctaIntro: 'Поговорим о вашей идее',
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
  ctaIntro: 'Поговорим о вашей идее',
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
    <>
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
                  {slides.map((slide, index) => (
                    <button
                      type="button"
                      key={slide.id}
                      className="embla__slide relative h-full min-w-0 flex-none basis-[85%] cursor-pointer border-0 bg-transparent pb-0 pl-[22px] pr-0 pt-0 text-left text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#63ff45] sm:basis-1/2 lg:basis-1/4"
                      aria-label={`Открыть услугу ${slide.title}`}
                      onClick={() => openModal(index)}
                      onMouseEnter={slide.videoRefConfig.handleMouseEnter(slide.videoRefConfig.ref)}
                      onMouseLeave={slide.videoRefConfig.handleMouseLeave(slide.videoRefConfig.ref)}
                    >
                      <video
                        ref={slide.videoRefConfig.ref}
                        className="pointer-events-none h-full w-full object-cover"
                        src={sliderVideoSrc}
                        playsInline
                        loop
                        muted
                        preload="metadata"
                      />
                      <div className="pointer-events-none absolute bottom-0 px-1.5 text-center">
                        <p className="text-[12px]">{slide.description}</p>
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
          <div className="text-center" data-reveal>
            <p className="text-[25px] font-bold uppercase leading-[1.14] mt-[50px] text-white">
              ЗАНИМАЕМСЯ ВСЕМИ ЭТАПАМИ СОЗДАНИЯ ПРОДУКТА: ПИШЕМ СЦЕНАРИИ, ОРГАНИЗУЕМ СЪЕМКИ, ВИДЕОСЪЕМКИ, МОНТАЖ, САУНД ДИЗАЙН, И СОЗДАЕМ ВСЕ АНИМАЦИИ
            </p>
            <p className="text-[157px] leading-[0.99] tracking-[0.08em] font-black uppercase text-white">
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
