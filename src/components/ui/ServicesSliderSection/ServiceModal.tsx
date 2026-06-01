'use client';

import Image, { type StaticImageData } from 'next/image';
import { useId, type ReactNode } from 'react';
import { BaseModal } from '@/src/components/ui/modal';

export type ServiceModalFeature = {
  title: string;
  description: string;
};

export type ServiceModalContent = {
  title: string;
  subtitle: string;
  description: string;
  ctaIntro: string;
  ctaLabel: string;
  backgroundImage: StaticImageData;
  features: ServiceModalFeature[];
};

type ServiceModalProps = {
  isOpen: boolean;
  content: ServiceModalContent;
  previousLabel: string;
  currentLabel: string;
  nextLabel: string;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onAfterClose?: () => void;
};

export function ServiceModal({
  isOpen,
  content,
  previousLabel,
  currentLabel,
  nextLabel,
  onClose,
  onPrevious,
  onNext,
  onAfterClose,
}: ServiceModalProps) {
  const titleId = useId();
  const descriptionId = useId();

  const footer: ReactNode = (
    <footer className="relative z-10 grid min-h-16 w-full shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-3 border-t border-white/10 px-5 py-3 text-[11px] font-medium leading-none sm:px-7 sm:text-sm lg:px-9">
      <button
        type="button"
        className="flex h-12 min-w-0 items-center gap-3 text-left text-white transition hover:text-[#63ff45] focus-visible:text-[#63ff45] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#63ff45]"
        aria-label="Show previous service"
        onClick={onPrevious}
      >
        <span className="text-4xl leading-none text-[#63ff45]">‹</span>
        <span className="hidden min-w-0 truncate sm:inline">{previousLabel}</span>
      </button>

      <p className="min-w-0 truncate text-center text-[14px] leading-none text-[#63ff45] sm:text-[22px]">
        {currentLabel}
      </p>

      <button
        type="button"
        className="flex h-12 min-w-0 items-center justify-end gap-3 text-right text-white transition hover:text-[#63ff45] focus-visible:text-[#63ff45] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#63ff45]"
        aria-label="Show next service"
        onClick={onNext}
      >
        <span className="hidden min-w-0 truncate sm:inline">{nextLabel}</span>
        <span className="text-4xl leading-none text-[#63ff45]">›</span>
      </button>
    </footer>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      labelledBy={titleId}
      describedBy={descriptionId}
      footer={footer}
      onClose={onClose}
      onPrevious={onPrevious}
      onNext={onNext}
      onAfterClose={onAfterClose}
      closeLabel="Close service modal"
      closeText="Закрыть"
      animationDuration={620}
      variant="sheet"
    >
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <Image
          src={content.backgroundImage}
          alt=""
          fill
          loading="eager"
          sizes="(min-width: 1024px) 1540px, 100vw"
          className="object-cover"
        />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-black/38" />
      <div className="pointer-events-none absolute inset-y-0 left-0 w-full bg-gradient-to-r from-black/88 via-black/54 to-black/24 lg:w-[72%]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/88 via-black/44 to-transparent" />

      <div className="relative z-10 flex h-full min-h-0 flex-col overflow-y-auto overscroll-contain px-5 pb-5 pt-4 [scrollbar-color:#63ff45_rgba(255,255,255,0.16)] [scrollbar-width:thin] sm:px-7 lg:overflow-hidden lg:px-10 lg:pb-9 lg:pt-10 xl:px-12">
        <div className="mx-auto mb-5 h-1 w-14 shrink-0 rounded-full bg-white/28 lg:hidden" aria-hidden="true" />

        <header className="max-w-[38rem] pr-20 sm:pr-24 lg:max-w-[45rem] lg:pr-0">
          <h2
            id={titleId}
            tabIndex={-1}
            className="max-w-[8ch] text-[3.25rem] font-black uppercase leading-[0.86] text-[#63ff45] outline-none sm:text-[4.75rem] lg:text-[clamp(5.25rem,7.8vw,9.25rem)]"
          >
            {content.title}
          </h2>

          <div id={descriptionId} className="mt-6 max-w-[29rem] lg:mt-7">
            <p className="text-[15px] font-black uppercase leading-[1.03] text-white sm:text-[18px] lg:text-[20px]">
              {content.subtitle}
            </p>
            <p className="mt-3 max-w-[27rem] text-[14px] leading-[1.08] text-white sm:text-[16px] lg:text-[17px]">
              {content.description}
            </p>
          </div>
        </header>

        <div className="mt-auto grid min-h-0 gap-7 pt-10 lg:grid-cols-[24rem_minmax(0,1fr)] lg:items-end lg:gap-12 lg:pt-8 xl:grid-cols-[28rem_minmax(0,1fr)]">
          <div className="max-w-[24rem] xl:max-w-[27rem]">
              <p className="text-center text-[20px] font-medium uppercase leading-[1.08] text-[#dedcd3] sm:text-[25px] lg:text-[28px]">
                {content.ctaIntro}
              </p>
              <button
                type="button"
                className="mt-3 flex min-h-[52px] w-full items-center justify-center border border-white/68 bg-white/10 px-4 text-center text-[20px] font-bold uppercase leading-none text-white shadow-[inset_0_0_38px_rgba(255,255,255,0.08)] backdrop-blur-[1px] transition hover:border-[#63ff45] hover:bg-white/15 hover:text-[#63ff45] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:min-h-[58px] sm:text-[23px] lg:min-h-[58px] lg:whitespace-nowrap lg:text-[23px]"
              >
                {content.ctaLabel}
              </button>
            </div>

            <div className="grid min-w-0 grid-cols-2 gap-x-5 gap-y-5 sm:grid-cols-4 lg:gap-x-8">
              {content.features.map((feature) => (
                <div
                  key={feature.title}
                  className="min-w-0"
                >
                  <h3 className="text-[14px] font-black uppercase leading-none text-[#63ff45] sm:text-[15px] lg:text-[17px]">
                    {feature.title}
                  </h3>
                  <p className="mt-1.5 text-[12px] leading-[1.04] text-white sm:text-[13px] lg:text-[14px]">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
        </div>
      </div>
    </BaseModal>
  );
}
