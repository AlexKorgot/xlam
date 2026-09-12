import { useRef } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import WheelGesturesPlugin from 'embla-carousel-wheel-gestures';
import { FULLPAGE_SCROLL_IGNORE_ATTR } from '@/src/components/ui/FullPageScroll';
import { ServiceSlideCard } from './ServiceSlideCard';
import { useServicesSliderGestures } from './useServicesSliderGestures';
import { useServicesDiscoveryHint } from './useServicesDiscoveryHint';
import type { ServiceSlide } from './services.types';

const scrollIgnoreAttr = { [FULLPAGE_SCROLL_IGNORE_ATTR]: 'true' } as const;

type ServicesSliderProps = {
  slides: ServiceSlide[];
  shouldLoadVideos: boolean;
  allowSectionScrollOnEdges: boolean;
  isActive: boolean;
  shouldPlayDiscoveryHint: boolean;
  onDiscoveryHintPlayed?: () => void;
  onOpen: (index: number) => void;
  onPrepare: (index: number) => void;
};

export function ServicesSlider({
  slides, shouldLoadVideos, allowSectionScrollOnEdges, isActive,
  shouldPlayDiscoveryHint, onDiscoveryHintPlayed, onOpen, onPrepare,
}: ServicesSliderProps) {
  const sectionContentRef = useRef<HTMLDivElement | null>(null);
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

  useServicesSliderGestures(emblaApi, allowSectionScrollOnEdges);
  useServicesDiscoveryHint({
    emblaApi, sectionContentRef, isActive, shouldPlayDiscoveryHint, onDiscoveryHintPlayed,
  });

  return (
    <div ref={sectionContentRef} className="embla__wrapper relative h-[clamp(260px,58vh,560px)] max-h-[62%] w-screen min-[1000px]:w-full">
      <div className="embla h-full">
        <div
          className="h-full overflow-hidden"
          ref={emblaRef}
          {...scrollIgnoreAttr}
        >
          <div className="embla__container ml-[-9px] flex h-full touch-pan-y touch-pinch-zoom min-[1000px]:ml-[-22px]">
            {slides.map((slide, index) => (
              <ServiceSlideCard
                key={slide.id}
                slide={slide}
                index={index}
                shouldLoad={shouldLoadVideos}
                onOpen={onOpen}
                onPrepare={onPrepare}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
