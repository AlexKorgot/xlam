'use client';

import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';
import { ModalPortal } from '@/src/components/ui/modal';

type BottomSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  closeOnSwipeDown?: boolean;
  closeLabel?: string;
};

type BottomSheetContextValue = {
  close: () => void;
  titleId: string;
  descriptionId: string;
};

type BottomSheetSectionProps = {
  children: ReactNode;
  className?: string;
};

const animationDuration = 280;
const BottomSheetContext = createContext<BottomSheetContextValue | null>(null);
const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function useBottomSheetContext() {
  const context = useContext(BottomSheetContext);

  if (!context) {
    throw new Error('BottomSheet compound components must be used inside BottomSheet.');
  }

  return context;
}

export function BottomSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  closeOnSwipeDown = true,
  closeLabel = 'Close',
}: BottomSheetProps) {
  const generatedTitleId = useId();
  const generatedDescriptionId = useId();
  const sheetRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const closeTimerRef = useRef<number | null>(null);
  const focusTimerRef = useRef<number | null>(null);
  const visibilityFrameRef = useRef<number | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const sheetPointerStartRef = useRef<{ x: number; y: number; scrollTop: number } | null>(null);
  const [shouldRender, setShouldRender] = useState(open);
  const [isVisible, setIsVisible] = useState(false);

  const close = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  useEffect(() => {
    if (!open && !shouldRender) {
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

    if (focusTimerRef.current) {
      window.clearTimeout(focusTimerRef.current);
      focusTimerRef.current = null;
    }

    if (open) {
      triggerRef.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;

      visibilityFrameRef.current = window.requestAnimationFrame(() => {
        setShouldRender(true);
        setIsVisible(true);
        visibilityFrameRef.current = null;
      });

      focusTimerRef.current = window.setTimeout(() => {
        const titleElement = document.getElementById(generatedTitleId);

        if (titleElement instanceof HTMLElement) {
          titleElement.focus();
        } else {
          closeButtonRef.current?.focus();
        }

        focusTimerRef.current = null;
      }, prefersReducedMotion ? 0 : 80);

      return () => {
        if (visibilityFrameRef.current) {
          window.cancelAnimationFrame(visibilityFrameRef.current);
          visibilityFrameRef.current = null;
        }

        if (focusTimerRef.current) {
          window.clearTimeout(focusTimerRef.current);
          focusTimerRef.current = null;
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

      if (focusTimerRef.current) {
        window.clearTimeout(focusTimerRef.current);
        focusTimerRef.current = null;
      }
    };
  }, [generatedTitleId, open, shouldRender]);

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
    if (!open || !closeOnEscape) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [close, closeOnEscape, open]);

  if (!shouldRender) {
    return null;
  }

  const handleOverlayMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      close();
    }
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Tab') {
      return;
    }

    const focusableElements = Array.from(
      sheetRef.current?.querySelectorAll<HTMLElement>(focusableSelector) ?? [],
    ).filter((element) => !element.hasAttribute('disabled') && !element.getAttribute('aria-hidden'));

    if (focusableElements.length === 0) {
      event.preventDefault();
      sheetRef.current?.focus();
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

  const contextValue: BottomSheetContextValue = {
    close,
    titleId: generatedTitleId,
    descriptionId: generatedDescriptionId,
  };

  const handleSheetPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!closeOnSwipeDown || event.pointerType !== 'touch') {
      return;
    }

    sheetPointerStartRef.current = {
      x: event.clientX,
      y: event.clientY,
      scrollTop: bodyRef.current?.scrollTop ?? 0,
    };
  };

  const handleSheetPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (!closeOnSwipeDown || event.pointerType !== 'touch') {
      return;
    }

    const start = sheetPointerStartRef.current;
    sheetPointerStartRef.current = null;

    if (!start || start.scrollTop > 0) {
      return;
    }

    const deltaX = event.clientX - start.x;
    const deltaY = event.clientY - start.y;

    if (deltaY > 56 && Math.abs(deltaY) > Math.abs(deltaX) * 1.3) {
      close();
    }
  };

  return (
    <ModalPortal>
      <BottomSheetContext.Provider value={contextValue}>
        <div
          className={[
            'fixed inset-0 z-[1000] flex items-end justify-center bg-black/45 px-0 text-[#111]',
            'transition-opacity duration-[280ms] ease-out motion-reduce:transition-none',
            isVisible ? 'opacity-100' : 'opacity-0',
          ].join(' ')}
          data-fullpage-scroll-ignore="true"
          onMouseDown={handleOverlayMouseDown}
        >
          <div
            ref={sheetRef}
            className={[
              'grid h-[92dvh] max-h-[92dvh] w-full max-w-[520px] overflow-hidden rounded-t-[24px] bg-[#f7f6f1] shadow-[0_-18px_60px_rgba(0,0,0,0.35)] outline-none',
              footer ? 'grid-rows-[auto_minmax(0,1fr)_auto]' : 'grid-rows-[auto_minmax(0,1fr)]',
              'transition-transform duration-[280ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none',
              isVisible ? 'translate-y-0' : 'translate-y-full',
            ].join(' ')}
            role="dialog"
            aria-modal="true"
            aria-label={title ? undefined : 'Bottom sheet'}
            aria-labelledby={title ? generatedTitleId : undefined}
            aria-describedby={description ? generatedDescriptionId : undefined}
            tabIndex={-1}
            onKeyDown={handleKeyDown}
            onMouseDown={(event) => event.stopPropagation()}
            onPointerDown={handleSheetPointerDown}
            onPointerUp={handleSheetPointerUp}
            onPointerCancel={() => {
              sheetPointerStartRef.current = null;
            }}
          >
            <BottomSheetHeader>
              <div className="h-[5px] w-11 rounded-full bg-black/20" aria-hidden="true" />
              <div className="flex min-w-0 items-start justify-between gap-4">
                <div className="min-w-0">
                  {title ? <BottomSheetTitle>{title}</BottomSheetTitle> : null}
                  {description ? (
                    <p
                      id={generatedDescriptionId}
                      className="mt-1 text-[14px] leading-[1.35] text-black/62"
                    >
                      {description}
                    </p>
                  ) : null}
                </div>
                <BottomSheetClose ref={closeButtonRef} ariaLabel={closeLabel}>
                  {closeLabel}
                </BottomSheetClose>
              </div>
            </BottomSheetHeader>

            <BottomSheetBody ref={bodyRef}>{children}</BottomSheetBody>

            {footer ? <BottomSheetFooter>{footer}</BottomSheetFooter> : null}
          </div>
        </div>
      </BottomSheetContext.Provider>
    </ModalPortal>
  );
}

