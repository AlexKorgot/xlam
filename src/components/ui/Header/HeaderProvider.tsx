'use client';

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from 'react';
import { usePathname } from 'next/navigation';
import { Header, type HeaderHandle } from '@/src/components/ui/Header/Header';

type SetHeaderProgress = (progress: number) => void;

const HeaderProgressContext = createContext<SetHeaderProgress>(() => {});

function getInitialHeaderProgress(pathname: string) {
  return pathname === '/' ? 0 : 1;
}

export function HeaderProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const initialProgress = getInitialHeaderProgress(pathname);
  const headerRef = useRef<HeaderHandle>(null);

  const setHeaderProgress = useCallback<SetHeaderProgress>((progress) => {
    headerRef.current?.setProgress(progress);
  }, []);

  useEffect(() => {
    setHeaderProgress(getInitialHeaderProgress(pathname));
  }, [pathname, setHeaderProgress]);

  return (
    <HeaderProgressContext.Provider value={setHeaderProgress}>
      <Header ref={headerRef} initialProgress={initialProgress} />
      {children}
    </HeaderProgressContext.Provider>
  );
}

export function useHeaderProgress() {
  return useContext(HeaderProgressContext);
}
