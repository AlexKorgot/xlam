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
import { publicAssetPath } from '@/src/lib/publicAssetPath';
import { CinematicVideoSlider } from '@/src/components/cinematic_new';
import { TextSection } from '@/src/components/textSection';

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
    <div className="">
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

          if (startIndex === 3 && targetIndex === 4) {
            morphStartTimeoutRef.current = window.setTimeout(() => {
              morphSectionRef.current?.playForward();
              morphStartTimeoutRef.current = null;
            }, FULLPAGE_SECTION_REVEAL_DELAY * 1000);
          }

          if (startIndex === 4 && targetIndex === 3) {
            morphSectionRef.current?.playReverse();
          }
        }}
      >
        <FullPageSection id="intro"  className={'bg-transparent'}>
          <div className="sr-only">XLAM Media</div>
        </FullPageSection>

        <SecondSectionDesign ref={secondSectionRef} />
        <ServicesSliderSection allowSectionScrollOnEdges />
        <TextSection intervalMs={1500} />
        <FullPageSection id="next">
          <MorphSection
              ref={morphSectionRef}
              className={'flex flex-col items-center'}
              videoSrc={publicAssetPath('/video/3_slider_content_video.mov')}
              autoPlayTimeline={false}
              topEndWidth={820}
          />
        </FullPageSection>
        <FullPageSection id="projects" className="items-stretch bg-black">
          <CinematicVideoSlider />
        </FullPageSection>

      </FullPageScroll>
    </div>
  );
};
