'use client';

import clsx from 'clsx';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FULLPAGE_SCROLL_EVENT,
  FULLPAGE_SCROLL_IGNORE_ATTR,
  FULLPAGE_TOUCH_AXIS_LOCK_RATIO,
  FULLPAGE_TOUCH_SWIPE_THRESHOLD,
  getFullPageSwipeDirection,
} from '@/src/components/ui/FullPageScroll';
import { Container } from '@/src/components/ui/grid/Container';
import styles from './TeamSection.module.scss';
import { localTeamMembers, type TeamMember } from './team.data';

const roleWidthByMemberId: Record<string, string> = {
  aysar: 'lg:w-[141px]',
  artem: 'lg:w-[326px]',
  gleb: 'lg:w-[214px]',
  valeriya: 'lg:w-[292px]',
  evgeniy: 'lg:w-[272px]',
  alexandr: 'lg:w-[439px]',
  sergey: 'lg:w-[260px]',
  alexey: 'lg:w-[408px]',
  roman: 'lg:w-[138px]',
};

const findTeamRow = (list: HTMLUListElement, id: string) =>
  Array.from(list.querySelectorAll<HTMLLIElement>('[data-team-item-id]')).find(
    (row) => row.dataset.teamItemId === id,
  );

export function TeamSection({ members = localTeamMembers }: { members?: TeamMember[] }) {
  const teamItems = members.length > 0 ? members : localTeamMembers;
  const [activeId, setActiveId] = useState(teamItems[0].id);
  const [isMobilePicker, setIsMobilePicker] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);
  const headingRef = useRef<HTMLDivElement | null>(null);
  const portraitRef = useRef<HTMLDivElement | null>(null);
  const pickerViewportRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const activeIdRef = useRef(teamItems[0].id);
  const selectionFrameRef = useRef<number | null>(null);
  const touchStartRef = useRef<{
    x: number;
    y: number;
    wasAtTop: boolean;
    wasAtBottom: boolean;
  } | null>(null);
  const activeItem =
    teamItems.find((item) => item.id === activeId) ?? teamItems[0];
  const scrollEdgeThreshold = 2;

  const isMobilePickerViewport = () =>
    typeof window !== 'undefined' && window.matchMedia('(max-width: 1023.98px)').matches;

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

  const scrollRowToListStart = (row: HTMLLIElement, behavior: ScrollBehavior) => {
    const list = listRef.current;

    if (!list) {
      return;
    }

    list.scrollTo({
      top: row.offsetTop,
      behavior,
    });
  };

  const selectItem = useCallback((id: string) => {
    if (activeIdRef.current === id) {
      return;
    }

    activeIdRef.current = id;
    setActiveId(id);
  }, []);

  const updateSelection = useCallback(() => {
    const list = listRef.current;

    if (!list || !isMobilePickerViewport()) {
      return;
    }

    const listRect = list.getBoundingClientRect();
    const listTop = listRect.top;
    const rows = list.querySelectorAll<HTMLLIElement>('[data-team-item-id]');
    let closestId: string | undefined;
    let closestDistance = Number.POSITIVE_INFINITY;

    rows.forEach((row) => {
      const rowRect = row.getBoundingClientRect();
      const distance = Math.abs(rowRect.top - listTop);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestId = row.dataset.teamItemId;
      }
    });

    if (closestId) {
      selectItem(closestId);
    }
  }, [selectItem]);

  const queueSelectionUpdate = useCallback(() => {
    if (selectionFrameRef.current !== null) {
      return;
    }

    selectionFrameRef.current = window.requestAnimationFrame(() => {
      selectionFrameRef.current = null;
      updateSelection();
    });
  }, [updateSelection]);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 1023.98px)');
    const syncPickerMode = () => {
      setIsMobilePicker(media.matches);
    };

    syncPickerMode();
    media.addEventListener('change', syncPickerMode);

    return () => {
      media.removeEventListener('change', syncPickerMode);
    };
  }, []);

  const alignAndSelectItem = useCallback((id: string) => {
    const list = listRef.current;

    if (!list || !isMobilePickerViewport()) {
      selectItem(id);
      return;
    }

    const row = findTeamRow(list, id);

    if (!row) {
      return;
    }

    scrollRowToListStart(row, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth');
    queueSelectionUpdate();
  }, [queueSelectionUpdate, selectItem]);

  useEffect(() => {
    if (!isMobilePicker) {
      return undefined;
    }

    const list = listRef.current;

    if (!list || !isMobilePickerViewport()) {
      return undefined;
    }

    const portraitElement = portraitRef.current;
    const selectedRow = findTeamRow(list, activeIdRef.current);

    if (selectedRow) {
      scrollRowToListStart(selectedRow, 'auto');
    }

    const syncPortraitPosition = () => {
      const section = sectionRef.current;
      const portrait = portraitRef.current;
      const picker = pickerViewportRef.current;

      if (!section || !portrait || !picker) {
        return;
      }

      if (window.matchMedia('(orientation: landscape)').matches) {
        portrait.style.removeProperty('--team-portrait-top');
        return;
      }

      // The cutout images have empty space above the head; align the visible head with the first row.
      const top = picker.getBoundingClientRect().top - section.getBoundingClientRect().top - 56;
      portrait.style.setProperty('--team-portrait-top', `${top}px`);
    };

    syncPortraitPosition();
    queueSelectionUpdate();
    const resizeObserver = new ResizeObserver(() => {
      syncPortraitPosition();
      queueSelectionUpdate();
    });
    resizeObserver.observe(list);
    if (headingRef.current) {
      resizeObserver.observe(headingRef.current);
    }
    window.addEventListener('resize', syncPortraitPosition);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', syncPortraitPosition);
      portraitElement?.style.removeProperty('--team-portrait-top');

      if (selectionFrameRef.current !== null) {
        window.cancelAnimationFrame(selectionFrameRef.current);
        selectionFrameRef.current = null;
      }
    };
  }, [isMobilePicker, queueSelectionUpdate]);

  const handleListWheel = (event: React.WheelEvent<HTMLUListElement>) => {
    if (event.deltaY === 0) {
      return;
    }

    const direction = event.deltaY > 0 ? 'down' : 'up';

    if (canScrollList(direction)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    requestFullPageScroll(direction);
  };

  const handleListScroll = () => {
    queueSelectionUpdate();
  };

  const handleListPointerDown = (event: React.PointerEvent<HTMLUListElement>) => {
    if (event.pointerType !== 'touch') {
      return;
    }

    touchStartRef.current = {
      x: event.clientX,
      y: event.clientY,
      wasAtTop: !canScrollList('up'),
      wasAtBottom: !canScrollList('down'),
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

    if (
      canScrollList(direction) ||
      !(direction === 'up' ? start.wasAtTop : start.wasAtBottom)
    ) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    requestFullPageScroll(direction);
  };

  const handleListPointerCancel = () => {
    touchStartRef.current = null;
  };

  return (
    <section
      ref={sectionRef}
      className="relative isolate h-full min-h-0 overflow-hidden bg-black font-normalidad text-white"
      aria-labelledby="team-heading"
    >
      <Container
        outerClassName="h-full min-h-0"
        className="flex h-full min-h-0 flex-col pb-8 pt-[clamp(58px,11svh,92px)] max-lg:[@media_(orientation:landscape)]:justify-center max-lg:[@media_(orientation:landscape)]:pt-[var(--header-offset)] sm:pt-24 lg:justify-center lg:pb-0 lg:pt-0"
      >
          <div ref={headingRef} className="relative z-50 max-w-[740px] max-lg:[@media_(orientation:landscape)]:max-w-[46vw]">
            <h2
              id="team-heading"
              className="text-[2rem] font-black uppercase leading-none tracking-normal text-white md:text-[2.35rem] xl:text-[3rem]"
            >
              Команд<span className="text-[#66ff66]">а</span>
            </h2>
            <p className="mt-2 max-w-[379px] text-[14px] font-medium uppercase leading-[0.99] text-white max-lg:[@media_(orientation:landscape)]:mt-1 max-lg:[@media_(orientation:landscape)]:line-clamp-2 max-lg:[@media_(orientation:landscape)]:pt-[2px] max-lg:[@media_(orientation:landscape)]:!leading-[1.12] max-lg:[@media_(orientation:landscape)]:text-[11px] sm:max-w-[673px] sm:text-[14px] lg:mt-2 lg:max-w-[740px] lg:text-[16px]">
              Не аутсорс-лотерея, а одна команда от идеи до эфира.
              Генеральный медиаподрядчик полного цикла.
            </p>
          </div>

          <div ref={portraitRef} className={clsx('pointer-events-none absolute right-[-68px] top-[var(--team-portrait-top)] z-40 flex justify-end max-lg:[@media_(orientation:landscape)]:right-[clamp(3rem,12vw,7rem)] max-lg:[@media_(orientation:landscape)]:-translate-y-1/2 lg:right-[-92px] lg:block lg:-translate-y-[43%] min-[1080px]:right-0 min-[1450px]:right-[188px]', styles.portraitStage)}>
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
                loading={activeItem.id === teamItems[0].id ? 'eager' : 'lazy'}
                unoptimized
                sizes="(min-width: 1280px) 388px, (min-width: 1024px) 30vw, 58vw"
                className="h-[520px] w-auto max-w-none object-contain max-lg:[@media_(orientation:landscape)]:h-[min(76svh,320px)] lg:h-[704px]"
              />
            )}
          </div>

          <div ref={pickerViewportRef} className={clsx('relative z-30 mt-2 h-[var(--team-picker-height)] min-h-0 w-full max-w-full flex-none overflow-hidden max-lg:[@media_(orientation:landscape)]:mt-3 max-lg:[@media_(orientation:landscape)]:max-w-[54vw] lg:mt-[17px] lg:h-auto lg:flex-none lg:overflow-visible', styles.pickerViewport)}>
            <ul
              ref={listRef}
              className="relative z-10 h-full min-h-0 w-full max-w-full flex-1 touch-pan-y snap-y snap-mandatory overflow-y-auto overflow-x-hidden overscroll-contain pb-[calc(var(--team-picker-height)-var(--team-row-height))] pr-1 [scrollbar-width:none] lg:h-auto lg:flex-none lg:snap-none lg:overflow-visible lg:pb-0 lg:pr-0 [&::-webkit-scrollbar]:hidden"
              {...{ [FULLPAGE_SCROLL_IGNORE_ATTR]: 'true' }}
              onScroll={handleListScroll}
              onWheel={handleListWheel}
              onPointerDown={handleListPointerDown}
              onPointerUp={handleListPointerUp}
              onPointerCancel={handleListPointerCancel}
            >
              {teamItems.map((item) => (
                <TeamRow
                  key={item.id}
                  item={item}
                  isActive={item.id === activeItem.id}
                  onActivate={() => {
                    if (!isMobilePickerViewport()) {
                      selectItem(item.id);
                    }
                  }}
                  onSelect={() => alignAndSelectItem(item.id)}
                />
              ))}
            </ul>
          </div>
      </Container>
    </section>
  );
}

