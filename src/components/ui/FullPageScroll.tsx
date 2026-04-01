'use client';

import { ReactNode, useRef } from 'react';
import gsap from 'gsap';
import { Observer } from 'gsap/Observer';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(Observer);

interface FullPageScrollProps {
    children: ReactNode;
    animationDuration?: number;
    progressCallback?: (value: number) => number
}

export default function FullPageScroll({
                                           children,
                                           animationDuration = 0.8,
                                           progressCallback
                                       }: FullPageScrollProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const sectionsRef = useRef<HTMLElement[]>([]);
    const currentIndexRef = useRef(0);
    const isScrollingRef = useRef(false);
    const progress = useRef(0);

    const scrollToSection = (index: number) => {
        if (!containerRef.current || !sectionsRef.current[index]) return;
        if (isScrollingRef.current) return;

        isScrollingRef.current = true;

        gsap.to(containerRef.current, {
            y: -index * window.innerHeight,
            duration: animationDuration,
            ease: 'power2.inOut',
            onUpdate: () => {
                progress.current += 1
                if (progressCallback && index === 1) progressCallback(progress.current)
            },
            onComplete: () => {
                currentIndexRef.current = index;
                setTimeout(() => {
                    isScrollingRef.current = false;
                }, 100);
            },
        });
    };

    const handleScrollDown = () => {
        const nextIndex = currentIndexRef.current + 1;
        if (nextIndex < sectionsRef.current.length) {
            scrollToSection(nextIndex);
        }
    };

    const handleScrollUp = () => {
        const prevIndex = currentIndexRef.current - 1;
        if (prevIndex >= 0) {
            scrollToSection(prevIndex);
        }
    };

    useGSAP(() => {
        if (!containerRef.current) return;

        const sections = Array.from(containerRef.current.children) as HTMLElement[];
        sectionsRef.current = sections;

        const observer = Observer.create({
            type: 'wheel,touch',
            onDown: () => {
                handleScrollDown()
            },
            onUp: () => {
                handleScrollUp()
            },
            wheelSpeed: 1,
            tolerance: 10,
            // preventDefault: true,
        });

        const handleResize = () => {
            if (containerRef.current) {
                gsap.set(containerRef.current, {
                    y: -currentIndexRef.current * window.innerHeight,
                });
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            observer.kill();
            window.removeEventListener('resize', handleResize);
        };
    }, [animationDuration]);

    return (
        <div className="relative w-full h-screen overflow-hidden">
            <div
                ref={containerRef}
                className="absolute top-0 left-0 w-full"
                style={{ willChange: 'transform' }}
            >
                {children}
            </div>
        </div>
    );
}