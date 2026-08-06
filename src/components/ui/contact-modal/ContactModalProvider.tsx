'use client';

import {
  createContext,
  lazy,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { ContactModalContextValue } from './contactModal.types';

const loadContactModal = () =>
  import('./ContactModalNew').then(({ ContactModalNew: Component }) => ({
    default: Component,
  }));

const ContactModalNew = lazy(loadContactModal);

const ContactModalContext = createContext<ContactModalContextValue | null>(null);

type ContactModalProviderProps = {
  children: ReactNode;
};

export function ContactModalProvider({ children }: ContactModalProviderProps) {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [hasMountedContactModal, setHasMountedContactModal] = useState(false);

  useEffect(() => {
    const preloadOnIntent = () => {
      void loadContactModal();
      window.removeEventListener('pointerdown', preloadOnIntent, true);
      window.removeEventListener('keydown', preloadOnIntent, true);
    };

    window.addEventListener('pointerdown', preloadOnIntent, true);
    window.addEventListener('keydown', preloadOnIntent, true);

    return () => {
      window.removeEventListener('pointerdown', preloadOnIntent, true);
      window.removeEventListener('keydown', preloadOnIntent, true);
    };
  }, []);

  const openContactModal = useCallback(() => {
    setHasMountedContactModal(true);
    setIsContactModalOpen(true);
  }, []);

  const closeContactModal = useCallback(() => {
    setIsContactModalOpen(false);
  }, []);

  const value = useMemo<ContactModalContextValue>(
    () => ({
      isContactModalOpen,
      openContactModal,
      closeContactModal,
    }),
    [closeContactModal, isContactModalOpen, openContactModal],
  );

  return (
    <ContactModalContext.Provider value={value}>
      {children}
      {hasMountedContactModal ? (
        <Suspense fallback={null}>
          <ContactModalNew
            isOpen={isContactModalOpen}
            onClose={closeContactModal}
          />
        </Suspense>
      ) : null}
    </ContactModalContext.Provider>
  );
}

export function useContactModal() {
  const context = useContext(ContactModalContext);

  if (!context) {
    throw new Error('useContactModal must be used within ContactModalProvider');
  }

  return context;
}
