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
  animationDuration?: number;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
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
  animationDuration = defaultAnimationDuration,
  closeOnBackdropClick = true,
  closeOnEscape = true,
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

  return (
    <ModalPortal>
      <div
        ref={dialogRef}
        className={[
          'fixed inset-0 z-[1000] overflow-hidden overflow-x-hidden bg-black text-white',
          'transition-opacity duration-[260ms] ease-out motion-reduce:transition-none',
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
            'relative mx-auto flex min-h-[100svh] w-full max-w-[1920px] flex-col p-5 min-[1000px]:items-center min-[1000px]:justify-center min-[1000px]:px-[66px] min-[1000px]:py-[46px]',
            'transition-[opacity,transform] duration-[260ms] ease-out motion-reduce:transition-none',
            isVisible
              ? 'translate-y-0 scale-100 opacity-100'
              : 'translate-y-4 scale-[0.985] opacity-0',
          ].join(' ')}
        >
          <div className="relative flex h-[calc(100svh-128px)] min-h-[620px] w-full max-w-[1756px] flex-col overflow-hidden overflow-x-hidden lg:h-[min(829px,calc(100svh-251px))]">
            <button
              ref={closeButtonRef}
              type="button"
              className="absolute right-5 top-5 z-20 flex h-11 w-11 items-center justify-center border border-white/30 bg-black/50 text-[30px] leading-none text-white transition hover:border-[#63ff45] hover:text-[#63ff45] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#63ff45]"
              aria-label={closeLabel}
              onClick={close}
            >
              x
            </button>

            {children}
          </div>

          {footer}
        </div>
      </div>
    </ModalPortal>
  );
}
