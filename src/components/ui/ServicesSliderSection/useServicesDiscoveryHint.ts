import { useRef, type RefObject } from 'react';
import type { UseEmblaCarouselType } from 'embla-carousel-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

gsap.registerPlugin(useGSAP);

type DiscoveryHintOptions = {
  emblaApi: UseEmblaCarouselType[1];
  sectionContentRef: RefObject<HTMLDivElement | null>;
  isActive: boolean;
  shouldPlayDiscoveryHint: boolean;
  onDiscoveryHintPlayed?: () => void;
};

export function useServicesDiscoveryHint({
  emblaApi, sectionContentRef, isActive, shouldPlayDiscoveryHint, onDiscoveryHintPlayed,
}: DiscoveryHintOptions) {
  const discoveryHintPlayedRef = useRef(false);
  const shouldPlayDiscoveryHintRef = useRef(shouldPlayDiscoveryHint);

  useGSAP(
    () => {
      if (
        !isActive ||
        !shouldPlayDiscoveryHintRef.current ||
        discoveryHintPlayedRef.current ||
        !emblaApi
      ) {
        return;
      }

      const viewportNode = emblaApi.rootNode();
      const slideVisuals = emblaApi
        .slideNodes()
        .map((slideNode) =>
          slideNode.querySelector<HTMLElement>('[data-service-slide-visual]'),
        )
        .filter((slideVisual): slideVisual is HTMLElement => slideVisual !== null);

      if (slideVisuals.length < 2) {
        return;
      }

      const markHintPlayed = () => {
        if (discoveryHintPlayedRef.current) {
          return;
        }

        discoveryHintPlayedRef.current = true;
        onDiscoveryHintPlayed?.();
      };

      if (
        window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
        emblaApi.selectedScrollSnap() !== 0 ||
        !emblaApi.canScrollNext()
      ) {
        markHintPlayed();
        return;
      }

      const removeInteractionListeners = () => {
        viewportNode.removeEventListener('pointerdown', cancelHint);
        viewportNode.removeEventListener('wheel', cancelHint);
      };

      const cancelHint = () => {
        timeline.progress(1).kill();
        removeInteractionListeners();
        markHintPlayed();
      };

      const timeline = gsap.timeline({
        delay: 0.65,
        onComplete: removeInteractionListeners,
        onStart: markHintPlayed,
      });

      viewportNode.addEventListener('pointerdown', cancelHint, { once: true });
      viewportNode.addEventListener('wheel', cancelHint, {
        once: true,
        passive: true,
      });

      timeline
        .set(slideVisuals, { willChange: 'transform' })
        .to(slideVisuals, {
          xPercent: -20,
          duration: 0.45,
          ease: 'power2.out',
        })
        .to(slideVisuals, {
          xPercent: 0,
          duration: 0.55,
          ease: 'power2.inOut',
        })
        .set(slideVisuals, { clearProps: 'transform,willChange' });

      return () => {
        removeInteractionListeners();
      };
    },
    {
      dependencies: [
        emblaApi,
        isActive,
        onDiscoveryHintPlayed,
      ],
      revertOnUpdate: true,
      scope: sectionContentRef,
    },
  );

}
