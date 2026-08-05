'use client';

import {
  useId,
  useState,
  type CSSProperties,
  type FormEvent,
  type MouseEvent,
} from 'react';
import { GlitchBrandXIcon } from '@/src/components/ui/GlitchBrandXIcon';
import { BaseModal } from '@/src/components/ui/modal';
import { remoteImageAsset } from '@/src/lib/mediaAssetPath';

const blueBottomImage = remoteImageAsset('/modal_bottom.png', 378, 215);

type ContactModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type ContactFormState = 'idle' | 'success';

const fieldClassName =
  'h-[30px] w-full border-0 border-b border-black bg-transparent px-0 text-[14px] font-bold uppercase leading-none text-black outline-none transition placeholder:text-[#8f8f8f] focus:border-[#63ff45] focus:placeholder:text-black max-[999px]:[@media_(orientation:landscape)]:h-[27px] max-[999px]:[@media_(orientation:landscape)]:text-[12px] min-[1000px]:h-[34px] min-[1000px]:text-[16px]';

const footerImageStyle = {
  backgroundImage: `url(${blueBottomImage.src})`,
} as CSSProperties;

export function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const [formState, setFormState] = useState<ContactFormState>('idle');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormState('success');
  };

  const handleAfterClose = () => {
    setFormState('idle');
  };

  const handleBackdropMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      labelledBy={titleId}
      describedBy={descriptionId}
      onClose={onClose}
      onAfterClose={handleAfterClose}
      closeLabel="Закрыть форму связи"
      showCloseButton={false}
      animationDuration={360}
      variant="center"
      backdropClassName="bg-black/45 backdrop-blur-[18px] backdrop-saturate-[0.72]"
    >
      <div
        className="flex h-full w-full items-center justify-center px-0 py-6 max-[999px]:[@media_(orientation:landscape)]:py-2 min-[1000px]:py-10"
        onMouseDown={handleBackdropMouseDown}
      >
        <section className="relative flex h-[min(560px,calc(100dvh-48px))] w-[min(340px,calc(100vw-48px))] flex-col overflow-hidden bg-white text-black shadow-[0_30px_100px_rgba(0,0,0,0.55)] max-[999px]:[@media_(orientation:landscape)]:h-[calc(100dvh-16px)] max-[999px]:[@media_(orientation:landscape)]:w-[min(620px,calc(100vw-32px))] min-[1000px]:h-[min(626px,calc(100svh-80px))] min-[1000px]:w-[min(378px,calc(100vw-40px))]">
          <header className="relative z-20 flex h-[48px] shrink-0 items-center justify-end border-b border-black/10 px-[18px] max-[999px]:[@media_(orientation:landscape)]:h-[40px] max-[999px]:[@media_(orientation:landscape)]:px-[14px] min-[1000px]:h-[58px] min-[1000px]:px-[21px]">
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center text-black transition hover:text-[#63ff45] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black max-[999px]:[@media_(orientation:landscape)]:h-7 max-[999px]:[@media_(orientation:landscape)]:w-7 min-[1000px]:h-9 min-[1000px]:w-9"
              aria-label="Закрыть форму связи"
              onClick={onClose}
            >
              <GlitchBrandXIcon className="cursor-pointer" fill="currentColor" />
            </button>
          </header>

          <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto px-[18px] pb-0 pt-[14px] [scrollbar-width:none] max-[999px]:[@media_(orientation:landscape)]:grid max-[999px]:[@media_(orientation:landscape)]:grid-cols-[0.9fr_1.1fr] max-[999px]:[@media_(orientation:landscape)]:gap-6 max-[999px]:[@media_(orientation:landscape)]:px-[18px] max-[999px]:[@media_(orientation:landscape)]:pt-[10px] min-[1000px]:flex min-[1000px]:px-[21px] min-[1000px]:pt-[18px] [&::-webkit-scrollbar]:hidden">
            <div>
              <h2
                id={titleId}
                tabIndex={-1}
                className="max-w-[336px] text-[28px] font-black uppercase leading-[0.88] tracking-0 text-black outline-none max-[999px]:[@media_(orientation:landscape)]:text-[25px] min-[1000px]:text-[clamp(2.15rem,9vw,32px)] min-[1000px]:leading-[0.86]"
              >
                Поговорим о вашей идее?
              </h2>

              <p
                id={descriptionId}
                className="mt-[8px] max-w-[336px] text-[14px] font-medium leading-[1] text-black max-[999px]:[@media_(orientation:landscape)]:text-[13px] min-[1000px]:mt-[12px] min-[1000px]:text-[17px] min-[1000px]:leading-[0.96]"
              >
                Ответим в течение дня и предложим формат реализации под ваш запрос.
              </p>
            </div>

            <form
              className="mt-[10px] flex flex-col max-[999px]:[@media_(orientation:landscape)]:mt-0 min-[1000px]:mt-[13px]"
              onSubmit={handleSubmit}
            >
              <label className="block">
                <span className="sr-only">Имя</span>
                <input
                  className={fieldClassName}
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Имя"
                  required
                />
              </label>

              <label className="mt-[9px] block max-[999px]:[@media_(orientation:landscape)]:mt-[7px] min-[1000px]:mt-[12px]">
                <span className="sr-only">Почта</span>
                <input
                  className={fieldClassName}
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Почта"
                  required
                />
              </label>

              <label className="mt-[9px] block max-[999px]:[@media_(orientation:landscape)]:mt-[7px] min-[1000px]:mt-[12px]">
                <span className="sr-only">Краткий запрос</span>
                <input
                  className={fieldClassName}
                  name="message"
                  type="text"
                  placeholder="Краткий запрос"
                  required
                />
              </label>

              <button
                type="submit"
                className="mt-[22px] flex h-[60px] w-full items-center justify-center rounded-[4px] bg-black px-5 text-center text-[23px] font-black uppercase leading-none text-white transition hover:bg-[#63ff45] hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black max-[999px]:[@media_(orientation:landscape)]:mt-[14px] max-[999px]:[@media_(orientation:landscape)]:h-[44px] max-[999px]:[@media_(orientation:landscape)]:text-[19px] min-[1000px]:mt-[34px] min-[1000px]:h-[78px] min-[1000px]:text-[29px]"
              >
                Отправить
              </button>

              <p
                className="mt-[8px] min-h-[27px] text-[12px] font-medium leading-[1] text-[#8f8f8f] max-[999px]:[@media_(orientation:landscape)]:mt-[6px] max-[999px]:[@media_(orientation:landscape)]:min-h-[22px] max-[999px]:[@media_(orientation:landscape)]:text-[11px] min-[1000px]:mt-[11px] min-[1000px]:min-h-[31px] min-[1000px]:text-[15px] min-[1000px]:leading-[0.96]"
                aria-live="polite"
              >
                {formState === 'success'
                  ? 'Заявка отправлена. Мы свяжемся с вами в течение дня.'
                  : '*Нажимая «Отправить», вы даете согласие на обработку персональных данных'}
              </p>
            </form>
          </div>

          <div
            className="pointer-events-none h-[90px] shrink-0 bg-cover bg-center bg-no-repeat max-[999px]:[@media_(orientation:landscape)]:h-[120px] min-[1000px]:h-[118px]"
            style={footerImageStyle}
            aria-hidden="true"
          />
        </section>
      </div>
    </BaseModal>
  );
}
