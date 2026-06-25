'use client';

import {forwardRef, useId, useImperativeHandle, useRef} from 'react';
import type {
    MouseEvent as ReactMouseEvent,
    PointerEvent as ReactPointerEvent,
} from 'react';
import gsap from 'gsap';
import {useGSAP} from '@gsap/react';

export interface MorphSectionHandle {
    playForward: () => void;
    playReverse: () => void;
    reset: () => void;
    revealExpandedVideo: () => void;
    hideExpandedVideo: () => void;
    fadeExpandedVideoOut: () => void;
    fadeExpandedVideoIn: () => void;
    isExpandedVideoVisible: () => boolean;
}

type MorphSectionProps = {
    videoSrc: string;
    autoPlayTimeline?: boolean;
    className?: string;
    topEndWidth?: number;
    bottomLeftX?: number;
};

const TOP_START_RIGHT_X = 234.5;
const BOTTOM_START_LEFT_X = 0;
const TOP_FLICKER_START = 1.18;
const BOTTOM_FLICKER_START = 1.3;
const M_ACTIVATION_START = 0.24;
const M_REVEAL_START = 0.48;
const M_REVEAL_DURATION = 0.95;
const VIDEO_REVEAL_START = M_REVEAL_START + 0.14;
const TOP_VIDEO_REVEAL_START = VIDEO_REVEAL_START;
const OUTLINE_TO_WHITE_START = VIDEO_REVEAL_START + 0.05;
const TEXT_REVEAL_START = M_REVEAL_START + M_REVEAL_DURATION * 0.72;
const EXPANDED_PLAY_BUTTON_TAP_THRESHOLD = 10;

function buildMPathRight(rightX: number) {
    return `
    M54.5 2.5
    H85
    L118.5 120
    L152 2.5
    H182.5
    H${rightX}
    V245.5
    H182.5
    V71
    L177.5 70.4
    L143 215.5
    H94
    L59.5 70.4
    L54.5 71
    V245.5
    H2.5
    V2.5
    H54.5
    Z
  `;
}

function buildMPathLeft(leftX: number) {
    return `
    M${leftX} 2.5
    H54.5
    H85
    L118.5 120
    L152 2.5
    H182.5
    H234.5
    V245.5
    H182.5
    V71
    L177.5 70.4
    L143 215.5
    H94
    L59.5 70.4
    L54.5 71
    V245.5
    H${leftX}
    V2.5
    Z
  `;
}

