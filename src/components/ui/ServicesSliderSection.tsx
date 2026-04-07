'use client';

import FullPageSection from '@/src/components/ui/FullPageSection';
import { useRef } from "react";

import useEmblaCarousel from 'embla-carousel-react'
import WheelGesturesPlugin from 'embla-carousel-wheel-gestures'
import { FULLPAGE_SCROLL_IGNORE_ATTR } from '@/src/components/ui/FullPageScroll';

type ServiceSlide = {
  id: string;
  title: string;
  description: string;
  overlayClass: string;
};

const sliderVideoSrc = '/video/3_slider_content_video.mov';
const scrollIgnoreAttr = { [FULLPAGE_SCROLL_IGNORE_ATTR]: 'true' } as const;

const slides: ServiceSlide[] = [
  {
    id: 'show',
    title: 'ШОУ ПОД КЛЮЧ',
    description:
      'ОТ ИДЕИ ДО ПРЕМЬЕРЫ, РАЗРАБАТЫВАЕМ, СНИМАЕМ И ВЫВОДИМ ШОУ В ЭФИР.',
    overlayClass: 'bg-black/60 panel',
    embda: 'embla__slide'
  },
  {
    id: 'ads',
    title: 'РЕКЛАМА',
    description:
      'РАЗРАБАТЫВАЕМ РЕКЛАМНЫЕ ВИДЕО, УСИЛИВАЕМ БРЕНД И ПРИВОДИМ К РЕЗУЛЬТАТУ.',
    overlayClass: 'bg-gradient-to-b from-[#102d34]/65 to-black/80 panel',
    embda: 'embla__slide'
  },
  {
    id: 'b2b',
    title: 'B2B КОНТЕНТ',
    description:
      'ПРОИЗВОДИМ СИСТЕМНЫЙ КОНТЕНТ ДЛЯ БИЗНЕСА: ИМИДЖ, ПРОДУКТ, КОММУНИКАЦИИ.',
    overlayClass: 'bg-gradient-to-b from-[#0c2d1c]/65 to-black/80 panel',
    embda: 'embla__slide'
  },
  {
    id: 'branding',
    title: 'БРЕНДИНГ',
    description:
      'ФОРМИРУЕМ ВИЗУАЛЬНЫЙ ЯЗЫК БРЕНДА И УПАКОВЫВАЕМ ЕГО В КОНТЕНТ.',
    overlayClass: 'bg-black/65 panel',
    embda: 'embla__slide'
  },
  {
    id: 'branding',
    title: 'БРЕНДИНГ',
    description:
        'ФОРМИРУЕМ ВИЗУАЛЬНЫЙ ЯЗЫК БРЕНДА И УПАКОВЫВАЕМ ЕГО В КОНТЕНТ.',
    overlayClass: 'bg-black/65 panel',
    embda: 'embla__slide'
  },
  {
    id: 'branding',
    title: 'БРЕНДИНГ',
    description:
        'ФОРМИРУЕМ ВИЗУАЛЬНЫЙ ЯЗЫК БРЕНДА И УПАКОВЫВАЕМ ЕГО В КОНТЕНТ.',
    overlayClass: 'bg-black/65 panel',
    embda: 'embla__slide'
  },
  {
    id: 'branding',
    title: 'БРЕНДИНГ',
    description:
        'ФОРМИРУЕМ ВИЗУАЛЬНЫЙ ЯЗЫК БРЕНДА И УПАКОВЫВАЕМ ЕГО В КОНТЕНТ.',
    overlayClass: 'bg-black/65 panel',
    embda: 'embla__slide'
  },
];

const supportingLine =
  'ЗАНИМАЕМСЯ ВСЕМИ ЭТАПАМИ СОЗДАНИЯ ПРОДУКТА: ПИШЕМ СЦЕНАРИИ, ОРГАНИЗУЕМ СЪЕМКИ, ВИДЕОСЪЕМКИ, МОНТАЖ, САУНД ДИЗАЙН, И СОЗДАЕМ ВСЕ АНИМАЦИИ';

export function ServicesSliderSection() {
  const component = useRef(null);
  const slider = useRef(null);

  const [emblaRef] = useEmblaCarousel(
      { loop: true },
      [WheelGesturesPlugin({
        forceWheelAxis: 'x'
      })])

  return (
    <FullPageSection id="services" className="items-stretch bg-black text-white">
      <div className="flex h-full w-full flex-col items-center justify-center px-4 py-6 sm:px-6 lg:px-12">
        <div className="embla flex w-full max-w-[1500px] flex-col gap-10">
          <div ref={emblaRef} data-reveal {...scrollIgnoreAttr}  className="embla__container flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:grid lg:grid-cols-4 lg:gap-6 lg:overflow-visible lg:snap-none">
            {slides.map((slide) => (
              <article
                key={slide.id}
                className={`${slide.embda} relative aspect-[3/4] min-w-[70%] flex-shrink-0 snap-center overflow-hidden border border-white/15 bg-black sm:min-w-[45%] lg:min-w-0`}
              >
                <video
                  className="absolute inset-0 h-full w-full object-cover"
                  src={sliderVideoSrc}
                  playsInline
                  autoPlay
                  loop
                  muted
                  preload="metadata"
                />
                <div className={`absolute inset-0 ${slide.overlayClass}`} aria-hidden />
                <div className="relative z-10 flex h-full flex-col items-center justify-end gap-4 px-5 pb-6 text-center">
                  <p className="text-[0.7rem] font-semibold uppercase leading-relaxed tracking-[0.35em] text-white/80">
                    {slide.description}
                  </p>
                  <h3 className="text-2xl font-black uppercase tracking-[0.08em] text-[#63ff45] sm:text-3xl lg:text-[2.5rem]">
                    {slide.title}
                  </h3>
                </div>
              </article>
            ))}
          </div>

          <div className="space-y-6 text-center" data-reveal>
            <p className="text-[0.68rem] font-semibold uppercase leading-6 tracking-[0.4em] text-white/70">
              {supportingLine}
            </p>
            <p className="text-[clamp(2.6rem,7vw,5.8rem)] font-black uppercase tracking-[-0.02em] text-white">
              ХЛАМ MEDI<span className="text-[#63ff45]">A</span>
            </p>
          </div>
        </div>
      </div>
    </FullPageSection>
  );
}
