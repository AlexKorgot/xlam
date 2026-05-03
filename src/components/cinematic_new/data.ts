import { publicAssetPath } from '@/src/lib/publicAssetPath';
import type { CinematicSlide } from './types';

const mainVideo = publicAssetPath('/video/timessquarenightwide.mp4');

export const cinematicSlides: CinematicSlide[] = [
  {
    id: 'mer-tv',
    eyebrow: '\u041f\u0440\u043e\u0434\u0430\u043a\u0448\u043d \u043f\u043e\u043b\u043d\u043e\u0433\u043e \u0446\u0438\u043a\u043b\u0430',
    title: '\u0421\u0435\u0440\u0438\u0430\u043b \u00ab\u041c\u0415\u0420-\u0422\u0412\u00bb',
    description:
      'A production case with broadcast-density framing, fast editorial rhythm, and a complete postproduction system.',
    tags: ['Production', 'Series', 'Post'],
    client: 'MER-TV',
    year: '2026',
    accent: '#66ff66',
    videoSrc: mainVideo,
  },
  {
    id: 'city-flow',
    eyebrow: 'Campaign film',
    title: 'City Flow',
    description:
      'A night-city film where location movement becomes the visual dramaturgy of the brand.',
    tags: ['Campaign', 'Cinematic', 'OOH'],
    client: 'XLAM',
    year: '2026',
    accent: '#7cff55',
    videoSrc: mainVideo,
  },
  {
    id: 'signal-room',
    eyebrow: 'Studio content',
    title: 'Signal Room',
    description:
      'A controlled studio story with contrast lighting, screen graphics, and precise movement direction.',
    tags: ['Studio', 'Editorial', 'Launch'],
    client: 'Signal',
    year: '2026',
    accent: '#55ff88',
    videoSrc: mainVideo,
  },
  {
    id: 'neon-index',
    eyebrow: 'Brand story',
    title: 'Neon Index',
    description:
      'A visual system for a nocturnal brand world, built to scale from teaser to hero film.',
    tags: ['Brand', 'Motion', 'Design'],
    client: 'Index',
    year: '2026',
    accent: '#b8ff2c',
    videoSrc: mainVideo,
  },
  {
    id: 'frame-unit',
    eyebrow: 'Case film',
    title: 'Frame Unit',
    description:
      'An energetic case film with large-format framing, reflections, sharp cuts, and continuous video texture.',
    tags: ['Case', 'Location', 'Color'],
    client: 'Frame',
    year: '2026',
    accent: '#58ff70',
    videoSrc: mainVideo,
  },
];
