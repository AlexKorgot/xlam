import React, { useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

type Slide = {
    id: number;
    title: string;
    meta: string;
    image: string;
};

const slidesData: Slide[] = [
    {
        id: 1,
        title: "Queen of the South",
        meta: "Cinematic interior scene",
        image:
            "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1400&q=80",
    },
    {
        id: 2,
        title: "Cruel Summer",
        meta: "Wide controlled studio frame",
        image:
            "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1400&q=80",
    },
    {
        id: 3,
        title: "The Chosen S02",
        meta: "Soft haze and centered subject",
        image:
            "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80",
    },
    {
        id: 4,
        title: "The Gifted S02",
        meta: "Minimal depth and edge falloff",
        image:
            "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1400&q=80",
    },
    {
        id: 5,
        title: "Night Sequence",
        meta: "Moody composition study",
        image:
            "https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1400&q=80",
    },
];

function wrapIndex(index: number, total: number) {
    return (index + total) % total;
}

function getShortestOffset(index: number, activeIndex: number, total: number) {
    let offset = index - activeIndex;
    const half = Math.floor(total / 2);

    if (offset > half) offset -= total;
    if (offset < -half) offset += total;

    return offset;
}

function getSlideStyle(offset: number) {
    const abs = Math.abs(offset);
    const sideClip =
        offset < 0
            ? "inset(0 0 0 10% round 22px)"
            : "inset(0 10% 0 0 round 22px)";

    if (offset === 0) {
        return {
            xPercent: 0,
            width: "58%",
            height: "74%",
            scale: 1,
            opacity: 1,
            blur: 0,
            brightness: 1,
            zIndex: 30,
            clipPath:
                "polygon(0% 0%, 100% 3%, 100% 97%, 0% 100%, 2.5% 50%)",
            pointerEvents: "auto" as const,
        };
    }

    if (abs === 1) {
        return {
            xPercent: offset * 176,
            width: "22%",
            height: "68%",
            scale: 0.92,
            opacity: 0.5,
            blur: 5,
            brightness: 0.62,
            zIndex: 20,
            clipPath: sideClip,
            pointerEvents: "auto" as const,
        };
    }

    return {
        xPercent: offset > 0 ? 260 : -260,
        width: "18%",
        height: "64%",
        scale: 0.88,
        opacity: 0,
        blur: 12,
        brightness: 0.45,
        zIndex: 0,
        clipPath: sideClip,
        pointerEvents: "none" as const,
    };
}

export default function MatchboxWarpSlider() {
    const [activeIndex, setActiveIndex] = useState(2);
    const rootRef = useRef<HTMLDivElement | null>(null);
    const slideRefs = useRef<(HTMLElement | null)[]>([]);
    const titleRef = useRef<HTMLDivElement | null>(null);
    const guardRef = useRef(false);

    const slides = useMemo(() => slidesData, []);

    const animateToState = () => {
        const timeline = gsap.timeline({
            defaults: { duration: 1.15, ease: "power3.inOut" },
        });

        slideRefs.current.forEach((slide, index) => {
            if (!slide) return;

            const offset = getShortestOffset(index, activeIndex, slides.length);
            const style = getSlideStyle(offset);

            const media = slide.querySelector("[data-media]");
            const overlay = slide.querySelector("[data-overlay]");
            const text = slide.querySelector("[data-text]");

            timeline.to(
                slide,
                {
                    xPercent: style.xPercent,
                    width: style.width,
                    height: style.height,
                    scale: style.scale,
                    opacity: style.opacity,
                    zIndex: style.zIndex,
                    clipPath: style.clipPath,
                    pointerEvents: style.pointerEvents,
                    overwrite: "auto",
                },
                0
            );

            if (media) {
                timeline.to(
                    media,
                    {
                        filter: `blur(${style.blur}px) brightness(${style.brightness})`,
                        scale: offset === 0 ? 1 : 1.06,
                        overwrite: "auto",
                    },
                    0
                );
            }

            if (overlay) {
                timeline.to(
                    overlay,
                    {
                        opacity: offset === 0 ? 0.14 : 0.42,
                        overwrite: "auto",
                    },
                    0
                );
            }

            if (text) {
                timeline.to(
                    text,
                    {
                        y: offset === 0 ? 0 : 18,
                        opacity: offset === 0 ? 1 : 0,
                        overwrite: "auto",
                    },
                    0
                );
            }
        });

        if (titleRef.current) {
            timeline
                .fromTo(
                    titleRef.current,
                    { y: 24, opacity: 0.45 },
                    { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
                    0.1
                )
                .fromTo(
                    titleRef.current.querySelectorAll("[data-line]"),
                    { yPercent: 115 },
                    { yPercent: 0, duration: 0.9, stagger: 0.04, ease: "power3.out" },
                    0.1
                );
        }
    };

    useGSAP(
        () => {
            slideRefs.current.forEach((slide, index) => {
                if (!slide) return;

                const offset = getShortestOffset(index, activeIndex, slides.length);
                const style = getSlideStyle(offset);
                const media = slide.querySelector("[data-media]");
                const overlay = slide.querySelector("[data-overlay]");
                const text = slide.querySelector("[data-text]");

                gsap.set(slide, {
                    left: "50%",
                    top: "50%",
                    xPercent: style.xPercent,
                    yPercent: -50,
                    x: 0,
                    width: style.width,
                    height: style.height,
                    scale: style.scale,
                    opacity: style.opacity,
                    zIndex: style.zIndex,
                    clipPath: style.clipPath,
                    transformOrigin: "center center",
                    pointerEvents: style.pointerEvents,
                });

                if (media) {
                    gsap.set(media, {
                        scale: offset === 0 ? 1 : 1.06,
                        filter: `blur(${style.blur}px) brightness(${style.brightness})`,
                    });
                }

                if (overlay) {
                    gsap.set(overlay, {
                        opacity: offset === 0 ? 0.14 : 0.42,
                    });
                }

                if (text) {
                    gsap.set(text, {
                        y: offset === 0 ? 0 : 18,
                        opacity: offset === 0 ? 1 : 0,
                    });
                }
            });

            if (titleRef.current) {
                gsap.set(titleRef.current, { opacity: 1 });
                gsap.set(titleRef.current.querySelectorAll("[data-line]"), {
                    yPercent: 0,
                });
            }

            if (!guardRef.current) {
                guardRef.current = true;
                return;
            }

            animateToState();
        },
        { scope: rootRef, dependencies: [activeIndex] }
    );

    const next = () => setActiveIndex((prev) => wrapIndex(prev + 1, slides.length));
    const prev = () => setActiveIndex((prev) => wrapIndex(prev - 1, slides.length));

    const activeSlide = slides[activeIndex];

    return (
        <section className="min-h-screen bg-[#111111] text-[#f2efe8]">
            <div
                ref={rootRef}
                className="relative mx-auto flex min-h-screen w-full max-w-[1800px] flex-col justify-center overflow-hidden px-4 py-10 md:px-8"
            >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,248,220,0.16),transparent_30%,transparent_58%,rgba(0,0,0,0.72)_100%)]" />
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.65)_0%,rgba(0,0,0,0.12)_20%,rgba(255,255,255,0.05)_50%,rgba(0,0,0,0.12)_80%,rgba(0,0,0,0.68)_100%)]" />

                <header className="relative z-20 mb-6 flex items-end justify-between gap-4 md:mb-10">
                    <div className="max-w-2xl">
                        <div className="mb-3 text-[11px] uppercase tracking-[0.38em] text-[#d8d0c2]/55">
                            Shot Here
                        </div>
                        <div ref={titleRef} className="overflow-hidden">
                            <div className="overflow-hidden">
                                <h2
                                    data-line
                                    className="text-[clamp(2.3rem,7vw,7rem)] font-black uppercase leading-[0.84] tracking-[-0.06em] text-[#ece7de]"
                                >
                                    More space.
                                </h2>
                            </div>
                            <div className="overflow-hidden">
                                <h2
                                    data-line
                                    className="text-[clamp(2.3rem,7vw,7rem)] font-black uppercase leading-[0.84] tracking-[-0.06em] text-[#ece7de]"
                                >
                                    Bigger stories.
                                </h2>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-30 flex shrink-0 gap-2 md:gap-3">
                        <button
                            onClick={prev}
                            className="rounded-full border border-white/12 bg-white/5 px-5 py-3 text-xs uppercase tracking-[0.25em] text-white/75 transition hover:bg-white/10"
                        >
                            Prev
                        </button>
                        <button
                            onClick={next}
                            className="rounded-full border border-white/12 bg-white/5 px-5 py-3 text-xs uppercase tracking-[0.25em] text-white/75 transition hover:bg-white/10"
                        >
                            Next
                        </button>
                    </div>
                </header>

                <div className="relative z-10 h-[58vh] min-h-[420px] w-full md:h-[62vh] md:min-h-[520px]">
                    {slides.map((slide, index) => (
                        <article
                            key={slide.id}
                            ref={(node) => {
                                slideRefs.current[index] = node;
                            }}
                            className="absolute -translate-x-1/2 overflow-hidden border border-white/6 bg-black/20 shadow-[0_30px_120px_rgba(0,0,0,0.45)]"
                        >
                            <div
                                data-media
                                className="absolute inset-0 bg-cover bg-center will-change-transform"
                                style={{ backgroundImage: `url(${slide.image})` }}
                            />

                            <div
                                data-overlay
                                className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.14)_0%,rgba(0,0,0,0.3)_100%)]"
                            />

                            <div className="absolute inset-0 ring-1 ring-inset ring-white/8" />

                            <div data-text className="absolute inset-x-0 bottom-0 p-5 md:p-7">
                                <div className="mb-2 text-[10px] uppercase tracking-[0.3em] text-[#e8e0d0]/55">
                                    {slide.meta}
                                </div>
                                <h3 className="max-w-[18ch] text-xl font-medium tracking-[-0.03em] text-[#f4efe6] md:text-3xl">
                                    {slide.title}
                                </h3>
                            </div>
                        </article>
                    ))}
                </div>

                <footer className="relative z-20 mt-6 flex items-end justify-between gap-6 md:mt-8">
                    <p className="max-w-3xl text-sm uppercase tracking-[0.16em] text-[#d8d0c2]/88 md:text-[18px]">
                        We have everything you need to bring your vision to life.
                    </p>

                    <div className="hidden min-w-[260px] justify-end md:flex">
                        <div className="text-right">
                            <div className="mb-1 text-[10px] uppercase tracking-[0.34em] text-white/40">
                                Active frame
                            </div>
                            <div className="text-base font-medium text-[#f4efe6]">{activeSlide.title}</div>
                        </div>
                    </div>
                </footer>
            </div>
        </section>
    );
}
