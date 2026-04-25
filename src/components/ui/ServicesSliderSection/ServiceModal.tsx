'use client';

import Image, { type StaticImageData } from 'next/image';
import {
  useEffect,
  useId,
  useRef,
  useState,
  type MouseEvent,
} from 'react';
import { createPortal } from 'react-dom';

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

const modalAnimationDuration = 260;

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
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const closeTimerRef = useRef<number | null>(null);
  const visibilityFrameRef = useRef<number | null>(null);
  const [shouldRender, setShouldRender] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    if (visibilityFrameRef.current) {
      window.cancelAnimationFrame(visibilityFrameRef.current);
      visibilityFrameRef.current = null;
    }

    if (isOpen) {
      visibilityFrameRef.current = window.requestAnimationFrame(() => {
        setIsVisible(true);
        visibilityFrameRef.current = null;
      });
      return () => {
        if (visibilityFrameRef.current) {
          window.cancelAnimationFrame(visibilityFrameRef.current);
          visibilityFrameRef.current = null;
        }
      };
    }

    visibilityFrameRef.current = window.requestAnimationFrame(() => {
      setIsVisible(false);
      visibilityFrameRef.current = null;
    });

    closeTimerRef.current = window.setTimeout(() => {
      setShouldRender(false);
      closeTimerRef.current = null;
      onAfterClose?.();
    }, prefersReducedMotion ? 0 : modalAnimationDuration);

    return () => {
      if (visibilityFrameRef.current) {
        window.cancelAnimationFrame(visibilityFrameRef.current);
        visibilityFrameRef.current = null;
      }

      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
    };
  }, [isOpen, onAfterClose]);

  useEffect(() => {
    if (!shouldRender) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [shouldRender]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const focusFrame = window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });

    return () => {
      window.cancelAnimationFrame(focusFrame);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        onPrevious();
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        onNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, onNext, onPrevious]);

  if (!shouldRender || typeof document === 'undefined') {
    return null;
  }

  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return createPortal(
    <div
      className={[
        'fixed inset-0 z-[1000] overflow-y-auto bg-black text-white',
        'transition-opacity duration-[260ms] ease-out motion-reduce:transition-none',
        isVisible ? 'opacity-100' : 'opacity-0',
      ].join(' ')}
      data-fullpage-scroll-ignore="true"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onMouseDown={handleBackdropClick}
    >
      <div
        className={[
          'relative mx-auto flex min-h-[100svh] w-full max-w-[1920px] flex-col px-5 pb-6 pt-20 sm:px-8 sm:pt-24 lg:px-[66px] lg:py-[46px]',
          'transition-[opacity,transform] duration-[260ms] ease-out motion-reduce:transition-none',
          isVisible
            ? 'translate-y-0 scale-100 opacity-100'
            : 'translate-y-4 scale-[0.985] opacity-0',
        ].join(' ')}
      >
        <div className="relative flex h-[calc(100svh-128px)] min-h-[620px] w-full max-w-[1756px] flex-col overflow-hidden lg:h-[min(829px,calc(100svh-251px))]">
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

          <button
            ref={closeButtonRef}
            type="button"
            className="absolute right-5 top-5 z-20 flex h-11 w-11 items-center justify-center border border-white/30 bg-black/50 text-[30px] leading-none text-white transition hover:border-[#63ff45] hover:text-[#63ff45] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#63ff45]"
            aria-label="Закрыть окно услуги"
            onClick={onClose}
          >
            ×
          </button>

          <div className="relative z-10 flex h-full min-h-0 flex-col px-6 pb-8 pt-16 sm:px-8 sm:pt-20 lg:px-[50px] lg:pb-[95px] lg:pt-[103px]">
            <div className="min-h-0 flex-1 overflow-y-auto pr-1 lg:overflow-visible lg:pr-0">
              <h2
                id={titleId}
                className="max-w-[834px] text-[54px] font-black uppercase leading-[0.99] text-[#63ff45] sm:text-[76px] lg:text-[120px]"
              >
                {content.title}
              </h2>

              <div className="mt-8 max-w-[563px] lg:mt-[41px]">
                <p className="text-[18px] font-bold uppercase leading-[1.1] text-white sm:text-[22px] lg:text-[24px]">
                  {content.subtitle}
                </p>
                <p className="mt-4 text-[17px] leading-[1.1] text-white sm:text-[20px] lg:mt-[14px] lg:text-[22px]">
                  {content.description}
                </p>
              </div>
            </div>

            <div className="grid shrink-0 gap-8 pt-8 lg:grid-cols-[565px_1fr] lg:items-end lg:gap-[102px] lg:pt-0">
              <div>
                <p className="text-center text-[24px] font-medium uppercase leading-[1.21] text-[#dedcd3] sm:text-[28px] lg:text-[32px]">
                  {content.ctaIntro}
                </p>
                <button
                  type="button"
                  className="mt-[7px] flex min-h-[66px] w-full items-center justify-center bg-[#49f041] px-8 text-center text-[24px] font-medium uppercase leading-[1.21] text-[#1b1b1b] transition hover:bg-[#63ff45] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:min-h-[74px] sm:text-[28px] lg:min-h-[82px] lg:text-[32px]"
                >
                  {content.ctaLabel}
                </button>
              </div>

              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4 xl:gap-[30px]">
                {content.features.map((feature) => (
                  <div key={feature.title} className="max-w-[210px]">
                    <h3 className="text-[20px] font-bold uppercase leading-none text-[#63ff45]">
                      {feature.title}
                    </h3>
                    <p className="mt-[11px] text-[18px] leading-none text-white">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

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
      </div>
    </div>,
    document.body,
  );
}
