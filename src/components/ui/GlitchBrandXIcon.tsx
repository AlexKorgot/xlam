'use client';

import { useRef, type CSSProperties } from 'react';
import { useGSAP } from '@gsap/react';
import clsx from 'clsx';
import gsap from 'gsap';
import { BrandXIcon } from '@/src/components/ui/BrandXIcon';

gsap.registerPlugin(useGSAP);

type GlitchBrandXIconProps = {
  fill?: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  style?: CSSProperties;
};

export function GlitchBrandXIcon({
  fill = 'currentColor',
  width = 24,
  height = 21,
  className,
  style,
}: GlitchBrandXIconProps) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const baseRef = useRef<HTMLSpanElement>(null);
  const topRef = useRef<HTMLSpanElement>(null);
  const bottomRef = useRef<HTMLSpanElement>(null);
  const redRef = useRef<HTMLSpanElement>(null);
  const greenRef = useRef<HTMLSpanElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useGSAP(
    () => {
      const targets = [
        baseRef.current,
        topRef.current,
        bottomRef.current,
        redRef.current,
        greenRef.current,
      ].filter(Boolean);

      if (
        !baseRef.current ||
        !topRef.current ||
        !bottomRef.current ||
        !redRef.current ||
        !greenRef.current
      ) {
        return;
      }

      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      gsap.set(targets, {
        x: 0,
        skewX: 0,
        transformOrigin: '50% 50%',
      });
      gsap.set([redRef.current, greenRef.current], {
        autoAlpha: 0,
      });

      if (reduceMotion) {
        return;
      }

      tlRef.current = gsap.timeline({
        paused: true,
        defaults: {
          ease: 'power4.inOut',
        },
      });

      tlRef.current
        .to([baseRef.current, topRef.current, bottomRef.current], {
          skewX: 22,
          duration: 0.1,
        })
        .to([baseRef.current, topRef.current, bottomRef.current], {
          skewX: 0,
          duration: 0.04,
        })
        .to(baseRef.current, {
          opacity: 0.35,
          duration: 0.04,
        })
        .to(baseRef.current, {
          opacity: 1,
          duration: 0.04,
        })
        .to([baseRef.current, topRef.current, bottomRef.current], {
          x: -4,
          duration: 0.04,
        })
        .to([baseRef.current, topRef.current, bottomRef.current], {
          x: 0,
          duration: 0.04,
        })
        .to([baseRef.current, topRef.current, bottomRef.current], {
          x: 2,
          duration: 0.015,
        })
        .to([baseRef.current, topRef.current, bottomRef.current], {
          x: -2,
          duration: 0.015,
        })
        .to([baseRef.current, topRef.current, bottomRef.current], {
          x: 0,
          duration: 0.015,
        })
        .add('split', 0)
        .to(
          topRef.current,
          {
            x: -1,
            duration: 0.15,
          },
          'split',
        )
        .to(
          bottomRef.current,
          {
            x: 1,
            duration: 0.15,
          },
          'split',
        )
        .to(
          redRef.current,
          {
            autoAlpha: 0.85,
            x: -2,
            duration: 0.08,
          },
          'split',
        )
        .to(
          greenRef.current,
          {
            autoAlpha: 0.85,
            x: 1,
            duration: 0.05,
          },
          'split+=0.03',
        )
        .to([redRef.current, greenRef.current], {
          autoAlpha: 0,
          x: 0,
          duration: 0.04,
        })
        .to([topRef.current, bottomRef.current], {
          x: 0,
          duration: 0.2,
        });

      return () => {
        tlRef.current?.kill();
        tlRef.current = null;
      };
    },
    { scope: rootRef },
  );

  const restartGlitch = () => tlRef.current?.restart();
  const rootStyle: CSSProperties = {
    width,
    height,
    ...style,
  };

  return (
    <span
      ref={rootRef}
      className={clsx('relative inline-flex shrink-0 items-center justify-center', className)}
      style={rootStyle}
      onMouseEnter={restartGlitch}
      onPointerEnter={restartGlitch}
    >
      <span ref={baseRef} className="absolute inset-0">
        <BrandXIcon fill={fill} height="100%" width="100%" />
      </span>
      <span
        ref={topRef}
        className="absolute inset-0"
        style={{ clipPath: 'inset(0 0 48% 0)' }}
      >
        <BrandXIcon fill={fill} height="100%" width="100%" />
      </span>
      <span
        ref={bottomRef}
        className="absolute inset-0"
        style={{ clipPath: 'inset(48% 0 0 0)' }}
      >
        <BrandXIcon fill={fill} height="100%" width="100%" />
      </span>
      <span ref={redRef} className="absolute inset-0 mix-blend-screen">
        <BrandXIcon fill="rgba(255,0,0,0.95)" height="100%" width="100%" />
      </span>
      <span ref={greenRef} className="absolute inset-0 mix-blend-screen">
        <BrandXIcon fill="rgba(0,255,0,0.9)" height="100%" width="100%" />
      </span>
    </span>
  );
}
