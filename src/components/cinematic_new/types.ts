import type { StaticImageData } from 'next/image';

export type CinematicOverlayState = 'slider' | 'sliding' | 'opening' | 'opened' | 'openedSliding' | 'closing';

export type CinematicSlide = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  tags: string[];
  client: string;
  year: string;
  accent: string;
  videoSrc: string;
  videoObjectPosition?: [number, number];
  opened: {
    titleLead: string;
    titleAccent: string;
    body: string;
    secondaryBody?: string;
    services: string[];
    previews?: {
      src: string | StaticImageData;
      alt: string;
    }[];
    navLabel: string;
    thumbnailCount: number;
  };
};

export type SliderSceneCallbacks = {
  onActiveSlideChange?: (index: number) => void;
  onOverlayStateChange?: (state: CinematicOverlayState) => void;
  onOpenedSlideTargetChange?: (index: number | null) => void;
  onAutoplayBlocked?: () => void;
};
