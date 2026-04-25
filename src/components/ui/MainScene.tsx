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
import { Container } from '@/src/components/ui/grid/Container';
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
    <div className="font-normalidad relative min-h-[100svh] bg-black text-foreground">
      <FullPageScroll
        progressCallback={(progress) => {
          setHeaderProgress(progress);
          secondSectionRef.current?.setProgress(progress);
        }}
        transitionStartCallback={(startIndex, targetIndex) => {
          clearMorphStartTimeout();

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
        <FullPageSection id="intro" className="bg-black">
          <div className="sr-only">XLAM Media</div>
        </FullPageSection>

        <SecondSectionDesign ref={secondSectionRef} />
        <ServicesSliderSection />
        <FullPageSection id="next" className="bg-[#050505] text-center">
          <div
            data-reveal
            className="px-6 text-sm uppercase tracking-[0.4em] text-white/60"
          >
            <Container>
              <main className="min-[100svh] bg-black">
                <MorphSection
                  ref={morphSectionRef}
                  videoSrc="/video/3_slider_content_video.mov"
                  autoPlayTimeline={false}
                  topEndWidth={820}
                />
              </main>
            </Container>
          </div>
        </FullPageSection>
      </FullPageScroll>
    </div>
  );
};
