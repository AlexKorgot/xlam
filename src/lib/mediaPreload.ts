import type { StaticImageData } from 'next/image';
import { mediaAssetPath, remoteImageAsset } from '@/src/lib/mediaAssetPath';
import logoBig from '@/src/lib/assets/logo_big.svg';
import sliderBackground from '@/src/lib/assets/slider_bg.png';
import teleImage from '@/src/lib/assets/tele.png';
import headerPlateImage from '@/src/lib/assets/main/rectangle.png';
import whyUsBalls from '@/src/components/ui/WhyUsSection/why-us-balls.png';

const logo = remoteImageAsset('/logo.svg', 110, 56);
const springImage = remoteImageAsset('/spring.png', 2160, 2160);
const sphereImage = remoteImageAsset('/circle.png', 485, 485);
const stoneMImage = remoteImageAsset('/m.png', 810, 626);
const greenBrickImage = remoteImageAsset('/lego_green.png', 2160, 2160);
const furryXImage = remoteImageAsset('/x.png', 1024, 1024);
const shieldImage = remoteImageAsset('/sield.png', 500, 500);
const tubeImage = remoteImageAsset('/tube.png', 2160, 2160);
const darkBrickImage = remoteImageAsset('/lego_dark.png', 2160, 2160);
const textGeneralBackground = remoteImageAsset('/general_bg.png', 1920, 1080);
const textBlueTop = remoteImageAsset('/blue_top.png', 1920, 890);
const textBlueBottom = remoteImageAsset('/blue_bottom.png', 1920, 730);
const textGreenTop = remoteImageAsset('/green_top.png', 1920, 970);
const textGreenBottom = remoteImageAsset('/green_bottom.png', 1920, 840);
const textGrayTop = remoteImageAsset('/gray_top.png', 1920, 930);
const textGrayBottom = remoteImageAsset('/gray_bottom.png', 1920, 820);
const textModalBottom = remoteImageAsset('/modal_bottom.png', 378, 215);
const servicesAdsModal = remoteImageAsset('/ads-modal.png', 1756, 829);
const servicesB2bModal = remoteImageAsset('/b2b-modal.png', 1756, 829);
const servicesBrandModal = remoteImageAsset('/brand.png', 1756, 829);
const servicesBrandingModal = remoteImageAsset('/branding-modal.png', 1756, 829);
const servicesShowModal = remoteImageAsset('/show-modal.png', 1800, 860);
const teamPersonOne = remoteImageAsset('/07A kopia_13 1.png', 388, 704);
const teamPersonTwo = remoteImageAsset('/07A kopia_13 1 (1).png', 388, 704);
const teamPersonThree = remoteImageAsset('/07A kopia_13 1 (2).png', 388, 704);
const teamPersonFour = remoteImageAsset('/07A kopia_13 1 (3).png', 388, 704);
const teamPersonFive = remoteImageAsset('/07A kopia_13 1 (4).png', 388, 704);
const teamEvgeniyMalov = remoteImageAsset('/evgeniy-malov.png', 648, 1176);
const cinematicMerPreviewOne = remoteImageAsset('/mer1.png', 412, 208);
const cinematicMerPreviewTwo = remoteImageAsset('/mer2.png', 412, 208);
const cinematicShowPreviewOne = remoteImageAsset('/podcast1.png', 412, 208);
const cinematicShowPreviewTwo = remoteImageAsset('/podcast2.png', 412, 208);
const cinematicPodcastPreviewOne = remoteImageAsset('/show1.png', 412, 208);
const cinematicPodcastPreviewTwo = remoteImageAsset('/show2.png', 412, 208);
const cinematicDzenLogo = remoteImageAsset('/dzen.svg', 147, 44);
const cinematicMerLogo = remoteImageAsset('/mer.svg', 163, 35);
const cinematicNikeLogo = remoteImageAsset('/nike.svg', 104, 37);

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
  priority: MediaPreloadPriority = 'immediate',
): MediaPreloadItem => ({
  src: imageSrc(asset),
  kind: 'image',
  priority,
});

const video = (
  path: `/${string}`,
  priority: MediaPreloadPriority = 'idle',
): MediaPreloadItem => ({
  src: mediaAssetPath(path),
  kind: 'video',
  priority,
});

export const mediaPreloadManifest: MediaPreloadItem[] = [
  image(logo, 'immediate'),
  image(logoBig, 'immediate'),
  video('/only_bg.mp4', 'immediate'),

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
  image(mediaAssetPath('/5.jpg')),
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
  image(cinematicDzenLogo),
  image(cinematicMerLogo),
  image(cinematicNikeLogo),

  video('/balls.mp4'),
  video('/Mer.mp4'),
  video('/now.mp4'),
  video('/vote.mp4'),
  video('/1.mp4'),
  video('/2.mp4'),
  video('/3.mp4'),
  video('/4.mp4'),
];
