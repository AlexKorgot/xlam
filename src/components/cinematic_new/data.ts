import { publicAssetPath } from '@/src/lib/publicAssetPath';
import type { CinematicSlide } from './types';
import merPreview1 from './assets/mer/mer1.png';
import merPreview2 from './assets/mer/mer2.png';
import showPreview1 from './assets/mer/podcast1.png';
import showPreview2 from './assets/mer/podcast2.png';
import podcastPreview1 from './assets/mer/show1.png';
import podcastPreview2 from './assets/mer/show2.png';

const merVideo = publicAssetPath('/video/Mer.mp4');
const nowVideo = publicAssetPath('/video/now.mp4');
const voteVideo = publicAssetPath('/video/vote.mp4');
const mainVideoObjectPosition: [number, number] = [0.5, 0.58];
const productionDescription =
  'Полный цикл продакшена: разработка концепции, подбор ведущих и гостей, организация съемок, продакшн и пост-продакшн. Мы превращаем идею в полноценный формат, готовый к публикации на YouTube, ТВ или платформах.';
const openedServices = ['кастинг', 'саунд', 'Графика', 'Монтаж', 'Идея', 'Cценарий', 'Режиссура', 'Cъемка', 'Брендинг'];

export const cinematicSlides: CinematicSlide[] = [
  {
    id: 'mer-tv',
    eyebrow: 'комедийный сериал',
    title: '«МЕР-ТВ»',
    description:
      'A production case with broadcast-density framing, fast editorial rhythm, and a complete postproduction system.',
    tags: ['Production', 'Series', 'Post'],
    client: 'MER-TV',
    year: '2026',
    accent: '#66ff66',
    videoSrc: merVideo,
    videoObjectPosition: mainVideoObjectPosition,
    opened: {
      titleLead: 'Комедийный сериал',
      titleAccent: '«МЕР-ТВ»',
      body: 'Полный цикл продакшена: разработка концепции, подбор ведущих и гостей, организация съемок, продакшн и пост-продакшн. Мы превращаем идею в полноценный формат, готовый к публикации на YouTube, ТВ или платформах.',
      secondaryBody: '«Мёр-TV» — комедийный сериал, пародия на классический российский новостной телеканал с девизом «только правда, немного выдумки и в основном ложь». Ведущие Геннадий Ветер (Андрей Бебуришвили) и Кирилл Кириллов (Айсар Альтавил) снимают самые неожиданные репортажи на самые злободневные темы. Закрыли весь цикл: от идеи и сценария до съёмки и публикации.',
      services: openedServices,
      previews: [
        { src: merPreview1, alt: 'Мер-ТВ кадр 1' },
        { src: merPreview2, alt: 'Мер-ТВ кадр 2' },
      ],
      navLabel: 'МЕР-ТВ',
      thumbnailCount: 3,
    },
  },
  {
    id: 'shame-to-know',
    eyebrow: 'Юмористическое шоу-викторина',
    title: '«Стыдно знать»',
    description: productionDescription,
    tags: ['Scenario', 'Production', 'SMM'],
    client: 'XLAM',
    year: '2026',
    accent: '#7cff55',
    videoSrc: nowVideo,
    videoObjectPosition: mainVideoObjectPosition,
    opened: {
      titleLead: 'Юмористическое шоу',
      titleAccent: '«Стыдно знать»',
      body: 'Сняли сезон шоу-викторины для платформы Дзен — про знания, которыми обычно не делятся.\n',
      secondaryBody: '«Стыдно знать» — шоу-викторина Андрея Бебуришвили на Дзене. Два приглашённых героя соревнуются в постыдных знаниях: разбираются в плохом кино, забытых ток-шоу, российской попсе и других вещах, в любви к которым обычно не признаются.\n' +
          'Шоу — собственный проект платформы Дзен. Мы выступили продакшн-партнером: собрали съёмочную команду, организовали смены, сняли сезон и довели материал до публикации.\n',
      services: openedServices,
      previews: [
        { src: podcastPreview1, alt: 'Стыдно знать кадр 1' },
        { src: podcastPreview2, alt: 'Стыдно знать кадр 2' },
      ],
      navLabel: 'Стыдно знать',
      thumbnailCount: 3,
    },
  },
  {
    id: 'agritek-bio',
    eyebrow: 'шоу-подкаст',
    title: '«Выбор»',
    description: productionDescription,
    tags: ['Branding', 'Design', 'Production'],
    client: 'шоу-подкаст',
    year: '2026',
    accent: '#55ff88',
    videoSrc: voteVideo,
    videoObjectPosition: mainVideoObjectPosition,
    opened: {
      titleLead: 'шоу-подкаст',
      titleAccent: 'Выбор',
      body: 'Сняли сезон шоу-подкаста для платформы Дзен — про дилеммы, которые легче придумать, чем разрешить.\n',
      secondaryBody: '«Выбор» — это шоу-подкаст на Дзене. Гостю предлагают дилеммы из тех, во что играют в детстве: миллион долларов или суперспособность, одно невозможное против другого. Только теперь у героя есть жизненный опыт — и тем интереснее, что он выберет. В финале выпуска ведущие предлагают гостю одно из непростых заданий, а второе берут на себя. Шоу — собственный проект платформы Дзен. Мы выступили продакшн-партнером.',
      services: openedServices,
      previews: [
        { src: showPreview1, alt: 'Выбор кадр 1' },
        { src: showPreview2, alt: 'Выбор кадр 2' },
      ],
      navLabel: 'Выбор',
      thumbnailCount: 3,
    },
  },
];
