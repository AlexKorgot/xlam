'use client';

import clsx from 'clsx';
import Image, { type StaticImageData } from 'next/image';
import { useState } from 'react';
import personImageOne from './assets/07A kopia_13 1.png';
import personImageTwo from './assets/07A kopia_13 1 (1).png';
import personImageThree from './assets/07A kopia_13 1 (2).png';
import personImageFour from './assets/07A kopia_13 1 (3).png';
import personImageFive from './assets/07A kopia_13 1 (4).png';
import evgeniyMalovImage from './assets/evgeniy-malov.png';

type TeamMemberId =
  | 'aysar'
  | 'artem'
  | 'gleb'
  | 'valeriya'
  | 'evgeniy'
  | 'alexandr'
  | 'sergey'
  | 'alexey'
  | 'roman';

type TeamItem = {
  id: string;
  memberId: TeamMemberId;
  name: string;
  role: string;
  image: StaticImageData;
  roleClassName: string;
  isMobileVisible?: boolean;
  videoSrc?: string;
};

const teamItems: TeamItem[] = [
  {
    id: 'aysar',
    memberId: 'aysar',
    name: 'Айсар Альтавил',
    role: 'CCO',
    image: personImageOne,
    roleClassName: 'lg:w-[141px]',
  },
  {
    id: 'artem',
    memberId: 'artem',
    name: 'Артем Зозуля',
    role: 'Head of Creative',
    image: personImageTwo,
    roleClassName: 'lg:w-[326px]',
  },
  {
    id: 'gleb',
    memberId: 'gleb',
    name: 'Глеб Кучинский',
    role: 'Director',
    image: personImageThree,
    roleClassName: 'lg:w-[214px]',
  },
  {
    id: 'valeriya',
    memberId: 'valeriya',
    name: 'Валерия Монастырская',
    role: 'Line Producer',
    image: evgeniyMalovImage,
    roleClassName: 'lg:w-[292px]',
  },
  {
    id: 'evgeniy',
    memberId: 'evgeniy',
    name: 'Евгений Малов',
    role: 'Art Director',
    image: personImageFour,
    roleClassName: 'lg:w-[272px]',
  },
  {
    id: 'alexandr',
    memberId: 'alexandr',
    name: 'Александр Глебов',
    role: 'Aerial Cinematographer',
    image: personImageFive,
    roleClassName: 'lg:w-[439px]',
  },
  {
    id: 'sergey',
    memberId: 'sergey',
    name: 'Сергей Киселев',
    role: 'AI Producer',
    image: personImageOne,
    roleClassName: 'lg:w-[260px]',
    isMobileVisible: false,
  },
  {
    id: 'alexey',
    memberId: 'alexey',
    name: 'Алексей Пейзан',
    role: 'Full-stack Developer',
    image: personImageTwo,
    roleClassName: 'lg:w-[408px]',
    isMobileVisible: false,
  },
  {
    id: 'roman',
    memberId: 'roman',
    name: 'Роман Ковалев',
    role: 'CEO',
    image: personImageThree,
    roleClassName: 'lg:w-[138px]',
    isMobileVisible: false,
  },
];

