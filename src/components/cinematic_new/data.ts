import { publicAssetPath } from '@/src/lib/publicAssetPath';
import type { CinematicSlide } from './types';

const merVideo = publicAssetPath('/video/Mer.mp4');
const nowVideo = publicAssetPath('/video/now.mp4');
const voteVideo = publicAssetPath('/video/vote.mp4');
const mainVideoObjectPosition: [number, number] = [0.5, 0.58];
const productionDescription =
  'Полный цикл продакшена: разработка концепции, подбор ведущих и гостей, организация съемок, продакшн и пост-продакшн. Мы превращаем идею в полноценный формат, готовый к публикации на YouTube, ТВ или платформах.';
const openedServices = ['сценарий', 'монтаж', 'smm', 'branding', 'продакшн'];

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
    videoSrc: merVideo,
    videoObjectPosition: mainVideoObjectPosition,
    opened: {
      titleLead: 'сериал',
      titleAccent: 'МЕР-ТВ',
      body: productionDescription,
      secondaryBody: productionDescription,
      services: openedServices,
      navLabel: 'Сериал Мер-ТВ',
      thumbnailCount: 3,
    },
  },
  {
    id: 'shame-to-know',
    eyebrow: 'Шоу полного цикла',
    title: 'Шоу «Стыдно знать»',
    description: productionDescription,
    tags: ['Scenario', 'Production', 'SMM'],
    client: 'XLAM',
    year: '2026',
    accent: '#7cff55',
    videoSrc: nowVideo,
    videoObjectPosition: mainVideoObjectPosition,
    opened: {
      titleLead: 'шоу',
      titleAccent: 'Стыдно знать',
      body: productionDescription,
      secondaryBody: productionDescription,
      services: openedServices,
      navLabel: 'Шоу Стыдно знать',
      thumbnailCount: 3,
    },
  },
  {
    id: 'agritek-bio',
    eyebrow: 'Фирменный стиль',
    title: 'Агритек БИО',
    description: productionDescription,
    tags: ['Branding', 'Design', 'Production'],
    client: 'Агритек БИО',
    year: '2026',
    accent: '#55ff88',
    videoSrc: voteVideo,
    videoObjectPosition: mainVideoObjectPosition,
    opened: {
      titleLead: 'фирменный стиль',
      titleAccent: 'АГРИТЕК БИО',
      body: productionDescription,
      services: openedServices,
      navLabel: 'Фирменный стиль Агритек БИО',
      thumbnailCount: 4,
    },
  },
];
