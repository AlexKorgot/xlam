'use client';

import { ReactNode } from 'react';
import type { CSSProperties } from 'react';

interface FullPageSectionProps {
  children: ReactNode;
  className?: string;
  fullBleed?: boolean;
  id?: string;
}

export default function FullPageSection({
  children,
  className = '',
  fullBleed = false,
  id,
}: FullPageSectionProps) {
  return (
    <section
      id={id}
      className={`flex w-full items-center justify-center overflow-hidden ${fullBleed ? '[&>*]:w-full' : ''} ${className}`}
      style={{ height: 'var(--fullpage-height, 100svh)' } as CSSProperties}
    >
      {children}
    </section>
  );
}
