'use client';

import { useEffect } from 'react';

type PerformanceDiagnosticsProps = {
  activeSectionIndex: number;
};

const isDebugPerformanceEnabled = () =>
  new URLSearchParams(window.location.search).get('debugPerformance') === '1';

const getVideoSummary = () => {
  const videos = Array.from(document.querySelectorAll<HTMLVideoElement>('video'));

  return {
    mounted: videos.length,
    playing: videos.filter((video) => !video.paused && !video.ended).length,
    sources: videos.map((video) => video.currentSrc || video.getAttribute('src') || '(none)'),
  };
};

export function PerformanceDiagnostics({
  activeSectionIndex,
}: PerformanceDiagnosticsProps) {
  useEffect(() => {
    if (!isDebugPerformanceEnabled()) {
      return;
    }

    console.info('[performance] active section', {
      activeSectionIndex,
      renderStates: Array.from(
        document.querySelectorAll<HTMLElement>('[data-section-render-state]'),
      ).map((section) => ({
        id: section.dataset.fullpageSectionId ?? section.id ?? '(anonymous)',
        state: section.dataset.sectionRenderState,
      })),
      videos: getVideoSummary(),
    });
  }, [activeSectionIndex]);

  useEffect(() => {
    if (!isDebugPerformanceEnabled()) {
      return;
    }

    const originalRequestAnimationFrame = window.requestAnimationFrame.bind(window);
    const originalCancelAnimationFrame = window.cancelAnimationFrame.bind(window);
    const pendingAnimationFrames = new Set<number>();
    let reportQueued = false;

    window.requestAnimationFrame = (callback: FrameRequestCallback) => {
      let frameId = 0;
      frameId = originalRequestAnimationFrame((time) => {
        pendingAnimationFrames.delete(frameId);
        callback(time);
      });
      pendingAnimationFrames.add(frameId);
      return frameId;
    };

    window.cancelAnimationFrame = (frameId: number) => {
      pendingAnimationFrames.delete(frameId);
      originalCancelAnimationFrame(frameId);
    };

    const report = (reason: string) => {
      console.info(`[performance] ${reason}`, {
        pendingAnimationFrames: pendingAnimationFrames.size,
        videos: getVideoSummary(),
      });
    };

    const queueReport = (reason: string) => {
      if (reportQueued) {
        return;
      }

      reportQueued = true;
      queueMicrotask(() => {
        reportQueued = false;
        report(reason);
      });
    };

    const handleMediaEvent = (event: Event) => {
      const video = event.target;

      if (!(video instanceof HTMLVideoElement)) {
        return;
      }

      console.info(`[performance] video ${event.type}`, {
        src: video.currentSrc || video.getAttribute('src') || '(none)',
        paused: video.paused,
      });
      queueReport('media state');
    };

    const observer = new MutationObserver((mutations) => {
      const hasRelevantMutation = mutations.some((mutation) =>
        mutation.type === 'childList' ||
        mutation.attributeName === 'src' ||
        mutation.attributeName === 'data-section-render-state');

      if (hasRelevantMutation) {
        queueReport('DOM/media mutation');
      }
    });

    observer.observe(document.documentElement, {
      attributeFilter: ['src', 'data-section-render-state'],
      attributes: true,
      childList: true,
      subtree: true,
    });

    const mediaEvents = ['play', 'pause', 'loadstart', 'emptied', 'error'] as const;
    mediaEvents.forEach((eventName) => {
      document.addEventListener(eventName, handleMediaEvent, true);
    });

    const intervalId = window.setInterval(() => {
      report('sample');
    }, 2000);

    report('diagnostics enabled');

    return () => {
      observer.disconnect();
      window.clearInterval(intervalId);
      mediaEvents.forEach((eventName) => {
        document.removeEventListener(eventName, handleMediaEvent, true);
      });
      window.requestAnimationFrame = originalRequestAnimationFrame;
      window.cancelAnimationFrame = originalCancelAnimationFrame;
    };
  }, []);

  return null;
}
