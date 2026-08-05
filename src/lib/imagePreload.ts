'use client';

import { useEffect } from 'react';

type ImageCrossOrigin = 'anonymous' | 'use-credentials';

type ImagePreloadOptions = {
  crossOrigin?: ImageCrossOrigin;
};

const imagePreloadPromises = new Map<string, Promise<void>>();
type ImagePreloadRecord = {
  image: HTMLImageElement;
  promise: Promise<void>;
};

const imageRecords = new Map<string, ImagePreloadRecord>();

const getImagePreloadKey = (src: string, crossOrigin?: ImageCrossOrigin) =>
  `${crossOrigin ?? 'default'}:${src}`;

const createImagePreloadRecord = (
  src: string,
  { crossOrigin }: ImagePreloadOptions = {},
) => {
  const key = getImagePreloadKey(src, crossOrigin);
  const image = new window.Image();
  const promise = new Promise<void>((resolve) => {
    const handleSettled = () => {
      image.removeEventListener('load', handleSettled);
      image.removeEventListener('error', handleSettled);
      resolve();
    };

    image.addEventListener('load', handleSettled, { once: true });
    image.addEventListener('error', handleSettled, { once: true });
    image.decoding = 'async';

    if (crossOrigin) {
      image.crossOrigin = crossOrigin;
    }

    image.src = src;

    void image.decode?.().then(handleSettled).catch(handleSettled);
  });

  const record = { image, promise };
  imageRecords.set(key, record);
  imagePreloadPromises.set(key, promise);

  return record;
};

export function preloadImage(src: string, options: ImagePreloadOptions = {}) {
  const key = getImagePreloadKey(src, options.crossOrigin);

  return (
    imagePreloadPromises.get(key) ?? createImagePreloadRecord(src, options).promise
  );
}

export function acquirePreloadedImage(
  src: string,
  options: ImagePreloadOptions = {},
) {
  const key = getImagePreloadKey(src, options.crossOrigin);

  return (imageRecords.get(key) ?? createImagePreloadRecord(src, options)).image;
}

export function releasePreloadedImage(
  src: string,
  image: HTMLImageElement,
  options: ImagePreloadOptions = {},
) {
  const key = getImagePreloadKey(src, options.crossOrigin);

  if (imageRecords.get(key)?.image !== image) {
    return;
  }

  imageRecords.delete(key);
  imagePreloadPromises.delete(key);
}

type UseImagePreloadOptions = {
  crossOrigin?: ImageCrossOrigin;
};

export function useImagePreload(
  sources: readonly string[],
  { crossOrigin }: UseImagePreloadOptions = {},
) {
  useEffect(() => {
    sources.forEach((src) => {
      void preloadImage(src, { crossOrigin });
    });
  }, [crossOrigin, sources]);
}
