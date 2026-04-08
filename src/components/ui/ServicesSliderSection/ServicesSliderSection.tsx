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
};

const sliderVideoSrc = '/video/3_slider_content_video.mov';
const scrollIgnoreAttr = { [FULLPAGE_SCROLL_IGNORE_ATTR]: 'true' } as const;



const supportingLine =
  'ЗАНИМАЕМСЯ ВСЕМИ ЭТАПАМИ СОЗДАНИЯ ПРОДУКТА: ПИШЕМ СЦЕНАРИИ, ОРГАНИЗУЕМ СЪЕМКИ, ВИДЕОСЪЕМКИ, МОНТАЖ, САУНД ДИЗАЙН, И СОЗДАЕМ ВСЕ АНИМАЦИИ';

export function ServicesSliderSection() {
  const slides: ServiceSlide[] = [
    {
      id: 'show',
      title: 'ШОУ ПОД КЛЮЧ',
      description:
          'ОТ ИДЕИ ДО ПРЕМЬЕРЫ, РАЗРАБАТЫВАЕМ, СНИМАЕМ И ВЫВОДИМ ШОУ В ЭФИР.',
      videoRefConfig: {
        ref: useRef(null),
        handleMouseLeave(ref){
         return () => {
           ref.current?.pause()
           ref.current.currentTime = 0;
         }
        },
        handleMouseEnter(ref) {
          return () => {
            ref.current?.play();
          }
        }
      }
    },
    {
      id: 'ads',
      title: 'РЕКЛАМА',
      description:
          'РАЗРАБАТЫВАЕМ РЕКЛАМНЫЕ ВИДЕО, УСИЛИВАЕМ БРЕНД И ПРИВОДИМ К РЕЗУЛЬТАТУ.',
      videoRefConfig: {
        ref: useRef(null),
        handleMouseLeave: (ref) => {
         return () => {
           ref.current?.pause()
           ref.current.currentTime = 0;
         }
        },
        handleMouseEnter(ref) {
          return () => {
            ref.current?.play();
          }
        }
      }
    },
    {
      id: 'b2b',
      title: 'B2B КОНТЕНТ',
      description:
          'ПРОИЗВОДИМ СИСТЕМНЫЙ КОНТЕНТ ДЛЯ БИЗНЕСА: ИМИДЖ, ПРОДУКТ, КОММУНИКАЦИИ.',
      videoRefConfig: {
        ref: useRef(null),
        handleMouseLeave: (ref) => {
          return () => {
            ref.current?.pause()
            ref.current.currentTime = 0;
          }
        },
        handleMouseEnter(ref) {
          return () => {
            ref.current?.play();
          }
        }
      }
    },
    {
      id: 'branding',
      title: 'БРЕНДИНГ',
      description:
          'ФОРМИРУЕМ ВИЗУАЛЬНЫЙ ЯЗЫК БРЕНДА И УПАКОВЫВАЕМ ЕГО В КОНТЕНТ.',
      videoRefConfig: {
        ref: useRef(null),
        handleMouseLeave: (ref) => {
          return () => {
            ref.current?.pause()
            ref.current.currentTime = 0;
          }
        },
        handleMouseEnter(ref) {
          return () => {
            ref.current?.play();
          }
        }
      }
    },
  ];

  const component = useRef(null);
  const slider = useRef(null);

  // const handleMouseEnter = () => {
  //   videoRef.current?.play();
  // };
  //
  // const handleMouseLeave = () => {
  //   videoRef.current?.pause();
  //   videoRef.current.currentTime = 0; // сброс (по желанию)
  // };

  const [emblaRef] = useEmblaCarousel(
      { loop: true },
      [WheelGesturesPlugin({
        forceWheelAxis: 'x'
      })])

  return (
    <FullPageSection id="services" className="items-stretch bg-black text-white pt-40">
      <div className="flex h-full w-full flex-col items-center justify-center max-w-[1570px]">
        <div className='embda__wrapper lg:h-[70vh]'>
          <div className="embla h-full">
            <div className="overflow-hidden h-full" ref={emblaRef}>
              <div className="embla__container flex touch-pan-y touch-pinch-zoom h-full ml-[-22px]">
                {slides.map((i) =>(
                    <div key={i.id} className="embla__slide pl-[22px] flex-none basis-1/4 min-w-0 h-full relative">
                      <video
                          ref={i.videoRefConfig.ref}
                          className="object-cover h-full grayscale hover:grayscale-0 transition duration-500 ease-in-out"
                          src={sliderVideoSrc}
                          playsInline
                          loop
                          muted
                          onMouseEnter={i.videoRefConfig.handleMouseEnter(i.videoRefConfig.ref)}
                          onMouseLeave={i.videoRefConfig.handleMouseLeave(i.videoRefConfig.ref)}
                          preload="metadata"
                      />
                      <div className='absolute bottom-0 text-center px-1.5'>
                        <p className=''>{i.description}</p>
                        <h4 className='text-[#63ff45] text-[30px] font-black'>{i.title}</h4>
                      </div>
                    </div>
                ))}
              </div>
            </div>
          </div>
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
    </FullPageSection>
  );
}
