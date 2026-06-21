'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
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
  closeText?: ReactNode;
  showCloseButton?: boolean;
  animationDuration?: number;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  variant?: 'center' | 'sheet';
  backdropClassName?: string;
};

const defaultAnimationDuration = 260;
const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

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
  closeLabel = 'Close modal',
  closeText,
  showCloseButton = true,
  animationDuration = defaultAnimationDuration,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  variant = 'center',
  backdropClassName,
}: BaseModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const closeTimerRef = useRef<number | null>(null);
  const visibilityFrameRef = useRef<number | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isVisible, setIsVisible] = useState(false);
  const close = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen && !shouldRender) {
      return;
    }

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
      triggerRef.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      visibilityFrameRef.current = window.requestAnimationFrame(() => {
        setShouldRender(true);
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
        triggerRef.current?.focus();
        triggerRef.current = null;
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
  }, [animationDuration, isOpen, onAfterClose, shouldRender]);

  useEffect(() => {
    if (!shouldRender) {
      return;
    }

    const scrollY = window.scrollY;
    const { style: bodyStyle } = document.body;
    const { style: htmlStyle } = document.documentElement;
    const previousBodyStyles = {
      left: bodyStyle.left,
      overflow: bodyStyle.overflow,
      overscrollBehavior: bodyStyle.overscrollBehavior,
      position: bodyStyle.position,
      right: bodyStyle.right,
      top: bodyStyle.top,
      width: bodyStyle.width,
    };
    const previousHtmlStyles = {
      overflow: htmlStyle.overflow,
      overscrollBehavior: htmlStyle.overscrollBehavior,
    };

    htmlStyle.overflow = 'hidden';
    htmlStyle.overscrollBehavior = 'none';
    bodyStyle.overflow = 'hidden';
    bodyStyle.overscrollBehavior = 'none';
    bodyStyle.position = 'fixed';
    bodyStyle.top = `-${scrollY}px`;
    bodyStyle.left = '0';
    bodyStyle.right = '0';
    bodyStyle.width = '100%';

    return () => {
      htmlStyle.overflow = previousHtmlStyles.overflow;
      htmlStyle.overscrollBehavior = previousHtmlStyles.overscrollBehavior;
      bodyStyle.overflow = previousBodyStyles.overflow;
      bodyStyle.overscrollBehavior = previousBodyStyles.overscrollBehavior;
      bodyStyle.position = previousBodyStyles.position;
      bodyStyle.top = previousBodyStyles.top;
      bodyStyle.left = previousBodyStyles.left;
      bodyStyle.right = previousBodyStyles.right;
      bodyStyle.width = previousBodyStyles.width;
      window.scrollTo(0, scrollY);
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
      if (event.key === 'Escape' && closeOnEscape) {
        event.preventDefault();
        close();
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
  }, [close, closeOnEscape, isOpen, onNext, onPrevious]);

  if (!shouldRender) {
    return null;
  }

  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (closeOnBackdropClick && event.target === event.currentTarget) {
      close();
    }
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Tab') {
      return;
    }

    const focusableElements = Array.from(
      dialogRef.current?.querySelectorAll<HTMLElement>(focusableSelector) ?? [],
    ).filter((element) => !element.hasAttribute('disabled'));

    if (focusableElements.length === 0) {
      event.preventDefault();
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    }

    if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  };

  const isSheet = variant === 'sheet';

  return (
    <ModalPortal>
      <div
        ref={dialogRef}
        className={[
          'fixed inset-0 z-[1000] overflow-hidden overflow-x-hidden text-white',
          'transition-opacity motion-reduce:transition-none',
          isSheet
            ? 'duration-[360ms] ease-out'
            : 'duration-[260ms] ease-out',
          isSheet
            ? 'bg-black/34 backdrop-blur-[1px] sm:bg-black/58 sm:backdrop-blur-[2px]'
            : 'bg-black',
          backdropClassName,
          isVisible ? 'opacity-100' : 'opacity-0',
        ].join(' ')}
        data-fullpage-scroll-ignore="true"
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        onKeyDown={handleKeyDown}
        onMouseDown={handleBackdropClick}
      >
        <div
          className={[
            isSheet
              ? 'relative mx-auto flex min-h-[100svh] w-full max-w-[1920px] flex-col items-center justify-end px-0 pt-6 sm:px-4 sm:pt-8 lg:justify-center lg:px-8 lg:py-8'
              : 'relative mx-auto flex min-h-[100svh] w-full max-w-[1920px] flex-col p-5 min-[1000px]:items-center min-[1000px]:justify-center min-[1000px]:px-[66px] min-[1000px]:py-[46px]',
            isSheet
              ? ''
              : [
                  'transition-[opacity,transform] duration-[260ms] ease-out motion-reduce:transition-none',
                  isVisible ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-4 scale-[0.985] opacity-0',
                ].join(' '),
          ].join(' ')}
        >
          <div
            className={[
              'relative flex w-full flex-col overflow-hidden overflow-x-hidden',
              isSheet
                ? [
                    'h-[min(92svh,calc(100svh-1rem))] max-w-none rounded-t-lg border border-b-0 border-white/18 bg-[#050909]/88 shadow-[0_-28px_90px_rgba(0,0,0,0.76)] backdrop-blur-lg transition-[opacity,transform] duration-[620ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none sm:bg-[#050909]/94 sm:backdrop-blur-xl lg:h-[min(829px,calc(100svh-4rem))] lg:max-w-[min(1756px,calc(100vw-4rem))] lg:rounded-lg lg:border-b lg:shadow-[0_30px_100px_rgba(0,0,0,0.78)]',
                    isVisible
                      ? 'translate-y-0 scale-100 opacity-100'
                      : 'translate-y-full opacity-0 lg:translate-y-0 lg:scale-100',
                  ].join(' ')
                : 'h-[calc(100svh-128px)] min-h-[620px] max-w-[1756px] lg:h-[min(829px,calc(100svh-251px))]',
            ].join(' ')}
          >
            {showCloseButton ? (
              <button
                ref={closeButtonRef}
                type="button"
                className={[
                  'absolute z-20 flex items-center justify-center border bg-black/50 font-black uppercase leading-none text-white transition hover:border-[#63ff45] hover:text-[#63ff45] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#63ff45]',
                  isSheet
                    ? 'right-5 top-4 h-10 px-4 border-white/55 sm:right-7 lg:right-9'
                    : 'right-5 top-5 h-11 w-11 text-[30px]',
                ].join(' ')}
                aria-label={closeLabel}
                onClick={close}
              >
                {isSheet ? (
                  closeText ?? 'Закрыть'
                ) : (
                  closeText ?? 'x'
                )}
              </button>
            ) : null}

            {isSheet ? (
              <div
                className={[
                  'relative min-h-0 flex-1 overflow-hidden transition-opacity duration-[420ms] ease-out motion-reduce:transition-none',
                  isVisible ? 'opacity-100' : 'opacity-0',
                ].join(' ')}
              >
                {children}
              </div>
            ) : (
              children
            )}

            {isSheet ? footer : null}
          </div>

          {isSheet ? null : footer}
        </div>
      </div>
    </ModalPortal>
  );
}
