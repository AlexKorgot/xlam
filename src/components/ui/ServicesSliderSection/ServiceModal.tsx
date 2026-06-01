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
    <footer className="relative z-10 mt-5 grid h-[47px] w-full max-w-[1756px] shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-4 text-[16px] leading-[1.1]">
      <button
        type="button"
        className="flex items-center gap-4 text-left text-white transition hover:text-[#63ff45] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#63ff45]"
        aria-label="Показать предыдущую услугу"
        onClick={onPrevious}
      >
        <span className="block h-0 w-0 border-y-[10px] border-r-[12px] border-y-transparent border-r-[#63ff45] sm:border-y-[13px] sm:border-r-[15px]" />
        <span className="hidden sm:inline">{previousLabel}</span>
      </button>

      <p className="text-center text-[18px] leading-[1.1] text-[#63ff45] sm:text-[22px]">
        {currentLabel}
      </p>

      <button
        type="button"
        className="flex items-center justify-end gap-4 text-right text-white transition hover:text-[#63ff45] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#63ff45]"
        aria-label="Показать следующую услугу"
        onClick={onNext}
      >
        <span className="hidden sm:inline">{nextLabel}</span>
        <span className="block h-0 w-0 border-y-[10px] border-l-[12px] border-y-transparent border-l-[#63ff45] sm:border-y-[13px] sm:border-l-[15px]" />
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
      closeLabel="Закрыть окно услуги"
    >
      <Image
        src={content.backgroundImage}
        alt=""
        fill
        loading="eager"
        sizes="(min-width: 1024px) 1756px, 100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black/25" />
      <div className="absolute inset-x-0 bottom-0 h-[59%] bg-gradient-to-t from-black via-black/72 to-transparent" />
      <div className="absolute inset-y-0 left-0 w-[56%] bg-gradient-to-r from-black/70 to-transparent" />

      <div className="relative z-10 flex h-full min-h-0 flex-col p-5 min-[1000px]:px-6 min-[1000px]:pb-5 min-[1000px]:pt-12">
        <div className="flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto overscroll-y-contain pr-3 [scrollbar-color:#63ff45_rgba(255,255,255,0.16)] [scrollbar-width:thin] min-[1000px]:justify-between min-[1000px]:pr-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#63ff45] [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-white/10">
          <h2
            id={titleId}
            className="max-w-[834px] text-[54px] font-black uppercase leading-[0.9] text-[#63ff45] sm:text-[76px] lg:text-[90px] 2xl:text-[112px]"
          >
            {content.title}
          </h2>

          <div id={descriptionId} className="mt-5 max-w-[563px] min-[1000px]:mt-5">
            <p className="max-w-[420px] text-[18px] font-bold uppercase leading-[1.02] text-white sm:text-[22px] lg:text-[21px] 2xl:text-[23px]">
              {content.subtitle}
            </p>
            <p className="mt-3 max-w-[455px] text-[16px] leading-[1.08] text-white sm:text-[19px] lg:text-[18px] 2xl:text-[20px]">
              {content.description}
            </p>
          </div>

          <div className="grid min-w-0 gap-6 pb-1 pt-6 min-[1000px]:grid-cols-[330px_minmax(0,1fr)] min-[1000px]:items-end min-[1000px]:gap-[82px] min-[1000px]:pt-8">
            <div className="max-w-[330px]">
              <p className="text-center text-[22px] font-medium uppercase leading-[1.1] text-[#dedcd3] sm:text-[27px] lg:text-[26px] 2xl:text-[30px]">
                {content.ctaIntro}
              </p>
              <button
                type="button"
                className="mt-3 flex min-h-[50px] w-full items-center justify-center border border-white/65 bg-white/10 px-4 text-center text-[22px] font-bold uppercase leading-none text-white shadow-[inset_0_0_38px_rgba(255,255,255,0.08)] transition hover:border-[#63ff45] hover:bg-white/15 hover:text-[#63ff45] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:min-h-[58px] sm:text-[24px] lg:min-h-[56px] lg:whitespace-nowrap lg:text-[22px] 2xl:min-h-[64px] 2xl:text-[26px]"
              >
                {content.ctaLabel}
              </button>
            </div>

            <div className="grid min-h-0 min-w-0 grid-cols-2 gap-x-6 gap-y-6 min-[1172px]:grid-cols-4 lg:gap-x-[30px]">
              {content.features.map((feature) => (
                <div key={feature.title} className="max-w-none pr-2 min-[1000px]:max-w-[210px] min-[1000px]:pr-0">
                  <h3 className="text-[18px] font-bold uppercase leading-none text-[#63ff45] lg:text-[16px] 2xl:text-[19px]">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-[15px] leading-[1.04] text-white lg:text-[14px] 2xl:text-[16px]">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </BaseModal>
  );
}
