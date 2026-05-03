export type CinematicOverlayState = 'slider' | 'opening' | 'opened' | 'closing';

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
};

export type SliderSceneCallbacks = {
  onActiveSlideChange?: (index: number) => void;
  onOverlayStateChange?: (state: CinematicOverlayState) => void;
  onAutoplayBlocked?: () => void;
};

