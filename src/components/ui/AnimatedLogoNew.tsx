'use client';

import { forwardRef  } from 'react';
import Image from 'next/image';
import Logo from '@/src/lib/assets/logo.svg';

export interface AnimatedLogoHandle {
  setProgress: (progress: number) => void;
}

export const AnimatedLogoNew = forwardRef<AnimatedLogoHandle>(function AnimatedLogo(
  _props,
  ref,
) {

  return (
    <div>
      <div
      >
        <div className="relative">
          <div
          >
            <Image
              src={Logo}
              alt="XLAM Media"
              unoptimized
              className="w-[95px] h-[48px] max-w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
});
