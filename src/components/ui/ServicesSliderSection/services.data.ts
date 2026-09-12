import { publicAssetPath } from '@/src/lib/publicAssetPath';
import { serviceModalBackgrounds } from './serviceModalBackground';
import type { ServiceModalContent, ServiceSlide } from './services.types';
import aiPosterDesktop from './assets/3.desktop.webp';
import aiPosterMobile from './assets/3.mobile.webp';
import b2bPosterDesktop from './assets/2.desktop.webp';
import b2bPosterMobile from './assets/2.mobile.webp';
import showPosterDesktop from './assets/1.desktop.webp';
import showPosterMobile from './assets/1.mobile.webp';
import adsPosterDesktop from './assets/4.desktop.webp';
import adsPosterMobile from './assets/4.mobile.webp';
import brandPosterDesktop from './assets/5.desktop.webp';
import brandPosterMobile from './assets/5.mobile.webp';

const showModalContent: ServiceModalContent = {
  title: 'Шоу под ключ',
  subtitle: 'От идеи до премьеры: разрабатываем, снимаем и выводим шоу в эфир',
  description:
    'Вам не нужно контролировать несколько подрядчиков и сводить их работу — мы все сделаем за вас. Берем на себя весь процесс: разработка, съёмка, постпродакшн и упаковка.',
  ctaIntro: 'Поговорим о вашей идее',
  ctaLabel: 'Оставить заявку',
  backgroundImage: serviceModalBackgrounds.show,
  features: [
    {
      title: 'Придумываем',
      description: 'Идея, концепция, формат, структура, сценарий',
    },
    {
      title: 'Собираем',
      description: 'Кастинг ведущих и гостей, локация-студия, смета, графика, музыка',
    },
    {
      title: 'Снимаем',
      description: 'Серийная съемка, режиссура, свет, звук, работа с гостями',
    },
    {
      title: 'Выпускаем',
      description: 'Монтаж, графика, цветокор, саунд-дизайн, упаковка для платформ',
    },
  ],
};

const adsModalContent: ServiceModalContent = {
  title: 'Реклама',
  subtitle: 'Делаем рекламу, которую пересылают друзьям ',
  description:
    'Реклама — это короткое кино, где нет случайных кадров: каждая секунда продумана, каждый образ работает на идею. Сопровождаем проект на всех стадиях — от брифа до финальной упаковки',
  ctaIntro: 'Поговорим о вашей идее',
  ctaLabel: 'Оставить заявку',
  backgroundImage: serviceModalBackgrounds.ads,
  features: [
    {
      title: 'Задача',
      description: 'Бриф, целевая аудитория, рынок, конкурентное поле',
    },
    {
      title: 'Идея',
      description: 'Концепция, сценарий, формат, раскадровка, смета',
    },
    {
      title: 'Производство',
      description: 'Кастинг, локации, съемка, режиссура, продюсирование',
    },
    {
      title: 'Постпродакшн',
      description: 'Монтаж, цветокор, графика, саунд-дизайн, адаптация и упаковка',
    },
  ],
};

const b2bModalContent: ServiceModalContent = {
  title: 'B2B Продукт',
  subtitle: 'Производим системный контент: имидж, продукт, коммуникация',
  description:
    'Знаем, что бизнесу всегда нужно «вчера». Строим визуальные системы: имиджевые ролики, продуктовые видео, корпоративный контент и  материалы для внутренних и внешних коммуникаций',
  ctaIntro: 'Поговорим о вашей идее',
  ctaLabel: 'Оставить заявку',
  backgroundImage: serviceModalBackgrounds.b2b,
  features: [
    {
      title: 'Стратегия',
      description: 'Бизнес-цель, формат, целевая аудитория, ТЗ',
    },
    {
      title: 'Идея',
      description: 'Концепция, структура, референсы, смета, питч',
    },
    {
      title: 'Производство',
      description: 'Съемка, графика, разработка всех материалов',
    },
    {
      title: 'Дистрибуция',
      description: 'Монтаж, графика, упаковка и адаптация под все каналы',
    },
  ],
};

