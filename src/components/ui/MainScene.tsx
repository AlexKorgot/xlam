'use client';

import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import FullPageScroll, {
  FULLPAGE_SCROLL_EVENT,
  FULLPAGE_SECTION_REVEAL_DELAY,
} from '@/src/components/ui/FullPageScroll';
import FullPageSection from '@/src/components/ui/FullPageSection';
import {
  SecondSectionDesign,
  type SecondSectionDesignHandle,
} from '@/src/components/ui/SecondSectionDesign';
import type { MorphSectionHandle } from '@/src/components/MorphSection';
import { useHeaderProgress } from '@/src/components/ui/Header/HeaderProvider';
import type { MobileXHeroSectionHandle } from '@/src/components/ui/MobileXHeroSection';
import { mediaAssetPath } from '@/src/lib/mediaAssetPath';
import { getSectionRenderState } from '@/src/lib/fullPageSectionState';

const INTRO_SECTION_INDEX = 0;
const SECOND_SECTION_INDEX = 1;
const MORPH_SECTION_INDEX = 2;
const SERVICES_SECTION_INDEX = 3;
const WHY_SECTION_INDEX = 4;
const PROJECTS_SECTION_INDEX = 5;
const TEXT_SECTION_INDEX = 6;
const TEAM_SECTION_INDEX = 7;
const FINAL_CONTACT_SECTION_INDEX = 8;
const MORPH_VIDEO_SRC = mediaAssetPath('/only_bg.mp4');
const MORPH_TOP_VIDEO_SRC = '/video_reels/top_video.mp4';
const MORPH_BOTTOM_VIDEO_SRC = '/video_reels/bottom_video.mp4';

const loadMorphSection = () => import('@/src/components/MorphSection');
const MorphSection = lazy(loadMorphSection);
const loadMobileXHeroSection = () =>
  import('@/src/components/ui/MobileXHeroSection').then(
    ({ MobileXHeroSection: Component }) => ({ default: Component }),
  );
const MobileXHeroSection = lazy(loadMobileXHeroSection);

const PerformanceDiagnostics = lazy(() =>
  import('@/src/components/ui/PerformanceDiagnostics').then(
    ({ PerformanceDiagnostics: Component }) => ({ default: Component }),
  ),
);

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
  activeSectionIndex: number;
  children: ReactNode;
  fallbackClassName?: string;
  sectionIndex: number;
  sectionId: string;
};

const DeferredSection = ({
  activeSectionIndex,
  children,
  fallbackClassName = 'bg-black',
  sectionIndex,
  sectionId,
}: DeferredSectionProps) => {
  const renderState = getSectionRenderState(sectionIndex, activeSectionIndex);

  const fallback = (
    <div
      className={`h-full w-full ${fallbackClassName}`}
      aria-hidden="true"
    />
  );

  return (
    <div
      data-fullpage-section-id={sectionId}
      data-section-render-state={renderState}
      className={`w-full ${fallbackClassName}`}
      style={{ height: 'var(--fullpage-height, 100svh)' } as CSSProperties}
    >
      {renderState === 'distant' ? fallback : (
        <Suspense fallback={fallback}>{children}</Suspense>
      )}
    </div>
  );
};

type ResponsiveMorphMode = 'mobile' | 'desktop' | null;

function useResponsiveMorphMode() {
  const [mode, setMode] = useState<ResponsiveMorphMode>(null);

  useEffect(() => {
    const media = window.matchMedia('(min-width: 1000px)');
    const syncMode = () => {
      setMode(media.matches ? 'desktop' : 'mobile');
    };

    syncMode();
    media.addEventListener('change', syncMode);

    return () => {
      media.removeEventListener('change', syncMode);
    };
  }, []);

  return mode;
}

