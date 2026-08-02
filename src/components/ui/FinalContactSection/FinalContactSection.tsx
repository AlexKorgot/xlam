'use client';

import clsx from 'clsx';
import { useState } from 'react';
import FullPageSection from '@/src/components/ui/FullPageSection';
import { useContactModal } from '@/src/components/ui/contact-modal';

const menuItems = [
  'Услуги',
  'Проекты',
  'Связаться с нами',
  'Контакты',
];

const socialItems = ['Youtube', 'Rutube', 'Вконтакте', 'Max'];

export function FinalContactSection() {
  const [activeButtonId, setActiveButtonId] = useState<string | null>(null);
  const { openContactModal } = useContactModal();

  return (
    <FullPageSection id="final-contact" fullBleed reserveHeader className="items-stretch bg-black">
      <div className="relative isolate h-full w-full overflow-hidden bg-black font-normalidad text-white">
        <div className="relative z-40 mx-auto flex h-full w-full max-w-[1740px] flex-col pb-[max(18px,env(safe-area-inset-bottom))] pt-4 max-[999px]:[@media_(orientation:landscape)]:pb-0 max-[999px]:[@media_(orientation:landscape)]:pt-1 min-[1000px]:pb-0 min-[1000px]:pt-14">
          <div className="relative z-20 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-0">
            <nav aria-label="Навигация по секциям">
              <ul className="max-w-none">
                {menuItems.map((item) => {
                  const buttonId = `menu-${item}`;
                  const isActive = activeButtonId === buttonId;

                  return (
                  <li key={item} className="cursor-pointer border-t border-white/55 last:border-b">
                    <button
                      type="button"
                      aria-disabled="true"
                      aria-pressed={isActive}
                      onPointerDown={() => setActiveButtonId(buttonId)}
                      onFocus={() => setActiveButtonId(buttonId)}
                      className={clsx(
                        'group relative flex h-[41px] w-full cursor-pointer items-center overflow-hidden px-3 text-left text-[16px] font-medium uppercase leading-none transition-colors hover:text-black focus-visible:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#66ff66] sm:h-[52px] sm:text-[20px] max-[999px]:[@media_(orientation:landscape)]:h-[30px] max-[999px]:[@media_(orientation:landscape)]:px-2 max-[999px]:[@media_(orientation:landscape)]:text-[13px] min-[1000px]:h-[69px] min-[1000px]:px-3 min-[1000px]:text-[28px]',
                        isActive ? 'text-black' : 'text-white',
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className={clsx(
                          'pointer-events-none absolute inset-y-0 left-0 right-0 bg-[linear-gradient(90deg,#66ff66_0%,#66ff66_34%,rgba(102,255,102,0.62)_58%,rgba(102,255,102,0.16)_82%,rgba(102,255,102,0)_100%)] transition-opacity duration-200 ease-out group-hover:opacity-100 group-focus-visible:opacity-100',
                          isActive ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                      <span className="pointer-events-none relative z-10 origin-left transition-transform duration-300 ease-out group-hover:scale-[1.2] group-focus-visible:scale-[1.2]">
                        {item}
                      </span>
                    </button>
                  </li>
                  );
                })}
              </ul>
            </nav>

            <div className="ml-0 w-full max-w-none">
              <ul aria-label="Социальные сети">
                {socialItems.map((item) => {
                  const buttonId = `social-${item}`;
                  const isActive = activeButtonId === buttonId;

                  return (
                  <li key={item} className="cursor-pointer border-t border-white/55 last:border-b">
                    <button
                      type="button"
                      aria-disabled="true"
                      aria-pressed={isActive}
                      onPointerDown={() => setActiveButtonId(buttonId)}
                      onFocus={() => setActiveButtonId(buttonId)}
                      className={clsx(
                        'group relative flex h-[41px] w-full cursor-pointer items-center justify-end overflow-hidden px-3 text-right text-[15px] font-medium uppercase leading-none transition-colors hover:text-black focus-visible:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#66ff66] sm:h-[52px] sm:text-[18px] max-[999px]:[@media_(orientation:landscape)]:h-[30px] max-[999px]:[@media_(orientation:landscape)]:px-2 max-[999px]:[@media_(orientation:landscape)]:text-[12px] min-[1000px]:h-[69px] min-[1000px]:text-[28px]',
                        isActive ? 'text-black' : 'text-white',
                      )}
                      aria-label={`${item}: ссылка будет добавлена позже`}
                    >
                      <span
                        aria-hidden="true"
                        className={clsx(
                          'pointer-events-none absolute inset-y-0 left-0 right-0 bg-[linear-gradient(270deg,#66ff66_0%,#66ff66_34%,rgba(102,255,102,0.62)_58%,rgba(102,255,102,0.16)_82%,rgba(102,255,102,0)_100%)] transition-opacity duration-200 ease-out group-hover:opacity-100 group-focus-visible:opacity-100',
                          isActive ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                      <span className="pointer-events-none relative z-10 origin-right transition-transform duration-300 ease-out group-hover:scale-[1.2] group-focus-visible:scale-[1.2]">
                        {item}
                      </span>
                    </button>
                  </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <div className="relative min-h-0 w-full flex-1 [container-type:size]">
            <div className="pointer-events-none absolute left-1/2 top-0 z-0 aspect-[9/16] w-[88vw] max-w-[49.5svh] [transform:translate(-50%,-41%)] max-[999px]:[@media_(orientation:portrait)]:w-[145vw] max-[999px]:[@media_(orientation:portrait)]:max-w-[64svh] max-[999px]:[@media_(orientation:landscape)]:w-[72vw] max-[999px]:[@media_(orientation:landscape)]:max-w-[78svh] min-[1000px]:aspect-video min-[1000px]:max-w-[1600px] min-[1000px]:[transform:translate(-50%,min(-27%,calc(100cqh_-_100%)))]">
              <video
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                className="absolute inset-0 z-0 block h-full w-full"
                aria-hidden="true"
              >
                <source src="/video/mobile.mp4" type="video/mp4" media="(max-width: 999px)" />
                <source src="/video/desktop.mp4" type="video/mp4" />
              </video>

              <div
                aria-hidden="true"
                className="absolute inset-0 z-10 bg-[linear-gradient(90deg,#000_0%,rgba(0,0,0,0.96)_3%,rgba(0,0,0,0.82)_8%,rgba(0,0,0,0.6)_14%,rgba(0,0,0,0.38)_21%,rgba(0,0,0,0.18)_28%,rgba(0,0,0,0)_35%,rgba(0,0,0,0)_65%,rgba(0,0,0,0.18)_72%,rgba(0,0,0,0.38)_79%,rgba(0,0,0,0.6)_86%,rgba(0,0,0,0.82)_92%,rgba(0,0,0,0.96)_97%,#000_100%)]"
              />

              <button
                type="button"
                onClick={openContactModal}
                className="pointer-events-auto absolute left-[28%] top-[43%] z-20 h-[23%] w-[52%] cursor-pointer rounded-[6px] bg-transparent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#66ff66] min-[1000px]:left-[38%] min-[1000px]:top-[27%] min-[1000px]:h-[38%] min-[1000px]:w-[26%]"
                aria-label="Открыть форму обратной связи"
              />
            </div>
          </div>
        </div>
      </div>
    </FullPageSection>
  );
}
