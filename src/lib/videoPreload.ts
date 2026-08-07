'use client';

import { useEffect } from 'react';

const VIDEO_PRELOAD_TIMEOUT_MS = 8000;
type VideoCrossOrigin = 'anonymous' | 'use-credentials';

type VideoPreloadOptions = {
  crossOrigin?: VideoCrossOrigin;
  preload?: 'auto' | 'metadata' | 'none';
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
  { crossOrigin, preload = 'auto' }: VideoPreloadOptions = {},
) => {
  const key = getVideoPreloadKey(src, crossOrigin);
  const video = document.createElement('video');
  let resolvePromise: () => void = () => {};
  let isSettled = false;

  const promise = new Promise<void>((resolve) => {
    resolvePromise = resolve;
  });

  const cleanup = () => {
    window.clearTimeout(timeoutId);
    video.removeEventListener('canplaythrough', handleReady);
    video.removeEventListener('loadeddata', handleReady);
    video.removeEventListener('loadedmetadata', handleReady);
    video.removeEventListener('error', handleFailure);
  };

  const handleReady = () => {
    if (isSettled) {
      return;
    }

    isSettled = true;
    cleanup();
    resolvePromise();
  };

  const handleFailure = () => {
    if (isSettled) {
      return;
    }

    isSettled = true;
    cleanup();

    if (videoRecords.get(key)?.video === video) {
      videoRecords.delete(key);
      videoPreloadPromises.delete(key);
    }

    resolvePromise();
  };

  const timeoutId = window.setTimeout(() => {
    const requiredReadyState = preload === 'metadata'
      ? HTMLMediaElement.HAVE_METADATA
      : HTMLMediaElement.HAVE_CURRENT_DATA;

    if (video.readyState >= requiredReadyState) {
      handleReady();
      return;
    }

    handleFailure();
  }, VIDEO_PRELOAD_TIMEOUT_MS);

  video.addEventListener('canplaythrough', handleReady, { once: true });
  video.addEventListener('loadeddata', handleReady, { once: true });
  if (preload === 'metadata') {
    video.addEventListener('loadedmetadata', handleReady, { once: true });
  }
  video.addEventListener('error', handleFailure, { once: true });
  video.preload = preload;
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
  const record = videoRecords.get(key) ?? createVideoPreloadRecord(src, options);

  if (options.preload === 'auto' && record.video.preload !== 'auto') {
    record.video.preload = 'auto';
  }

  return record.video;
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
