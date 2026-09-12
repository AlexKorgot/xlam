import type { StaticImageData } from 'next/image';
import type { ServiceModalBackground } from './serviceModalBackground';

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
  desktop: StaticImageData;
  mobile: StaticImageData;
}>;

export type ServiceSlide = {
  id: string;
  title: string;
  description: string;
  videoSrc?: string;
  poster: ServicePoster;
  modal: ServiceModalContent;
};