export function BottomSheetHeader({
  children,
  className = '',
}: BottomSheetSectionProps) {
  return (
    <header
      className={[
        'flex shrink-0 flex-col items-center gap-4 border-b border-black/10 px-5 pb-4 pt-3',
        className,
      ].join(' ')}
    >
      {children}
    </header>
  );
}

export function BottomSheetTitle({
  children,
  className = '',
}: BottomSheetSectionProps) {
  const { titleId } = useBottomSheetContext();

  return (
    <h2
      id={titleId}
      tabIndex={-1}
      className={[
        'truncate text-[20px] font-semibold leading-[1.15] text-black outline-none',
        className,
      ].join(' ')}
    >
      {children}
    </h2>
  );
}

export const BottomSheetBody = forwardRef<HTMLDivElement, BottomSheetSectionProps>(
function BottomSheetBody({
  children,
  className = '',
}, ref) {
  return (
    <div
      ref={ref}
      className={[
        'min-h-0 overflow-y-auto overscroll-y-contain px-5 py-4 [-webkit-overflow-scrolling:touch]',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  );
});

BottomSheetBody.displayName = 'BottomSheetBody';

export function BottomSheetFooter({
  children,
  className = '',
}: BottomSheetSectionProps) {
  return (
    <footer
      className={[
        'shrink-0 border-t border-black/10 bg-[#f7f6f1] px-5 pb-[max(16px,env(safe-area-inset-bottom))] pt-4',
        className,
      ].join(' ')}
    >
      {children}
    </footer>
  );
}

export const BottomSheetClose = forwardRef<HTMLButtonElement, {
  ariaLabel?: string;
  children?: ReactNode;
}>(
function BottomSheetClose({ ariaLabel = 'Close', children }, ref) {
  const { close } = useBottomSheetContext();

  return (
    <button
      ref={ref}
      type="button"
      aria-label={ariaLabel}
      className="flex h-11 shrink-0 items-center justify-center rounded-full border border-black/12 bg-white px-4 text-[12px] font-semibold leading-none text-black shadow-sm transition hover:border-black/25 hover:bg-[#eeeeea] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
      onClick={close}
    >
      {children ?? (
        <span className="relative h-4 w-4" aria-hidden="true">
          <span className="absolute left-0 top-1/2 h-[2px] w-4 -translate-y-1/2 rotate-45 rounded-full bg-current" />
          <span className="absolute left-0 top-1/2 h-[2px] w-4 -translate-y-1/2 -rotate-45 rounded-full bg-current" />
        </span>
      )}
    </button>
  );
});

BottomSheetClose.displayName = 'BottomSheetClose';
