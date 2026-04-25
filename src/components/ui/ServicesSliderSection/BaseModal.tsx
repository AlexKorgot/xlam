'use client';

import {
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { ModalPortal } from './ModalPortal';

type BaseModalProps = {
  isOpen: boolean;
  labelledBy: string;
  describedBy?: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  onAfterClose?: () => void;
  closeLabel?: string;
  animationDuration?: number;
};

const defaultAnimationDuration = 260;

export function BaseModal({
  isOpen,
  labelledBy,
  describedBy,
  children,
  footer,
  onClose,
  onPrevious,
  onNext,
  onAfterClose,
  closeLabel = 'Закрыть модальное окно',
  animationDuration = defaultAnimationDuration,
}: BaseModalProps) {
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

    closeTimerRef.current = window.setTimeout(
      () => {
        setShouldRender(false);
        closeTimerRef.current = null;
        onAfterClose?.();
      },
      prefersReducedMotion ? 0 : animationDuration,
    );

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
  }, [animationDuration, isOpen, onAfterClose]);

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

      if (event.key === 'ArrowLeft' && onPrevious) {
        event.preventDefault();
        onPrevious();
      }

      if (event.key === 'ArrowRight' && onNext) {
        event.preventDefault();
        onNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, onNext, onPrevious]);

  if (!shouldRender) {
    return null;
  }

  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <ModalPortal>
      <div
        className={[
          'fixed inset-0 z-[1000] overflow-y-auto bg-black text-white',
          'transition-opacity duration-[260ms] ease-out motion-reduce:transition-none',
          isVisible ? 'opacity-100' : 'opacity-0',
        ].join(' ')}
        data-fullpage-scroll-ignore="true"
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
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
            <button
              ref={closeButtonRef}
              type="button"
              className="absolute right-5 top-5 z-20 flex h-11 w-11 items-center justify-center border border-white/30 bg-black/50 text-[30px] leading-none text-white transition hover:border-[#63ff45] hover:text-[#63ff45] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#63ff45]"
              aria-label={closeLabel}
              onClick={onClose}
            >
              ×
            </button>

            {children}
          </div>

          {footer}
        </div>
      </div>
    </ModalPortal>
  );
}
