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
import { MobileXHeroSection } from '@/src/components/ui/MobileXHeroSection';
import {WhyUsSection} from "@/src/components/ui/WhyUsSection";
import {TeamSection} from "@/src/components/ui/TeamSection";
import { FinalContactSection } from '@/src/components/ui/FinalContactSection/FinalContactSection';

const SECOND_SECTION_INDEX = 1;
const MORPH_SECTION_INDEX = 2;

const isDesktopMorphViewport = () =>
  typeof window !== 'undefined' && window.matchMedia('(min-width: 1000px)').matches;

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
        beforeTransitionCallback={(startIndex, targetIndex) => {
          if (
            startIndex === MORPH_SECTION_INDEX &&
            targetIndex === SECOND_SECTION_INDEX &&
            isDesktopMorphViewport() &&
            morphSectionRef.current?.isExpandedVideoVisible()
          ) {
            morphSectionRef.current?.hideExpandedVideo();
            return false;
          }

          if (
            startIndex === MORPH_SECTION_INDEX &&
            targetIndex > MORPH_SECTION_INDEX &&
            isDesktopMorphViewport() &&
            !morphSectionRef.current?.isExpandedVideoVisible()
          ) {
            morphSectionRef.current?.revealExpandedVideo();
            return false;
          }

          return true;
        }}
        progressCallback={(progress) => {
          setHeaderProgress(progress);
          secondSectionRef.current?.setProgress(progress);
        }}
        transitionStartCallback={(startIndex, targetIndex) => {
          clearMorphStartTimeout();

          if (startIndex === SECOND_SECTION_INDEX && targetIndex === MORPH_SECTION_INDEX) {
            secondSectionRef.current?.playExit();
          }

          if (startIndex === MORPH_SECTION_INDEX && targetIndex === SECOND_SECTION_INDEX) {
            secondSectionRef.current?.playEnter();
          }

          if (
            startIndex === SECOND_SECTION_INDEX &&
            targetIndex === MORPH_SECTION_INDEX &&
            isDesktopMorphViewport()
          ) {
            morphStartTimeoutRef.current = window.setTimeout(() => {
              morphSectionRef.current?.playForward();
              morphStartTimeoutRef.current = null;
            }, FULLPAGE_SECTION_REVEAL_DELAY * 1000);
          }

          if (
            startIndex === MORPH_SECTION_INDEX &&
            targetIndex === SECOND_SECTION_INDEX &&
            isDesktopMorphViewport()
          ) {
            morphSectionRef.current?.hideExpandedVideo();
            morphSectionRef.current?.playReverse();
          }

          if (
            startIndex === MORPH_SECTION_INDEX &&
            targetIndex > MORPH_SECTION_INDEX &&
            isDesktopMorphViewport()
          ) {
            morphSectionRef.current?.fadeExpandedVideoOut();
          }

          if (
            startIndex > MORPH_SECTION_INDEX &&
            targetIndex === MORPH_SECTION_INDEX &&
            isDesktopMorphViewport()
          ) {
            morphSectionRef.current?.fadeExpandedVideoIn();
          }

        }}
      >
        <FullPageSection id="intro"  className={'bg-transparent'}>
          <div className="sr-only">XLAM Media</div>
        </FullPageSection>

        <SecondSectionDesign ref={secondSectionRef} />

        <FullPageSection id="next" className="items-stretch bg-black">
          <MobileXHeroSection />
          <MorphSection
              ref={morphSectionRef}
              className={'hidden flex-col items-center min-[1000px]:flex'}
              videoSrc={publicAssetPath('/video/3_slider_content_video.mov')}
              autoPlayTimeline={false}
              topEndWidth={820}
          />
        </FullPageSection>

        <ServicesSliderSection allowSectionScrollOnEdges />

        <FullPageSection id="why" fullBleed className="items-stretch bg-black">
          <WhyUsSection />
        </FullPageSection>
        <FullPageSection id="projects" className="items-stretch bg-black">
          <CinematicVideoSlider />
        </FullPageSection>

        <TextSection intervalMs={0} />

        <FullPageSection id="about" fullBleed className="items-stretch bg-black">
          <TeamSection />
        </FullPageSection>

        <FinalContactSection />

      </FullPageScroll>
    </div>
  );
};
