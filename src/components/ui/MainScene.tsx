'use client';

import { useRef } from 'react';
import { Header, type HeaderHandle } from '@/src/components/ui/Header/Header';
import FullPageScroll from '@/src/components/ui/FullPageScroll';
import FullPageSection from '@/src/components/ui/FullPageSection';
import {
  SecondSectionDesign,
  type SecondSectionDesignHandle,
} from '@/src/components/ui/SecondSectionDesign';
import { ServicesSliderSection } from '@/src/components/ui/ServicesSliderSection/ServicesSliderSection';
import { Container } from '@/src/components/ui/grid/Container';
import MorphSection from '@/src/components/MorphSection';

export const MainScene = () => {
  const headerRef = useRef<HeaderHandle>(null);
  const secondSectionRef = useRef<SecondSectionDesignHandle>(null);

  return (
    <div className="font-normalidad relative min-h-screen bg-black text-foreground">
      <Header ref={headerRef} />

      <FullPageScroll
        progressCallback={(progress) => {
          headerRef.current?.setProgress(progress);
          secondSectionRef.current?.setProgress(progress);
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
              <main className="min-h-screen bg-black">
                <MorphSection
                  videoSrc="/video/3_slider_content_video.mov"
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
