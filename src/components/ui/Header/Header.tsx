'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import clsx from "clsx";
import { AnimatedLogo } from '../AnimatedLogo';
import s from './Header.module.scss';

export const Header = ({scrollProgress = 0}: {scrollProgress?: number}) => {
    const leftRef = useRef<HTMLDivElement>(null);
    const rightRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (!leftRef.current || !rightRef.current) return;

        // Обновляем анимацию в зависимости от прогресса
        const opacity = Math.min(scrollProgress, 1);
        const visibility = opacity > 0 ? 'visible' : 'hidden';

        gsap.set([leftRef.current, rightRef.current], {
            opacity: opacity,
            visibility: visibility,
        });

    }, [scrollProgress]);

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
                    <AnimatedLogo scrollProgress={scrollProgress} />
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