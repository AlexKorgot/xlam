'use client';

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Container } from "@/src/components/ui/grid/Container";
import { mediaAssetPath } from "@/src/lib/mediaAssetPath";
import { useNearViewport } from "@/src/lib/useNearViewport";
import styles from "./WhyUsSection.module.scss";

type FeatureBlockData = {
  label: string;
  className?: string;
};

const featureBlocks: FeatureBlockData[] = [
  {
    label: "Собственный парк оборудования",
    className: styles.cardEquipment,
  },
  {
    label: "Без рамок по формату",
    className: styles.cardFormat,
  },
  {
    label: "Создаём визуальные миры через брендинг, CGI и моушн",
    className: styles.cardWorlds,
  },
  {
    label: "Генеральный медиаподрядчик, а не аутсорс-лотерея",
    className: styles.cardContractor,
  },
  {
    label: "Senior-специалисты под каждую задачу",
    className: styles.cardSenior,
  },
  {
    label: "Работаем со всеми платформами и соцсетями",
    className: styles.cardPlatforms,
  },
  {
    label: "Актуальные AI-инструменты",
    className: styles.cardAi,
  },
  {
    label: "Гибкость под любой масштаб и бюджет",
    className: styles.cardScale,
  },
  {
    label: "Полный цикл медиауслуг",
    className: styles.cardCycle,
  },
];

const FEATURE_REVEAL_STEP_MS = 95;

function createRandomRevealDelays(count: number) {
  const order = Array.from({ length: count }, (_, index) => index);

  for (let index = order.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [order[index], order[randomIndex]] = [order[randomIndex], order[index]];
  }

  if (order.length > 1 && order.every((value, index) => value === index)) {
    [order[0], order[1]] = [order[1], order[0]];
  }

  const delays = Array<number>(count);
  order.forEach((featureIndex, revealIndex) => {
    delays[featureIndex] = revealIndex * FEATURE_REVEAL_STEP_MS;
  });

  return delays;
}

export function WhyUsSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [revealDelays, setRevealDelays] = useState<number[] | null>(null);
  const hasAnimatedIn = revealDelays !== null;
  const shouldLoadVideo = useNearViewport(sectionRef);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section || hasAnimatedIn) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          return;
        }

        setRevealDelays(createRandomRevealDelays(featureBlocks.length));
        observer.disconnect();
      },
      { threshold: 0.35 },
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
    };
  }, [hasAnimatedIn]);

  return (
    <section
      ref={sectionRef}
      className="relative isolate min-h-[100svh] overflow-hidden bg-black pt-[104px] font-normalidad text-white sm:pt-[128px] max-[999px]:[@media_(orientation:landscape)]:!pt-[60px] lg:h-[100svh] lg:pt-[150px]"
      aria-labelledby="why-us-heading"
    >
      <video
        aria-hidden="true"
        autoPlay
        className="pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover min-[1000px]:object-contain"
        muted
        playsInline
        preload="none"
        src={shouldLoadVideo ? mediaAssetPath("/balls.mp4") : undefined}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.14)_28%,rgba(0,0,0,0.62)_58%,rgba(0,0,0,0.82)_100%)] lg:hidden"
      />
      <Container>
        <div className="relative z-10 flex min-h-0 flex-col items-center">
          <h2
            id="why-us-heading"
            className="mx-auto w-full max-w-[713px] text-center text-[38px] font-black uppercase leading-[1.21] tracking-normal sm:text-5xl md:text-[56px] lg:text-[60px]"
          >
            ПОЧЕМУ <span className="text-[#66ff66]">МЫ</span>
          </h2>

          <ul
            aria-label="Преимущества"
            className={`${styles.featureList} ${hasAnimatedIn ? styles.featureListAnimated : ""} mt-[clamp(2rem,5svh,12rem)] max-[999px]:[@media_(orientation:landscape)]:!mt-[clamp(8px,2svh,16px)] md:mt-7`}
          >
            {featureBlocks.map((feature, index) => (
              <FeatureBlock
                key={`${feature.label}-${index}`}
                label={feature.label}
                className={feature.className}
                revealDelayMs={revealDelays?.[index]}
              />
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}

function FeatureBlock({
  label,
  className,
  revealDelayMs,
}: {
  label: string;
  className?: string;
  revealDelayMs?: number;
}) {
  const revealStyle = typeof revealDelayMs === "number"
    ? ({ "--feature-delay": `${revealDelayMs}ms` } as CSSProperties)
    : undefined;

  return (
    <li
      className={`${styles.featureBlock} ${className ?? ""}`}
      style={revealStyle}
    >
      <span className="text-balance">{label}</span>
    </li>
  );
}
