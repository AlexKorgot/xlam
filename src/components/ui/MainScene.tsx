'use client';

import {
  lazy,
  Suspense,
  useEffect,
  useRef,
  type CSSProperties,
  type ReactNode,
} from 'react';
import FullPageScroll, {
  FULLPAGE_SECTION_REVEAL_DELAY,
} from '@/src/components/ui/FullPageScroll';
import FullPageSection from '@/src/components/ui/FullPageSection';
import {
  SecondSectionDesign,
  type SecondSectionDesignHandle,
} from '@/src/components/ui/SecondSectionDesign';
import MorphSection, {
  type MorphSectionHandle,
} from '@/src/components/MorphSection';
import { useHeaderProgress } from '@/src/components/ui/Header/HeaderProvider';
import {
  MobileXHeroSection,
  type MobileXHeroSectionHandle,
} from '@/src/components/ui/MobileXHeroSection';
import { mediaAssetPath } from '@/src/lib/mediaAssetPath';
import { useNearViewport } from '@/src/lib/useNearViewport';

const SECOND_SECTION_INDEX = 1;
const MORPH_SECTION_INDEX = 2;
const MORPH_VIDEO_SRC = mediaAssetPath('/only_bg.mp4');
const MORPH_TOP_VIDEO_SRC = '/video_reels/top_video.mp4';
const MORPH_BOTTOM_VIDEO_SRC = '/video_reels/bottom_video.mp4';

const ServicesSliderSection = lazy(() =>
  import('@/src/components/ui/ServicesSliderSection/ServicesSliderSection').then(
    ({ ServicesSliderSection: Component }) => ({ default: Component }),
  ),
);
const WhyUsSection = lazy(() =>
  import('@/src/components/ui/WhyUsSection/WhyUsSection').then(
    ({ WhyUsSection: Component }) => ({ default: Component }),
  ),
);
const CinematicVideoSlider = lazy(() =>
  import('@/src/components/cinematic_new/CinematicVideoSlider.client').then(
    ({ CinematicVideoSlider: Component }) => ({ default: Component }),
  ),
);
const TextSection = lazy(() =>
  import('@/src/components/textSection/TextSection').then(
    ({ TextSection: Component }) => ({ default: Component }),
  ),
);
const TeamSection = lazy(() =>
  import('@/src/components/ui/TeamSection/TeamSection').then(
    ({ TeamSection: Component }) => ({ default: Component }),
  ),
);
const FinalContactSection = lazy(() =>
  import('@/src/components/ui/FinalContactSection/FinalContactSection').then(
    ({ FinalContactSection: Component }) => ({ default: Component }),
  ),
);

type DeferredSectionProps = {
  children: ReactNode;
  fallbackClassName?: string;
  sectionId: string;
};

const DeferredSection = ({
  children,
  fallbackClassName = 'bg-black',
  sectionId,
}: DeferredSectionProps) => {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const shouldLoad = useNearViewport(sectionRef, '180% 0px');

  const fallback = (
    <div
      className={`h-full w-full ${fallbackClassName}`}
      aria-hidden="true"
    />
  );

  return (
    <div
      ref={sectionRef}
      data-fullpage-section-id={sectionId}
      className={`w-full ${fallbackClassName}`}
      style={{ height: 'var(--fullpage-height, 100svh)' } as CSSProperties}
    >
      {shouldLoad ? <Suspense fallback={fallback}>{children}</Suspense> : fallback}
    </div>
  );
};

const isDesktopMorphViewport = () =>
  typeof window !== 'undefined' && window.matchMedia('(min-width: 1000px)').matches;

const isMobileHeroViewport = () =>
  typeof window !== 'undefined' && window.matchMedia('(max-width: 999.98px)').matches;

export const MainScene = () => {
  const setHeaderProgress = useHeaderProgress();
  const secondSectionRef = useRef<SecondSectionDesignHandle>(null);
  const morphSectionRef = useRef<MorphSectionHandle>(null);
  const mobileHeroRef = useRef<MobileXHeroSectionHandle>(null);
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
            isMobileHeroViewport() &&
            mobileHeroRef.current?.isExpandedVideoVisible()
          ) {
            mobileHeroRef.current?.hideExpandedVideo();
            return false;
          }

          if (
            startIndex === MORPH_SECTION_INDEX &&
            targetIndex > MORPH_SECTION_INDEX &&
            isMobileHeroViewport() &&
            !mobileHeroRef.current?.isExpandedVideoVisible()
          ) {
            mobileHeroRef.current?.revealExpandedVideo();
            return false;
          }

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
            startIndex === MORPH_SECTION_INDEX &&
            targetIndex > MORPH_SECTION_INDEX &&
            isMobileHeroViewport()
          ) {
            mobileHeroRef.current?.fadeExpandedVideoOut();
          }

          if (
            startIndex > MORPH_SECTION_INDEX &&
            targetIndex === MORPH_SECTION_INDEX &&
            isDesktopMorphViewport()
          ) {
            morphSectionRef.current?.fadeExpandedVideoIn();
          }

          if (
            startIndex > MORPH_SECTION_INDEX &&
            targetIndex === MORPH_SECTION_INDEX &&
            isMobileHeroViewport()
          ) {
            mobileHeroRef.current?.fadeExpandedVideoIn();
          }

        }}
      >
        <FullPageSection id="intro"  className={'bg-transparent'}>
          <div className="sr-only">XLAM Media</div>
        </FullPageSection>

        <SecondSectionDesign ref={secondSectionRef} />

        <FullPageSection id="next" className="items-stretch bg-black">
          <MobileXHeroSection ref={mobileHeroRef} />
          <MorphSection
              ref={morphSectionRef}
              className={'hidden flex-col items-center min-[1000px]:flex'}
              videoSrc={MORPH_VIDEO_SRC}
              topVideoSrc={MORPH_TOP_VIDEO_SRC}
              bottomVideoSrc={MORPH_BOTTOM_VIDEO_SRC}
              autoPlayTimeline={false}
              topEndWidth={1040}
              bottomLeftX={-795}
          />
        </FullPageSection>

        <DeferredSection sectionId="services">
          <ServicesSliderSection allowSectionScrollOnEdges />
        </DeferredSection>

        <DeferredSection sectionId="why">
          <WhyUsSection />
        </DeferredSection>

        <DeferredSection sectionId="projects">
          <CinematicVideoSlider />
        </DeferredSection>

        <DeferredSection sectionId="text-section" fallbackClassName="bg-white">
          <TextSection intervalMs={0} />
        </DeferredSection>

        <DeferredSection sectionId="about">
          <TeamSection />
        </DeferredSection>

        <DeferredSection sectionId="final-contact">
          <FinalContactSection />
        </DeferredSection>

      </FullPageScroll>
    </div>
  );
};
