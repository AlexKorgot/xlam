'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const minimumNoiseDuration = 520;
const fallbackNoiseDuration = 900;

function isInternalNavigationClick(event: MouseEvent) {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return false;
  }

  const target = event.target;

  if (!(target instanceof Element)) {
    return false;
  }

  const anchor = target.closest<HTMLAnchorElement>('a[href]');

  if (!anchor || anchor.hasAttribute('download')) {
    return false;
  }

  const targetWindow = anchor.getAttribute('target');

  if (targetWindow && targetWindow !== '_self') {
    return false;
  }

  const href = anchor.getAttribute('href');

  if (!href || href.startsWith('#')) {
    return false;
  }

  const url = new URL(href, window.location.href);

  if (url.origin !== window.location.origin) {
    return false;
  }

  const currentUrl = new URL(window.location.href);

  return url.pathname !== currentUrl.pathname || url.search !== currentUrl.search;
}

export function RouteNoiseOverlay() {
  const pathname = usePathname();
  const [isActive, setIsActive] = useState(false);
  const fallbackTimerRef = useRef<number | null>(null);
  const settleTimerRef = useRef<number | null>(null);

  const clearTimers = () => {
    if (fallbackTimerRef.current !== null) {
      window.clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }

    if (settleTimerRef.current !== null) {
      window.clearTimeout(settleTimerRef.current);
      settleTimerRef.current = null;
    }
  };

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!isInternalNavigationClick(event)) {
        return;
      }

      clearTimers();
      setIsActive(true);

      fallbackTimerRef.current = window.setTimeout(() => {
        setIsActive(false);
        fallbackTimerRef.current = null;
      }, fallbackNoiseDuration);
    };

    document.addEventListener('click', handleClick, true);

    return () => {
      document.removeEventListener('click', handleClick, true);
      clearTimers();
    };
  }, []);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    if (fallbackTimerRef.current !== null) {
      window.clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }

    settleTimerRef.current = window.setTimeout(() => {
      setIsActive(false);
      settleTimerRef.current = null;
    }, minimumNoiseDuration);
  }, [isActive, pathname]);

  return <div data-route-noise data-active={isActive ? 'true' : 'false'} aria-hidden="true" />;
}
