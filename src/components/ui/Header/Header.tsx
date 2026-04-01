'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import clsx from "clsx";
import { AnimatedLogo } from '../AnimatedLogo';
import s from './Header.module.scss';

gsap.registerPlugin(ScrollTrigger);

export const Header = () => {
    const leftRef = useRef<HTMLDivElement>(null);
    const rightRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (!leftRef.current || !rightRef.current) return;

        // Анимация появления меню при скролле
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: document.body,
                start: "top top",
                end: "+=80",
                scrub: 1,
            }
        });

        tl.to([leftRef.current, rightRef.current], {
            opacity: 1,
            visibility: 'visible',
            duration: 1,
            ease: "none",
        }, 0);

        return () => {
            tl.kill();
        };
    }, []);

    return (
        <div className={clsx(s.wrapper, 'max-w-[1740px] m-auto fixed top-0 left-0 right-0 z-50 px-4 py-4')}>
            <header className={clsx('uppercase', s.header)}>
                <div
                    ref={leftRef}
                    className={s.left}
                    style={{
                        opacity: 0,
                        visibility: 'hidden'
                    }}
                >
                    <a href="#">Услуги</a>
                    <a href="#">Портфолио</a>
                </div>

                <div className={s.center}>
                    <AnimatedLogo />
                </div>

                <div
                    ref={rightRef}
                    className={s.right}
                    style={{
                        opacity: 0,
                        visibility: 'hidden'
                    }}
                >
                    <a href="#">Контакты</a>
                    <a href="#">Связаться с нами</a>
                </div>
            </header>
        </div>
    );
};