'use client';

import { ReactNode } from 'react';
import type { CSSProperties } from 'react';

interface FullPageSectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

export default function FullPageSection({
  children,
  className = '',
  id,
}: FullPageSectionProps) {
  return (
    <section
      id={id}
      className={`flex w-full items-center justify-center overflow-hidden ${className}`}
      style={{ height: 'var(--fullpage-height, 100svh)' } as CSSProperties}
    >
      {children}
    </section>
  );
}
