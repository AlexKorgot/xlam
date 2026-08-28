import { publicAssetPath } from '@/src/lib/publicAssetPath';
import type { CinematicSlide } from './types';

const merPreview1 = publicAssetPath('/cinematic_previews/mer-1-412.1c545995.webp');
const merPreview2 = publicAssetPath('/cinematic_previews/mer-2-412.fda43870.webp');
const showPreview1 = publicAssetPath('/cinematic_previews/podcast-1-412.16329266.webp');
const showPreview2 = publicAssetPath('/cinematic_previews/podcast-2-412.e051ec56.webp');
const podcastPreview1 = publicAssetPath('/cinematic_previews/show-1-412.b8ebda62.webp');
const podcastPreview2 = publicAssetPath('/cinematic_previews/show-2-412.04b21275.webp');
const stillThinkingPreview1 = publicAssetPath('/cinematic_previews/eshche-dumaem-1.png');
const stillThinkingPreview2 = publicAssetPath('/cinematic_previews/eshche-dumaem-2.png');
const nastolkaPreview1 = publicAssetPath('/cinematic_previews/nastolka-1.png');
const nastolkaPreview2 = publicAssetPath('/cinematic_previews/nastolka-2.png');

const merVideo = publicAssetPath('/cinematic_videos/mer-1920.4cd799a1.mp4');
const nowVideo = publicAssetPath('/cinematic_videos/stidno-1920.4585f3d6.mp4');
const voteVideo = publicAssetPath('/cinematic_videos/vibor-1280.f2942d38.mp4');
const nastolkaVideo = publicAssetPath('/cinematic_videos/nastolka-desktop.mp4');
const nastolkaMobileVideo = publicAssetPath('/cinematic_videos/nastolka-mobile.mp4');
const stillThinkingVideo = publicAssetPath('/cinematic_videos/eshche-dumaem-desktop.mp4');
const stillThinkingMobileVideo = publicAssetPath('/cinematic_videos/eshche-dumaem-mobile.mp4');
const merPoster = publicAssetPath('/cinematic_posters/mer-1920.266a8cf9.webp');
const nowPoster = publicAssetPath('/cinematic_posters/stidno-1920.df074ec8.webp');
const votePoster = publicAssetPath('/cinematic_posters/vibor-1280.4c843162.webp');
const nastolkaPoster = publicAssetPath('/cinematic_posters/nastolka.png');
const stillThinkingPoster = publicAssetPath('/cinematic_posters/eshche-dumaem.png');
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
    posterSrc: merPoster,
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
    posterSrc: nowPoster,
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
    posterSrc: votePoster,
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
  {
    id: 'nastolka',
    eyebrow: 'развлекательное шоу',
    title: '«Настолка»',
    description: productionDescription,
    tags: ['Scenario', 'Production', 'Post'],
    client: 'XLAM',
    year: '2026',
    accent: '#66ff66',
    videoSrc: nastolkaVideo,
    mobileVideoSrc: nastolkaMobileVideo,
    posterSrc: nastolkaPoster,
    videoObjectPosition: mainVideoObjectPosition,
    opened: {
      titleLead: 'Развлекательное шоу',
      titleAccent: '«Настолка»',
      body: 'Сняли игровое шоу с механикой настольной игры — про то, как объяснить слово, когда словами нельзя.',
      secondaryBody: '«Настолка» — игровое шоу, в котором два ведущих и два приглашённых гостя делятся на команды и играют в большую настольную игру. Бросок кубика решает, как объяснять слово: рисунком, жестами, песней или вопросами «да/нет». Чем сложнее способ — тем больше очков, а по пути к финишу ждут ловушки и удвоения.\n\nШоу — проект MQP (Medium Quality Production). Мы выступили продакшн-партнёром: взяли на себя креатив, организовали съёмки, поставили режиссуру, свет и звук под игровую механику и довели материал до эфира.',
      services: openedServices,
      previews: [
        { src: nastolkaPreview1, alt: 'Настолка — логотип проекта' },
        { src: nastolkaPreview2, alt: 'Настолка — участники шоу' },
      ],
      navLabel: 'Настолка',
      thumbnailCount: 2,
    },
  },
  {
    id: 'eshche-dumaem',
    eyebrow: 'новый проект',
    title: '«Ещё думаем»',
    description: productionDescription,
    tags: ['Scenario', 'Production', 'Post'],
    client: 'XLAM',
    year: '2026',
    accent: '#7cff55',
    videoSrc: stillThinkingVideo,
    mobileVideoSrc: stillThinkingMobileVideo,
    posterSrc: stillThinkingPoster,
    videoObjectPosition: mainVideoObjectPosition,
    opened: {
      titleLead: 'Новый проект',
      titleAccent: '«Ещё думаем»',
      body: 'Сделали интеллектуальное live-шоу для Twitch — знатоки против ведущего, зрители подкидывают вопросы прямо из чата.',
      secondaryBody: '«Ещё думаем» — интеллектуальное live-шоу Андрея Бебуришвили на Twitch. Пять приглашённых героев садятся за стол с волчком и тринадцатью карточками — и играют против ведущего до шести очков.\n\nМы выступили продакшн-партнёром и собрали трансляцию под ключ: семь камер, живая режиссура, саунд-дизайн под каждый игровой момент, графика и счёт в реальном времени. Прямой эфир — без монтажа, без пересъёмок, без права на второй дубль.',
      services: openedServices,
      previews: [
        { src: stillThinkingPreview1, alt: 'Ещё думаем — игровое поле' },
        { src: stillThinkingPreview2, alt: 'Ещё думаем — участники шоу' },
      ],
      navLabel: 'Ещё думаем',
      thumbnailCount: 2,
    },
  },
];
