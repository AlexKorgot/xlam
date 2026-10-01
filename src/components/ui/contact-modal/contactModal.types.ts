import type { SiteSettings } from '@/src/lib/siteSettings.types';

export type ContactModalContextValue = {
  settings: SiteSettings;
  isContactModalOpen: boolean;
  preloadContactModal: () => void;
  openContactModal: () => void;
  closeContactModal: () => void;
};
