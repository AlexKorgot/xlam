'use client';

import Image, { type StaticImageData } from 'next/image';
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { GlitchBrandXIcon } from '@/src/components/ui/GlitchBrandXIcon';
import GlitchText from '@/src/components/ui/GlitchText/GlitchText';
import { BaseModal } from '@/src/components/ui/modal';
import { useContactModal } from '@/src/components/ui/contact-modal';

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

type DisplayedModalState = {
  content: ServiceModalContent;
  previousLabel: string;
  currentLabel: string;
  nextLabel: string;
};

const contentSwitchExitDuration = 180;

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
  const { openContactModal } = useContactModal();
  const titleId = useId();
  const descriptionId = useId();
  const nextDisplayedState = useMemo<DisplayedModalState>(
    () => ({
      content,
      previousLabel,
      currentLabel,
      nextLabel,
    }),
    [content, currentLabel, nextLabel, previousLabel],
  );
  const [displayedState, setDisplayedState] =
    useState<DisplayedModalState>(nextDisplayedState);
  const displayedStateRef = useRef(nextDisplayedState);
  const [isContentVisible, setIsContentVisible] = useState(true);
  const contentSwitchTimeoutRef = useRef<number | null>(null);
  const contentSwitchFrameRef = useRef<number | null>(null);

  const clearContentSwitchTimers = () => {
    if (contentSwitchTimeoutRef.current !== null) {
      window.clearTimeout(contentSwitchTimeoutRef.current);
      contentSwitchTimeoutRef.current = null;
    }

    if (contentSwitchFrameRef.current !== null) {
      window.cancelAnimationFrame(contentSwitchFrameRef.current);
      contentSwitchFrameRef.current = null;
    }
  };

  useEffect(() => {
    if (!isOpen) {
      clearContentSwitchTimers();
      return;
    }

    if (displayedStateRef.current.content === content) {
      return;
    }

    clearContentSwitchTimers();

    contentSwitchFrameRef.current = window.requestAnimationFrame(() => {
      contentSwitchFrameRef.current = null;
      setIsContentVisible(false);

      contentSwitchTimeoutRef.current = window.setTimeout(() => {
        displayedStateRef.current = nextDisplayedState;
        setDisplayedState(nextDisplayedState);

        contentSwitchFrameRef.current = window.requestAnimationFrame(() => {
          contentSwitchFrameRef.current = null;
          setIsContentVisible(true);
        });

        contentSwitchTimeoutRef.current = null;
      }, contentSwitchExitDuration);
    });
  }, [content, isOpen, nextDisplayedState]);

  useEffect(
    () => () => {
      clearContentSwitchTimers();
    },
    [],
  );

  const contentTransitionClass = [
    'transition-opacity duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none',
    isContentVisible ? 'opacity-100' : 'opacity-0',
  ].join(' ');
  const backgroundTransitionClass = [
    'pointer-events-none absolute inset-0 transition-opacity duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none',
    isContentVisible ? 'opacity-[0.82] lg:opacity-100' : 'opacity-0',
  ].join(' ');

  const footer: ReactNode = (
    <footer className="relative z-10 grid h-[64px] w-full shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-3 border-t border-white/[0.12] bg-black/[0.42] px-5 text-[11px] font-medium leading-none backdrop-blur-sm sm:px-7 sm:text-sm lg:h-[72px] lg:px-10">
      <button
        type="button"
        className="flex h-12 min-w-0 cursor-pointer items-center gap-3 text-left uppercase text-white transition hover:text-[#63ff45] focus-visible:text-[#63ff45] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#63ff45]"
        aria-label="Show previous service"
        onClick={onPrevious}
      >
        <span className="cursor-pointer text-4xl leading-none text-[#63ff45]" aria-hidden="true">
          <GlitchText size="36">‹</GlitchText>
        </span>
        <span className="hidden min-w-0 cursor-pointer truncate sm:inline">
          <GlitchText size="14">{displayedState.previousLabel}</GlitchText>
        </span>
      </button>

      <div className="min-w-0 cursor-pointer truncate text-center text-[14px] font-black uppercase leading-none text-[#63ff45] sm:text-[22px] lg:text-[28px]">
        <GlitchText size="28">{displayedState.currentLabel}</GlitchText>
      </div>

      <button
        type="button"
        className="flex h-12 min-w-0 cursor-pointer items-center justify-end gap-3 text-right uppercase text-white transition hover:text-[#63ff45] focus-visible:text-[#63ff45] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#63ff45]"
        aria-label="Show next service"
        onClick={onNext}
      >
        <span className="hidden min-w-0 cursor-pointer truncate sm:inline">
          <GlitchText size="14">{displayedState.nextLabel}</GlitchText>
        </span>
        <span className="cursor-pointer text-4xl leading-none text-[#63ff45]" aria-hidden="true">
          <GlitchText size="36">›</GlitchText>
        </span>
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
      closeText={<GlitchBrandXIcon className="cursor-pointer" fill="white" />}
      showCloseButtonBorder={false}
      animationDuration={620}
      variant="sheet"
    >
      <div className={backgroundTransitionClass}>
        <Image
          src={displayedState.content.backgroundImage}
          alt=""
          fill
          loading="eager"
          sizes="(min-width: 1024px) 1540px, 100vw"
          className="object-cover"
        />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-black/28 lg:bg-black/30" />
      <div className="pointer-events-none absolute inset-y-0 left-0 w-full bg-gradient-to-r from-black/90 via-black/50 to-black/[0.12] lg:hidden" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[72%] bg-gradient-to-t from-black/[0.92] via-black/[0.46] to-transparent lg:hidden" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/[0.46] to-transparent lg:hidden" />

      <div className={`relative z-10 flex h-full min-h-0 flex-col overflow-y-auto overscroll-contain px-5 pb-6 pt-4 [scrollbar-color:#63ff45_rgba(255,255,255,0.16)] [scrollbar-width:thin] sm:px-8 lg:overflow-hidden lg:px-12 lg:pb-10 lg:pt-12 xl:px-[54px] ${contentTransitionClass}`}>
        <div className="mx-auto mb-5 h-1 w-14 shrink-0 rounded-full bg-white/28 lg:hidden" aria-hidden="true" />

        <header className="max-w-[40rem] pr-20 sm:pr-24 lg:max-w-[58rem] lg:pr-0">
          <h2
            id={titleId}
            tabIndex={-1}
            className="max-w-[11ch] text-[3.35rem] font-black uppercase leading-[0.84] text-[#63ff45] outline-none sm:text-[4.9rem] lg:max-w-[12ch] lg:text-[clamp(5.75rem,7.45vw,9rem)]"
          >
            {displayedState.content.title}
          </h2>

          <div id={descriptionId} className="mt-7 max-w-[31rem] lg:mt-12">
            <p className="text-[15px] font-black uppercase leading-[1.03] text-white sm:text-[18px] lg:text-[20px]">
              {displayedState.content.subtitle}
            </p>
            <p className="mt-3 max-w-[29rem] text-[14px] leading-[1.08] text-white sm:text-[16px] lg:text-[17px]">
              {displayedState.content.description}
            </p>
          </div>
        </header>

        <div className="mt-auto grid min-h-0 gap-8 pt-4 lg:grid-cols-[390px_minmax(0,1fr)] lg:items-end lg:gap-14 lg:pt-8 xl:grid-cols-[430px_minmax(0,1fr)] xl:gap-16">
          <div className="max-w-[29rem] xl:max-w-[31rem]">
            <p className="text-center text-[20px] font-black uppercase leading-[1.08] text-[#dedcd3] sm:text-[25px] lg:text-[28px]">
              {displayedState.content.ctaIntro}
            </p>
            <button
              type="button"
              className="mt-3 flex min-h-[52px] w-full cursor-pointer items-center justify-center border border-white/68 bg-white/10 px-4 text-center text-[20px] font-bold uppercase leading-none text-white shadow-[inset_0_0_38px_rgba(255,255,255,0.08)] backdrop-blur-[1px] transition hover:border-[#63ff45] hover:bg-white/15 hover:text-[#63ff45] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:min-h-[58px] sm:text-[23px] lg:min-h-[58px] lg:whitespace-nowrap lg:text-[23px]"
              onClick={openContactModal}
            >
              <span className="cursor-pointer">
                <GlitchText size="23">{displayedState.content.ctaLabel}</GlitchText>
              </span>
            </button>
          </div>

          <div className="grid min-w-0 grid-cols-2 gap-x-5 gap-y-5 sm:grid-cols-4 lg:gap-x-8 xl:gap-x-11">
            {displayedState.content.features.map((feature) => (
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
