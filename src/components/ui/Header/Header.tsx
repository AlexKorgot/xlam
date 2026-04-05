'use client';

import { forwardRef, useImperativeHandle, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import clsx from 'clsx';
import { AnimatedLogo, type AnimatedLogoHandle } from '../AnimatedLogo';
import s from './Header.module.scss';

export interface HeaderHandle {
  setProgress: (progress: number) => void;
}

export const Header = forwardRef<HeaderHandle>(function Header(_props, ref) {
  const headerRef = useRef<HTMLElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<AnimatedLogoHandle>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const progressRef = useRef(0);

  useGSAP(
    () => {
      if (!leftRef.current || !rightRef.current) {
        return;
      }

      gsap.set([leftRef.current, rightRef.current], {
        autoAlpha: 0,
        y: -18,
      });

      timelineRef.current = gsap
        .timeline({
          paused: true,
          defaults: {
            ease: 'power2.out',
          },
        })
        .to(
          [leftRef.current, rightRef.current],
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.24,
            stagger: 0.04,
          },
          0.58,
        );

      timelineRef.current.progress(progressRef.current);

      return () => {
        timelineRef.current?.kill();
      };
    },
    { scope: headerRef },
  );

  useImperativeHandle(ref, () => ({
    setProgress(progress: number) {
      progressRef.current = gsap.utils.clamp(0, 1, progress);
      timelineRef.current?.progress(progressRef.current);
      logoRef.current?.setProgress(progressRef.current);
    },
  }));

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 px-4 pt-5 sm:px-8 sm:pt-7">
      <header
        ref={headerRef}
        className={clsx(
          s.header,
          'pointer-events-none mx-auto max-w-[1460px] uppercase',
        )}
      >
        <div ref={leftRef} className={clsx(s.left, 'pointer-events-auto')}>
          <span>УСЛУГИ</span>
          <span>ПОРТФОЛИО</span>
        </div>

        <div className={s.center}>
          <AnimatedLogo ref={logoRef} />
        </div>

        <div ref={rightRef} className={clsx(s.right, 'pointer-events-auto')}>
          <span>КОНТАКТЫ</span>
          <span>СВЯЗАТЬСЯ С НАМИ</span>
        </div>
      </header>
    </div>
  );
});