const MorphSection = forwardRef<MorphSectionHandle, MorphSectionProps>(function MorphSection({
    videoSrc,
    autoPlayTimeline = true,
    className = '',
    topEndWidth = 820,
    bottomLeftX = -585,
}: MorphSectionProps, ref) {
    const rootRef = useRef<HTMLDivElement | null>(null);
    const topRowRef = useRef<HTMLDivElement | null>(null);
    const bottomRowRef = useRef<HTMLDivElement | null>(null);
    const timelineRef = useRef<gsap.core.Timeline | null>(null);
    const expandedVideoTimelineRef = useRef<gsap.core.Timeline | null>(null);
    const expandedVideoFrameRef = useRef<HTMLDivElement | null>(null);
    const expandedVideoRef = useRef<HTMLVideoElement | null>(null);
    const expandedPlayButtonRef = useRef<HTMLButtonElement | null>(null);
    const expandedPlayButtonTimeoutRef = useRef<number | null>(null);
    const expandedPlayButtonPointerStartRef = useRef<{x: number; y: number} | null>(null);
    const shouldSuppressExpandedPlayClickRef = useRef(false);
    const isExpandedVideoVisibleRef = useRef(false);
    const isExpandedVideoPlayingRef = useRef(false);

    const topVideoRef = useRef<HTMLVideoElement | null>(null);
    const topClipPathRef = useRef<SVGPathElement | null>(null);
    const topOverlayPathRef = useRef<SVGPathElement | null>(null);
    const topOutlinePathRef = useRef<SVGPathElement | null>(null);

    const bottomVideoRef = useRef<HTMLVideoElement | null>(null);
    const bottomClipPathRef = useRef<SVGPathElement | null>(null);
    const bottomOverlayPathRef = useRef<SVGPathElement | null>(null);
    const bottomOutlinePathRef = useRef<SVGPathElement | null>(null);

    const topLetterRefs = useRef<SVGPathElement[]>([]);
    const bottomLetterRefs = useRef<SVGPathElement[]>([]);

    const textRef = useRef<HTMLParagraphElement | null>(null);

    const setTopLetterRef = (el: SVGPathElement | null, index: number) => {
        if (el) topLetterRefs.current[index] = el;
    };

    const setBottomLetterRef = (el: SVGPathElement | null, index: number) => {
        if (el) bottomLetterRefs.current[index] = el;
    };

    const pauseVideo = (video: HTMLVideoElement | null, reset = false) => {
        if (!video) {
            return;
        }

        video.pause();

        if (reset) {
            video.currentTime = 0;
        }
    };

    const pauseVideos = (reset = false) => {
        pauseVideo(topVideoRef.current, reset);
        pauseVideo(bottomVideoRef.current, reset);
        pauseVideo(expandedVideoRef.current, reset);
    };

    const playLetterVideos = (reset = false) => {
        [topVideoRef.current, bottomVideoRef.current].forEach((video) => {
            if (!video) {
                return;
            }

            if (reset) {
                video.currentTime = 0;
            }

            video.play().catch(() => {});
        });
    };

    const syncVideoTime = (video: HTMLVideoElement, currentTime: number) => {
        const seek = () => {
            video.currentTime = currentTime;
        };

        if (video.readyState >= 1) {
            seek();
            return;
        }

        video.addEventListener('loadedmetadata', seek, {once: true});
    };

    const clearExpandedPlayButtonTimeout = () => {
        if (expandedPlayButtonTimeoutRef.current === null) {
            return;
        }

        window.clearTimeout(expandedPlayButtonTimeoutRef.current);
        expandedPlayButtonTimeoutRef.current = null;
    };

    const showExpandedPlayButton = () => {
        const button = expandedPlayButtonRef.current;

        if (!button) {
            return;
        }

        gsap.to(button, {
            autoAlpha: 1,
            scale: 1,
            duration: 0.28,
            ease: 'power2.out',
        });
    };

    const hideExpandedPlayButton = () => {
        const button = expandedPlayButtonRef.current;

        if (!button) {
            return;
        }

        gsap.to(button, {
            autoAlpha: 0,
            scale: 0.94,
            duration: 0.38,
            ease: 'sine.out',
        });
    };

    const syncExpandedPlayButtonState = () => {
        const button = expandedPlayButtonRef.current;

        if (!button) {
            return;
        }

        button.dataset.playing = isExpandedVideoPlayingRef.current ? 'true' : 'false';
        button.setAttribute(
            'aria-label',
            isExpandedVideoPlayingRef.current ? 'Pause video' : 'Play video',
        );
    };

    const playExpandedVideo = (video: HTMLVideoElement) => {
        video.play().catch(() => {});
        isExpandedVideoPlayingRef.current = true;
        syncExpandedPlayButtonState();
        clearExpandedPlayButtonTimeout();
        hideExpandedPlayButton();
    };

    const pauseExpandedVideo = (video: HTMLVideoElement) => {
        video.pause();
        isExpandedVideoPlayingRef.current = false;
        syncExpandedPlayButtonState();
        clearExpandedPlayButtonTimeout();
        showExpandedPlayButton();
    };

    const resetExpandedVideoPlayback = () => {
        const video = expandedVideoRef.current;

        if (video) {
            video.pause();

            if (video.currentTime !== 0) {
                video.currentTime = 0;
            }
        }

        isExpandedVideoPlayingRef.current = false;
        syncExpandedPlayButtonState();
        clearExpandedPlayButtonTimeout();
        gsap.set(expandedPlayButtonRef.current, {
            autoAlpha: 1,
            scale: 1,
        });
    };

    const handleExpandedVideoPlay = () => {
        const video = expandedVideoRef.current;

        if (!video) {
            return;
        }

        if (!video.paused) {
            pauseExpandedVideo(video);
            return;
        }

        playExpandedVideo(video);
    };

    const handleExpandedPlayButtonPointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
        expandedPlayButtonPointerStartRef.current = {
            x: event.clientX,
            y: event.clientY,
        };
        shouldSuppressExpandedPlayClickRef.current = false;
    };

    const handleExpandedPlayButtonPointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
        const start = expandedPlayButtonPointerStartRef.current;

        if (!start) {
            return;
        }

        const deltaX = event.clientX - start.x;
        const deltaY = event.clientY - start.y;

        if (Math.hypot(deltaX, deltaY) > EXPANDED_PLAY_BUTTON_TAP_THRESHOLD) {
            shouldSuppressExpandedPlayClickRef.current = true;
        }
    };

    const handleExpandedPlayButtonPointerCancel = () => {
        expandedPlayButtonPointerStartRef.current = null;
        shouldSuppressExpandedPlayClickRef.current = false;
    };

    const handleExpandedPlayButtonClick = (event: ReactMouseEvent<HTMLButtonElement>) => {
        expandedPlayButtonPointerStartRef.current = null;

        if (shouldSuppressExpandedPlayClickRef.current) {
            event.preventDefault();
            event.stopPropagation();
            shouldSuppressExpandedPlayClickRef.current = false;
            return;
        }

        event.stopPropagation();
        handleExpandedVideoPlay();
    };

    const handleExpandedVideoEnded = () => {
        const video = expandedVideoRef.current;

        if (video) {
            video.currentTime = 0;
        }

        isExpandedVideoPlayingRef.current = false;
        syncExpandedPlayButtonState();
        clearExpandedPlayButtonTimeout();
        showExpandedPlayButton();
    };

    const handleExpandedVideoFrameClick = (event: ReactMouseEvent<HTMLDivElement>) => {
        event.preventDefault();

        if ((event.target as HTMLElement | null)?.closest('button')) {
            return;
        }

        const video = expandedVideoRef.current;

        if (!video) {
            return;
        }

        if (video.paused) {
            playExpandedVideo(video);
            return;
        }

        pauseExpandedVideo(video);
    };

    const handleExpandedPlayButtonPointerLeave = () => {
        if (!isExpandedVideoPlayingRef.current) {
            return;
        }

        clearExpandedPlayButtonTimeout();
        hideExpandedPlayButton();
    };


    const topClipId = useId().replace(/:/g, '') + '-top';
    const bottomClipId = useId().replace(/:/g, '') + '-bottom';

    const topSvgWidth = topEndWidth + 6;
    const topSvgHeight = 248;

    const bottomSvgX = bottomLeftX;
    const bottomSvgWidth = 234.5 - bottomLeftX + 6;
    const bottomSvgHeight = 248;

    const neonPulse = (
        target: SVGPathElement,
        startAt: number,
        isOutline = false
    ) => {
        const tl = gsap.timeline();

        const dimGlow = 'drop-shadow(0 0 0px rgba(102,255,102,0))';
        const midGlow = 'drop-shadow(0 0 6px rgba(102,255,102,0.35))';
        const strongGlow = 'drop-shadow(0 0 14px rgba(102,255,102,0.65))';

        const toState = (
            color: string,
            duration: number,
            at?: string | number,
            glow: string = dimGlow
        ) => {
            tl.to(
                target,
                isOutline
                    ? {
                        stroke: color,
                        filter: glow,
                        duration,
                        ease: 'none',
                    }
                    : {
                        fill: color,
                        filter: glow,
                        duration,
                        ease: 'none',
                    },
                at
            );
        };

        const d1 = gsap.utils.random(0.05, 0.12);
        const d2 = gsap.utils.random(0.08, 0.22);
        const d3 = gsap.utils.random(0.05, 0.16);
        const d4 = gsap.utils.random(0.1, 0.28);
        const d5 = gsap.utils.random(0.08, 0.2);
        const d6 = gsap.utils.random(0.18, 0.42);

        const mode = gsap.utils.random(0, 3, 1);

        if (mode === 0) {
            toState('#111111', d1, startAt, dimGlow);
            toState('#ffffff', d2, '>', dimGlow);
            toState('#1a1a1a', d3, '>', dimGlow);
            toState('#66FF66', d4, '>', strongGlow);
            toState('#dfffdc', d5, '>', midGlow);
            toState('#ffffff', d6, '>', dimGlow);
        } else if (mode === 1) {
            toState('#000000', d2, startAt, dimGlow);
            toState('#2a2a2a', d1, '>', dimGlow);
            toState('#66FF66', d4, '>', strongGlow);
            toState('#153815', d3, '>', midGlow);
            toState('#66FF66', d5, '>', strongGlow);
            toState('#ffffff', d6, '>', dimGlow);
        } else if (mode === 2) {
            toState('#0d0d0d', d1, startAt, dimGlow);
            toState('#ffffff', d1, '>', dimGlow);
            toState('#050505', d2, '>', dimGlow);
            toState('#66FF66', d3, '>', strongGlow);
            toState('#ffffff', d6, '>', dimGlow);
        } else {
            toState('#202020', d2, startAt, dimGlow);
            toState('#000000', d1, '>', dimGlow);
            toState('#66FF66', d4, '>', strongGlow);
            toState('#c8ffc8', d5, '>', midGlow);
            toState('#ffffff', d6, '>', dimGlow);
        }

        return tl;
    };

    const buildSyncedMActivation = (
        outlineTargets: SVGPathElement[],
        overlayTargets: SVGPathElement[],
        startAt: number,
    ) => {
        const tl = gsap.timeline();

        tl.to(outlineTargets, {
            stroke: '#ffffff',
            filter: 'drop-shadow(0 0 0px rgba(102,255,102,0))',
            duration: 0.34,
            ease: 'power2.out',
        }, startAt);

        tl.to(overlayTargets, {
            opacity: 1,
            fill: '#ffffff',
            duration: 0.28,
            ease: 'sine.out',
        }, startAt + 0.08);

        return tl;
    };

    const buildFlickerSection = (
        letterTargets: SVGPathElement[],
        outlineTargets: SVGPathElement[],
        startAt: number
    ) => {
        const tl = gsap.timeline();

        letterTargets.forEach((target, i) => {
            const delay = startAt + gsap.utils.random(0, 0.45) + i * 0.035;
            tl.add(neonPulse(target, delay, false), 0);
        });

        outlineTargets.forEach((target, i) => {
            const delay = startAt + gsap.utils.random(0.08, 0.55) + i * 0.04;
            tl.add(neonPulse(target, delay, true), 0);
        });

        return tl;
    };

    useGSAP(
        () => {
            const topRow = topRowRef.current;
            const bottomRow = bottomRowRef.current;

            const topVideo = topVideoRef.current;
            const topClipPath = topClipPathRef.current;
            const topOverlayPath = topOverlayPathRef.current;
            const topOutlinePath = topOutlinePathRef.current;

            const bottomVideo = bottomVideoRef.current;
            const bottomClipPath = bottomClipPathRef.current;
            const bottomOverlayPath = bottomOverlayPathRef.current;
            const bottomOutlinePath = bottomOutlinePathRef.current;

            const topLetters = topLetterRefs.current.filter(Boolean);
            const bottomLetters = bottomLetterRefs.current.filter(Boolean);

            if (
                !topRow ||
                !bottomRow ||
                !topVideo ||
                !topClipPath ||
                !topOverlayPath ||
                !topOutlinePath ||
                !bottomVideo ||
                !bottomClipPath ||
                !bottomOverlayPath ||
                !bottomOutlinePath
            ) {
                return;
            }

            const topState = {rightX: TOP_START_RIGHT_X};
            const bottomState = {leftX: BOTTOM_START_LEFT_X};

            const renderTop = () => {
                const d = buildMPathRight(topState.rightX);
                topClipPath.setAttribute('d', d);
                topOverlayPath.setAttribute('d', d);
                topOutlinePath.setAttribute('d', d);
            };

            const renderBottom = () => {
                const d = buildMPathLeft(bottomState.leftX);
                bottomClipPath.setAttribute('d', d);
                bottomOverlayPath.setAttribute('d', d);
                bottomOutlinePath.setAttribute('d', d);
            };

            gsap.set(topRow, {
                xPercent: -135,
                opacity: 1,
                filter: 'blur(10px)',
                scale: 0.985,
                transformOrigin: 'center center',
            });

            gsap.set(bottomRow, {
                xPercent: 135,
                opacity: 1,
                filter: 'blur(10px)',
                scale: 0.985,
                transformOrigin: 'center center',
            });

            gsap.set([...topLetters, ...bottomLetters], {
                fill: '#ffffff',
                filter: 'drop-shadow(0 0 0px rgba(102,255,102,0))',
            });

            gsap.set([topOutlinePath, bottomOutlinePath], {
                stroke: '#ffffff',
                filter: 'drop-shadow(0 0 0px rgba(102,255,102,0))',
            });

            gsap.set([topVideo, bottomVideo], {
                opacity: 0,
                scale: 1.02,
                filter: 'blur(6px)',
                transformOrigin: 'center center',
            });

            gsap.set([topOverlayPath, bottomOverlayPath], {
                opacity: 0,
                fill: '#66FF66',
            });

            gsap.set(textRef.current, {
                opacity: 0,
                y: 18,
                filter: 'blur(8px)',
            });

            gsap.set(expandedVideoFrameRef.current, {
                autoAlpha: 0,
                scale: 1.025,
                filter: 'blur(14px)',
                transformOrigin: 'center center',
            });

            gsap.set(expandedPlayButtonRef.current, {
                autoAlpha: 0,
                scale: 0.94,
                transformOrigin: 'center center',
            });

            renderTop();
            renderBottom();

            const tl = gsap.timeline({
                paused: true,
                defaults: {
                    ease: 'power3.inOut',
                },
            });

            const resetIfBeforeThreshold = (
                video: HTMLVideoElement | null,
                threshold: number,
                currentTime: number,
            ) => {
                if (!video || currentTime >= threshold) {
                    return;
                }

                video.pause();

                if (video.currentTime !== 0) {
                    video.currentTime = 0;
                }
            };

            tl.eventCallback('onUpdate', () => {
                const currentTime = tl.time();

                resetIfBeforeThreshold(topVideoRef.current, VIDEO_REVEAL_START, currentTime);
                resetIfBeforeThreshold(bottomVideoRef.current, VIDEO_REVEAL_START, currentTime);
            });

            tl.eventCallback('onReverseComplete', () => {
                pauseVideos(true);
                tl.pause(0);
            });

            tl.to(
                textRef.current,
                {
                    opacity: 1,
                    y: 0,
                    filter: 'blur(0px)',
                    duration: 1.05,
                    ease: 'power2.out',
                },
                TEXT_REVEAL_START
            );

            // 1. cinematic въезд
            tl.to(
                topRow,
                {
                    xPercent: 0,
                    duration: 1.7,
                    ease: 'expo.out',
                    filter: 'blur(0px)',
                    scale: 1,
                },
                0
            ).to(
                bottomRow,
                {
                    xPercent: 0,
                    duration: 1.7,
                    ease: 'expo.out',
                    filter: 'blur(0px)',
                    scale: 1,
                },
                0.03
            );

// 2. flicker обычных букв
            tl.add(
                buildFlickerSection(topLetters, [], TOP_FLICKER_START),
                0
            );
            tl.add(
                buildFlickerSection(bottomLetters, [], BOTTOM_FLICKER_START),
                0
            );

// 3. M синхронно заполняются белым во время фликера остальных букв.
            tl.add(
                buildSyncedMActivation(
                    [topOutlinePath, bottomOutlinePath],
                    [topOverlayPath, bottomOverlayPath],
                    M_ACTIVATION_START,
                ),
                0
            );

// 4. как только M включились, они начинают расти
            tl.to(
                topState,
                {
                    rightX: topEndWidth,
                    duration: M_REVEAL_DURATION,
                    ease: 'power3.inOut',
                    onUpdate: renderTop,
                },
                M_REVEAL_START
            )
                .to(
                    bottomState,
                    {
                        leftX: bottomLeftX,
                        duration: M_REVEAL_DURATION,
                        ease: 'power3.inOut',
                        onUpdate: renderBottom,
                    },
                    M_REVEAL_START
                )

                .call(
                    () => {
                        playLetterVideos(true);
                        window.setTimeout(() => playLetterVideos(false), 80);
                    },
                    [],
                    VIDEO_REVEAL_START
                )

                // Белый слой уходит по мере появления видео внутри букв.
                .to(
                    [topVideo, bottomVideo],
                    {
                        opacity: 1,
                        scale: 1,
                        duration: 0.92,
                        ease: 'sine.out',
                    },
                    TOP_VIDEO_REVEAL_START
                )

                .to(
                    [topVideo, bottomVideo],
                    {
                        filter: 'blur(0px)',
                        duration: 0.82,
                        ease: 'sine.out',
                    },
                    TOP_VIDEO_REVEAL_START
                )

                .to(
                    [topOverlayPath, bottomOverlayPath],
                    {
                        opacity: 0,
                        duration: 0.78,
                        ease: 'sine.out',
                    },
                    TOP_VIDEO_REVEAL_START + 0.06
                )

                // Уже с середины расширения контур остается нейтрально белым.
                .to(
                    [topOutlinePath, bottomOutlinePath],
                    {
                        filter: 'drop-shadow(0 0 0px rgba(102,255,102,0))',
                        duration: 0.32,
                        ease: 'power1.out',
                    },
                    OUTLINE_TO_WHITE_START
                )

                // и сразу же контур начинает плавно уходить в белый
                .to(
                    [topOutlinePath, bottomOutlinePath],
                    {
                        stroke: '#ffffff',
                        filter: 'drop-shadow(0 0 0px rgba(102,255,102,0))',
                        duration: M_REVEAL_DURATION * 0.55,
                        ease: 'power2.out',
                    },
                    OUTLINE_TO_WHITE_START
                );

            timelineRef.current = tl;

            if (autoPlayTimeline) {
                tl.play(0);
            } else {
                tl.pause(0);
                pauseVideos(true);
            }

            return () => {
                clearExpandedPlayButtonTimeout();
                pauseVideos(true);
                timelineRef.current?.kill();
                expandedVideoTimelineRef.current?.kill();
                timelineRef.current = null;
                expandedVideoTimelineRef.current = null;
            };
        },
        {scope: rootRef, dependencies: [autoPlayTimeline, topEndWidth, bottomLeftX]}
    );

    useImperativeHandle(ref, () => ({
        playForward() {
            const timeline = timelineRef.current;

            if (!timeline) {
                return;
            }

            timeline.timeScale(1);
            timeline.play();

            if (timeline.time() >= VIDEO_REVEAL_START) {
                playLetterVideos(false);
                window.setTimeout(() => playLetterVideos(false), 80);
            }
        },
        playReverse() {
            const timeline = timelineRef.current;

            if (!timeline) {
                return;
            }

            pauseVideos();
            timeline.timeScale(1);
            timeline.reverse();
        },
        reset() {
            pauseVideos(true);
            timelineRef.current?.pause(0);
            expandedVideoTimelineRef.current?.kill();
            expandedVideoTimelineRef.current = null;
            isExpandedVideoVisibleRef.current = false;
            isExpandedVideoPlayingRef.current = false;
            syncExpandedPlayButtonState();
        },
        revealExpandedVideo() {
            const expandedFrame = expandedVideoFrameRef.current;
            const expandedVideo = expandedVideoRef.current;

            if (!expandedFrame || !expandedVideo || isExpandedVideoVisibleRef.current) {
                return;
            }

            if (!expandedVideo.getAttribute('src')) {
                expandedVideo.src = videoSrc;
                expandedVideo.load();
            }

            syncVideoTime(expandedVideo, topVideoRef.current?.currentTime ?? 0);
            expandedVideo.pause();
            isExpandedVideoVisibleRef.current = true;
            isExpandedVideoPlayingRef.current = false;
            syncExpandedPlayButtonState();
            clearExpandedPlayButtonTimeout();

            expandedVideoTimelineRef.current?.kill();
            expandedVideoTimelineRef.current = gsap.timeline({
                defaults: {
                    ease: 'sine.out',
                },
            });

            expandedVideoTimelineRef.current
                .to([
                    topOverlayPathRef.current,
                    bottomOverlayPathRef.current,
                ].filter(Boolean), {
                    autoAlpha: 1,
                    fill: '#ffffff',
                    duration: 0.42,
                    ease: 'sine.out',
                }, 0)
                .to([
                    topOutlinePathRef.current,
                    bottomOutlinePathRef.current,
                ].filter(Boolean), {
                    stroke: '#ffffff',
                    filter: 'drop-shadow(0 0 0px rgba(102,255,102,0))',
                    duration: 0.42,
                    ease: 'sine.out',
                }, 0)
                .to([
                    topRowRef.current,
                    bottomRowRef.current,
                    textRef.current,
                ].filter(Boolean), {
                    autoAlpha: 0,
                    filter: 'blur(14px)',
                    scale: 0.98,
                    duration: 0.72,
                    stagger: 0.04,
                    transformOrigin: 'center center',
                }, 0)
                .to(expandedFrame, {
                    autoAlpha: 1,
                    filter: 'blur(0px)',
                    scale: 1,
                    duration: 0.92,
                    ease: 'power2.out',
                }, 0.16);
            expandedVideoTimelineRef.current.to(expandedPlayButtonRef.current, {
                autoAlpha: 1,
                scale: 1,
                duration: 0.42,
                ease: 'power2.out',
            }, 0.48);
        },
        hideExpandedVideo() {
            const expandedFrame = expandedVideoFrameRef.current;
            const expandedVideo = expandedVideoRef.current;

            expandedVideoTimelineRef.current?.kill();
            clearExpandedPlayButtonTimeout();
            isExpandedVideoVisibleRef.current = false;
            isExpandedVideoPlayingRef.current = false;
            syncExpandedPlayButtonState();

            gsap.timeline({
                defaults: {
                    ease: 'sine.out',
                },
                onComplete: () => {
                    expandedVideo?.pause();
                    expandedVideo?.removeAttribute('src');
                    expandedVideo?.load();
                },
            })
                .to(expandedFrame, {
                    autoAlpha: 0,
                    filter: 'blur(12px)',
                    scale: 1.025,
                    duration: 0.36,
                }, 0)
                .to(expandedPlayButtonRef.current, {
                    autoAlpha: 0,
                    scale: 0.94,
                    duration: 0.2,
                }, 0)
                .to([
                    topRowRef.current,
                    bottomRowRef.current,
                    textRef.current,
                ].filter(Boolean), {
                    autoAlpha: 1,
                    filter: 'blur(0px)',
                    scale: 1,
                    duration: 0.42,
                    clearProps: 'visibility,opacity,filter,scale',
                }, 0.08)
                .to([
                    topOverlayPathRef.current,
                    bottomOverlayPathRef.current,
                ].filter(Boolean), {
                    autoAlpha: 0,
                    fill: '#66FF66',
                    duration: 0.24,
                }, 0.08);
        },
        fadeExpandedVideoOut() {
            if (!isExpandedVideoVisibleRef.current) {
                return;
            }

            gsap.to(expandedVideoFrameRef.current, {
                autoAlpha: 0,
                duration: 0.95,
                ease: 'sine.out',
                overwrite: 'auto',
                onComplete: resetExpandedVideoPlayback,
            });
            gsap.to(expandedPlayButtonRef.current, {
                autoAlpha: 0,
                scale: 0.94,
                duration: 0.32,
                ease: 'sine.out',
                overwrite: 'auto',
            });
        },
        fadeExpandedVideoIn() {
            if (!isExpandedVideoVisibleRef.current) {
                return;
            }

            gsap.to(expandedVideoFrameRef.current, {
                autoAlpha: 1,
                filter: 'blur(0px)',
                scale: 1,
                duration: 0.95,
                ease: 'sine.out',
                overwrite: 'auto',
            });
            gsap.to(expandedPlayButtonRef.current, {
                autoAlpha: isExpandedVideoPlayingRef.current ? 0 : 1,
                scale: isExpandedVideoPlayingRef.current ? 0.94 : 1,
                duration: 0.32,
                delay: 0.42,
                ease: 'sine.out',
                overwrite: 'auto',
            });
        },
        isExpandedVideoVisible() {
            return isExpandedVideoVisibleRef.current;
        },
    }));

    return (
        <section
            ref={rootRef}
            className={[
                'relative flex h-full min-h-0 w-full justify-center overflow-hidden px-6 py-[clamp(1rem,4vh,2.5rem)] md:px-10',
                className,
            ].join(' ')}
        >
            {/* Верхняя строка */}
            <div
                ref={expandedVideoFrameRef}
                className="absolute inset-x-6 top-[calc(var(--header-offset)+1rem)] z-0 h-[calc(var(--fullpage-height,100svh)-var(--header-offset)-2rem)] overflow-hidden bg-black opacity-0 md:inset-x-10"
                onClick={handleExpandedVideoFrameClick}
            >
                <video
                    ref={expandedVideoRef}
                    muted
                    playsInline
                    preload="none"
                    className="h-full w-full object-cover"
                    onEnded={handleExpandedVideoEnded}
                />
                <button
                    ref={expandedPlayButtonRef}
                    type="button"
                    data-playing="false"
                    className="group absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#66ff66] text-black opacity-0 shadow-[0_0_44px_rgba(102,255,102,0.42)] transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#66ff66]"
                    aria-label="Play video"
                    onClick={handleExpandedPlayButtonClick}
                    onPointerDown={handleExpandedPlayButtonPointerDown}
                    onPointerMove={handleExpandedPlayButtonPointerMove}
                    onPointerCancel={handleExpandedPlayButtonPointerCancel}
                    onPointerLeave={handleExpandedPlayButtonPointerLeave}
                    onMouseLeave={handleExpandedPlayButtonPointerLeave}
                >
                    <span
                        aria-hidden="true"
                        className="absolute ml-1 h-0 w-0 border-y-[13px] border-l-[20px] border-y-transparent border-l-black transition-[opacity,transform] duration-200 group-data-[playing=true]:scale-75 group-data-[playing=true]:opacity-0"
                    />
                    <span
                        aria-hidden="true"
                        className="absolute h-7 w-2 -translate-x-2 scale-75 bg-black opacity-0 transition-[opacity,transform] duration-200 group-data-[playing=true]:scale-100 group-data-[playing=true]:opacity-100"
                    />
                    <span
                        aria-hidden="true"
                        className="absolute h-7 w-2 translate-x-2 scale-75 bg-black opacity-0 transition-[opacity,transform] duration-200 group-data-[playing=true]:scale-100 group-data-[playing=true]:opacity-100"
                    />
                </button>
            </div>
            <div ref={topRowRef} className="relative z-10 flex gap-[36px]">
                <svg
                    width="214"
                    height="248"
                    viewBox="0 0 214 248"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="shrink-0"
                >
                    <path
                        ref={(el) => setTopLetterRef(el, 0)}
                        d="M144.63 247.71L103.85 176.27L63.71 247.71H0L71.04 123.14L0 0H68.81L107.36 67.49L144.95 0H208.66L139.85 120.62L213.44 247.71H144.63Z"
                        fill="white"
                    />
                </svg>

                <svg
                    width="211"
                    height="248"
                    viewBox="0 0 211 248"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="shrink-0"
                >
                    <path
                        ref={(el) => setTopLetterRef(el, 1)}
                        d="M0 181.29H2.55C15.29 181.29 23.47 175.07 27.08 162.62C30.69 150.18 32.5 130.07 32.5 102.31V0H210.9V247.71H147.19V61.03H91.44V102.31C91.44 131.51 90.01 155.62 87.14 174.65C84.27 193.68 79.65 208.52 73.28 219.17C66.91 229.82 58.63 237.24 48.43 241.43C38.24 245.62 25.92 247.71 11.48 247.71H0.00999451V181.3L0 181.29Z"
                        fill="white"
                    />
                </svg>

                <svg
                    width="237"
                    height="256"
                    viewBox="0 0 237 256"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="shrink-0"
                >
                    <path
                        ref={(el) => setTopLetterRef(el, 2)}
                        d="M71.85 0H164.24L232.09 247.71H164.87L152.13 200.32H74.72L61.98 247.71H4L71.85 0ZM89.05 146.47H137.79L113.26 54.93L89.05 146.47Z"
                        fill="white"
                    />
                </svg>

                <svg
                    width={topSvgWidth}
                    height={topSvgHeight}
                    viewBox={`0 0 ${topSvgWidth} ${topSvgHeight}`}
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="-ml-6 shrink-0 overflow-visible"
                >
                    <defs>
                        <clipPath id={topClipId} clipPathUnits="userSpaceOnUse">
                            <path ref={topClipPathRef} d={buildMPathRight(TOP_START_RIGHT_X)}/>
                        </clipPath>
                    </defs>

                    <foreignObject
                        x="0"
                        y="0"
                        width={topSvgWidth}
                        height={topSvgHeight}
                        clipPath={`url(#${topClipId})`}
                    >
                        <div className="relative h-full w-full">
                            <video
                                ref={topVideoRef}
                                src={videoSrc}
                                muted
                                playsInline
                                preload="auto"
                                className="h-full w-full object-cover"
                            />
                        </div>
                    </foreignObject>

                    <path
                        ref={topOverlayPathRef}
                        d={buildMPathRight(TOP_START_RIGHT_X)}
                        fill="#66FF66"
                    />

                    <path
                        ref={topOutlinePathRef}
                        d={buildMPathRight(TOP_START_RIGHT_X)}
                        fill="none"
                        stroke="white"
                        strokeWidth="5"
                    />
                </svg>
            </div>

            {/* Нижняя строка */}
            <div ref={bottomRowRef} className="relative z-10 mt-[clamp(1rem,4vh,2.5rem)] flex translate-x-[24px] gap-[36px]">
                <svg
                    width={bottomSvgWidth}
                    height={bottomSvgHeight}
                    viewBox={`${bottomSvgX} 0 ${bottomSvgWidth} ${bottomSvgHeight}`}
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="shrink-0 overflow-visible"
                >
                    <defs>
                        <clipPath id={bottomClipId} clipPathUnits="userSpaceOnUse">
                            <path ref={bottomClipPathRef} d={buildMPathLeft(BOTTOM_START_LEFT_X)}/>
                        </clipPath>
                    </defs>

                    <foreignObject
                        x={bottomSvgX}
                        y="0"
                        width={bottomSvgWidth}
                        height={bottomSvgHeight}
                        clipPath={`url(#${bottomClipId})`}
                    >
                        <div className="relative h-full w-full">
                            <video
                                ref={bottomVideoRef}
                                src={videoSrc}
                                muted
                                playsInline
                                preload="auto"
                                className="h-full w-full object-cover"
                            />
                        </div>
                    </foreignObject>

                    <path
                        ref={bottomOverlayPathRef}
                        d={buildMPathLeft(BOTTOM_START_LEFT_X)}
                        fill="#66FF66"
                    />

                    <path
                        ref={bottomOutlinePathRef}
                        d={buildMPathLeft(BOTTOM_START_LEFT_X)}
                        fill="none"
                        stroke="white"
                        strokeWidth="5"
                    />
                </svg>

                <svg
                    width="168"
                    height="248"
                    viewBox="0 0 168 248"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="-ml-4 shrink-0"
                >
                    <path
                        ref={(el) => setBottomLetterRef(el, 0)}
                        d="M0 0.00997925H165.66V59.24H63.72V91.55H140.49V148.99H63.72V188.48H167.26V247.71H0.0100098V0L0 0.00997925Z"
                        fill="white"
                    />
                </svg>

                <svg
                    width="201"
                    height="248"
                    viewBox="0 0 201 248"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="shrink-0"
                >
                    <path
                        ref={(el) => setBottomLetterRef(el, 1)}
                        d="M0 0.0299988H87.61C105.66 0.0299988 121.75 2.00001 135.87 5.95001C149.99 9.90001 161.83 16.66 171.39 26.23C180.95 35.81 188.22 48.55 193.21 64.46C198.2 80.38 200.7 100.18 200.7 123.87C200.7 147.56 198.2 167.73 193.21 183.64C188.22 199.56 180.95 212.24 171.39 221.69C161.83 231.15 149.99 237.84 135.87 241.79C121.74 245.74 105.66 247.71 87.61 247.71H0V0V0.0299988ZM87.61 186.71C103.32 186.71 115.22 183.66 123.29 177.56C131.36 171.46 135.4 158.71 135.4 139.33V107.74C135.4 89.79 131.36 77.53 123.29 70.94C115.22 64.36 103.32 61.07 87.61 61.07H63.72V186.72H87.61V186.71Z"
                        fill="#ffffff"
                    />
                </svg>

                <svg
                    width="64"
                    height="248"
                    viewBox="0 0 64 248"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="shrink-0"
                >
                    <path
                        ref={(el) => setBottomLetterRef(el, 2)}
                        d="M0 0H63.71V247.71H0V0Z"
                        fill="white"
                    />
                </svg>

                <svg
                    width="237"
                    height="256"
                    viewBox="0 0 237 256"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="shrink-0"
                >
                    <path
                        ref={(el) => setBottomLetterRef(el, 3)}
                        d="M71.85 0H164.24L232.09 247.71H164.87L152.13 200.32H74.72L61.98 247.71H4L71.85 0ZM89.05 146.47H137.79L113.26 54.93L89.05 146.47Z"
                        fill="white"
                    />
                </svg>
            </div>

            <div className="relative z-10 text-center">
                <p  ref={textRef} className="mt-[clamp(1rem,4vh,3.125rem)] text-[clamp(1.5rem,4.5vw,2.5rem)] font-bold uppercase leading-[1.14] text-white">
                    Мы делаем шоу для платформ, рекламу для брендов и <br/> контент для бизнеса. Такие дела.
                </p>
            </div>
        </section>
    );
});

export default MorphSection;
