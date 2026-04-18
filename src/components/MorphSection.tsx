'use client';

import { useId, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

type MorphSectionProps = {
    videoSrc: string;
    autoPlayTimeline?: boolean;
    className?: string;
    topEndWidth?: number;
    bottomLeftX?: number;
};

const TOP_START_RIGHT_X = 234.5;
const BOTTOM_START_LEFT_X = 0;

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

export default function MorphSection({
                                         videoSrc,
                                         autoPlayTimeline = true,
                                         className = '',
                                         topEndWidth = 820,
                                         bottomLeftX = -585,
                                     }: MorphSectionProps) {
    const rootRef = useRef<HTMLDivElement | null>(null);
    const topRowRef = useRef<HTMLDivElement | null>(null);
    const bottomRowRef = useRef<HTMLDivElement | null>(null);

    const topVideoRef = useRef<HTMLVideoElement | null>(null);
    const topClipPathRef = useRef<SVGPathElement | null>(null);
    const topOverlayPathRef = useRef<SVGPathElement | null>(null);
    const topOutlinePathRef = useRef<SVGPathElement | null>(null);

    const bottomVideoRef = useRef<HTMLVideoElement | null>(null);
    const bottomClipPathRef = useRef<SVGPathElement | null>(null);
    const bottomOverlayPathRef = useRef<SVGPathElement | null>(null);
    const bottomOutlinePathRef = useRef<SVGPathElement | null>(null);




    const topClipId = useId().replace(/:/g, '') + '-top';
    const bottomClipId = useId().replace(/:/g, '') + '-bottom';

    const topSvgWidth = topEndWidth + 6;
    const topSvgHeight = 248;

    const bottomSvgX = bottomLeftX;
    const bottomSvgWidth = 234.5 - bottomLeftX + 6;
    const bottomSvgHeight = 248;

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

            const topState = { rightX: TOP_START_RIGHT_X };
            const bottomState = { leftX: BOTTOM_START_LEFT_X };

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
                xPercent: -120,
                opacity: 1,
            });

            gsap.set(bottomRow, {
                xPercent: 120,
                opacity: 1,
            });

            gsap.set([topRow, bottomRow], {
                filter: 'blur(6px)',
            });

            gsap.set([topVideo, bottomVideo], {
                opacity: 0,
                scale: 1.04,
                transformOrigin: 'center center',
            });

            gsap.set([topOverlayPath, bottomOverlayPath], {
                opacity: 1,
            });

            renderTop();
            renderBottom();

            const tl = gsap.timeline({
                paused: !autoPlayTimeline,
                defaults: {
                    ease: 'power3.inOut',
                },
            });

            // 1. Выезд строк с разных сторон
            tl.to(topRow, {
                xPercent: 0,
                duration: 1.5,
                ease: 'expo.out',
                filter: 'blur(0px)',
            }, 0).to(bottomRow, {
                xPercent: 0,
                duration: 1.5,
                ease: 'expo.out',
                filter: 'blur(0px)',
            }, 0);

            // 2. Твоя текущая анимация M + video
            tl.to(
                topState,
                {
                    rightX: topEndWidth,
                    duration: 0.9,
                    onUpdate: renderTop,
                },
                0.9
            ).to(
                bottomState,
                {
                    leftX: bottomLeftX,
                    duration: 0.9,
                    onUpdate: renderBottom,
                },
                0.9
            ).call(
                () => {
                    topVideo.currentTime = 0;
                    bottomVideo.currentTime = 0;

                    topVideo.play().catch(() => {});
                    bottomVideo.play().catch(() => {});
                },
                [],
                1.8
            ).to(
                [topOverlayPath, bottomOverlayPath],
                {
                    opacity: 0,
                    duration: 0.42,
                },
                1.72
            ).to(
                [topVideo, bottomVideo],
                {
                    opacity: 1,
                    scale: 1,
                    duration: 0.6,
                },
                1.72
            );

            if (autoPlayTimeline) {
                tl.play(0);
            }
        },
        { scope: rootRef, dependencies: [autoPlayTimeline, topEndWidth, bottomLeftX] }
    );

    return (
        <section
            ref={rootRef}
            className={[
                'w-full overflow-hidden bg-black px-6 py-8 md:px-10 md:py-10',
                className,
            ].join(' ')}
        >
            {/* Верхняя строка */}
            <div ref={topRowRef} className="flex gap-[36px]">
                <svg
                    width="214"
                    height="248"
                    viewBox="0 0 214 248"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="shrink-0"
                >
                    <path
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
                    className="shrink-0 overflow-visible"
                >
                    <defs>
                        <clipPath id={topClipId} clipPathUnits="userSpaceOnUse">
                            <path ref={topClipPathRef} d={buildMPathRight(TOP_START_RIGHT_X)} />
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
            <div ref={bottomRowRef} className="mt-10 flex gap-[36px]">
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
                            <path ref={bottomClipPathRef} d={buildMPathLeft(BOTTOM_START_LEFT_X)} />
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
                    className="shrink-0"
                >
                    <path
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
                    <path d="M0 0H63.71V247.71H0V0Z" fill="white" />
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
                        d="M71.85 0H164.24L232.09 247.71H164.87L152.13 200.32H74.72L61.98 247.71H4L71.85 0ZM89.05 146.47H137.79L113.26 54.93L89.05 146.47Z"
                        fill="white"
                    />
                </svg>
            </div>
        </section>
    );
}