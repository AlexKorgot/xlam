'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';
import Logo from '@/src/lib/assets/logo.svg';

gsap.registerPlugin(ScrollTrigger);

export const AnimatedLogo = () => {
    const centerLogoRef = useRef<HTMLDivElement>(null);
    const headerLogoRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (!centerLogoRef.current || !headerLogoRef.current) return;

        // Создаем таймлайн для синхронной анимации
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: document.body,
                start: "top top",
                end: "+=80", // Анимация на всю высоту окна
                scrub: 1, // Плавная привязка к скроллу
                invalidateOnRefresh: true,
            }
        });

        // Анимация большого логотипа в центре
        tl.to(centerLogoRef.current, {
            scale: 0,
            y: -390,
            x: -40,
            // opacity: 0,
            duration: 1,
            ease: "none",
        }, 0);

        // Анимация маленького логотипа в хедере
        tl.to(headerLogoRef.current, {
            scale: 1,
            opacity: 1,
            duration: 1,
            ease: "none",
        }, 0);

        return () => {
            tl.kill();
        };
    }, []);

    return (
        <>
            {/* Большой логотип в центре */}
            <div
                ref={centerLogoRef}
                className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none"
                style={{
                    transformOrigin: 'center center'
                }}
            >
                <Image
                    src={Logo}
                    alt={'logo'}
                    priority
                    width={700}
                    height={700}
                    className="w-[700px] h-auto"
                />
            </div>

            {/* Маленький логотип в хедере */}
            <div
                ref={headerLogoRef}
                className="flex justify-center items-center"
                style={{
                    opacity: 0,
                    transformOrigin: 'center center',
                    scale: 0
                }}
            >
                <Image
                    src={Logo}
                    alt={'logo'}
                    priority
                    width={95}
                    height={95}
                    className="w-[95px] h-auto"
                />
            </div>
        </>
    );
};