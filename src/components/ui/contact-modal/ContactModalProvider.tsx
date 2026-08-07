'use client';

import {
  createContext,
  lazy,
  Suspense,
  useCallback,
  useContext,
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

  const preloadContactModal = useCallback(() => {
    void loadContactModal();
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
      preloadContactModal,
      openContactModal,
      closeContactModal,
    }),
    [closeContactModal, isContactModalOpen, openContactModal, preloadContactModal],
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
