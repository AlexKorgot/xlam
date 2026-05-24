'use client';

import {
  createContext,
  type CSSProperties,
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
  const isImmersiveRoute = pathname === '/';
  const contentStyle = isImmersiveRoute
    ? undefined
    : ({ paddingTop: 'var(--header-offset)' } satisfies CSSProperties);
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
      <div style={contentStyle}>{children}</div>
    </HeaderProgressContext.Provider>
  );
}

export function useHeaderProgress() {
  return useContext(HeaderProgressContext);
}
