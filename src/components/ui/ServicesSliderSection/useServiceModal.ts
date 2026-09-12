import { useCallback, useState } from 'react';
import type { ServiceSlide } from './services.types';

export function useServiceModal(slides: ServiceSlide[]) {
  const slideCount = slides.length;
  const [selectedSlideIndex, setSelectedSlideIndex] = useState<number | null>(null);
  const [renderedSlideIndex, setRenderedSlideIndex] = useState<number | null>(0);
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

  return {
    renderedSlide, previousSlide, nextSlide,
    isOpen: selectedSlideIndex !== null,
    openModal, closeModal, showPreviousSlide, showNextSlide,
    prepareModal: setRenderedSlideIndex,
  };
}
