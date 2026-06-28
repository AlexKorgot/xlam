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
import blueBottomImage from '@/src/components/textSection/assets/img/modal_bottom.png';

type ContactModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type ContactFormState = 'idle' | 'success';

const fieldClassName =
  'h-[34px] w-full border-0 border-b border-black bg-transparent px-0 text-[16px] font-bold uppercase leading-none text-black outline-none transition placeholder:text-[#8f8f8f] focus:border-[#63ff45] focus:placeholder:text-black';

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
        className="flex h-full w-full items-center justify-center px-0 py-10"
        onMouseDown={handleBackdropMouseDown}
      >
        <section className="relative flex h-[min(626px,calc(100svh-80px))] w-[min(378px,calc(100vw-40px))] flex-col overflow-hidden bg-white text-black shadow-[0_30px_100px_rgba(0,0,0,0.55)]">
          <header className="relative z-20 flex h-[58px] shrink-0 items-center justify-end border-b border-black/10 px-[21px]">
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center text-black transition hover:text-[#63ff45] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
              aria-label="Закрыть форму связи"
              onClick={onClose}
            >
              <GlitchBrandXIcon className="cursor-pointer" fill="currentColor" />
            </button>
          </header>

          <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto px-[21px] pb-0 pt-[18px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <h2
              id={titleId}
              tabIndex={-1}
              className="max-w-[336px] text-[clamp(2.15rem,9vw,32px)] font-black uppercase leading-[0.86] tracking-0 text-black outline-none"
            >
              Поговорим о вашей идее?
            </h2>

            <p
              id={descriptionId}
              className="mt-[12px] max-w-[336px] text-[17px] font-medium leading-[0.96] text-black"
            >
              Ответим в течение дня и предложим формат реализации под ваш запрос.
            </p>

            <form
              className="mt-[13px] flex flex-col"
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

              <label className="mt-[12px] block">
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

              <label className="mt-[12px] block">
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
                className="mt-[34px] flex h-[78px] w-full items-center justify-center rounded-[4px] bg-black px-5 text-center text-[29px] font-black uppercase leading-none text-white transition hover:bg-[#63ff45] hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
              >
                Отправить
              </button>

              <p
                className="mt-[11px] min-h-[31px] text-[15px] font-medium leading-[0.96] text-[#8f8f8f]"
                aria-live="polite"
              >
                {formState === 'success'
                  ? 'Заявка отправлена. Мы свяжемся с вами в течение дня.'
                  : '*Нажимая «Отправить», вы даете согласие на обработку персональных данных'}
              </p>
            </form>
          </div>

          <div
            className="pointer-events-none h-[118px] shrink-0 bg-cover bg-center bg-no-repeat"
            style={footerImageStyle}
            aria-hidden="true"
          />
        </section>
      </div>
    </BaseModal>
  );
}
