'use client';

import { useEffect, useState, type RefObject } from 'react';

export function useNearViewport(
  targetRef: RefObject<Element | null>,
  rootMargin = '320px 0px',
) {
  const [isNearViewport, setIsNearViewport] = useState(false);

  useEffect(() => {
    if (isNearViewport) {
      return;
    }

    const target = targetRef.current;

    if (!target) {
      return;
    }

    if (typeof IntersectionObserver === 'undefined') {
      const fallbackId = window.setTimeout(() => {
        setIsNearViewport(true);
      }, 0);

      return () => {
        window.clearTimeout(fallbackId);
      };
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          return;
        }

        setIsNearViewport(true);
        observer.disconnect();
      },
      {
        rootMargin,
        threshold: 0.01,
      },
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [isNearViewport, rootMargin, targetRef]);

  return isNearViewport;
}