export const MainScene = () => {
  const setHeaderProgress = useHeaderProgress();
  const [activeSectionIndex, setActiveSectionIndex] = useState(INTRO_SECTION_INDEX);
  const [transitionTargetIndex, setTransitionTargetIndex] = useState<number | null>(null);
  const [hasMountedMorphSection, setHasMountedMorphSection] = useState(false);
  const responsiveMorphMode = useResponsiveMorphMode();
  const responsiveMorphModeRef = useRef(responsiveMorphMode);
  const secondSectionRef = useRef<SecondSectionDesignHandle>(null);
  const morphSectionRef = useRef<MorphSectionHandle>(null);
  const mobileHeroRef = useRef<MobileXHeroSectionHandle>(null);
  const morphStartTimeoutRef = useRef<number | null>(null);
  const morphTimelineReadyRef = useRef(false);
  const morphTimelineReadyPromiseRef = useRef<Promise<void> | null>(null);
  const resolveMorphTimelineReadyRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    responsiveMorphModeRef.current = responsiveMorphMode;
  }, [responsiveMorphMode]);

  const waitForMorphTimeline = useCallback(() => {
    if (morphTimelineReadyRef.current) {
      return Promise.resolve();
    }

    if (!morphTimelineReadyPromiseRef.current) {
      morphTimelineReadyPromiseRef.current = new Promise<void>((resolve) => {
        resolveMorphTimelineReadyRef.current = resolve;
      });
    }

    return morphTimelineReadyPromiseRef.current;
  }, []);

  const handleMorphTimelineReadyChange = useCallback((ready: boolean) => {
    morphTimelineReadyRef.current = ready;

    if (!ready) {
      return;
    }

    resolveMorphTimelineReadyRef.current?.();
    resolveMorphTimelineReadyRef.current = null;
    morphTimelineReadyPromiseRef.current = null;
  }, []);

  const clearMorphStartTimeout = useCallback(() => {
    if (morphStartTimeoutRef.current === null) {
      return;
    }

    window.clearTimeout(morphStartTimeoutRef.current);
    morphStartTimeoutRef.current = null;
  }, []);

  useEffect(
    () => () => {
      clearMorphStartTimeout();
    },
    [clearMorphStartTimeout],
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.get('skipIntro') !== '1') {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      window.dispatchEvent(
        new CustomEvent(FULLPAGE_SCROLL_EVENT, {
          detail: {
            behavior: 'instant',
            targetIndex: SECOND_SECTION_INDEX,
          },
        }),
      );
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  const morphSectionRenderState = transitionTargetIndex === MORPH_SECTION_INDEX
    ? 'active'
    : getSectionRenderState(MORPH_SECTION_INDEX, activeSectionIndex);

  const handleSectionChange = useCallback((index: number) => {
    setActiveSectionIndex(index);
    setTransitionTargetIndex(null);

    if (index === SECOND_SECTION_INDEX || index === MORPH_SECTION_INDEX) {
      setHasMountedMorphSection(true);
    }
  }, []);

  const handleBeforeTransition = useCallback(async (
    startIndex: number,
    targetIndex: number,
  ) => {
    if (targetIndex === MORPH_SECTION_INDEX && startIndex !== MORPH_SECTION_INDEX) {
      const mode = responsiveMorphModeRef.current;

      if (mode === 'mobile') {
        await loadMobileXHeroSection();
      } else if (mode === 'desktop') {
        await loadMorphSection();
      }

      setHasMountedMorphSection(true);

      if (mode === 'desktop') {
        await waitForMorphTimeline();
      }
    }

    if (
      startIndex === MORPH_SECTION_INDEX &&
      targetIndex === SECOND_SECTION_INDEX &&
      responsiveMorphModeRef.current === 'mobile' &&
      mobileHeroRef.current?.isExpandedVideoVisible()
    ) {
      mobileHeroRef.current?.hideExpandedVideo();
      return false;
    }

    if (
      startIndex === MORPH_SECTION_INDEX &&
      targetIndex > MORPH_SECTION_INDEX &&
      responsiveMorphModeRef.current === 'mobile' &&
      !mobileHeroRef.current?.isExpandedVideoVisible()
    ) {
      mobileHeroRef.current?.revealExpandedVideo();
      return false;
    }

    if (
      startIndex === MORPH_SECTION_INDEX &&
      targetIndex === SECOND_SECTION_INDEX &&
      responsiveMorphModeRef.current === 'desktop' &&
      morphSectionRef.current?.isExpandedVideoVisible()
    ) {
      morphSectionRef.current?.hideExpandedVideo();
      return false;
    }

    if (
      startIndex === MORPH_SECTION_INDEX &&
      targetIndex > MORPH_SECTION_INDEX &&
      responsiveMorphModeRef.current === 'desktop' &&
      !morphSectionRef.current?.isExpandedVideoVisible()
    ) {
      morphSectionRef.current?.revealExpandedVideo();
      return false;
    }

    return true;
  }, [waitForMorphTimeline]);

  const handleProgress = useCallback((progress: number) => {
    setHeaderProgress(progress);
    secondSectionRef.current?.setProgress(progress);
  }, [setHeaderProgress]);

  const handleTransitionStart = useCallback((startIndex: number, targetIndex: number) => {
    clearMorphStartTimeout();
    setTransitionTargetIndex(targetIndex);

    if (startIndex === SECOND_SECTION_INDEX && targetIndex === MORPH_SECTION_INDEX) {
      secondSectionRef.current?.playExit();
    }

    if (startIndex === MORPH_SECTION_INDEX && targetIndex === SECOND_SECTION_INDEX) {
      secondSectionRef.current?.playEnter();
    }

    if (
      startIndex === SECOND_SECTION_INDEX &&
      targetIndex === MORPH_SECTION_INDEX &&
      responsiveMorphModeRef.current === 'desktop'
    ) {
      morphStartTimeoutRef.current = window.setTimeout(() => {
        morphSectionRef.current?.playForward();
        morphStartTimeoutRef.current = null;
      }, FULLPAGE_SECTION_REVEAL_DELAY * 1000);
    }

    if (
      startIndex === MORPH_SECTION_INDEX &&
      targetIndex === SECOND_SECTION_INDEX &&
      responsiveMorphModeRef.current === 'desktop'
    ) {
      morphSectionRef.current?.hideExpandedVideo();
      morphSectionRef.current?.playReverse();
    }

    if (
      startIndex === MORPH_SECTION_INDEX &&
      targetIndex > MORPH_SECTION_INDEX &&
      responsiveMorphModeRef.current === 'desktop'
    ) {
      morphSectionRef.current?.fadeExpandedVideoOut();
    }

    if (
      startIndex === MORPH_SECTION_INDEX &&
      targetIndex > MORPH_SECTION_INDEX &&
      responsiveMorphModeRef.current === 'mobile'
    ) {
      mobileHeroRef.current?.fadeExpandedVideoOut();
    }

    if (
      startIndex > MORPH_SECTION_INDEX &&
      targetIndex === MORPH_SECTION_INDEX &&
      responsiveMorphModeRef.current === 'desktop'
    ) {
      morphSectionRef.current?.fadeExpandedVideoIn();
    }

    if (
      startIndex > MORPH_SECTION_INDEX &&
      targetIndex === MORPH_SECTION_INDEX &&
      responsiveMorphModeRef.current === 'mobile'
    ) {
      mobileHeroRef.current?.fadeExpandedVideoIn();
    }
  }, [clearMorphStartTimeout]);

  return (
    <div className="">
      {process.env.NODE_ENV !== 'production' ? (
        <Suspense fallback={null}>
          <PerformanceDiagnostics activeSectionIndex={activeSectionIndex} />
        </Suspense>
      ) : null}
      <FullPageScroll
        beforeTransitionCallback={handleBeforeTransition}
        progressCallback={handleProgress}
        sectionChangeCallback={handleSectionChange}
        transitionStartCallback={handleTransitionStart}
      >
        <FullPageSection id="intro" className="bg-transparent">
          <div className="sr-only">XLAM Media</div>
        </FullPageSection>

        <DeferredSection
          activeSectionIndex={activeSectionIndex}
          sectionIndex={SECOND_SECTION_INDEX}
          sectionId="production"
        >
          <SecondSectionDesign ref={secondSectionRef} />
        </DeferredSection>

        <FullPageSection id="next" className="items-stretch bg-black">
          <div
            className="h-full w-full bg-black"
            data-fullpage-section-id="next"
            data-section-render-state={morphSectionRenderState}
          >
            {
              morphSectionRenderState === 'distant' ||
              responsiveMorphMode === null ||
              !hasMountedMorphSection
            ? (
              <div className="h-full w-full" aria-hidden="true" />
            ) : (
              <Suspense fallback={<div className="h-full w-full bg-black" aria-hidden="true" />}>
                {responsiveMorphMode === 'mobile' ? (
                  <MobileXHeroSection
                    ref={mobileHeroRef}
                    renderState={morphSectionRenderState}
                  />
                ) : (
                  <MorphSection
                    ref={morphSectionRef}
                    renderState={morphSectionRenderState}
                    onTimelineReadyChange={handleMorphTimelineReadyChange}
                    className="flex flex-col items-center"
                    videoSrc={MORPH_VIDEO_SRC}
                    topVideoSrc={MORPH_TOP_VIDEO_SRC}
                    bottomVideoSrc={MORPH_BOTTOM_VIDEO_SRC}
                    autoPlayTimeline={false}
                    topEndWidth={1040}
                    bottomLeftX={-795}
                  />
                )}
              </Suspense>
            )}
          </div>
        </FullPageSection>

        <DeferredSection
          activeSectionIndex={activeSectionIndex}
          sectionIndex={SERVICES_SECTION_INDEX}
          sectionId="services"
        >
          <ServicesSliderSection allowSectionScrollOnEdges />
        </DeferredSection>

        <DeferredSection
          activeSectionIndex={activeSectionIndex}
          sectionIndex={WHY_SECTION_INDEX}
          sectionId="why"
        >
          <WhyUsSection />
        </DeferredSection>

        <DeferredSection
          activeSectionIndex={activeSectionIndex}
          sectionIndex={PROJECTS_SECTION_INDEX}
          sectionId="projects"
        >
          <CinematicVideoSlider />
        </DeferredSection>

        <DeferredSection
          activeSectionIndex={activeSectionIndex}
          sectionIndex={TEXT_SECTION_INDEX}
          sectionId="text-section"
          fallbackClassName="bg-white"
        >
          <TextSection intervalMs={0} />
        </DeferredSection>

        <DeferredSection
          activeSectionIndex={activeSectionIndex}
          sectionIndex={TEAM_SECTION_INDEX}
          sectionId="about"
        >
          <TeamSection />
        </DeferredSection>

        <DeferredSection
          activeSectionIndex={activeSectionIndex}
          sectionIndex={FINAL_CONTACT_SECTION_INDEX}
          sectionId="final-contact"
        >
          <FinalContactSection />
        </DeferredSection>

      </FullPageScroll>
    </div>
  );
};
