import type { StaticImageData } from 'next/image';
import { publicAssetPath } from '@/src/lib/publicAssetPath';
import logo from '@/src/lib/assets/logo.svg';
import logoBig from '@/src/lib/assets/logo_big.svg';
import sliderBackground from '@/src/lib/assets/slider_bg.png';
import teleImage from '@/src/lib/assets/tele.png';
import headerPlateImage from '@/src/lib/assets/main/rectangle.png';
import springImage from '@/src/lib/assets/main/spring.png';
import sphereImage from '@/src/lib/assets/main/circle.png';
import stoneMImage from '@/src/lib/assets/main/m.png';
import greenBrickImage from '@/src/lib/assets/main/lego_green.png';
import furryXImage from '@/src/lib/assets/main/x.png';
import shieldImage from '@/src/lib/assets/main/sield.png';
import tubeImage from '@/src/lib/assets/main/tube.png';
import darkBrickImage from '@/src/lib/assets/main/lego_dark.png';
import textGeneralBackground from '@/src/components/textSection/assets/img/general_bg.png';
import textBlueTop from '@/src/components/textSection/assets/img/blue_top.png';
import textBlueBottom from '@/src/components/textSection/assets/img/blue_bottom.png';
import textGreenTop from '@/src/components/textSection/assets/img/green_top.png';
import textGreenBottom from '@/src/components/textSection/assets/img/green_bottom.png';
import textGrayTop from '@/src/components/textSection/assets/img/gray_top.png';
import textGrayBottom from '@/src/components/textSection/assets/img/gray_bottom.png';
import textModalBottom from '@/src/components/textSection/assets/img/modal_bottom.png';
import servicesAdsModal from '@/src/components/ui/ServicesSliderSection/assets/ads-modal.png';
import servicesB2bModal from '@/src/components/ui/ServicesSliderSection/assets/b2b-modal.png';
import servicesBrandModal from '@/src/components/ui/ServicesSliderSection/assets/brand.png';
import servicesBrandingModal from '@/src/components/ui/ServicesSliderSection/assets/branding-modal.png';
import servicesShowModal from '@/src/components/ui/ServicesSliderSection/assets/show-modal.png';
import teamPersonOne from '@/src/components/ui/TeamSection/assets/07A kopia_13 1.png';
import teamPersonTwo from '@/src/components/ui/TeamSection/assets/07A kopia_13 1 (1).png';
import teamPersonThree from '@/src/components/ui/TeamSection/assets/07A kopia_13 1 (2).png';
import teamPersonFour from '@/src/components/ui/TeamSection/assets/07A kopia_13 1 (3).png';
import teamPersonFive from '@/src/components/ui/TeamSection/assets/07A kopia_13 1 (4).png';
import teamEvgeniyMalov from '@/src/components/ui/TeamSection/assets/evgeniy-malov.png';
import whyUsBalls from '@/src/components/ui/WhyUsSection/why-us-balls.png';
import cinematicMerPreviewOne from '@/src/components/cinematic_new/assets/mer/mer1.png';
import cinematicMerPreviewTwo from '@/src/components/cinematic_new/assets/mer/mer2.png';
import cinematicShowPreviewOne from '@/src/components/cinematic_new/assets/mer/show1.png';
import cinematicShowPreviewTwo from '@/src/components/cinematic_new/assets/mer/show2.png';
import cinematicPodcastPreviewOne from '@/src/components/cinematic_new/assets/mer/podcast1.png';
import cinematicPodcastPreviewTwo from '@/src/components/cinematic_new/assets/mer/podcast2.png';

export type MediaPreloadKind = 'image' | 'video';
export type MediaPreloadPriority = 'immediate' | 'idle';

export type MediaPreloadItem = {
  src: string;
  kind: MediaPreloadKind;
  priority: MediaPreloadPriority;
};

type ImageAsset = StaticImageData | { src: string } | string;

const imageSrc = (asset: ImageAsset) =>
  typeof asset === 'string' ? asset : asset.src;

const image = (
  asset: ImageAsset,
  priority: MediaPreloadPriority = 'idle',
): MediaPreloadItem => ({
  src: imageSrc(asset),
  kind: 'image',
  priority,
});

const video = (
  path: `/${string}`,
  priority: MediaPreloadPriority = 'idle',
): MediaPreloadItem => ({
  src: publicAssetPath(path),
  kind: 'video',
  priority,
});

export const mediaPreloadManifest: MediaPreloadItem[] = [
  image(logo, 'immediate'),
  image(logoBig, 'immediate'),
  video('/video/only_bg.mp4', 'immediate'),

  image(sliderBackground),
  image(teleImage),
  image(headerPlateImage),
  image(springImage),
  image(sphereImage),
  image(stoneMImage),
  image(greenBrickImage),
  image(furryXImage),
  image(shieldImage),
  image(tubeImage),
  image(darkBrickImage),
  image(textGeneralBackground),
  image(textBlueTop),
  image(textBlueBottom),
  image(textGreenTop),
  image(textGreenBottom),
  image(textGrayTop),
  image(textGrayBottom),
  image(textModalBottom),
  image(servicesAdsModal),
  image(servicesB2bModal),
  image(servicesBrandModal),
  image(servicesBrandingModal),
  image(servicesShowModal),
  image(publicAssetPath('/video/services/posters/5.png')),
  image(teamPersonOne),
  image(teamPersonTwo),
  image(teamPersonThree),
  image(teamPersonFour),
  image(teamPersonFive),
  image(teamEvgeniyMalov),
  image(whyUsBalls),
  image(cinematicMerPreviewOne),
  image(cinematicMerPreviewTwo),
  image(cinematicShowPreviewOne),
  image(cinematicShowPreviewTwo),
  image(cinematicPodcastPreviewOne),
  image(cinematicPodcastPreviewTwo),

  video('/video/balls.mp4'),
  video('/video/Mer.mp4'),
  video('/video/now.mp4'),
  video('/video/vote.mp4'),
  video('/video/timessquarenightwide.mp4'),
  video('/video/services/1.mp4'),
  video('/video/services/2.mp4'),
  video('/video/services/3.mp4'),
  video('/video/services/4.mp4'),
];
