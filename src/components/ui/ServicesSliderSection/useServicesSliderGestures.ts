import { useEffect, useRef } from 'react';
import type { UseEmblaCarouselType } from 'embla-carousel-react';
import {
  FULLPAGE_SCROLL_EVENT,
  FULLPAGE_TOUCH_AXIS_LOCK_RATIO,
  FULLPAGE_TOUCH_SWIPE_THRESHOLD,
  getFullPageSwipeDirection,
} from '@/src/components/ui/FullPageScroll';

const edgeWheelThreshold = 48;
const edgeWheelUnlockDelay = 700;
const edgeWrapUnlockDelay = 420;
const lastSlideReturnDelay = 500;

export function useServicesSliderGestures(
  emblaApi: UseEmblaCarouselType[1],
  allowSectionScrollOnEdges: boolean,
) {
  const wheelBridgeDirectionRef = useRef<'up' | 'down' | null>(null);
  const wheelBridgeDeltaRef = useRef(0);
  const wheelBridgeLockRef = useRef(false);
  const wheelBridgeTimeoutRef = useRef<number | null>(null);
  const edgeWrapLockRef = useRef(false);
  const edgeWrapTimeoutRef = useRef<number | null>(null);
  const lastSlideReturnTimeoutRef = useRef<number | null>(null);
  const isSliderHoveredRef = useRef(false);
  const lastSliderIntentRef = useRef<'up' | 'down' | null>(null);
  const sectionTouchStartRef = useRef<{ x: number; y: number } | null>(null);

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

}
