import type { StaticImageData } from 'next/image';
import adsModalDesktop from './assets/ads-modal.desktop.webp';
import adsModalMobile from './assets/ads-modal.mobile.webp';
import b2bModalDesktop from './assets/b2b-modal.desktop.webp';
import b2bModalMobile from './assets/b2b-modal.mobile.webp';
import brandModalDesktop from './assets/brand.desktop.webp';
import brandModalMobile from './assets/brand.mobile.webp';
import brandingModalDesktop from './assets/branding-modal.desktop.webp';
import brandingModalMobile from './assets/branding-modal.mobile.webp';
import showModalDesktop from './assets/show-modal.desktop.webp';
import showModalMobile from './assets/show-modal.mobile.webp';

export type ServiceModalBackground = Readonly<{
  desktop: StaticImageData;
  mobile: StaticImageData;
}>;

export const serviceModalBackgrounds = {
  ads: {
    desktop: adsModalDesktop,
    mobile: adsModalMobile,
  },
  b2b: {
    desktop: b2bModalDesktop,
    mobile: b2bModalMobile,
  },
  brand: {
    desktop: brandModalDesktop,
    mobile: brandModalMobile,
  },
  branding: {
    desktop: brandingModalDesktop,
    mobile: brandingModalMobile,
  },
  show: {
    desktop: showModalDesktop,
    mobile: showModalMobile,
  },
} as const satisfies Record<string, ServiceModalBackground>;

export const serviceModalBackgroundList = Object.values(serviceModalBackgrounds);

const mobileBackgroundMediaQuery = '(max-width: 999.98px)';
const backgroundPreloadPromises = new Map<string, Promise<void>>();

export function getServiceModalBackgroundSource(
  background: ServiceModalBackground,
) {
  if (
    typeof window !== 'undefined' &&
    window.matchMedia(mobileBackgroundMediaQuery).matches
  ) {
    return background.mobile.src;
  }

  return background.desktop.src;
}

export function preloadServiceModalBackground(
  background: ServiceModalBackground,
) {
  if (typeof window === 'undefined') {
    return Promise.resolve();
  }

  const source = getServiceModalBackgroundSource(background);
  const cachedPromise = backgroundPreloadPromises.get(source);

  if (cachedPromise) {
    return cachedPromise;
  }

  const preloadPromise = new Promise<void>((resolve) => {
    const image = new window.Image();
    let isSettled = false;

    const settle = () => {
      if (isSettled) {
        return;
      }

      isSettled = true;
      window.clearTimeout(fallbackTimeout);
      resolve();
    };

    const decodeAndSettle = () => {
      if (typeof image.decode !== 'function') {
        settle();
        return;
      }

      void image.decode().catch(() => undefined).finally(settle);
    };

    const fallbackTimeout = window.setTimeout(settle, 4000);

    image.decoding = 'async';
    image.onload = decodeAndSettle;
    image.onerror = () => {
      backgroundPreloadPromises.delete(source);
      settle();
    };
    image.src = source;

    if (image.complete) {
      decodeAndSettle();
    }
  });

  backgroundPreloadPromises.set(source, preloadPromise);
  return preloadPromise;
}
