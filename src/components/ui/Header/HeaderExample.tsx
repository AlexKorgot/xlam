'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import clsx from "clsx";
import { useGSAP } from "@gsap/react";
import { AnimatedLogo } from '../AnimatedLogo';
import s from './Header.module.scss';

interface HeaderProps {
    transitionProgress: number; // Прогресс перехода от 0 до 1
}

export const HeaderExample = ({ transitionProgress }: HeaderProps) => {
    const headerRef = useRef<HTMLDivElement>(null);
    const leftRef = useRef<HTMLDivElement>(null);
    const rightRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (!leftRef.current || !rightRef.current) return;

        // Меню появляется по мере перехода
        gsap.to([leftRef.current, rightRef.current], {
            opacity: transitionProgress,
            visibility: transitionProgress > 0.5 ? 'visible' : 'hidden',
            duration: 0.1,
            ease: "none",
        });
    }, [transitionProgress]);

    return (
        <div
            ref={headerRef}
            className={clsx(s.wrapper, 'max-w-[1740px] m-auto fixed top-0 left-0 right-0 z-50 px-4 py-4')}
            style={{
                backgroundColor: transitionProgress > 0.5 ? 'rgba(0, 0, 0, 0.8)' : 'transparent',
                backdropFilter: transitionProgress > 0.5 ? 'blur(10px)' : 'none',
                transition: 'background-color 0.3s ease, backdrop-filter 0.3s ease'
            }}
        >
            <header className={clsx('uppercase', s.header)}>
                <div ref={leftRef} className={s.left}>
                    <a href="#">Услуги</a>
                    <a href="#">Портфолио</a>
                </div>

                <div className={s.center}>
                    <AnimatedLogo transitionProgress={transitionProgress} />
                </div>

                <div ref={rightRef} className={s.right}>
                    <a href="#">Контакты</a>
                    <a href="#">Связаться с нами</a>
                </div>
            </header>
        </div>
    );
};