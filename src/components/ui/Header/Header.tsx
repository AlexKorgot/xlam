'use client';

import { forwardRef, useImperativeHandle, useRef } from 'react';
import HeaderDesktop from '@/src/components/ui/Header/HeaderDesktop';
import HeaderMobile from '@/src/components/ui/Header/HeaderMobile';
import type { HeaderHandle } from '@/src/components/ui/Header/types';

export type { HeaderHandle } from '@/src/components/ui/Header/types';

interface HeaderProps {
  initialProgress?: number;
}

export const Header = forwardRef<HeaderHandle, HeaderProps>(function Header(
  { initialProgress = 0 },
  ref,
) {
  const desktopRef = useRef<HeaderHandle>(null);
  const mobileRef = useRef<HeaderHandle>(null);

  useImperativeHandle(ref, () => ({
    setProgress(progress: number) {
      desktopRef.current?.setProgress(progress);
      mobileRef.current?.setProgress(progress);
    },
  }));

  return (
    <>
      <HeaderDesktop ref={desktopRef} initialProgress={initialProgress} />
      <HeaderMobile ref={mobileRef} initialProgress={initialProgress} />
    </>
  );
});
