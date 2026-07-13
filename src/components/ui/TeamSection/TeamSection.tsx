'use client';

import clsx from 'clsx';
import Image, { type StaticImageData } from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FULLPAGE_SCROLL_EVENT,
  FULLPAGE_SCROLL_IGNORE_ATTR,
  FULLPAGE_TOUCH_AXIS_LOCK_RATIO,
  FULLPAGE_TOUCH_SWIPE_THRESHOLD,
  getFullPageSwipeDirection,
} from '@/src/components/ui/FullPageScroll';
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
  const [isMobilePicker, setIsMobilePicker] = useState(false);
  const listRef = useRef<HTMLUListElement | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const scrollStopTimeoutRef = useRef<number | null>(null);
  const isSnapScrollingRef = useRef(false);
  const hasCenteredInitialItemRef = useRef(false);
  const activeItem =
    teamItems.find((item) => item.id === activeId) ?? teamItems[3];
  const pickerItems = teamItems.map((item) => ({
    item,
    cycle: 0,
    key: item.id,
  }));
  const scrollEdgeThreshold = 2;

  const isMobilePickerViewport = () =>
    typeof window !== 'undefined' && window.matchMedia('(max-width: 999.98px)').matches;

  const canScrollList = (direction: 'up' | 'down') => {
    const list = listRef.current;

    if (!list) {
      return false;
    }

    if (direction === 'down') {
      return list.scrollTop + list.clientHeight < list.scrollHeight - scrollEdgeThreshold;
    }

    return list.scrollTop > scrollEdgeThreshold;
  };

  const requestFullPageScroll = (direction: 'up' | 'down') => {
    window.dispatchEvent(
      new CustomEvent(FULLPAGE_SCROLL_EVENT, {
        detail: { direction },
      }),
    );
  };

  const scrollRowToListCenter = (row: HTMLLIElement, behavior: ScrollBehavior) => {
    const list = listRef.current;

    if (!list) {
      return;
    }

    const rowTop = row.offsetTop;
    const targetScrollTop = rowTop - (list.clientHeight - row.offsetHeight) / 2;

    list.scrollTo({
      top: Math.max(0, targetScrollTop),
      behavior,
    });
  };

  useEffect(() => {
    const media = window.matchMedia('(max-width: 999.98px)');
    const syncPickerMode = () => {
      setIsMobilePicker(media.matches);
    };

    syncPickerMode();
    media.addEventListener('change', syncPickerMode);

    return () => {
      media.removeEventListener('change', syncPickerMode);
    };
  }, []);

  const selectCenteredListItem = useCallback((snapToItem = true) => {
    const list = listRef.current;

    if (!list || !isMobilePickerViewport()) {
      return;
    }

    const listRect = list.getBoundingClientRect();
    const listCenterY = listRect.top + listRect.height / 2;
    const rows = Array.from(list.querySelectorAll<HTMLLIElement>('[data-team-item-id]'));
    let closestRow: HTMLLIElement | null = null;
    let closestDistance = Number.POSITIVE_INFINITY;

    for (const row of rows) {
      const rowRect = row.getBoundingClientRect();
      const rowCenterY = rowRect.top + rowRect.height / 2;
      const distance = Math.abs(rowCenterY - listCenterY);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestRow = row;
      }
    }

    const nextId = closestRow?.dataset.teamItemId;

    if (!nextId) {
      return;
    }

    if (snapToItem && closestRow) {
      isSnapScrollingRef.current = true;
      scrollRowToListCenter(closestRow, 'smooth');

      window.setTimeout(() => {
        isSnapScrollingRef.current = false;
      }, 260);
    }

    setActiveId(nextId);
  }, []);

  const scheduleCenteredSelection = useCallback(
    (delay = 150) => {
      if (scrollStopTimeoutRef.current !== null) {
        window.clearTimeout(scrollStopTimeoutRef.current);
      }

      scrollStopTimeoutRef.current = window.setTimeout(() => {
        scrollStopTimeoutRef.current = null;
        selectCenteredListItem();
      }, delay);
    },
    [selectCenteredListItem],
  );

  const centerAndSelectItem = useCallback((id: string) => {
    const list = listRef.current;

    if (!list || !isMobilePickerViewport()) {
      setActiveId(id);
      return;
    }

    const rows = Array.from(list.querySelectorAll<HTMLLIElement>(`[data-team-item-id="${id}"]`));
    const listRect = list.getBoundingClientRect();
    const listCenterY = listRect.top + listRect.height / 2;
    let row: HTMLLIElement | null = null;
    let closestDistance = Number.POSITIVE_INFINITY;

    for (const candidate of rows) {
      const rowRect = candidate.getBoundingClientRect();
      const rowCenterY = rowRect.top + rowRect.height / 2;
      const distance = Math.abs(rowCenterY - listCenterY);

      if (distance < closestDistance) {
        closestDistance = distance;
        row = candidate;
      }
    }

    if (!row) {
      setActiveId(id);
      return;
    }

    isSnapScrollingRef.current = true;
    scrollRowToListCenter(row, 'smooth');
    setActiveId(id);

    window.setTimeout(() => {
      isSnapScrollingRef.current = false;
    }, 260);
  }, []);

  useEffect(() => {
    if (!isMobilePicker) {
      return undefined;
    }

    if (hasCenteredInitialItemRef.current) {
      return undefined;
    }

    hasCenteredInitialItemRef.current = true;

    const centerInitialItem = window.setTimeout(() => {
      const list = listRef.current;

      if (!list || !isMobilePickerViewport()) {
        return;
      }

      const row = list.querySelector<HTMLLIElement>(`[data-team-item-id="${activeId}"]`);

      if (row) {
        scrollRowToListCenter(row, 'auto');
      }
    }, 0);

    return () => {
      window.clearTimeout(centerInitialItem);

      if (scrollStopTimeoutRef.current !== null) {
        window.clearTimeout(scrollStopTimeoutRef.current);
      }
    };
  }, [activeId, isMobilePicker]);

  const handleListWheel = (event: React.WheelEvent<HTMLUListElement>) => {
    const direction = event.deltaY > 0 ? 'down' : 'up';

    if (canScrollList(direction)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    requestFullPageScroll(direction);
  };

  const handleListScroll = () => {
    if (!isMobilePickerViewport()) {
      return;
    }

    if (isSnapScrollingRef.current) {
      return;
    }

    scheduleCenteredSelection();
  };

  const handleListPointerDown = (event: React.PointerEvent<HTMLUListElement>) => {
    if (event.pointerType !== 'touch') {
      return;
    }

    touchStartRef.current = {
      x: event.clientX,
      y: event.clientY,
    };
  };

  const handleListPointerUp = (event: React.PointerEvent<HTMLUListElement>) => {
    if (event.pointerType !== 'touch') {
      return;
    }

    const start = touchStartRef.current;
    touchStartRef.current = null;

    if (!start) {
      return;
    }

    const deltaX = event.clientX - start.x;
    const deltaY = event.clientY - start.y;
    const isVerticalSwipe =
      Math.abs(deltaY) > FULLPAGE_TOUCH_SWIPE_THRESHOLD &&
      Math.abs(deltaY) > Math.abs(deltaX) * FULLPAGE_TOUCH_AXIS_LOCK_RATIO;

    if (!isVerticalSwipe) {
      return;
    }

    const direction = getFullPageSwipeDirection(deltaY);

    if (canScrollList(direction)) {
      scheduleCenteredSelection(180);
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    requestFullPageScroll(direction);
  };

  const handleListPointerCancel = () => {
    touchStartRef.current = null;
    scheduleCenteredSelection(220);
  };

  return (
    <section
      className="relative isolate h-full min-h-0 overflow-hidden bg-black font-normalidad text-white"
      aria-labelledby="team-heading"
    >
      <div className="mx-auto flex h-full min-h-0 w-full max-w-[1920px] flex-col px-[18px] pb-8 pt-0 sm:px-8 lg:px-[92px] lg:pb-0">
        <div className="relative mx-auto flex min-h-0 w-full flex-1 flex-col pt-[clamp(58px,11svh,92px)] max-lg:[@media_(orientation:landscape)]:justify-center max-lg:[@media_(orientation:landscape)]:pt-[var(--header-offset)] sm:pt-24 lg:max-w-[1740px] lg:justify-center lg:pt-0">
          <div className="relative z-50 max-w-[740px] max-lg:[@media_(orientation:landscape)]:max-w-[46vw]">
            <h2
              id="team-heading"
              className="text-[38px] font-black uppercase leading-[1.21] tracking-normal text-white max-lg:[@media_(orientation:landscape)]:text-[32px] sm:text-[64px] lg:text-[90px]"
            >
              Команд<span className="text-[#66ff66]">а</span>
            </h2>
            <p className="mt-2 max-w-[379px] text-[14px] font-medium uppercase leading-[0.99] text-white max-lg:[@media_(orientation:landscape)]:mt-1 max-lg:[@media_(orientation:landscape)]:line-clamp-2 max-lg:[@media_(orientation:landscape)]:pt-[2px] max-lg:[@media_(orientation:landscape)]:!leading-[1.12] max-lg:[@media_(orientation:landscape)]:text-[11px] sm:max-w-[673px] sm:text-[14px] lg:mt-2 lg:max-w-[740px] lg:text-[16px]">
              Не аутсорс-лотерея, а одна команда от идеи до эфира.
              Генеральный медиаподрядчик полного цикла.
            </p>
          </div>

          <div className="pointer-events-none absolute right-[-68px] top-[218px] z-40 flex justify-end max-lg:[@media_(orientation:landscape)]:right-[clamp(3rem,12vw,7rem)] max-lg:[@media_(orientation:landscape)]:top-1/2 max-lg:[@media_(orientation:landscape)]:-translate-y-1/2 lg:right-[-92px] lg:top-1/2 lg:block lg:-translate-y-[43%] min-[1080px]:right-0 min-[1450px]:right-[188px]">
            {activeItem.videoSrc ? (
              <video
                key={activeItem.id}
                src={activeItem.videoSrc}
                aria-label={`${activeItem.name}, ${activeItem.role}`}
                autoPlay
                muted
                loop
                playsInline
                className="h-[520px] w-auto max-w-none object-contain max-lg:[@media_(orientation:landscape)]:h-[min(76svh,320px)] lg:h-[704px]"
              />
            ) : (
              <Image
                key={activeItem.id}
                src={activeItem.image}
                alt={`${activeItem.name}, ${activeItem.role}`}
                loading="eager"
                unoptimized
                sizes="(min-width: 1280px) 388px, (min-width: 1024px) 30vw, 58vw"
                className="h-[520px] w-auto max-w-none object-contain max-lg:[@media_(orientation:landscape)]:h-[min(76svh,320px)] lg:h-[704px]"
              />
            )}
          </div>

          <div className="relative z-30 mt-4 h-[390px] min-h-0 w-full max-w-full flex-none overflow-hidden max-lg:[@media_(orientation:landscape)]:mt-3 max-lg:[@media_(orientation:landscape)]:h-[144px] max-lg:[@media_(orientation:landscape)]:max-w-[54vw] sm:h-[430px] lg:mt-[17px] lg:h-auto lg:flex-none lg:overflow-visible">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-0 right-[4px] top-1/2 z-20 hidden h-[54px] -translate-y-1/2 bg-[#66ff66]/[0.06] shadow-[0_0_42px_rgba(102,255,102,0.16)] max-lg:block max-lg:[@media_(orientation:landscape)]:h-[48px] sm:h-[70px]"
            />
            <ul
              ref={listRef}
              className="relative z-10 h-full min-h-0 w-full max-w-full flex-1 touch-pan-y snap-y snap-mandatory overflow-y-auto overflow-x-hidden overscroll-contain py-[168px] pr-1 [mask-image:linear-gradient(to_bottom,transparent_0%,#000_12%,#000_50%,#000_88%,transparent_100%)] [scrollbar-width:none] max-lg:[@media_(orientation:landscape)]:py-[48px] sm:py-[180px] lg:h-auto lg:flex-none lg:snap-none lg:overflow-visible lg:py-0 lg:pr-0 lg:[mask-image:none] [&::-webkit-scrollbar]:hidden"
              {...{ [FULLPAGE_SCROLL_IGNORE_ATTR]: 'true' }}
              onScroll={handleListScroll}
              onWheel={handleListWheel}
              onPointerDown={handleListPointerDown}
              onPointerUp={handleListPointerUp}
              onPointerCancel={handleListPointerCancel}
            >
              {pickerItems.map(({ item, cycle, key }) => (
                <TeamRow
                  key={key}
                  item={item}
                  cycle={cycle}
                  isActive={item.id === activeItem.id}
                  onActivate={() => {
                    if (!isMobilePickerViewport()) {
                      setActiveId(item.id);
                    }
                  }}
                  onSelect={() => centerAndSelectItem(item.id)}
                />
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function TeamRow({
  item,
  cycle,
  isActive,
  onActivate,
  onSelect,
}: {
  item: TeamItem;
  cycle: number;
  isActive: boolean;
  onActivate: () => void;
  onSelect: () => void;
}) {
  return (
    <li
      data-team-item-id={item.id}
      data-team-cycle={cycle}
      className={clsx(
        'snap-center lg:border-t lg:border-white/55 lg:last:border-b',
      )}
    >
      <button
        type="button"
        data-member-id={item.memberId}
        aria-pressed={isActive}
        onMouseEnter={onActivate}
        onFocus={onActivate}
        onClick={onSelect}
        className={clsx(
          'group relative flex min-h-[54px] w-full min-w-0 overflow-hidden text-left uppercase transition-colors max-lg:[@media_(orientation:landscape)]:!h-[48px] max-lg:[@media_(orientation:landscape)]:!min-h-[48px] sm:min-h-[70px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#66ff66] lg:h-[59px] lg:min-h-[59px]',
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
        <span className="relative flex w-full min-w-0 flex-col items-start gap-[4px] px-[8px] py-[6px] max-lg:[@media_(orientation:landscape)]:!h-full max-lg:[@media_(orientation:landscape)]:!flex-row max-lg:[@media_(orientation:landscape)]:!items-center max-lg:[@media_(orientation:landscape)]:!gap-3 max-lg:[@media_(orientation:landscape)]:!py-[3px] sm:flex-row sm:items-start sm:gap-4 sm:px-[9px] sm:py-2 lg:h-full lg:gap-[28px] lg:px-[10px] lg:py-0 lg:pt-[11px]">
          <span className="max-w-full truncate whitespace-nowrap text-[16px] font-medium leading-[0.99] tracking-normal max-lg:[@media_(orientation:landscape)]:!leading-[1.12] max-lg:[@media_(orientation:landscape)]:text-[15px] sm:text-[22px] lg:text-[28px] max-[1400px]:text-[24px]">
            {item.name}
          </span>
          <span
            className={clsx(
              'inline-flex h-5 w-[176px] items-center justify-center px-2.5 text-center text-[10px] font-medium leading-none transition-colors max-lg:[@media_(orientation:landscape)]:h-4 max-lg:[@media_(orientation:landscape)]:w-[150px] max-lg:[@media_(orientation:landscape)]:text-[9px] sm:h-6 sm:min-w-[207px] sm:text-[12px] lg:h-5 lg:min-w-0 lg:text-[16px]',
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
