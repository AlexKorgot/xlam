'use client';

import Image, { type StaticImageData } from 'next/image';
import { useCallback, useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
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
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0);
  const contentSwitchTimeoutRef = useRef<number | null>(null);
  const contentSwitchFrameRef = useRef<number | null>(null);
  const featureListRef = useRef<HTMLDivElement | null>(null);
  const featureScrollStopTimeoutRef = useRef<number | null>(null);
  const isFeatureSnapScrollingRef = useRef(false);

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

  const clearFeatureScrollTimeout = () => {
    if (featureScrollStopTimeoutRef.current === null) {
      return;
    }

    window.clearTimeout(featureScrollStopTimeoutRef.current);
    featureScrollStopTimeoutRef.current = null;
  };

  const isMobileFeaturePickerViewport = () =>
    typeof window !== 'undefined' && window.matchMedia('(max-width: 999.98px)').matches;

  const scrollFeatureToListCenter = (row: HTMLElement, behavior: ScrollBehavior) => {
    const list = featureListRef.current;

    if (!list) {
      return;
    }

    const targetScrollTop = row.offsetTop - (list.clientHeight - row.offsetHeight) / 2;

    list.scrollTo({
      top: Math.max(0, targetScrollTop),
      behavior,
    });
  };

  const selectCenteredFeature = useCallback((snapToFeature = true) => {
    const list = featureListRef.current;

    if (!list || !isMobileFeaturePickerViewport()) {
      return;
    }

    const listRect = list.getBoundingClientRect();
    const listCenterY = listRect.top + listRect.height / 2;
    const rows = Array.from(list.querySelectorAll<HTMLElement>('[data-service-feature-index]'));
    let closestRow: HTMLElement | null = null;
    let closestDistance = Number.POSITIVE_INFINITY;

    for (const row of rows) {
      const rowRect = row.getBoundingClientRect();
      const rowCenterY = rowRect.top + rowRect.height / 2;
      const distance = Math.abs(rowCenterY - listCenterY);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestRow = row;
      }
    }

    const nextIndex = Number(closestRow?.dataset.serviceFeatureIndex);

    if (!Number.isFinite(nextIndex)) {
      return;
    }

    if (snapToFeature && closestRow) {
      isFeatureSnapScrollingRef.current = true;
      scrollFeatureToListCenter(closestRow, 'smooth');

      window.setTimeout(() => {
        isFeatureSnapScrollingRef.current = false;
      }, 260);
    }

    setActiveFeatureIndex(nextIndex);
  }, []);

  const scheduleCenteredFeatureSelection = useCallback(
    (delay = 150) => {
      clearFeatureScrollTimeout();

      featureScrollStopTimeoutRef.current = window.setTimeout(() => {
        featureScrollStopTimeoutRef.current = null;
        selectCenteredFeature();
      }, delay);
    },
    [selectCenteredFeature],
  );

  const centerFeature = useCallback((index: number, behavior: ScrollBehavior = 'smooth') => {
    if (!isMobileFeaturePickerViewport()) {
      setActiveFeatureIndex(index);
      return;
    }

    const row = featureListRef.current?.querySelector<HTMLElement>(
      `[data-service-feature-index="${index}"]`,
    );

    if (!row) {
      setActiveFeatureIndex(index);
      return;
    }

    isFeatureSnapScrollingRef.current = true;
    scrollFeatureToListCenter(row, behavior);
    setActiveFeatureIndex(index);

    window.setTimeout(() => {
      isFeatureSnapScrollingRef.current = false;
    }, 260);
  }, []);

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
      clearFeatureScrollTimeout();
    },
    [],
  );

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const centerInitialFeature = window.setTimeout(() => {
      centerFeature(0, 'auto');
    }, 0);

    return () => {
      window.clearTimeout(centerInitialFeature);
      clearFeatureScrollTimeout();
    };
  }, [centerFeature, displayedState.content, isOpen]);

  const handleFeatureListScroll = () => {
    if (!isMobileFeaturePickerViewport() || isFeatureSnapScrollingRef.current) {
      return;
    }

    scheduleCenteredFeatureSelection();
  };

  const contentTransitionClass = [
    'transition-opacity duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none',
    isContentVisible ? 'opacity-100' : 'opacity-0',
  ].join(' ');
  const backgroundTransitionClass = [
    'pointer-events-none absolute inset-0 transition-opacity duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none',
    isContentVisible ? 'opacity-100' : 'opacity-0',
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
          unoptimized
          sizes="(min-width: 1024px) 1540px, 100vw"
          className="object-cover"
        />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-black/10 lg:bg-black/30" />
      <div className="pointer-events-none absolute inset-y-0 left-0 w-full bg-gradient-to-r from-black/10 via-black/[0.06] to-transparent lg:hidden" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[56%] bg-gradient-to-t from-black/10 via-black/[0.06] to-transparent lg:hidden" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/10 to-transparent lg:hidden" />

      <div className={`relative z-10 flex h-full min-h-0 flex-col overflow-y-auto overscroll-contain px-5 pb-6 pt-4 [scrollbar-color:#63ff45_rgba(255,255,255,0.16)] [scrollbar-width:thin] sm:px-8 lg:justify-end lg:overflow-hidden lg:px-12 lg:pb-10 lg:pt-12 xl:px-[54px] ${contentTransitionClass}`}>
        <div className="mx-auto mb-5 h-1 w-14 shrink-0 rounded-full bg-white/28 min-[1000px]:hidden" aria-hidden="true" />

        <header className="mr-auto mt-auto max-w-[40rem] pr-0 text-left min-[1000px]:mt-0 lg:max-w-[58rem] lg:pr-0">
          <h2
            id={titleId}
            tabIndex={-1}
            className="max-w-[11ch] text-[3.35rem] font-black uppercase leading-[0.84] text-[#63ff45] outline-none sm:text-[4.9rem] lg:max-w-[12ch] lg:text-[clamp(5.75rem,7.45vw,9rem)]"
          >
            {displayedState.content.title}
          </h2>

          <div id={descriptionId} className="mt-7 hidden max-w-[31rem] min-[1000px]:block lg:mt-12">
            <p className="text-[15px] font-black uppercase leading-[1.03] text-white sm:text-[18px] lg:text-[20px]">
              {displayedState.content.subtitle}
            </p>
            <p className="mt-3 max-w-[29rem] text-[14px] leading-[1.08] text-white sm:text-[16px] lg:text-[17px]">
              {displayedState.content.description}
            </p>
          </div>
        </header>

        <div className="mt-4 grid min-h-0 gap-4 pt-0 min-[1000px]:mt-0 min-[1000px]:grid-cols-[390px_minmax(0,1fr)] min-[1000px]:items-start min-[1000px]:gap-14 min-[1000px]:pt-8 xl:grid-cols-[430px_minmax(0,1fr)] xl:gap-16">
          <div className="order-2 mr-auto w-full max-w-[29rem] min-[1000px]:order-1 min-[1000px]:mx-0 xl:max-w-[31rem]">
            <p className="whitespace-nowrap text-center text-[18px] font-black uppercase leading-[1.08] text-[#dedcd3] sm:text-[22px] lg:text-[24px]">
              {displayedState.content.ctaIntro}
            </p>
            <button
              type="button"
              className="mt-2 flex min-h-[52px] w-full cursor-pointer items-center justify-center border border-white/68 bg-white/10 px-4 text-center text-[20px] font-bold uppercase leading-none text-white shadow-[inset_0_0_38px_rgba(255,255,255,0.08)] backdrop-blur-[1px] transition hover:border-[#63ff45] hover:bg-white/15 hover:text-[#63ff45] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:min-h-[58px] sm:text-[23px] lg:mt-3 lg:min-h-[58px] lg:whitespace-nowrap lg:text-[23px]"
              onClick={openContactModal}
            >
              <span className="cursor-pointer">
                <GlitchText size="23">{displayedState.content.ctaLabel}</GlitchText>
              </span>
            </button>
          </div>

          <div className="order-1 relative min-w-0 min-[1000px]:order-2">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-0 right-1 top-1/2 z-10 h-[64px] -translate-y-1/2 bg-[#63ff45]/[0.08] shadow-[0_0_34px_rgba(99,255,69,0.14)] min-[1000px]:hidden"
            />
            <div
              ref={featureListRef}
              className="relative z-20 h-[188px] touch-pan-y snap-y snap-mandatory overflow-y-auto overscroll-contain py-[62px] pr-1 text-left [mask-image:linear-gradient(to_bottom,transparent_0%,#000_16%,#000_50%,#000_84%,transparent_100%)] [scrollbar-width:none] min-[1000px]:grid min-[1000px]:h-auto min-[1000px]:snap-none min-[1000px]:grid-cols-[repeat(4,minmax(0,1fr))] min-[1000px]:items-start min-[1000px]:gap-x-8 min-[1000px]:overflow-visible min-[1000px]:py-0 min-[1000px]:pr-0 min-[1000px]:[mask-image:none] xl:gap-x-11 [&::-webkit-scrollbar]:hidden"
              onScroll={handleFeatureListScroll}
            >
              {displayedState.content.features.map((feature, index) => {
                const isActive = index === activeFeatureIndex;

                return (
                  <button
                    key={feature.title}
                    type="button"
                    data-service-feature-index={index}
                    aria-pressed={isActive}
                    className={[
                      'group relative block min-h-[64px] w-full cursor-pointer snap-center overflow-hidden text-left uppercase transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#63ff45] min-[1000px]:min-h-0 min-[1000px]:cursor-default min-[1000px]:snap-none min-[1000px]:overflow-visible min-[1000px]:normal-case',
                      isActive ? 'text-black' : 'text-white',
                    ].join(' ')}
                    onClick={() => {
                      if (isMobileFeaturePickerViewport()) {
                        centerFeature(index);
                      }
                    }}
                  >
                    <span
                      aria-hidden="true"
                      className={[
                        'absolute inset-y-0 left-0 right-0 bg-[linear-gradient(90deg,#63ff45_0%,#63ff45_73%,#000_97%)] transition-opacity duration-200 min-[1000px]:hidden',
                        isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
                      ].join(' ')}
                    />
                    <span className="relative flex min-h-[64px] w-full min-w-0 flex-col justify-center px-2 py-2 min-[1000px]:block min-[1000px]:min-h-0 min-[1000px]:p-0">
                      <span
                        className={[
                          'block text-[14px] font-black uppercase leading-none transition-colors sm:text-[15px] lg:text-[17px]',
                          isActive
                            ? 'text-black min-[1000px]:text-[#63ff45]'
                            : 'text-[#63ff45]',
                        ].join(' ')}
                      >
                        {feature.title}
                      </span>
                      <span
                        className={[
                          'mt-1.5 block text-[12px] leading-[1.04] transition-colors sm:text-[13px] min-[1000px]:leading-[1.12] lg:text-[14px]',
                          isActive
                            ? 'text-black min-[1000px]:text-white'
                            : 'text-white',
                        ].join(' ')}
                      >
                        {feature.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </BaseModal>
  );
}
