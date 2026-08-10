'use client';

import { useEffect, useRef, useState } from 'react';
import FullPageSection from '@/src/components/ui/FullPageSection';
import { useContactModal } from '@/src/components/ui/contact-modal';
import { Container } from '@/src/components/ui/grid/Container';
import { publicAssetPath } from '@/src/lib/publicAssetPath';
import { useNearViewport } from '@/src/lib/useNearViewport';

const leftSocialItems = [
  { label: 'YOUTUBE' },
  { label: 'INSTA' },
  { label: 'TG' },
];

const rightSocialItems = [
  { label: 'RUTUBE', href: 'https://rutube.ru/channel/80320249' },
  { label: 'ВКОНТАКТЕ', href: 'https://vk.ru/xlam_media' },
  {
    label: 'MAX',
    href: 'https://max.ru/join/I5TMiVG9fJau4wFy0PUUkWiXfL2NnHvfYRsBPucE7FQ',
  },
];
const mobileVideoSrc = publicAssetPath('/footer/mobile.mp4');
const desktopVideoSrc = publicAssetPath('/footer/desktop.mp4');

export function FinalContactSection() {
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const { openContactModal, preloadContactModal } = useContactModal();
  const sectionContentRef = useRef<HTMLDivElement | null>(null);
  const shouldLoadVideo = useNearViewport(sectionContentRef);

  useEffect(() => {
    if (!shouldLoadVideo) {
      return;
    }

    const mediaQuery = window.matchMedia(
      '(max-width: 999.98px) and (orientation: portrait)',
    );
    const updateVideoSrc = () => {
      setVideoSrc(mediaQuery.matches ? mobileVideoSrc : desktopVideoSrc);
    };

    updateVideoSrc();
    mediaQuery.addEventListener('change', updateVideoSrc);

    return () => {
      mediaQuery.removeEventListener('change', updateVideoSrc);
    };
  }, [shouldLoadVideo]);

  return (
    <FullPageSection id="final-contact" fullBleed reserveHeader className="items-stretch bg-black">
      <div ref={sectionContentRef} className="relative isolate h-full w-full overflow-hidden bg-black font-normalidad text-white">
        <Container
          outerClassName="h-full"
          className="z-40 flex h-full flex-col pb-[max(18px,env(safe-area-inset-bottom))] pt-4 max-[999px]:[@media_(orientation:landscape)]:pb-0 max-[999px]:[@media_(orientation:landscape)]:pt-1 min-[1000px]:pb-0 min-[1000px]:pt-14"
        >
          <div className="relative z-20 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-0">
            <nav aria-label="Социальные сети">
              <ul className="max-w-none">
                {leftSocialItems.map((item) => {
                  return (
                  <li key={item.label} className="border-t border-white/55 last:border-b">
                    <span
                      aria-disabled="true"
                      className="group relative flex h-[41px] w-full items-center overflow-hidden px-3 text-left text-[16px] font-medium uppercase leading-none text-white transition-colors hover:text-black sm:h-[52px] sm:text-[20px] max-[999px]:[@media_(orientation:landscape)]:h-[30px] max-[999px]:[@media_(orientation:landscape)]:px-2 max-[999px]:[@media_(orientation:landscape)]:text-[13px] min-[1000px]:h-[69px] min-[1000px]:px-3 min-[1000px]:text-[28px]"
                    >
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-y-0 left-0 right-0 bg-[linear-gradient(90deg,#66ff66_0%,#66ff66_34%,rgba(102,255,102,0.62)_58%,rgba(102,255,102,0.16)_82%,rgba(102,255,102,0)_100%)] opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100"
                      />
                      <span className="pointer-events-none relative z-10 origin-left transition-transform duration-300 ease-out group-hover:scale-[1.2]">
                        {item.label}
                      </span>
                    </span>
                  </li>
                  );
                })}
              </ul>
            </nav>

            <div className="ml-0 w-full max-w-none">
              <ul aria-label="Социальные сети">
                {rightSocialItems.map((item) => {
                  return (
                  <li key={item.label} className="cursor-pointer border-t border-white/55 last:border-b">
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative flex h-[41px] w-full cursor-pointer items-center justify-end overflow-hidden px-3 text-right text-[15px] font-medium uppercase leading-none text-white transition-colors hover:text-black sm:h-[52px] sm:text-[18px] max-[999px]:[@media_(orientation:landscape)]:h-[30px] max-[999px]:[@media_(orientation:landscape)]:px-2 max-[999px]:[@media_(orientation:landscape)]:text-[12px] min-[1000px]:h-[69px] min-[1000px]:text-[28px]"
                    >
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-y-0 left-0 right-0 bg-[linear-gradient(270deg,#66ff66_0%,#66ff66_34%,rgba(102,255,102,0.62)_58%,rgba(102,255,102,0.16)_82%,rgba(102,255,102,0)_100%)] opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100"
                      />
                      <span className="pointer-events-none relative z-10 origin-right transition-transform duration-300 ease-out group-hover:scale-[1.2]">
                        {item.label}
                      </span>
                    </a>
                  </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <div className="relative min-h-0 w-full flex-1 [container-type:size]">
            <div className="pointer-events-none absolute left-1/2 top-0 z-0 aspect-[9/16] w-[88vw] max-w-[49.5svh] [transform:translate(-50%,-41%)] max-[999px]:[@media_(orientation:portrait)]:w-[145vw] max-[999px]:[@media_(orientation:portrait)]:max-w-[64svh] max-[999px]:[@media_(orientation:landscape)]:aspect-video max-[999px]:[@media_(orientation:landscape)]:w-[88vw] max-[999px]:[@media_(orientation:landscape)]:max-w-[120svh] max-[999px]:[@media_(orientation:landscape)]:[transform:translate(-50%,min(-27%,calc(100cqh_-_100%)))] min-[1000px]:aspect-video min-[1000px]:max-w-[1600px] min-[1000px]:[transform:translate(-50%,min(-27%,calc(100cqh_-_100%)))]">
              {videoSrc ? (
                <video
                  key={videoSrc}
                  src={videoSrc}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="none"
                  className="absolute inset-0 z-0 block h-full w-full"
                  aria-hidden="true"
                />
              ) : null}

              <button
                type="button"
                onPointerEnter={preloadContactModal}
                onFocus={preloadContactModal}
                onPointerDown={preloadContactModal}
                onClick={openContactModal}
                className="pointer-events-auto absolute left-[28%] top-[43%] z-20 h-[23%] w-[52%] cursor-pointer rounded-[6px] bg-transparent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#66ff66] max-[999px]:[@media_(orientation:landscape)]:left-[38%] max-[999px]:[@media_(orientation:landscape)]:top-[27%] max-[999px]:[@media_(orientation:landscape)]:h-[38%] max-[999px]:[@media_(orientation:landscape)]:w-[26%] min-[1000px]:left-[38%] min-[1000px]:top-[27%] min-[1000px]:h-[38%] min-[1000px]:w-[26%]"
                aria-label="Открыть форму обратной связи"
              />
            </div>
          </div>
        </Container>
      </div>
    </FullPageSection>
  );
}
