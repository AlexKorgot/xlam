'use client';

import { ReactNode, useRef } from 'react';

interface FullPageSectionProps {
    children: ReactNode;
    className?: string;
}

export default function FullPageSection({ children, className = '' }: FullPageSectionProps) {
    const sectionRef = useRef<HTMLElement>(null);

    return (
        <section
            ref={sectionRef}
            className={`h-screen w-full flex items-center justify-center ${className}`}
        >
            {children}
        </section>
    );
}