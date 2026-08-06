'use client';

import FullPageSection from '@/src/components/ui/FullPageSection';
import {
  FULLPAGE_SCROLL_EVENT,
  FULLPAGE_SCROLL_IGNORE_ATTR,
  FULLPAGE_TOUCH_AXIS_LOCK_RATIO,
  FULLPAGE_TOUCH_SWIPE_THRESHOLD,
  getFullPageSwipeDirection,
} from '@/src/components/ui/FullPageScroll';
import { mediaAssetPath } from '@/src/lib/mediaAssetPath';
import { publicAssetPath } from '@/src/lib/publicAssetPath';
import { useNearViewport } from '@/src/lib/useNearViewport';
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
import {
  ServiceModal,
  type ServiceModalContent,
} from './ServiceModal';
import {
  preloadServiceModalBackground,
  serviceModalBackgroundList,
  serviceModalBackgrounds,
} from './serviceModalBackground';

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

type ServiceVideoMediaProps = {
  posterSrc: string;
  shouldLoad: boolean;
  videoRef: ServiceVideoRef;
  videoSrc: string;
};

function ServiceVideoMedia({
  posterSrc,
  shouldLoad,
  videoRef,
  videoSrc,
}: ServiceVideoMediaProps) {
  const [isPosterReady, setIsPosterReady] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [hasVideoError, setHasVideoError] = useState(false);

  const markVideoReady = () => {
    setIsVideoReady(true);
    setIsVideoLoading(false);
    setHasVideoError(false);
  };

  const showLoader =
    !isPosterReady || (shouldLoad && isVideoLoading && !hasVideoError);

  return (
    <div className="relative h-full w-full overflow-hidden bg-[radial-gradient(circle_at_50%_42%,rgba(99,255,69,0.14),rgba(0,0,0,0.96)_68%)]">
      <Image
        src={posterSrc}
        alt=""
        fill
        sizes="(min-width: 1000px) 25vw, (min-width: 600px) 33vw, 50vw"
        loading="lazy"
        onLoad={() => setIsPosterReady(true)}
        onError={() => setIsPosterReady(true)}
        className={`pointer-events-none object-cover transition-opacity duration-300 ${
          isPosterReady ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <video
        ref={videoRef}
        className={`pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
          isVideoReady && !hasVideoError ? 'opacity-100' : 'opacity-0'
        }`}
        src={shouldLoad ? videoSrc : undefined}
        playsInline
        loop
        muted
        preload="none"
        onLoadStart={() => {
          setIsVideoLoading(true);
          setHasVideoError(false);
        }}
        onLoadedData={markVideoReady}
        onCanPlay={markVideoReady}
        onPlaying={markVideoReady}
        onWaiting={() => setIsVideoLoading(true)}
        onStalled={() => setIsVideoLoading(true)}
        onSuspend={() => {
          if (!isVideoReady) {
            setIsVideoLoading(false);
          }
        }}
        onError={() => {
          setHasVideoError(true);
          setIsVideoReady(false);
          setIsVideoLoading(false);
        }}
      />

      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 z-[1] flex items-center justify-center bg-black/25 backdrop-blur-[1px] transition-opacity duration-200 ${
          showLoader ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <span className="relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#63ff45]/25 border-r-[#63ff45] border-t-[#63ff45] shadow-[0_0_22px_rgba(99,255,69,0.38)] animate-spin">
          <span className="h-1.5 w-1.5 rotate-45 bg-[#63ff45] shadow-[0_0_12px_rgba(99,255,69,0.9)]" />
        </span>
      </div>
    </div>
  );
}

interface ServicesSliderSectionProps {
  allowSectionScrollOnEdges?: boolean;
}

const scrollIgnoreAttr = { [FULLPAGE_SCROLL_IGNORE_ATTR]: 'true' } as const;
const edgeWheelThreshold = 48;
const edgeWheelUnlockDelay = 700;
const edgeWrapUnlockDelay = 420;
const lastSlideReturnDelay = 500;

const showModalContent: ServiceModalContent = {
  title: 'Шоу под ключ',
  subtitle: 'От идеи до премьеры: разрабатываем, снимаем и выводим шоу в эфир',
  description:
    'Вам не нужно контролировать несколько подрядчиков и сводить их работу — мы все сделаем за вас. Берем на себя весь процесс: разработка, съёмка, постпродакшн и упаковка.',
  ctaIntro: 'Поговорим о вашей идее',
  ctaLabel: 'Оставить заявку',
  backgroundImage: serviceModalBackgrounds.show,
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
  ctaIntro: 'Поговорим о вашей идее',
  ctaLabel: 'Оставить заявку',
  backgroundImage: serviceModalBackgrounds.ads,
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
  ctaIntro: 'Поговорим о вашей идее',
  ctaLabel: 'Оставить заявку',
  backgroundImage: serviceModalBackgrounds.b2b,
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
  ctaIntro: 'Поговорим о вашей идее',
  ctaLabel: 'Оставить заявку',
  backgroundImage: serviceModalBackgrounds.branding,
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
  ctaIntro: 'Поговорим о вашей идее',
  ctaLabel: 'Оставить заявку',
  backgroundImage: serviceModalBackgrounds.brand,
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
      videoSrc: publicAssetPath('/video/show.mp4'),
      posterSrc: mediaAssetPath('/3.jpg'),
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
      videoSrc: publicAssetPath('/video/b2b.mp4'),
      posterSrc: mediaAssetPath('/2.jpg'),
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
      videoSrc: publicAssetPath('/video/ads.mp4'),
      posterSrc: mediaAssetPath('/4.jpg'),
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
      videoSrc: publicAssetPath('/video/ai.mp4'),
      posterSrc: mediaAssetPath('/1.jpg'),
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
      videoSrc: publicAssetPath('/video/branding.mp4'),
      posterSrc: mediaAssetPath('/5.jpg'),
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
  const sectionContentRef = useRef<HTMLDivElement | null>(null);
  const shouldLoadVideos = useNearViewport(sectionContentRef);
  const wheelBridgeDeltaRef = useRef(0);
  const wheelBridgeLockRef = useRef(false);
  const wheelBridgeTimeoutRef = useRef<number | null>(null);
  const edgeWrapLockRef = useRef(false);
  const edgeWrapTimeoutRef = useRef<number | null>(null);
  const lastSlideReturnTimeoutRef = useRef<number | null>(null);
  const isSliderHoveredRef = useRef(false);
  const lastSliderIntentRef = useRef<'up' | 'down' | null>(null);
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

  useEffect(() => {
    if (!shouldLoadVideos) {
      return;
    }

    for (const background of serviceModalBackgroundList) {
      void preloadServiceModalBackground(background);
    }
  }, [shouldLoadVideos]);

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

    const unlockEdgeWrap = () => {
      edgeWrapLockRef.current = false;
    };

    const queueWheelBridgeUnlock = () => {
      if (wheelBridgeTimeoutRef.current) {
        window.clearTimeout(wheelBridgeTimeoutRef.current);
      }

      wheelBridgeTimeoutRef.current = window.setTimeout(() => {
        unlockWheelBridge();
      }, edgeWheelUnlockDelay);
    };

    const queueEdgeWrapUnlock = () => {
      if (edgeWrapTimeoutRef.current) {
        window.clearTimeout(edgeWrapTimeoutRef.current);
      }

      edgeWrapTimeoutRef.current = window.setTimeout(() => {
        unlockEdgeWrap();
      }, edgeWrapUnlockDelay);
    };

    const clearLastSlideReturn = () => {
      if (lastSlideReturnTimeoutRef.current) {
        window.clearTimeout(lastSlideReturnTimeoutRef.current);
        lastSlideReturnTimeoutRef.current = null;
      }
    };

    const canReturnFromLastSlide = () => {
      const snapCount = emblaApi.scrollSnapList().length;

      return (
        snapCount > 1 &&
        !edgeWrapLockRef.current &&
        lastSliderIntentRef.current === 'down' &&
        emblaApi.selectedScrollSnap() === snapCount - 1
      );
    };

    const returnFromLastSlide = () => {
      if (isSliderHoveredRef.current || !canReturnFromLastSlide()) {
        return;
      }

      edgeWrapLockRef.current = true;
      lastSliderIntentRef.current = null;
      resetWheelBridge();
      emblaApi.scrollTo(0);
      queueEdgeWrapUnlock();
    };

    const queueLastSlideReturn = () => {
      clearLastSlideReturn();

      if (isSliderHoveredRef.current || !canReturnFromLastSlide()) {
        return;
      }

      lastSlideReturnTimeoutRef.current = window.setTimeout(() => {
        lastSlideReturnTimeoutRef.current = null;
        returnFromLastSlide();
      }, lastSlideReturnDelay);
    };

    const wrapToOppositeEdge = (direction: 'up' | 'down') => {
      const snapCount = emblaApi.scrollSnapList().length;

      if (snapCount <= 1) {
        return false;
      }

      if (edgeWrapLockRef.current) {
        return true;
      }

      if (
        direction === 'down' &&
        isSliderHoveredRef.current &&
        emblaApi.selectedScrollSnap() === snapCount - 1
      ) {
        return true;
      }

      const targetIndex = direction === 'down' ? 0 : snapCount - 1;
      edgeWrapLockRef.current = true;
      resetWheelBridge();
      emblaApi.scrollTo(targetIndex);
      queueEdgeWrapUnlock();

      return true;
    };

    const handleSliderMouseEnter = () => {
      isSliderHoveredRef.current = true;
      clearLastSlideReturn();
    };

    const handleSliderMouseLeave = () => {
      isSliderHoveredRef.current = false;
      queueLastSlideReturn();
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
      lastSliderIntentRef.current = direction;
      const hasScrollableSnaps = emblaApi.scrollSnapList().length > 1;
      const canScrollInsideSlider =
        direction === 'down'
          ? emblaApi.canScrollNext()
          : emblaApi.canScrollPrev();

      if (hasScrollableSnaps && canScrollInsideSlider) {
        resetWheelBridge();
        return;
      }

      if (wrapToOppositeEdge(direction)) {
        event.preventDefault();
        event.stopPropagation();
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
      if (!allowSectionScrollOnEdges) {
        return;
      }

      sectionTouchStartRef.current = { x: event.clientX, y: event.clientY };
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (!allowSectionScrollOnEdges) {
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
      const isHorizontalSliderSwipe =
        Math.abs(deltaX) > FULLPAGE_TOUCH_SWIPE_THRESHOLD &&
        Math.abs(deltaX) > Math.abs(deltaY) * FULLPAGE_TOUCH_AXIS_LOCK_RATIO;

      if (isHorizontalSliderSwipe) {
        const direction = deltaX < 0 ? 'down' : 'up';
        lastSliderIntentRef.current = direction;
        const canScrollInsideSlider =
          direction === 'down'
            ? emblaApi.canScrollNext()
            : emblaApi.canScrollPrev();

        if (!canScrollInsideSlider && wrapToOppositeEdge(direction)) {
          event.preventDefault();
          event.stopPropagation();
        }

        return;
      }

      if (event.pointerType !== 'touch') {
        return;
      }

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
    viewportNode.addEventListener('mouseenter', handleSliderMouseEnter);
    viewportNode.addEventListener('mouseleave', handleSliderMouseLeave);
    emblaApi.on('settle', queueLastSlideReturn);

    return () => {
      viewportNode.removeEventListener('wheel', handleWheel);
      viewportNode.removeEventListener('pointerdown', handlePointerDown);
      viewportNode.removeEventListener('pointerup', handlePointerUp);
      viewportNode.removeEventListener('pointercancel', handlePointerCancel);
      viewportNode.removeEventListener('mouseenter', handleSliderMouseEnter);
      viewportNode.removeEventListener('mouseleave', handleSliderMouseLeave);
      emblaApi.off('settle', queueLastSlideReturn);

      if (wheelBridgeTimeoutRef.current) {
        window.clearTimeout(wheelBridgeTimeoutRef.current);
        wheelBridgeTimeoutRef.current = null;
      }

      if (edgeWrapTimeoutRef.current) {
        window.clearTimeout(edgeWrapTimeoutRef.current);
        edgeWrapTimeoutRef.current = null;
      }

      clearLastSlideReturn();

      sectionTouchStartRef.current = null;
      isSliderHoveredRef.current = false;
      lastSliderIntentRef.current = null;
      unlockWheelBridge();
      unlockEdgeWrap();
      resetWheelBridge();
    };
  }, [allowSectionScrollOnEdges, emblaApi]);

  return (
    <>
      <FullPageSection id="services" className="items-stretch bg-black px-4 py-[clamp(1rem,4vh,3rem)] text-white sm:px-8 min-[1000px]:pt-[var(--header-offset)]">
        <div ref={sectionContentRef} className="flex h-full min-h-0 w-full max-w-[1740px] flex-col items-center justify-center gap-[clamp(0.75rem,2vh,2rem)] px-[15px]">
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
                      onFocus={() => {
                        void preloadServiceModalBackground(slide.modal.backgroundImage);
                      }}
                      onPointerDown={() => {
                        void preloadServiceModalBackground(slide.modal.backgroundImage);
                      }}
                      onPointerEnter={() => {
                        void preloadServiceModalBackground(slide.modal.backgroundImage);
                      }}
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
                          <ServiceVideoMedia
                            posterSrc={slide.posterSrc}
                            shouldLoad={shouldLoadVideos}
                            videoRef={slide.videoRefConfig.ref}
                            videoSrc={slide.videoSrc}
                          />
                        ) : (
                          <Image
                            className="pointer-events-none object-cover"
                            src={slide.posterSrc}
                            alt=""
                            fill
                            sizes="(min-width: 1000px) 25vw, (min-width: 600px) 33vw, 50vw"
                            loading="lazy"
                          />
                        )}
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] flex w-full flex-col items-center px-1.5 text-center min-[1000px]:pb-[25px]">
                          <p className="hidden max-w-[260px] text-[12px] leading-[1.12] min-[1000px]:block mb-2">{slide.description}</p>
                          <h4 className="text-[22px] font-black leading-none text-[#63ff45] [text-shadow:-4px_5px_18px_rgba(0,0,0,0.82)] min-[1000px]:text-[18px] min-[1430px]:text-[30px]">
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