function TeamRow({
  item,
  isActive,
  onActivate,
  onSelect,
}: {
  item: TeamMember;
  isActive: boolean;
  onActivate: () => void;
  onSelect: () => void;
}) {
  return (
    <li
      data-team-item-id={item.id}
      className={clsx(
        'snap-start lg:border-t lg:border-white/55 lg:last:border-b',
      )}
    >
      <button
        type="button"
        data-member-id={item.id}
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
        <span className="relative flex w-full min-w-0 flex-col items-start justify-center gap-[4px] px-[8px] py-[6px] max-lg:[@media_(orientation:landscape)]:!h-full max-lg:[@media_(orientation:landscape)]:!flex-row max-lg:[@media_(orientation:landscape)]:!items-center max-lg:[@media_(orientation:landscape)]:!justify-start max-lg:[@media_(orientation:landscape)]:!gap-3 max-lg:[@media_(orientation:landscape)]:!py-[3px] sm:flex-row sm:items-center sm:justify-start sm:gap-4 sm:px-[9px] sm:py-2 lg:h-full lg:gap-[28px] lg:px-[10px] lg:py-0">
          <span className="max-w-full translate-y-[0.08em] truncate whitespace-nowrap text-[16px] font-medium leading-none max-lg:[@media_(orientation:landscape)]:!text-[15px] sm:text-[22px] lg:text-[24px] min-[1401px]:text-[28px]">
            {item.name}
          </span>
          <span
            className={clsx(
              'inline-flex h-4 w-fit min-w-[176px] max-w-full items-center justify-center overflow-hidden whitespace-nowrap px-2.5 text-center text-[10px] font-medium leading-none text-ellipsis transition-colors max-lg:[@media_(orientation:landscape)]:!h-4 max-lg:[@media_(orientation:landscape)]:!min-w-[150px] max-lg:[@media_(orientation:landscape)]:w-[150px] max-lg:[@media_(orientation:landscape)]:text-[9px] sm:h-[22px] sm:min-w-[207px] sm:text-[12px] lg:h-6 lg:min-w-max lg:text-[16px] min-[1401px]:h-7',
              roleWidthByMemberId[item.id],
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
