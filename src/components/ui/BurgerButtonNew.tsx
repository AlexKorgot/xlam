'use client';

import { useState } from 'react';
import clsx from 'clsx';

export default function BurgerButton() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative h-[42px] w-[42px]">
            <div
                className={clsx(
                    'absolute right-0 top-0 overflow-hidden bg-white transition-[width,height,border-radius] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
                    isOpen ? 'h-[342px] w-[262px] rounded-none' : 'h-[42px] w-[42px] rounded-[21px]',
                )}
            >
                <button
                    type="button"
                    aria-label={isOpen ? 'Close menu' : 'Open menu'}
                    aria-pressed={isOpen}
                    onClick={() => setIsOpen((v) => !v)}
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

                    <svg
                        className={clsx(
                            'pointer-events-none absolute inset-0 m-auto transition-all duration-200 ease-out',
                            isOpen ? 'scale-100 opacity-100 delay-100' : 'scale-90 opacity-0',
                        )}
                        width="24"
                        height="21"
                        viewBox="0 0 24 21"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M1.83588e-06 -2.09815e-06L8.0472 11.3435L3.0708 21L9.10329 21L12 16.9166L14.8967 21L20.9292 21L15.9528 11.3435L24 0L13.8917 -8.83697e-07L12 3.67024L10.1083 -1.21445e-06L1.83588e-06 -2.09815e-06Z"
                            fill="black"
                        />
                    </svg>
                </button>

                <div
                    className={clsx(
                        'pt-[52px] transition-all duration-300 ease-out',
                        isOpen
                            ? 'translate-y-0 opacity-100 delay-200 pointer-events-auto'
                            : 'translate-y-[12px] opacity-0 pointer-events-none',
                    )}
                >
                    <div className="border-t border-black px-[31px] py-[14px] text-[18px] uppercase text-black">
                        Услуги
                    </div>
                    <div className="border-t border-black px-[31px] py-[14px] text-[18px] uppercase text-black">
                        Проекты
                    </div>
                    <div className="border-t border-black px-[31px] py-[14px] text-[18px] uppercase text-black">
                        Команда
                    </div>
                    <div className="border-t border-black px-[31px] py-[14px] text-[18px] uppercase text-black">
                        О нас
                    </div>
                    <div className="border-t border-black px-[31px] py-[14px] text-[18px] uppercase text-black">
                        Контакты
                    </div>
                    <div className="border-y border-black px-[31px] py-[14px] text-[18px] font-semibold uppercase text-black">
                        Оставить заявку
                    </div>
                </div>
            </div>
        </div>
    );
}