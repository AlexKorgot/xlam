'use client';

import clsx from 'clsx';
import Image from 'next/image';
import { useState } from 'react';
import teleImage from '@/src/lib/assets/tele.png';
import FullPageSection from '@/src/components/ui/FullPageSection';

const menuItems = [
  'Услуги',
  'Проекты',
  'Связаться с нами',
  'Контакты',
];

const socialItems = ['Youtube', 'Rutube', 'Вконтакте', 'Max'];

export function FinalContactSection() {
  const [activeButtonId, setActiveButtonId] = useState<string | null>(null);

  return (
    <FullPageSection id="final-contact" fullBleed reserveHeader className="items-stretch bg-black">
      <div className="relative isolate h-full w-full overflow-hidden bg-black font-normalidad text-white">
        <Image
          src={teleImage}
          alt=""
          loading="eager"
          unoptimized
          sizes="(max-width: 639px) 178vw, (max-width: 899px) 142vw, 114vw"
          className="pointer-events-none absolute bottom-[-2.5svh] left-1/2 z-50 h-auto w-[178vw] max-w-none -translate-x-[49%] select-none object-contain sm:bottom-[-5svh] sm:w-[142vw] min-[1000px]:bottom-0 min-[1000px]:h-full min-[1000px]:w-auto min-[1000px]:min-w-[114.6vw]"
          aria-hidden="true"
        />

        <div className="relative z-40 mx-auto flex h-full w-full max-w-[1740px] flex-col px-[18px] pb-[max(18px,env(safe-area-inset-bottom))] pt-4 sm:px-5 min-[1000px]:px-[18px] min-[1000px]:pb-0 min-[1000px]:pt-14 xl:px-[50px] min-[1830px]:px-0">
          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-0 min-[1000px]:grid-cols-[minmax(0,1048px)_minmax(280px,1fr)]">
            <nav aria-label="Навигация по секциям">
              <ul className="max-w-none">
                {menuItems.map((item) => {
                  const buttonId = `menu-${item}`;
                  const isActive = activeButtonId === buttonId;

                  return (
                  <li key={item} className="border-t border-white/55 last:border-b">
                    <button
                      type="button"
                      aria-disabled="true"
                      aria-pressed={isActive}
                      onPointerDown={() => setActiveButtonId(buttonId)}
                      onFocus={() => setActiveButtonId(buttonId)}
                      className={clsx(
                        'group relative flex h-[41px] w-full items-center overflow-hidden px-3 text-left text-[16px] font-medium uppercase leading-none transition-colors hover:text-black focus-visible:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#66ff66] sm:h-[52px] sm:text-[20px] min-[1000px]:h-[69px] min-[1000px]:px-3 min-[1000px]:text-[28px]',
                        isActive ? 'text-black' : 'text-white',
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className={clsx(
                          'pointer-events-none absolute inset-y-0 left-0 right-0 bg-[linear-gradient(90deg,#66ff66_0%,#66ff66_73.6%,#000_96.6%)] transition-opacity duration-200 ease-out group-hover:opacity-100 group-focus-visible:opacity-100',
                          isActive ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                      <span className="pointer-events-none relative z-10">{item}</span>
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
                  <li key={item} className="border-t border-white/55 last:border-b">
                    <button
                      type="button"
                      aria-disabled="true"
                      aria-pressed={isActive}
                      onPointerDown={() => setActiveButtonId(buttonId)}
                      onFocus={() => setActiveButtonId(buttonId)}
                      className={clsx(
                        'group relative flex h-[41px] w-full items-center justify-end overflow-hidden px-3 text-right text-[15px] font-medium uppercase leading-none transition-colors hover:text-black focus-visible:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#66ff66] sm:h-[52px] sm:text-[18px] min-[1000px]:h-[69px] min-[1000px]:text-[28px]',
                        isActive ? 'text-black' : 'text-white',
                      )}
                      aria-label={`${item}: ссылка будет добавлена позже`}
                    >
                      <span
                        aria-hidden="true"
                        className={clsx(
                          'pointer-events-none absolute inset-y-0 left-0 right-0 bg-[linear-gradient(270deg,#66ff66_0%,#66ff66_73.6%,#000_96.6%)] transition-opacity duration-200 ease-out group-hover:opacity-100 group-focus-visible:opacity-100',
                          isActive ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                      <span className="pointer-events-none relative z-10">{item}</span>
                    </button>
                  </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <button
            type="button"
            aria-disabled="true"
            className="absolute left-1/2 top-[42svh] z-30 h-[8svh] w-[36vw] max-w-[360px] -translate-x-1/2 -rotate-[-2deg] rounded-[6px] opacity-0 focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#66ff66] sm:top-[39svh] sm:h-[7svh] sm:w-[27vw] min-[1000px]:top-[38.2%] min-[1000px]:h-[7.2%] min-[1000px]:w-[18.2%]"
            aria-label="Оставить заявку"
          />
        </div>
      </div>
    </FullPageSection>
  );
}
