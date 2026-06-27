'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import { BrandXIcon } from '@/src/components/ui/BrandXIcon';
import { useContactModal } from '@/src/components/ui/contact-modal';
import { FULLPAGE_SCROLL_EVENT } from '@/src/components/ui/FullPageScroll';

const OVERLAY_TRANSITION_DURATION = 500;

const mobileMenu = [
    { label: 'Услуги', targetId: 'services' },
    { label: 'Проекты', targetId: 'projects' },
    { label: 'Команда', targetId: 'about' },
    { label: 'О нас', targetId: 'why' },
    { label: 'Контакты', targetId: 'final-contact' },
] as const;

type CloseMenuOptions = {
    immediate?: boolean;
};

export default function BurgerButton() {
    const { openContactModal } = useContactModal();
    const toggleButtonRef = useRef<HTMLButtonElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const overlayFrameRef = useRef<number | null>(null);
    const overlayTimeoutRef = useRef<number | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [isOverlayMounted, setIsOverlayMounted] = useState(false);
    const [isOverlayVisible, setIsOverlayVisible] = useState(false);

    const clearOverlayTimers = useCallback(() => {
        if (overlayFrameRef.current !== null) {
            window.cancelAnimationFrame(overlayFrameRef.current);
            overlayFrameRef.current = null;
        }

        if (overlayTimeoutRef.current !== null) {
            window.clearTimeout(overlayTimeoutRef.current);
            overlayTimeoutRef.current = null;
        }
    }, []);

    const openMenu = useCallback(() => {
        clearOverlayTimers();
        setIsOpen(true);
        setIsOverlayMounted(true);
        setIsOverlayVisible(false);

        overlayFrameRef.current = window.requestAnimationFrame(() => {
            overlayFrameRef.current = null;
            setIsOverlayVisible(true);
        });
    }, [clearOverlayTimers]);

    const closeMenu = useCallback((options: CloseMenuOptions = {}) => {
        clearOverlayTimers();
        setIsOpen(false);
        setIsOverlayVisible(false);

        if (options.immediate) {
            setIsOverlayMounted(false);
            return;
        }

        overlayTimeoutRef.current = window.setTimeout(() => {
            overlayTimeoutRef.current = null;
            setIsOverlayMounted(false);
        }, OVERLAY_TRANSITION_DURATION);
    }, [clearOverlayTimers]);
    const toggleMenu = () => {
        if (isOpen) {
            closeMenu();
            return;
        }

        openMenu();
    };

    const handleContactClick = () => {
        closeMenu({ immediate: true });
        toggleButtonRef.current?.focus();
        openContactModal();
    };

    const handleSectionClick = (targetId: string) => {
        closeMenu({ immediate: true });
        toggleButtonRef.current?.focus();
        window.dispatchEvent(
            new CustomEvent(FULLPAGE_SCROLL_EVENT, {
                detail: {
                    behavior: 'instant',
                    targetId,
                },
            }),
        );
    };

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const handlePointerDown = (event: PointerEvent) => {
            const target = event.target;

            if (!(target instanceof Node)) {
                return;
            }

            if (panelRef.current?.contains(target)) {
                return;
            }

            closeMenu();
        };

        document.addEventListener('pointerdown', handlePointerDown, true);

        return () => {
            document.removeEventListener('pointerdown', handlePointerDown, true);
        };
    }, [closeMenu, isOpen]);

    useEffect(
        () => () => {
            clearOverlayTimers();
        },
        [clearOverlayTimers],
    );

    return (
        <div className="relative h-[42px] w-[42px]">
            {isOverlayMounted
                ? createPortal(
                    <button
                        type="button"
                        aria-label="Close menu"
                        onClick={() => closeMenu()}
                        className={clsx(
                            'fixed inset-0 z-40 transition-[opacity,backdrop-filter] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
                            isOverlayVisible ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
                        )}
                        style={{
                            backgroundColor: isOverlayVisible
                                ? 'rgba(0, 0, 0, 0.24)'
                                : 'rgba(0, 0, 0, 0)',
                            WebkitBackdropFilter: isOverlayVisible
                                ? 'blur(32px) saturate(0.65)'
                                : 'blur(0px) saturate(1)',
                            backdropFilter: isOverlayVisible
                                ? 'blur(32px) saturate(0.65)'
                                : 'blur(0px) saturate(1)',
                            transitionProperty: 'opacity, background-color, -webkit-backdrop-filter, backdrop-filter',
                        }}
                    />,
                    document.body,
                )
                : null}
            <div
                ref={panelRef}
                aria-hidden={!isOpen}
                className={clsx(
                    'absolute right-0 top-0 z-50 overflow-hidden bg-white transition-[width,height,border-radius] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
                    isOpen ? 'h-[388px] w-[262px] rounded-none' : 'h-[42px] w-[42px] rounded-[21px]',
                )}
            >
                <button
                    ref={toggleButtonRef}
                    type="button"
                    aria-label={isOpen ? 'Close menu' : 'Open menu'}
                    aria-pressed={isOpen}
                    onClick={toggleMenu}
                    className="absolute right-0 top-0 z-20 flex h-[42px] w-[42px] items-center justify-center"
                >
          <span className="relative block h-[16px] w-[18px]">
            <span
                className={clsx(
                    'absolute left-0 top-0 block h-[2px] w-[18px] rounded-full bg-[#1f1f1f] transition-all duration-200 ease-out',
                    isOpen && 'translate-y-[7px] rotate-45 opacity-0 scale-90',
                )}
            />
            <span
                className={clsx(
                    'absolute left-0 top-[7px] block h-[2px] w-[18px] rounded-full bg-[#1f1f1f] transition-all duration-150 ease-out',
                    isOpen && 'opacity-0',
                )}
            />
            <span
                className={clsx(
                    'absolute left-0 top-[14px] block h-[2px] w-[18px] rounded-full bg-[#1f1f1f] transition-all duration-200 ease-out',
                    isOpen && '-translate-y-[7px] -rotate-45 opacity-0 scale-90',
                )}
            />
          </span>

                    <BrandXIcon
                        className={clsx(
                            'pointer-events-none absolute inset-0 m-auto transition-all duration-200 ease-out',
                            isOpen ? 'scale-100 opacity-100 delay-100' : 'scale-90 opacity-0',
                        )}
                        fill="black"
                    />
                </button>

                <div
                    className={clsx(
                        'pt-[52px] transition-all duration-300 ease-out',
                        isOpen
                            ? 'translate-y-0 opacity-100 delay-200 pointer-events-auto'
                            : 'translate-y-[12px] opacity-0 pointer-events-none',
                    )}
                >
                    {mobileMenu.map((item) => (
                        <button
                            key={item.targetId}
                            type="button"
                            className="w-full border-t border-black px-[31px] py-[14px] text-left text-[18px] uppercase text-black"
                            onClick={() => handleSectionClick(item.targetId)}
                        >
                            {item.label}
                        </button>
                    ))}
                    <button
                        type="button"
                        className="w-full border-y border-black px-[31px] py-[14px] text-left text-[18px] font-semibold uppercase text-black"
                        onClick={handleContactClick}
                    >
                        Оставить заявку
                    </button>
                </div>
            </div>
        </div>
    );
}
