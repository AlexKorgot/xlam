'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import Image from 'next/image';
import Logo from '@/src/lib/assets/logo.svg';

interface AnimatedLogoProps {
    scrollProgress?: number;
}

export const AnimatedLogo = ({ scrollProgress = 0 }: AnimatedLogoProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const centerLogoRef = useRef<HTMLDivElement>(null);
    const headerLogoRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (!centerLogoRef.current || !headerLogoRef.current) return;

        const getTargetPosition = () => {
            const centerRect = centerLogoRef.current!.getBoundingClientRect();
            const headerRect = headerLogoRef.current!.getBoundingClientRect();

            return {
                x: headerRect.left + (headerRect.width / 2) - (centerRect.left + (centerRect.width / 2)),
                y: headerRect.top + (headerRect.height / 2) - (centerRect.top + (centerRect.height / 2)),
                scale: headerRect.width / centerRect.width
            };
        };

        // Начальное состояние
        gsap.set(headerLogoRef.current, {
            opacity: 0,
        });

        gsap.set(centerLogoRef.current, {
            x: 0,
            y: 0,
            scale: 1,
            opacity: 1,
        });

        const moveTween = gsap.to(centerLogoRef.current, {
            x: getTargetPosition().x,
            y: getTargetPosition().y,
            scale: getTargetPosition().scale,
            duration: 1,
            ease: "power3.inOut",
            paused: true,
            overwrite: true,
        });

        const appearTween = gsap.to(headerLogoRef.current, {
            opacity: 1,
            duration: 0.5,
            ease: "power2.out",
            paused: true,
            overwrite: true,
        });

        const disappearTween = gsap.to(centerLogoRef.current, {
            opacity: 0,
            duration: 0.4,
            ease: "power2.in",
            paused: true,
            overwrite: true,
        });

        const updateAnimations = (progress: number) => {
            if (progress <= 0.7) {
                const moveProgress = progress / 0.7;
                moveTween.progress(Math.min(moveProgress, 1));
                appearTween.progress(0);
                disappearTween.progress(0);
                gsap.set(centerLogoRef.current, { opacity: 1 });
            } else if (progress <= 0.85) {
                moveTween.progress(1);
                const appearProgress = (progress - 0.7) / 0.15;
                appearTween.progress(Math.min(appearProgress, 1));
                disappearTween.progress(0);
                gsap.set(centerLogoRef.current, { opacity: 1 - appearProgress });
            } else {
                moveTween.progress(1);
                appearTween.progress(1);
                const disappearProgress = (progress - 0.85) / 0.15;
                disappearTween.progress(Math.min(disappearProgress, 1));
            }
        };

        updateAnimations(scrollProgress);

        const handleResize = () => {
            const { x: newX, y: newY, scale: newScale } = getTargetPosition();
            moveTween.vars.x = newX;
            moveTween.vars.y = newY;
            moveTween.vars.scale = newScale;
            moveTween.invalidate();
            updateAnimations(scrollProgress);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            moveTween.kill();
            appearTween.kill();
            disappearTween.kill();
        };
    }, [scrollProgress]);

    return (
        <div ref={containerRef}>
            {/* Большой логотип в центре */}
            <div
                ref={centerLogoRef}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none"
                style={{
                    transformOrigin: 'center center',
                    willChange: 'transform, opacity',
                }}
            >
                <Image
                    src={Logo}
                    alt="logo"
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
                    willChange: 'opacity',
                }}
            >
                <Image
                    src={Logo}
                    alt="logo"
                    priority
                    width={95}
                    height={95}
                    className="w-[95px] h-auto"
                />
            </div>
        </div>
    );
};