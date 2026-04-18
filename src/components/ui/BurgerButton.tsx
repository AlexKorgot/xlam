'use client';

import {useRef, useState} from 'react';
import gsap from 'gsap';
import {useGSAP} from '@gsap/react';

gsap.registerPlugin(useGSAP);

export default function BurgerButtonNew() {
    const [isOpen, setIsOpen] = useState(false);

    const rootRef = useRef<HTMLDivElement>(null);
    const topRef = useRef<HTMLSpanElement>(null);
    const middleRef = useRef<HTMLSpanElement>(null);
    const bottomRef = useRef<HTMLSpanElement>(null);
    const tlRef = useRef<gsap.core.Timeline | null>(null);
    const iconRef = useRef<SVGSVGElement>(null);

    //
    const panelRef = useRef<HTMLDivElement>(null);
    const itemsRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            if (!topRef.current || !middleRef.current || !bottomRef.current || !iconRef.current || !panelRef.current || !itemsRef.current) return;

            tlRef.current = gsap.timeline({paused: true});

            gsap.set([topRef.current, bottomRef.current], {
                scaleY: 1,
            });

            gsap.set(iconRef.current, {
                opacity: 0,
                scale: 0.8,
            });

            //
            gsap.set(panelRef.current, {
                width: 42,
                height: 42,
                borderRadius: 999,
            });

            gsap.set(itemsRef.current, {
                opacity: 0,
                y: 12,
                pointerEvents: 'none',
            });
            //

            tlRef.current
                .to(
                    topRef.current,
                    {
                        y: 7,
                        rotate: 45,
                        duration: 0.2,
                        ease: 'power2.out',
                        transformOrigin: '50% 50%',
                    },
                    0,
                )
                .to(
                    middleRef.current,
                    {
                        opacity: 0,
                        duration: 0.14,
                        ease: 'power2.out',
                    },
                    0,
                )
                .to(
                    bottomRef.current,
                    {
                        y: -7,
                        rotate: -45,
                        duration: 0.22,
                        ease: 'power2.out',
                        transformOrigin: '50% 50%',
                    },
                    0,
                )
                .to(
                    [topRef.current, bottomRef.current],
                    {
                        opacity: 0,
                        scale: 0.85,
                        duration: 0.14,
                        ease: 'power2.inOut',
                    },
                    '0.16',
                )
                .to(
                    iconRef.current,
                    {
                        opacity: 1,
                        scale: 1,
                        duration: 0.18,
                        ease: 'power2.out',
                    },
                    '<',
                )
                .to(
                    panelRef.current,
                    {
                        width: 262,
                        height: 342,
                        borderRadius: 0,
                        duration: 0.45,
                        ease: 'power3.inOut',
                    },
                    0,
                )
                .to(
                    itemsRef.current,
                    {
                        opacity: 1,
                        y: 0,
                        pointerEvents: 'auto',
                        duration: 0.22,
                        ease: 'power2.out',
                    },
                    0.22,
                );
        },
        {scope: rootRef},
    );

    const handleClick = () => {
        const next = !isOpen;
        setIsOpen(next);

        if (next) {
            tlRef.current?.play();
        } else {
            tlRef.current?.reverse();
        }
    };

    return (
        <div ref={rootRef}>
            <div ref={panelRef} className='absolute right-[15px] top-[20px] overflow-hidden bg-white'>
                <button
                    aria-label={isOpen ? 'Close menu' : 'Open menu'}
                    aria-pressed={isOpen}
                    onClick={handleClick}
                    className="relative ml-auto flex h-[42px] w-[42px] items-center justify-center rounded-full bg-white"
                >
              <span className="relative block h-[16px] w-[18px]">
        <span
            ref={topRef}
            className="absolute left-0 top-0 block h-[2px] w-[18px] rounded-full bg-[#1f1f1f]"
        />
        <span
            ref={middleRef}
            className="absolute left-0 top-[7px] block h-[2px] w-[18px] rounded-full bg-[#1f1f1f]"
        />
        <span
            ref={bottomRef}
            className="absolute left-0 top-[14px] block h-[2px] w-[18px] rounded-full bg-[#1f1f1f]"
        />
      </span>
                    <svg ref={iconRef}
                         className="pointer-events-none absolute inset-0 m-auto"
                         width="24"
                         height="21"
                         viewBox="0 0 24 21"
                         fill="none"
                         xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M1.83588e-06 -2.09815e-06L8.0472 11.3435L3.0708 21L9.10329 21L12 16.9166L14.8967 21L20.9292 21L15.9528 11.3435L24 0L13.8917 -8.83697e-07L12 3.67024L10.1083 -1.21445e-06L1.83588e-06 -2.09815e-06Z"
                            fill="black"/>
                    </svg>
                </button>

                <div ref={itemsRef}>
                    <div className="border-t border-black px-[31px] py-[14px] text-[18px] uppercase text-black">Услуги</div>
                    <div className="border-t border-black px-[31px] py-[14px] text-[18px] uppercase text-black">Проекты</div>
                    <div className="border-t border-black px-[31px] py-[14px] text-[18px] uppercase text-black">Команда</div>
                    <div className="border-t border-black px-[31px] py-[14px] text-[18px] uppercase text-black">О нас</div>
                    <div className="border-t border-black px-[31px] py-[14px] text-[18px] uppercase text-black">Контакты</div>
                    <div className="border-y border-black px-[31px] py-[14px] text-[18px] font-semibold uppercase text-black">Оставить заявку</div>
                </div>
            </div>
        </div>
    );
}