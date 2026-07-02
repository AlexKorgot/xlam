'use client';

import { useEffect } from 'react';
import type { MediaPreloadItem } from '@/src/lib/mediaPreload';
import { mediaPreloadManifest } from '@/src/lib/mediaPreload';

const loadedSources = new Set<string>();
const imageElements = new Map<string, HTMLImageElement>();
const videoElements = new Map<string, HTMLVideoElement>();
const preloadPromises = new Map<string, Promise<void>>();
let didStartMediaPreload = false;

const scheduleIdle = (callback: () => void) => {
  if (typeof window.requestIdleCallback === 'function') {
    return window.requestIdleCallback(callback, { timeout: 1600 });
  }

  return window.setTimeout(callback, 250);
};

const cancelIdle = (id: number) => {
  if (typeof window.cancelIdleCallback === 'function') {
    window.cancelIdleCallback(id);
    return;
  }

  window.clearTimeout(id);
};

const preloadImage = (src: string) => {
  const existingPromise = preloadPromises.get(src);

  if (existingPromise) {
    return existingPromise;
  }

  const promise = new Promise<void>((resolve) => {
    const image = new window.Image();

    const handleSettled = () => {
      image.removeEventListener('load', handleSettled);
      image.removeEventListener('error', handleSettled);
      resolve();
    };

    image.addEventListener('load', handleSettled, { once: true });
    image.addEventListener('error', handleSettled, { once: true });
    image.decoding = 'async';
    image.src = src;
    imageElements.set(src, image);

    void image.decode?.().then(handleSettled).catch(handleSettled);
  });

  preloadPromises.set(src, promise);

  return promise;
};

const preloadVideo = (src: string) => {
  const existingPromise = preloadPromises.get(src);

  if (existingPromise) {
    return existingPromise;
  }

  const promise = new Promise<void>((resolve) => {
    const video = document.createElement('video');
    const timeoutId = window.setTimeout(handleSettled, 8000);

    function handleSettled() {
      window.clearTimeout(timeoutId);
      video.removeEventListener('canplaythrough', handleSettled);
      video.removeEventListener('loadeddata', handleSettled);
      video.removeEventListener('error', handleSettled);
      resolve();
    }

    video.addEventListener('canplaythrough', handleSettled, { once: true });
    video.addEventListener('loadeddata', handleSettled, { once: true });
    video.addEventListener('error', handleSettled, { once: true });
    video.preload = 'auto';
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = 'anonymous';
    video.src = src;
    video.load();

    videoElements.set(src, video);
  });

  preloadPromises.set(src, promise);

  return promise;
};

const preloadItem = ({ src, kind }: MediaPreloadItem) => {
  if (loadedSources.has(src)) {
    return preloadPromises.get(src) ?? Promise.resolve();
  }

  loadedSources.add(src);

  if (kind === 'image') {
    return preloadImage(src);
  }

  return preloadVideo(src);
};

type MediaPreloaderProps = {
  items?: MediaPreloadItem[];
};

export function MediaPreloader({
  items = mediaPreloadManifest,
}: MediaPreloaderProps) {
  useEffect(() => {
    if (didStartMediaPreload) {
      return;
    }

    didStartMediaPreload = true;

    const immediatePromises = items
      .filter((item) => item.priority === 'immediate')
      .map(preloadItem);

    document.documentElement.dataset.mediaPreload = 'started';

    const idleId = scheduleIdle(() => {
      const idlePromises = items
        .filter((item) => item.priority === 'idle')
        .map(preloadItem);

      void Promise.allSettled([...immediatePromises, ...idlePromises]).then(() => {
        document.documentElement.dataset.mediaPreload = 'complete';
      });
    });

    return () => {
      cancelIdle(idleId);
    };
  }, [items]);

  return null;
}
