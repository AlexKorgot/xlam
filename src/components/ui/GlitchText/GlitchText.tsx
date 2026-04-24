'use client';

import { ReactNode, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import clsx from 'clsx';
import s from '@/src/components/ui/GlitchText/GlitchText.module.scss';

gsap.registerPlugin(useGSAP);

export default function GlitchText({ children, size }: {
    children: ReactNode;
    size?: string;
}) {
    const rootRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);
    const tlRef = useRef<gsap.core.Timeline | null>(null);

    useGSAP(
        () => {
            if (!textRef.current) return;

            const baseSize = 16;
            const currentSize = Number(size) || 16;
            const k = currentSize / baseSize;

            tlRef.current = gsap.timeline({
                paused: true,
                defaults: {
                    ease: 'power4.inOut',
                },
            });

            tlRef.current
                .to(`.${s.glitch}`, {
                    skewX: 25 * Math.min(k, 1.5),
                    duration: 0.1,
                })
                .to(`.${s.glitch}`, {
                    skewX: 0,
                    duration: 0.04,
                })
                .to(`.${s.glitch}`, {
                    opacity: 0.2,
                    duration: 0.04,
                })
                .to(`.${s.glitch}`, {
                    opacity: 1,
                    duration: 0.04,
                })
                .to(`.${s.glitch}`, {
                    x: -4 * k,
                    duration: 0.04,
                })
                .to(`.${s.glitch}`, {
                    x: 0,
                    duration: 0.04,
                })//
                .to(`.${s.glitch}`, {
                    x: 2 * k,
                    duration: 0.015,
                })
                .to(`.${s.glitch}`, {
                    x: -2 * k,
                    duration: 0.015,
                })
                .to(`.${s.glitch}`, {
                    x: 0,
                    duration: 0.015,
                }) //
                .add('split', 0)
                .to(
                    `.${s.top}`,
                    {
                        x: -1 * k,
                        duration: 0.15,
                    },
                    'split',
                )
                .to(
                    `.${s.bottom}`,
                    {
                        x: 1 * k,
                        duration: 0.15,
                    },
                    'split',
                )
                .set(
                    `.${s.glitch}`,
                    {
                        textShadow: `${-2 * k}px 0 rgba(255,0,0,1)`,
                    },
                    'split',
                )
                .set(
                    `.${s.glitch}`,
                    {
                        textShadow: 'none',
                    },
                    '+=0.09',
                )
                .set(
                    `.${s.glitch}`,
                    {
                        textShadow: `${1 * k}px 0 rgba(0,255,0,1)`,
                    },
                    'split',
                )
                .set(
                    `.${s.glitch}`,
                    {
                        textShadow: 'none',
                    },
                    '+=0.01',
                )
                .to(`.${s.top}`, {
                    x: 0,
                    duration: 0.2,
                })
                .to(`.${s.bottom}`, {
                    x: 0,
                    duration: 0.2,
                })

            return () => {
                tlRef.current?.kill();
            };
        },
        { scope: rootRef },
    );

    const fontSize = `${size || 16}px`;

    return (
        <div ref={rootRef}>
            <div
                ref={textRef}
                onMouseEnter={() => tlRef.current?.restart()}
                className="relative"
            >
                <span
                    className={clsx('invisible')}
                    style={{fontSize}}
                >
          {children}
        </span>

                <span
                    className={clsx(s.top, 'z-20', s.glitch)}
                    style={{fontSize}}
                >
          {children}
        </span>

                <span
                    className={clsx(s.bottom, 'z-20', s.glitch)}
                    style={{fontSize}}
                >
          {children}
        </span>
            </div>
        </div>
    );
}