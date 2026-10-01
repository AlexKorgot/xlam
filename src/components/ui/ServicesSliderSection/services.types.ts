import type { ServiceImageSource, ServiceModalBackground } from './serviceModalBackground';

export type ServiceModalFeature = {
  title: string;
  description: string;
};

export type ServiceModalContent = {
  title: string;
  subtitle: string;
  description: string;
  ctaIntro: string;
  ctaLabel: string;
  backgroundImage: ServiceModalBackground;
  features: ServiceModalFeature[];
};

export type ServicePoster = Readonly<{
  desktop: ServiceImageSource;
  mobile: ServiceImageSource;
}>;

export type ServiceSlide = {
  id: string;
  title: string;
  description: string;
  videoSrc?: string;
  poster: ServicePoster;
  modal: ServiceModalContent;
};

export type ServicesContent = {
  slides: ServiceSlide[];
  closingText: string;
};
