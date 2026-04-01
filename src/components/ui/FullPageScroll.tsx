'use client';

import { ReactNode, useRef } from 'react';
import gsap from 'gsap';
import { Observer } from 'gsap/Observer';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(Observer);

interface FullPageScrollProps {
    children: ReactNode;
    animationDuration?: number;
    progressCallback?: (value: number) => void;
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
    const animationRef = useRef<gsap.core.Tween | null>(null);

    const scrollToSection = (index: number) => {
        if (!containerRef.current || !sectionsRef.current[index]) return;
        if (isScrollingRef.current) return;

        isScrollingRef.current = true;
        const startIndex = currentIndexRef.current;
        const isMovingForward = index > startIndex;

        // Определяем, нужно ли вызывать progressCallback (только для перехода между 0 и 1)
        const shouldTrackProgress = (startIndex === 0 && index === 1) || (startIndex === 1 && index === 0);

        // Убиваем предыдущую анимацию, если есть
        if (animationRef.current) {
            animationRef.current.kill();
        }

        // Создаем анимацию с прогрессом
        animationRef.current = gsap.to(containerRef.current, {
            y: -index * window.innerHeight,
            duration: animationDuration,
            ease: 'power2.inOut',
            onUpdate: function() {
                if (shouldTrackProgress && progressCallback) {
                    const animationProgress = this.progress();

                    let progressValue;
                    if (isMovingForward) {
                        // Переход с 1 на 2 секцию (0 -> 1): прогресс от 0 до 1
                        progressValue = animationProgress;
                    } else {
                        // Переход со 2 на 1 секцию (1 -> 0): прогресс от 1 до 0
                        progressValue = 1 - animationProgress;
                    }
                    progressCallback(progressValue);
                }
            },
            onComplete: () => {
                currentIndexRef.current = index;
                if (shouldTrackProgress && progressCallback) {
                    const finalProgress = isMovingForward ? 1 : 0;
                    progressCallback(finalProgress);
                }
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
            preventDefault: true,
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
            if (animationRef.current) {
                animationRef.current.kill();
            }
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