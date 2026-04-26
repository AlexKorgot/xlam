'use client';

import { useEffect, useRef } from 'react';
import FullPageScroll, {
  FULLPAGE_SECTION_REVEAL_DELAY,
} from '@/src/components/ui/FullPageScroll';
import FullPageSection from '@/src/components/ui/FullPageSection';
import {
  SecondSectionDesign,
  type SecondSectionDesignHandle,
} from '@/src/components/ui/SecondSectionDesign';
import { ServicesSliderSection } from '@/src/components/ui/ServicesSliderSection/ServicesSliderSection';
import MorphSection, {
  type MorphSectionHandle,
} from '@/src/components/MorphSection';
import { useHeaderProgress } from '@/src/components/ui/Header/HeaderProvider';

export const MainScene = () => {
  const setHeaderProgress = useHeaderProgress();
  const secondSectionRef = useRef<SecondSectionDesignHandle>(null);
  const morphSectionRef = useRef<MorphSectionHandle>(null);
  const morphStartTimeoutRef = useRef<number | null>(null);

  const clearMorphStartTimeout = () => {
    if (morphStartTimeoutRef.current === null) {
      return;
    }

    window.clearTimeout(morphStartTimeoutRef.current);
    morphStartTimeoutRef.current = null;
  };

  useEffect(
    () => () => {
      clearMorphStartTimeout();
    },
    [],
  );

  return (
    <div className="font-normalidad relative min-h-[100svh]">
      <FullPageScroll
        progressCallback={(progress) => {
          setHeaderProgress(progress);
          secondSectionRef.current?.setProgress(progress);
        }}
        transitionStartCallback={(startIndex, targetIndex) => {
          clearMorphStartTimeout();

          if (startIndex === 1 && targetIndex === 2) {
            secondSectionRef.current?.playExit();
          }

          if (startIndex === 2 && targetIndex === 1) {
            secondSectionRef.current?.playEnter();
          }

          if (startIndex === 2 && targetIndex === 3) {
            morphStartTimeoutRef.current = window.setTimeout(() => {
              morphSectionRef.current?.playForward();
              morphStartTimeoutRef.current = null;
            }, FULLPAGE_SECTION_REVEAL_DELAY * 1000);
          }

          if (startIndex === 3 && targetIndex === 2) {
            morphSectionRef.current?.playReverse();
          }
        }}
      >
        <FullPageSection id="intro" >
          <div className="sr-only">XLAM Media</div>
        </FullPageSection>

        <SecondSectionDesign ref={secondSectionRef} />
        <ServicesSliderSection />
        <FullPageSection id="next">
          <MorphSection
              ref={morphSectionRef}
              className={'flex flex-col items-center'}
              videoSrc="/video/3_slider_content_video.mov"
              autoPlayTimeline={false}
              topEndWidth={820}
          />
        </FullPageSection>
      </FullPageScroll>
    </div>
  );
};
