import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { preloadServiceModalBackground } from './serviceModalBackground';
import type { ServiceModalContent } from './services.types';

type DisplayedModalState = {
  content: ServiceModalContent;
  previousLabel: string;
  currentLabel: string;
  nextLabel: string;
};

const contentSwitchExitDuration = 180;

export function useServiceModalTransition({
  content, previousLabel, currentLabel, nextLabel, isOpen,
}: DisplayedModalState & { isOpen: boolean }) {
  const nextDisplayedState = useMemo<DisplayedModalState>(
    () => ({
      content,
      previousLabel,
      currentLabel,
      nextLabel,
    }),
    [content, currentLabel, nextLabel, previousLabel],
  );
  const [displayedState, setDisplayedState] =
    useState<DisplayedModalState>(nextDisplayedState);
  const [preparedContent, setPreparedContent] = useState(content);
  const displayedStateRef = useRef(nextDisplayedState);
  const [isContentVisible, setIsContentVisible] = useState(true);
  const contentSwitchTimeoutRef = useRef<number | null>(null);
  const contentSwitchFrameRef = useRef<number | null>(null);

  if (preparedContent !== content) {
    setPreparedContent(content);

    if (!isOpen) {
      setDisplayedState(nextDisplayedState);
      setIsContentVisible(true);
    }
  }

  useLayoutEffect(() => {
    if (!isOpen) {
      displayedStateRef.current = displayedState;
    }
  }, [displayedState, isOpen]);

  const clearContentSwitchTimers = () => {
    if (contentSwitchTimeoutRef.current !== null) {
      window.clearTimeout(contentSwitchTimeoutRef.current);
      contentSwitchTimeoutRef.current = null;
    }

    if (contentSwitchFrameRef.current !== null) {
      window.cancelAnimationFrame(contentSwitchFrameRef.current);
      contentSwitchFrameRef.current = null;
    }
  };

  useEffect(() => {
    let isCancelled = false;

    if (!isOpen) {
      clearContentSwitchTimers();
      return;
    }

    if (displayedStateRef.current.content === content) {
      return;
    }

    clearContentSwitchTimers();

    void preloadServiceModalBackground(content.backgroundImage).then(() => {
      if (isCancelled) {
        return;
      }

      contentSwitchFrameRef.current = window.requestAnimationFrame(() => {
        contentSwitchFrameRef.current = null;
        setIsContentVisible(false);

        contentSwitchTimeoutRef.current = window.setTimeout(() => {
          displayedStateRef.current = nextDisplayedState;
          setDisplayedState(nextDisplayedState);

          contentSwitchFrameRef.current = window.requestAnimationFrame(() => {
            contentSwitchFrameRef.current = null;
            setIsContentVisible(true);
          });

          contentSwitchTimeoutRef.current = null;
        }, contentSwitchExitDuration);
      });
    });

    return () => {
      isCancelled = true;
      clearContentSwitchTimers();
    };
  }, [content, isOpen, nextDisplayedState]);

  const contentTransitionClass = [
    'transition-opacity duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
    isContentVisible ? 'opacity-100' : 'opacity-0',
  ].join(' ');
  const backgroundTransitionClass = [
    'pointer-events-none absolute inset-0 transition-opacity duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
    isContentVisible ? 'opacity-100' : 'opacity-0',
  ].join(' ');

  return { displayedState, contentTransitionClass, backgroundTransitionClass };
}
