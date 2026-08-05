'use client';

import { useEffect } from 'react';
import type { MediaPreloadItem } from '@/src/lib/mediaPreload';
import { mediaPreloadManifest } from '@/src/lib/mediaPreload';
import { preloadImage } from '@/src/lib/imagePreload';
import { preloadVideo } from '@/src/lib/videoPreload';

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

const preloadItem = ({ src, kind }: MediaPreloadItem) => {
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
