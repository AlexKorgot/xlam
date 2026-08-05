'use client';

import Image from 'next/image';
import { useId, type MouseEvent } from 'react';
import { GlitchBrandXIcon } from '@/src/components/ui/GlitchBrandXIcon';
import { BaseModal } from '@/src/components/ui/modal';
import modalBottomImage from '@/src/components/textSection/assets/img/modal_bottom.png';

type ContactModalNewProps = {
  isOpen: boolean;
  onClose: () => void;
};

const phoneNumber = '+7 (961) 089-39-98';
const phoneHref = 'tel:+79610893998';
const emailAddress = 'xlammedia@mail.ru';

export function ContactModalNew({ isOpen, onClose }: ContactModalNewProps) {
  const titleId = useId();
  const descriptionId = useId();

  const handleBackdropMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      labelledBy={titleId}
      describedBy={descriptionId}
      onClose={onClose}
      closeLabel="Закрыть контакты"
      showCloseButton={false}
      animationDuration={360}
      variant="center"
      backdropClassName="bg-black/45 backdrop-blur-[18px] backdrop-saturate-[0.72]"
    >
      <div
        className="flex h-full w-full items-center justify-center p-4 max-[999px]:[@media_(orientation:landscape)]:p-3 min-[1000px]:p-10"
        onMouseDown={handleBackdropMouseDown}
      >
        <section className="relative aspect-[438/460] w-[min(438px,calc(100vw-32px))] shrink-0 overflow-hidden bg-white text-black shadow-[0_30px_100px_rgba(0,0,0,0.55)] max-[999px]:[@media_(orientation:landscape)]:w-[min(438px,calc((100dvh-24px)*0.952))]">
          <Image
            src={modalBottomImage}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-auto w-full select-none"
            sizes="(max-width: 470px) calc(100vw - 32px), 438px"
          />

          <button
            type="button"
            className="absolute right-[18px] top-[18px] z-20 flex h-8 w-8 cursor-pointer items-center justify-center text-black transition hover:text-[#63ff45] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black max-[380px]:right-[12px] max-[380px]:top-[12px]"
            aria-label="Закрыть контакты"
            onClick={onClose}
          >
            <GlitchBrandXIcon fill="currentColor" />
          </button>

          <div className="relative z-10 px-[clamp(28px,9.6vw,42px)] pt-[clamp(30px,8vw,36px)]">
            <h2
              id={titleId}
              tabIndex={-1}
              className="max-w-[320px] text-[clamp(24px,6.6vw,30px)] font-black uppercase leading-[0.86] tracking-0 text-black outline-none"
            >
              Поговорим
              <br />
              о вашей идее?
            </h2>

            <p
              id={descriptionId}
              className="mt-[clamp(14px,4vw,19px)] max-w-[340px] text-[clamp(11px,3.1vw,14px)] font-medium leading-[0.94] text-black"
            >
              Напишите нам на почту или в любой мессенджер.
              <br />
              Ответим в течение дня и предложим формат
              <br />
              реализации под ваш запрос.
            </p>

            <address className="mt-[clamp(20px,5vw,26px)] flex flex-col items-start gap-[clamp(10px,2.8vw,14px)] not-italic">
              <a
                className="whitespace-nowrap text-[clamp(24px,7vw,32px)] font-medium leading-none text-black no-underline transition-colors hover:text-[#168bd2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
                href={phoneHref}
                aria-label={`Позвонить по номеру ${phoneNumber}`}
              >
                {phoneNumber}
              </a>

              <a
                className="text-[clamp(23px,6.8vw,31px)] font-medium leading-none text-black underline decoration-[1px] underline-offset-[3px] transition-colors hover:text-[#168bd2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
                href={`mailto:${emailAddress}`}
              >
                {emailAddress}
              </a>
            </address>
          </div>
        </section>
      </div>
    </BaseModal>
  );
}