const brandingModalContent: ServiceModalContent = {
  title: 'AI Контент',
  subtitle: 'СОЗДАЕМ ВИЗУАЛ НОВОГО ПОКОЛЕНИЯ С ПОМОЩЬЮ ИИ',
  description:
    'ИИ-контент под задачи любой сложности: быстро — когда время критично, масштабно — когда нужен объём, нестандартно — когда обычные решения не подходят.',
  ctaIntro: 'Поговорим о вашей идее',
  ctaLabel: 'Оставить заявку',
  backgroundImage: serviceModalBackgrounds.branding,
  features: [
    {
      title: 'Архитектура',
      description: 'Задача, визуальная стратегия, мудборд, концепция, эталоны',
    },
    {
      title: 'Промтинг',
      description: 'Настройка моделей, воркфлоу, контроль персонажей, доводка',
    },
    {
      title: 'Генерация',
      description: 'Производство на стеке нейросетей: видео, фото, голос, звук',
    },
    {
      title: 'Сборка',
      description: 'Курация, монтаж, цветокор, саунд-дизайн, апскейл',
    },
  ],
};

const brandModalContent: ServiceModalContent = {
  title: 'Брендинг',
  subtitle: 'Бренд как структура, а не набор красивых элементов',
  description:
    'Знаем, как айдентика живет в кадре, потому что сами снимаем шоу и рекламу. Делаем бренды, которые работают не только на бумаге, но и на экране. От стратегии до моушна и CGI.',
  ctaIntro: 'Поговорим о вашей идее',
  ctaLabel: 'Оставить заявку',
  backgroundImage: serviceModalBackgrounds.brand,
  features: [
    {
      title: 'Исследование',
      description: 'Рынок, конкуренты, аудитория, миссия, тон, визуальный аудит.',
    },
    {
      title: 'Стратегия',
      description: 'Позиционирование, платформа бренда, ключевые сообщения.',
    },
    {
      title: 'Айдентика',
      description: 'Логобук, брендбук, типографика, фирменный стиль.',
    },
    {
      title: 'Производство',
      description: 'Предпечатная подготовка, 3D-графика, CGI.',
    },
  ],
};

export const serviceSlides: ServiceSlide[] = [
  {
    id: 'show',
    title: 'ШОУ ПОД КЛЮЧ',
    description:
      'ОТ ИДЕИ ДО ПРЕМЬЕРЫ: РАЗРАБАТЫВАЕМ, СНИМАЕМ И ВЫВОДИМ ШОУ В ЭФИР',
    modal: showModalContent,
    videoSrc: publicAssetPath('/video/show.mp4'),
    poster: {
      desktop: showPosterDesktop,
      mobile: showPosterMobile,
    },
  },
  {
    id: 'b2b',
    title: 'B2B ПРОДУКТ',
    description:
      'ПРОИЗВОДИМ СИСТЕМНЫЙ КОНТЕНТ: ИМИДЖ, ПРОДУКТ, КОММУНИКАЦИИ',
    modal: b2bModalContent,
    videoSrc: publicAssetPath('/video/b2b.mp4'),
    poster: {
      desktop: aiPosterDesktop,
      mobile: aiPosterMobile,
    },
  },
  {
    id: 'ads',
    title: 'РЕКЛАМА',
    description:
      'ДЕЛАЕМ РЕКЛАМУ, КОТОРУЮ ПЕРЕСЫЛАЮТ ДРУЗЬЯМ',
    modal: adsModalContent,
    videoSrc: publicAssetPath('/video/ads.mp4'),
    poster: {
      desktop: b2bPosterDesktop,
      mobile: b2bPosterMobile,
    },
  },
  {
    id: 'branding',
    title: 'AI КОНТЕНТ',
    description:
      'СОЗДАЕМ ВИЗУАЛ НОВОГО ПОКОЛЕНИЯ С ПОМОЩЬЮ ИИ',
    modal: brandingModalContent,
    videoSrc: publicAssetPath('/video/ai.mp4'),
    poster: {
      desktop: adsPosterDesktop,
      mobile: adsPosterMobile,
    },
  },
  {
    id: 'brand',
    title: 'БРЕНДИНГ',
    description:
      'ФОРМИРУЕМ ВИЗУАЛЬНЫЙ ЯЗЫК БРЕНДА И УПАКОВЫВАЕМ ЕГО В КОНТЕНТ',
    modal: brandModalContent,
    videoSrc: publicAssetPath('/video/branding.mp4'),
    poster: {
      desktop: brandPosterDesktop,
      mobile: brandPosterMobile,
    },
  },
];