export function TeamSection() {
  const [activeId, setActiveId] = useState('valeriya');
  const activeItem =
    teamItems.find((item) => item.id === activeId) ?? teamItems[3];

  return (
    <section
      className="relative isolate min-h-[100svh] overflow-hidden bg-black font-normalidad text-white"
      aria-labelledby="team-heading"
    >
      <div className="mx-auto flex min-h-[100svh] w-full max-w-[1920px] flex-col px-[18px] pb-8 pt-0 sm:px-8 lg:px-[92px] lg:pb-0">
        <div className="relative mx-auto flex w-full flex-1 flex-col pt-[210px] sm:pt-24 lg:max-w-[1740px] lg:justify-center lg:pt-0">
          <div className="relative z-50 max-w-[740px]">
            <h2
              id="team-heading"
              className="text-[38px] font-black uppercase leading-[1.21] tracking-normal text-white sm:text-[64px] lg:text-[90px]"
            >
              Команд<span className="text-[#66ff66]">а</span>
            </h2>
            <p className="mt-3 max-w-[379px] text-[14px] font-medium uppercase leading-[0.99] text-white sm:max-w-[673px] sm:text-[14px] lg:mt-2 lg:max-w-[740px] lg:text-[16px]">
              Не аутсорс-лотерея, а одна команда от идеи до эфира.
              Генеральный медиаподрядчик полного цикла.
            </p>
          </div>

          <div className="pointer-events-none absolute right-[-46px] top-[307px] z-40 flex justify-end lg:right-[188px] lg:top-1/2 lg:block lg:-translate-y-[43%]">
            {activeItem.videoSrc ? (
              <video
                key={activeItem.id}
                src={activeItem.videoSrc}
                aria-label={`${activeItem.name}, ${activeItem.role}`}
                autoPlay
                muted
                loop
                playsInline
                className="h-[490px] w-auto max-w-none object-contain lg:h-[704px]"
              />
            ) : (
              <Image
                key={activeItem.id}
                src={activeItem.image}
                alt={`${activeItem.name}, ${activeItem.role}`}
                loading="eager"
                sizes="(min-width: 1280px) 388px, (min-width: 1024px) 30vw, 58vw"
                className="h-[490px] w-auto max-w-none object-contain lg:h-[704px]"
              />
            )}
          </div>

          <ul className="relative z-30 mt-[20px] w-full lg:mt-[17px]">
            {teamItems.map((item) => (
              <TeamRow
                key={item.id}
                item={item}
                isActive={item.id === activeItem.id}
                onActivate={() => setActiveId(item.id)}
              />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function TeamRow({
  item,
  isActive,
  onActivate,
}: {
  item: TeamItem;
  isActive: boolean;
  onActivate: () => void;
}) {
  return (
    <li
      className={clsx(
        'border-t border-white/55 last:border-b',
        item.isMobileVisible === false && 'max-lg:hidden',
      )}
    >
      <button
        type="button"
        data-member-id={item.memberId}
        aria-pressed={isActive}
        onMouseEnter={onActivate}
        onFocus={onActivate}
        onClick={onActivate}
        className={clsx(
          'group relative flex min-h-[70px] w-full overflow-hidden text-left uppercase transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#66ff66] lg:h-[59px] lg:min-h-[59px]',
          isActive ? 'text-black' : 'text-white',
        )}
      >
        <span
          aria-hidden="true"
          className={clsx(
            'absolute inset-y-0 left-0 bg-[linear-gradient(90deg,#66ff66_0%,#66ff66_73.6%,#000_96.6%)] transition-[right,opacity] duration-200 ease-out max-lg:right-[97px] lg:right-[21.44%]',
            isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
          )}
        />
        <span className="relative flex w-full flex-col items-start gap-[7px] px-[9px] py-2 sm:flex-row sm:items-start sm:gap-4 lg:h-full lg:gap-[28px] lg:px-[10px] lg:py-0 lg:pt-[11px]">
          <span className="whitespace-nowrap text-[18px] font-medium leading-[0.99] tracking-normal sm:text-[22px] lg:text-[28px] max-[1400px]:text-[24px]">
            {item.name}
          </span>
          <span
            className={clsx(
              'inline-flex h-6 w-[210px] items-center justify-center px-3 text-center text-[12px] font-medium leading-none transition-colors sm:min-w-[207px] sm:text-[12px] lg:h-5 lg:min-w-0 lg:text-[16px]',
              item.roleClassName,
              isActive
                ? 'bg-black text-white'
                : 'bg-white text-black group-hover:bg-black group-hover:text-white',
            )}
          >
            {item.role}
          </span>
        </span>
      </button>
    </li>
  );
}
