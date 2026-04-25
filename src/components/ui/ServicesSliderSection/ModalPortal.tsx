'use client';

import { useSyncExternalStore, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

type ModalPortalProps = {
  children: ReactNode;
  container?: Element | null;
  rootId?: string;
};

const subscribe = () => () => undefined;
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function ModalPortal({
  children,
  container,
  rootId,
}: ModalPortalProps) {
  const isClient = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  if (!isClient) {
    return null;
  }

  const target =
    container ??
    (rootId ? document.getElementById(rootId) : null) ??
    document.body;

  return createPortal(children, target);
}
