import GlitchText from '@/src/components/ui/GlitchText/GlitchText';
import { useContactModal } from '@/src/components/ui/contact-modal';
import { ServiceModalFeatures } from './ServiceModalFeatures';
import type { ServiceModalContent } from './services.types';

type ServiceModalBodyProps = {
  content: ServiceModalContent;
  isOpen: boolean;
  titleId: string;
  descriptionId: string;
  contentTransitionClass: string;
  backgroundTransitionClass: string;
};

export function ServiceModalBody({
  content, isOpen, titleId, descriptionId, contentTransitionClass, backgroundTransitionClass,
}: ServiceModalBodyProps) {
  const { openContactModal, preloadContactModal } = useContactModal();

  return (
    <>
      <div className={backgroundTransitionClass}>
        <picture className="block h-full w-full">
          <source
            media="(max-width: 999.98px)"
            srcSet={content.backgroundImage.mobile.src}
          />
          <img
            src={content.backgroundImage.desktop.src}
            alt=""
            decoding="async"
            fetchPriority="high"
            className="h-full w-full object-cover"
          />
        </picture>
      </div>
      <div className="pointer-events-none absolute inset-0 bg-black/10 min-[1000px]:bg-black/30" />
      <div className="pointer-events-none absolute inset-y-0 left-0 w-full bg-gradient-to-r from-black/10 via-black/[0.06] to-transparent min-[1000px]:hidden" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[56%] bg-gradient-to-t from-black/10 via-black/[0.06] to-transparent min-[1000px]:hidden" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/10 to-transparent min-[1000px]:hidden" />

      <div className={`relative z-10 flex h-full min-h-0 flex-col overflow-y-auto overscroll-contain px-5 pb-6 pt-4 [scrollbar-color:#63ff45_rgba(255,255,255,0.16)] [scrollbar-width:thin] sm:px-8 min-[1000px]:justify-end min-[1000px]:overflow-hidden min-[1000px]:px-12 min-[1000px]:pb-10 min-[1000px]:pt-12 xl:px-[54px] ${contentTransitionClass}`}>
        <div className="mx-auto mb-5 h-1 w-14 shrink-0 rounded-full bg-white/28 min-[1000px]:hidden" aria-hidden="true" />

        <header className="mr-auto mt-auto max-w-[40rem] pr-0 text-left min-[1000px]:mt-0 lg:max-w-[58rem] lg:pr-0">
          <h2
            id={titleId}
            tabIndex={-1}
            className="max-w-[11ch] text-[3.35rem] font-black uppercase leading-[0.84] text-[#63ff45] outline-none sm:text-[4.9rem] lg:max-w-[12ch] lg:text-[clamp(5.75rem,7.45vw,9rem)]"
          >
            {content.title}
          </h2>
        </header>

        <div className="mt-4 grid min-h-0 gap-4 pt-0 min-[1000px]:mt-7 min-[1000px]:grid-cols-[390px_minmax(0,1fr)] min-[1000px]:items-start min-[1000px]:gap-14 min-[1000px]:pt-0 xl:grid-cols-[430px_minmax(0,1fr)] xl:gap-16">
          <div className="order-2 mx-auto w-full max-w-[29rem] min-[1000px]:order-1 min-[1000px]:mx-0 xl:max-w-[31rem]">
            <div id={descriptionId} className="mb-5 hidden max-w-[31rem] min-[1000px]:block">
              <p className="text-[15px] font-black uppercase leading-[1.03] text-white sm:text-[18px] lg:text-[20px]">
                {content.subtitle}
              </p>
              <p className="mt-3 max-w-[29rem] text-[14px] leading-[1.08] text-white sm:text-[16px] lg:text-[17px]">
                {content.description}
              </p>
            </div>
            <p className="whitespace-nowrap text-center text-[18px] font-black uppercase leading-[1.08] text-[#dedcd3] sm:text-[22px]  lg:text-[20px] xl:text-[24px]">
              {content.ctaIntro}
            </p>
            <button
              type="button"
              className="mt-2 flex min-h-[52px] w-full cursor-pointer items-center justify-center border border-white/68 bg-white/10 px-4 text-center text-[20px] font-bold uppercase leading-none text-white shadow-[inset_0_0_38px_rgba(255,255,255,0.08)] backdrop-blur-[1px] transition hover:border-[#63ff45] hover:bg-white/15 hover:text-[#63ff45] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:min-h-[58px] sm:text-[23px] lg:mt-3 lg:min-h-[58px] lg:whitespace-nowrap lg:text-[23px]"
              onPointerEnter={preloadContactModal}
              onFocus={preloadContactModal}
              onPointerDown={preloadContactModal}
              onClick={openContactModal}
            >
              <span className="cursor-pointer">
                <GlitchText size="23">{content.ctaLabel}</GlitchText>
              </span>
            </button>
          </div>

          <ServiceModalFeatures features={content.features} isOpen={isOpen} />
        </div>
      </div>
    </>
  );
}
