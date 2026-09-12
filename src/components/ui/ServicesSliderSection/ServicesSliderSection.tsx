'use client';

import { useEffect, useRef } from 'react';
import FullPageSection from '@/src/components/ui/FullPageSection';
import { Container } from '@/src/components/ui/grid/Container';
import { useNearViewport } from '@/src/lib/useNearViewport';
import { ServiceModal } from './ServiceModal';
import { ServicesSlider } from './ServicesSlider';
import { serviceSlides } from './services.data';
import { useServiceModal } from './useServiceModal';
import { preloadServiceModalBackground, serviceModalBackgroundList } from './serviceModalBackground';

interface ServicesSliderSectionProps {
  allowSectionScrollOnEdges?: boolean;
  isActive?: boolean;
  onDiscoveryHintPlayed?: () => void;
  shouldPlayDiscoveryHint?: boolean;
}

export function ServicesSliderSection({
  allowSectionScrollOnEdges = false,
  isActive = false,
  onDiscoveryHintPlayed,
  shouldPlayDiscoveryHint = true,
}: ServicesSliderSectionProps) {
  const sectionContentRef = useRef<HTMLDivElement | null>(null);
  const shouldLoadVideos = useNearViewport(sectionContentRef);
  const {
    renderedSlide, previousSlide, nextSlide, isOpen,
    openModal, closeModal, showPreviousSlide, showNextSlide, prepareModal,
  } = useServiceModal(serviceSlides);

  useEffect(() => {
    if (!shouldLoadVideos) {
      return;
    }

    for (const background of serviceModalBackgroundList) {
      void preloadServiceModalBackground(background);
    }
  }, [shouldLoadVideos]);

  return (
    <>
      <FullPageSection id="services" className="items-stretch bg-black py-[clamp(1rem,4vh,3rem)] text-white min-[1000px]:pt-[var(--header-offset)]">
        <Container
          ref={sectionContentRef}
          outerClassName="h-full min-h-0"
          className="flex h-full min-h-0 flex-col items-center justify-center gap-[clamp(0.75rem,2vh,2rem)]"
        >
          <ServicesSlider
            slides={serviceSlides}
            shouldLoadVideos={shouldLoadVideos}
            allowSectionScrollOnEdges={allowSectionScrollOnEdges}
            isActive={isActive}
            shouldPlayDiscoveryHint={shouldPlayDiscoveryHint}
            onDiscoveryHintPlayed={onDiscoveryHintPlayed}
            onOpen={openModal}
            onPrepare={prepareModal}
          />
          <div className="min-h-0 text-center" data-reveal>
            <p className="max-w-[1000px] m-auto text-[clamp(0.875rem,2.2vw,1.5625rem)] font-bold uppercase leading-[1.14] text-white mb-4">
              берем на себя все этапы создания продукта: сценарий, съемка, монтаж, саунд-дизайн и графика
            </p>
            <p className="whitespace-nowrap text-[clamp(2.75rem,9vw,9.8125rem)] font-black uppercase leading-[0.99] tracking-[0.04em] text-white sm:tracking-[0.08em]">
              ХЛАМ MEDI<span className="text-[#63ff45]">A</span>
            </p>
          </div>
        </Container>
      </FullPageSection>
      {renderedSlide && previousSlide && nextSlide ? (
        <ServiceModal
          isOpen={isOpen}
          content={renderedSlide.modal}
          previousLabel={previousSlide.title}
          currentLabel={renderedSlide.title}
          nextLabel={nextSlide.title}
          onClose={closeModal}
          onPrevious={showPreviousSlide}
          onNext={showNextSlide}
        />
      ) : null}
    </>
  );
}
