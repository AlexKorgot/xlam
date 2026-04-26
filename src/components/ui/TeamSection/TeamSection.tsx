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

type TeamMemberId = 'artem' | 'evgeniy' | 'konstantin';

type TeamItem = {
  id: string;
  memberId: TeamMemberId;
  name: string;
  role: string;
  image: StaticImageData;
};

const teamItems: TeamItem[] = [
  {
    id: 'artem-top',
    memberId: 'artem',
    name: 'Артем Зозуля-Эрнст',
    role: 'creative director',
    image: personImageOne,
  },
  {
    id: 'evgeniy-top',
    memberId: 'evgeniy',
    name: 'Евгений Малов',
    role: 'graphic designer',
    image: personImageTwo,
  },
  {
    id: 'konstantin-top',
    memberId: 'konstantin',
    name: 'Константин Константинов',
    role: 'smm-manager',
    image: personImageThree,
  },
  {
    id: 'evgeniy-bottom',
    memberId: 'evgeniy',
    name: 'Евгений Малов',
    role: 'graphic designer',
    image: evgeniyMalovImage,
  },
  {
    id: 'konstantin-bottom',
    memberId: 'konstantin',
    name: 'Константин Константинов',
    role: 'smm-manager',
    image: personImageFour,
  },
  {
    id: 'artem-bottom',
    memberId: 'artem',
    name: 'Артем Зозуля-Эрнст',
    role: 'creative director',
    image: personImageFive,
  },
];

export function TeamSection() {
  const [activeId, setActiveId] = useState(teamItems[0].id);
  const activeItem =
    teamItems.find((item) => item.id === activeId) ?? teamItems[0];

  return (
    <section
      className="relative isolate min-h-[100svh] overflow-hidden bg-black font-normalidad text-white"
      aria-labelledby="team-heading"
    >
      <div className="mx-auto flex min-h-[100svh] w-full max-w-[1920px] flex-col px-5 pb-8 pt-6 sm:px-8 lg:px-[92px] lg:pb-[132px] lg:pt-0">
        <div className="relative flex flex-1 flex-col pt-16 sm:pt-20 lg:block lg:pt-0">
          <div className="relative z-20 max-w-[673px] lg:mt-[271px]">
            <h2
              id="team-heading"
              className="text-[48px] font-black uppercase leading-[1.21] tracking-normal text-white sm:text-[64px] lg:text-[90px]"
            >
              Команд<span className="text-[#66ff66]">а</span>
            </h2>
            <p className="mt-2 max-w-[673px] text-[12px] font-medium uppercase leading-[0.99] text-white sm:text-[14px] lg:h-[89px] lg:text-[16px]">
              Проект для нас - не потоковая задача, а совместная работа с ясным
              результатом. Мы думаем, советуем, объясняем и ведём
            </p>
          </div>

          <div className="relative z-[60] mt-8 flex justify-center lg:pointer-events-none lg:absolute lg:right-[181px] lg:top-[244px] lg:mt-0 lg:block">
            <Image
              key={activeItem.id}
              src={activeItem.image}
              alt={`${activeItem.name}, ${activeItem.role}`}
              loading="eager"
              sizes="(min-width: 1280px) 388px, (min-width: 1024px) 30vw, 58vw"
              className="h-[520px] w-auto max-w-none object-contain lg:h-[704px]"
            />
          </div>

          <ul className="relative z-30 mt-8 w-full lg:mt-[11px]">
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
    <li className="border-t border-white/55 last:border-b flex items-center">
      <button
        type="button"
        data-member-id={item.memberId}
        aria-pressed={isActive}
        onMouseEnter={onActivate}
        onFocus={onActivate}
        onClick={onActivate}
        className={clsx(
          'group relative flex min-h-[54px] w-full overflow-hidden text-left uppercase transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#66ff66] lg:h-[59px]',
          isActive ? 'text-black' : 'text-white',
        )}
      >
        <span
          aria-hidden="true"
          className={clsx(
            'absolute inset-y-0 left-0 bg-[#66ff66] transition-[right,opacity] duration-200 ease-out max-lg:right-0 lg:right-[24.36%]',
            isActive ? 'opacity-100' : 'opacity-0',
          )}
        />
        <span className="relative flex w-full flex-col items-center gap-2 px-3 py-3 sm:flex-row sm:items-start sm:gap-4 lg:h-full lg:px-5 lg:py-5 lg:pt-[15px]">
          <span className="text-[18px] font-medium leading-[0.99] tracking-normal sm:text-[22px] lg:text-[28px]">
            {item.name}
          </span>
          <span
            className={clsx(
              'inline-flex w-fit min-w-[168px] items-center justify-center px-3 text-center text-[10px] font-medium transition-colors sm:min-w-[207px] sm:text-[12px] lg:min-w-[241px] lg:text-[16px]',
              isActive ? 'bg-black text-white' : 'bg-white text-black',
            )}
          >
            {item.role}
          </span>
        </span>
      </button>
    </li>
  );
}
