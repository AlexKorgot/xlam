'use client';

import { useEffect } from 'react';

const VIDEO_PRELOAD_TIMEOUT_MS = 8000;
type VideoCrossOrigin = 'anonymous' | 'use-credentials';

type VideoPreloadOptions = {
  crossOrigin?: VideoCrossOrigin;
};

type VideoPreloadRecord = {
  video: HTMLVideoElement;
  promise: Promise<void>;
};

const videoRecords = new Map<string, VideoPreloadRecord>();
const videoPreloadPromises = new Map<string, Promise<void>>();

const getVideoPreloadKey = (src: string, crossOrigin?: VideoCrossOrigin) =>
  `${crossOrigin ?? 'default'}:${src}`;

const createVideoPreloadRecord = (
  src: string,
  { crossOrigin }: VideoPreloadOptions = {},
) => {
  const key = getVideoPreloadKey(src, crossOrigin);
  const video = document.createElement('video');
  let resolvePromise: () => void = () => {};
  let isSettled = false;

  const promise = new Promise<void>((resolve) => {
    resolvePromise = resolve;
  });

  const handleSettled = () => {
    if (isSettled) {
      return;
    }

    isSettled = true;
    window.clearTimeout(timeoutId);
    video.removeEventListener('canplaythrough', handleSettled);
    video.removeEventListener('loadeddata', handleSettled);
    video.removeEventListener('error', handleError);
    resolvePromise();
  };

  const handleError = () => {
    handleSettled();
    videoRecords.delete(key);
    videoPreloadPromises.delete(key);
  };

  const timeoutId = window.setTimeout(handleSettled, VIDEO_PRELOAD_TIMEOUT_MS);

  video.addEventListener('canplaythrough', handleSettled, { once: true });
  video.addEventListener('loadeddata', handleSettled, { once: true });
  video.addEventListener('error', handleError, { once: true });
  video.preload = 'auto';
  video.muted = true;
  video.playsInline = true;

  if (crossOrigin) {
    video.crossOrigin = crossOrigin;
  }

  video.src = src;
  video.load();

  const record = { video, promise };
  videoRecords.set(key, record);
  videoPreloadPromises.set(key, promise);

  return record;
};

export function preloadVideo(src: string, options: VideoPreloadOptions = {}) {
  const key = getVideoPreloadKey(src, options.crossOrigin);
  const existingPromise = videoPreloadPromises.get(key);

  if (existingPromise) {
    return existingPromise;
  }

  return createVideoPreloadRecord(src, options).promise;
}

export function acquirePreloadedVideo(
  src: string,
  options: VideoPreloadOptions = {},
) {
  const key = getVideoPreloadKey(src, options.crossOrigin);

  return (videoRecords.get(key) ?? createVideoPreloadRecord(src, options)).video;
}

export function releasePreloadedVideo(
  src: string,
  video: HTMLVideoElement,
  options: VideoPreloadOptions = {},
) {
  const key = getVideoPreloadKey(src, options.crossOrigin);

  if (videoRecords.get(key)?.video !== video) {
    return;
  }

  videoRecords.delete(key);
  videoPreloadPromises.delete(key);
}

type UseVideoPreloadOptions = {
  enabled: boolean;
  mediaQuery: string;
  crossOrigin?: VideoCrossOrigin;
};

export function useVideoPreload(
  sources: readonly string[],
  { enabled, mediaQuery, crossOrigin }: UseVideoPreloadOptions,
) {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const media = window.matchMedia(mediaQuery);
    const startPreload = () => {
      if (!media.matches) {
        return;
      }

      sources.forEach((src) => {
        void preloadVideo(src, { crossOrigin });
      });
    };

    startPreload();
    media.addEventListener('change', startPreload);

    return () => {
      media.removeEventListener('change', startPreload);
    };
  }, [crossOrigin, enabled, mediaQuery, sources]);
}
