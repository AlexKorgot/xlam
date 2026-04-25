'use client';

import { ReactNode } from 'react';

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
      className={`flex h-[100svh] w-full items-center justify-center ${className}`}
    >
      {children}
    </section>
  );
}
