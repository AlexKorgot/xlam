export type CinematicOverlayState = 'slider' | 'sliding' | 'opening' | 'opened' | 'closing';

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
    navLabel: string;
    thumbnailCount: number;
  };
};

export type SliderSceneCallbacks = {
  onActiveSlideChange?: (index: number) => void;
  onOverlayStateChange?: (state: CinematicOverlayState) => void;
  onAutoplayBlocked?: () => void;
};
