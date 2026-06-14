'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { ContactModal } from './ContactModal';
import type { ContactModalContextValue } from './contactModal.types';

const ContactModalContext = createContext<ContactModalContextValue | null>(null);

type ContactModalProviderProps = {
  children: ReactNode;
};

export function ContactModalProvider({ children }: ContactModalProviderProps) {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const openContactModal = useCallback(() => {
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
      <ContactModal isOpen={isContactModalOpen} onClose={closeContactModal} />
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
