'use client';

import { publicAssetPath } from '@/src/lib/publicAssetPath';

const TAGLINE =
  'Создаем видео, шоу, рекламу и бренды, которые звучат дольше, чем длятся';

const onlyBgVideo = publicAssetPath('/video/only_bg.mp4');

export function MobileXHeroSection() {
  return (
    <section className="relative isolate flex h-full min-h-0 w-full overflow-hidden bg-black font-normalidad text-white min-[1000px]:hidden">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
      >
        <source src={onlyBgVideo} type="video/mp4" media="(max-width: 999.98px)" />
      </video>

      <div className="absolute inset-0 bg-black/24" aria-hidden="true" />
      <div
        className="absolute inset-x-0 top-0 h-[18svh] bg-gradient-to-b from-black/70 via-black/24 to-transparent"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 bottom-0 h-[34svh] bg-gradient-to-t from-black/86 via-black/44 to-transparent"
        aria-hidden="true"
      />

      <div className="relative z-10 flex h-full w-full flex-col items-center px-[30px] pb-[max(2rem,env(safe-area-inset-bottom))] pt-[calc(var(--header-offset)+0.75rem)]">
        <div className="relative flex min-h-0 flex-1 items-center justify-center self-stretch">
          <div className="absolute left-1/2 top-1/2 h-[min(45svh,430px)] w-[min(76vw,332px)] -translate-x-1/2 -translate-y-[52%]">
            <svg
              className="absolute inset-0 h-full w-full overflow-visible"
              viewBox="0 0 332 360"
              role="img"
              aria-label="Зеркальная буква Х"
            >
              <defs>
                <clipPath id="mobile-x-hero-clip" clipPathUnits="userSpaceOnUse">
                  <path d="M229.8 360 166.4 246.6 103.1 360H0l111.7-181.8L6.7 0h111.8l53.8 101.5L226.1 0H332L226.9 178.2 332 360H229.8Z" />
                </clipPath>
                <filter id="mobile-x-hero-grain">
                  <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="2" seed="11" />
                  <feColorMatrix type="saturate" values="0" />
                  <feComponentTransfer>
                    <feFuncA type="table" tableValues="0 0.18" />
                  </feComponentTransfer>
                </filter>
              </defs>

              <foreignObject
                x="-80"
                y="-52"
                width="492"
                height="464"
                clipPath="url(#mobile-x-hero-clip)"
              >
                <video
                  className="h-full w-full scale-x-[-1] object-cover brightness-125 contrast-110"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  aria-hidden="true"
                >
                  <source src={onlyBgVideo} type="video/mp4" media="(max-width: 999.98px)" />
                </video>
              </foreignObject>
              <path
                d="M229.8 360 166.4 246.6 103.1 360H0l111.7-181.8L6.7 0h111.8l53.8 101.5L226.1 0H332L226.9 178.2 332 360H229.8Z"
                filter="url(#mobile-x-hero-grain)"
                fill="white"
              />
            </svg>
          </div>

          <h1 className="relative z-10 mt-[8svh] w-full max-w-[23rem] text-center text-[clamp(3.35rem,17.5vw,4.85rem)] font-black uppercase leading-[0.86] tracking-normal drop-shadow-[0_12px_28px_rgba(0,0,0,0.58)] [@media_(max-width:999.98px)_and_(max-height:520px)]:hidden">
            <span className="block">ХЛАМ</span>
            <span className="block">
              MEDI<span className="text-[#66ff66]">A</span>
            </span>
          </h1>

          <p
            className="relative z-10 mt-[2svh] hidden max-w-full whitespace-nowrap text-center text-[clamp(2rem,8vw,3rem)] font-black uppercase leading-none tracking-normal drop-shadow-[0_12px_28px_rgba(0,0,0,0.62)] [@media_(max-width:999.98px)_and_(max-height:520px)]:block"
            aria-label="ХЛАМ MEDIA"
          >
            ХЛАМ MEDI<span className="text-[#66ff66]">A</span>
          </p>
        </div>

        <div className="relative z-20 w-full shrink-0 pb-[calc(0.75rem+env(safe-area-inset-bottom))] text-center">
          <p className="mx-auto max-w-[23rem] text-[clamp(1rem,4.1vw,1.1rem)] font-black uppercase leading-[1.12] text-white drop-shadow-[0_10px_24px_rgba(0,0,0,0.72)]">
            {TAGLINE}
          </p>

          <a
            href="#contacts"
            className="mt-[22px] flex h-[54px] w-full items-center justify-center border border-white/88 bg-white/[0.08] px-5 text-center text-[clamp(1.05rem,4.5vw,1.25rem)] font-bold uppercase leading-none text-white shadow-[0_20px_70px_rgba(0,0,0,0.5),inset_0_0_32px_rgba(255,255,255,0.08)] backdrop-blur-[9px] transition-colors hover:border-[#66ff66] hover:text-[#66ff66] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            Заказать проект
          </a>
        </div>
      </div>
    </section>
  );
}
