import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ServiceModalFeature } from './services.types';

const featurePickerCycles = [-2, -1, 0, 1, 2] as const;
const featurePickerScrollStopDelay = 140;
const featurePickerSnapReleaseDelay = 260;

const isMobileFeaturePickerViewport = () =>
  typeof window !== 'undefined' && window.matchMedia('(max-width: 999.98px)').matches;

type ServiceModalFeaturesProps = {
  features: ServiceModalFeature[];
  isOpen: boolean;
};

export function ServiceModalFeatures({ features, isOpen }: ServiceModalFeaturesProps) {
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0);
  const featureListRef = useRef<HTMLUListElement | null>(null);
  const featureScrollStopTimeoutRef = useRef<number | null>(null);
  const featureSnapReleaseTimeoutRef = useRef<number | null>(null);
  const isFeatureSnapScrollingRef = useRef(false);

  const queueFeatureSnapRelease = (delay: number) => {
    if (featureSnapReleaseTimeoutRef.current !== null) {
      window.clearTimeout(featureSnapReleaseTimeoutRef.current);
    }

    featureSnapReleaseTimeoutRef.current = window.setTimeout(() => {
      featureSnapReleaseTimeoutRef.current = null;
      isFeatureSnapScrollingRef.current = false;
    }, delay);
  };

  const clearFeatureScrollStopTimer = () => {
    if (featureScrollStopTimeoutRef.current === null) {
      return;
    }

    window.clearTimeout(featureScrollStopTimeoutRef.current);
    featureScrollStopTimeoutRef.current = null;
  };

  const scrollFeatureRowToCenter = useCallback((
    row: HTMLLIElement,
    behavior: ScrollBehavior,
  ) => {
    const list = featureListRef.current;

    if (!list) {
      return;
    }

    const targetScrollTop =
      row.offsetTop - (list.clientHeight - row.offsetHeight) / 2;

    list.scrollTo({
      top: Math.max(0, targetScrollTop),
      behavior,
    });
  }, []);

  const getCenteredFeatureRow = useCallback(() => {
    const list = featureListRef.current;

    if (!list) {
      return null;
    }

    const listRect = list.getBoundingClientRect();
    const listCenterY = listRect.top + listRect.height / 2;
    const rows = Array.from(
      list.querySelectorAll<HTMLLIElement>('[data-feature-index]'),
    );
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

    return closestRow;
  }, []);

  const centerFeature = useCallback((index: number) => {
    const list = featureListRef.current;

    if (!list || !isMobileFeaturePickerViewport()) {
      setActiveFeatureIndex(index);
      return;
    }

    const rows = Array.from(
      list.querySelectorAll<HTMLLIElement>(`[data-feature-index="${index}"]`),
    );
    const listRect = list.getBoundingClientRect();
    const listCenterY = listRect.top + listRect.height / 2;
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

    if (!closestRow) {
      setActiveFeatureIndex(index);
      return;
    }

    isFeatureSnapScrollingRef.current = true;
    clearFeatureScrollStopTimer();
    scrollFeatureRowToCenter(closestRow, 'smooth');
    setActiveFeatureIndex(index);

    queueFeatureSnapRelease(featurePickerSnapReleaseDelay);
  }, [scrollFeatureRowToCenter]);

  const selectCenteredFeature = useCallback((snapToFeature = true) => {
    if (!isMobileFeaturePickerViewport()) {
      return;
    }

    const centeredRow = getCenteredFeatureRow();
    const nextIndex = Number(centeredRow?.dataset.featureIndex);

    if (!centeredRow || Number.isNaN(nextIndex)) {
      return;
    }

    setActiveFeatureIndex(nextIndex);

    const centerCycleRow = featureListRef.current?.querySelector<HTMLLIElement>(
      `[data-feature-index="${nextIndex}"][data-feature-cycle="0"]`,
    );

    if (snapToFeature && centerCycleRow) {
      isFeatureSnapScrollingRef.current = true;
      scrollFeatureRowToCenter(centerCycleRow, 'auto');

      queueFeatureSnapRelease(0);
    }
  }, [getCenteredFeatureRow, scrollFeatureRowToCenter]);

  const scheduleCenteredFeatureSelection = useCallback(() => {
    clearFeatureScrollStopTimer();

    featureScrollStopTimeoutRef.current = window.setTimeout(() => {
      featureScrollStopTimeoutRef.current = null;
      selectCenteredFeature();
    }, featurePickerScrollStopDelay);
  }, [selectCenteredFeature]);

  const mobileFeatureItems = useMemo(
    () =>
      featurePickerCycles.flatMap((cycle) =>
        features.map((feature, index) => ({
          cycle,
          feature,
          index,
          key: `${cycle}-${feature.title}`,
        })),
      ),
    [features],
  );

  useEffect(() => () => {
    clearFeatureScrollStopTimer();
    if (featureSnapReleaseTimeoutRef.current !== null) {
      window.clearTimeout(featureSnapReleaseTimeoutRef.current);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const resetFrame = window.requestAnimationFrame(() => {
      setActiveFeatureIndex(0);
      const firstCenterRow = featureListRef.current?.querySelector<HTMLLIElement>(
        '[data-feature-index="0"][data-feature-cycle="0"]',
      );

      if (firstCenterRow) {
        scrollFeatureRowToCenter(firstCenterRow, 'auto');
      }
    });

    return () => {
      window.cancelAnimationFrame(resetFrame);
    };
  }, [features, isOpen, scrollFeatureRowToCenter]);

  const handleFeatureListScroll = () => {
    if (!isMobileFeaturePickerViewport() || isFeatureSnapScrollingRef.current) {
      return;
    }

    const centeredRow = getCenteredFeatureRow();
    const nextIndex = Number(centeredRow?.dataset.featureIndex);

    if (!Number.isNaN(nextIndex)) {
      setActiveFeatureIndex(nextIndex);
    }

    scheduleCenteredFeatureSelection();
  };

  return (
    <div className="order-1 relative min-w-0 min-[1000px]:order-2 min-[1000px]:self-end">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-0 right-1 top-1/2 z-10 h-[64px] -translate-y-1/2 bg-[#63ff45]/[0.08] shadow-[0_0_34px_rgba(99,255,69,0.14)] min-[1000px]:hidden"
      />
      <ul
        ref={featureListRef}
        className="relative z-20 flex h-[188px] touch-pan-y snap-y snap-mandatory flex-col overflow-y-auto overflow-x-hidden overscroll-contain py-[62px] pr-1 text-left [mask-image:linear-gradient(to_bottom,transparent_0%,#000_16%,#000_50%,#000_84%,transparent_100%)] [scrollbar-width:none] min-[1000px]:hidden [&::-webkit-scrollbar]:hidden"
        onScroll={handleFeatureListScroll}
      >
        {mobileFeatureItems.map(({ cycle, feature, index, key }) => {
          const isActive = index === activeFeatureIndex;

          return (
            <li
              key={key}
              className="snap-center"
              data-feature-cycle={cycle}
              data-feature-index={index}
            >
              <button
                type="button"
                aria-pressed={isActive}
                className={[
                  'group relative block min-h-[64px] w-full flex-[0_0_64px] cursor-pointer overflow-hidden text-left uppercase transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#63ff45]',
                  isActive ? 'text-black' : 'text-white',
                ].join(' ')}
                onClick={() => centerFeature(index)}
              >
                <span
                  aria-hidden="true"
                  className={[
                    'absolute inset-y-0 left-0 right-0 overflow-hidden bg-[linear-gradient(90deg,#63ff45_0%,#63ff45_32%,rgba(99,255,69,0.68)_54%,rgba(99,255,69,0.32)_76%,rgba(99,255,69,0.12)_90%,rgba(99,255,69,0)_100%)] transition-opacity duration-200',
                    isActive
                      ? 'opacity-100'
                      : 'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100',
                  ].join(' ')}
                >
                  <span
                    className="absolute inset-y-0 right-0 w-[54%] backdrop-blur-[4px] [mask-image:linear-gradient(90deg,transparent_0%,#000_55%,#000_78%,rgba(0,0,0,0.35)_100%)] [-webkit-mask-image:linear-gradient(90deg,transparent_0%,#000_55%,#000_78%,rgba(0,0,0,0.35)_100%)]"
                  />
                </span>
                <span className="relative flex min-h-[64px] w-full min-w-0 flex-col justify-center px-2 py-2">
                  <span
                    className={[
                      'block text-[14px] font-black uppercase leading-none transition-colors group-hover:text-black group-focus-visible:text-black sm:text-[15px]',
                      isActive ? 'text-black' : 'text-[#63ff45]',
                    ].join(' ')}
                  >
                    {feature.title}
                  </span>
                  <span
                    className={[
                      'mt-1.5 block text-[12px] leading-[1.04] transition-colors group-hover:text-black group-focus-visible:text-black sm:text-[13px]',
                      isActive ? 'text-black' : 'text-white',
                    ].join(' ')}
                  >
                    {feature.description}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <div className="relative z-20 hidden text-left min-[1000px]:grid min-[1000px]:grid-cols-[repeat(2,minmax(0,1fr))] min-[1000px]:items-start min-[1000px]:gap-x-8 min-[1000px]:gap-y-6 min-[1400px]:grid-cols-[repeat(4,minmax(0,1fr))] min-[1400px]:gap-x-11">
        {features.map((feature, index) => {
          const isActive = index === activeFeatureIndex;

          return (
            <button
              key={feature.title}
              type="button"
              aria-pressed={isActive}
              className="group relative block w-full cursor-default overflow-visible text-left normal-case transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#63ff45]"
              onClick={() => setActiveFeatureIndex(index)}
            >
              <span className="relative block w-full min-w-0">
                <span
                  className={[
                    'block text-[17px] font-black uppercase leading-none transition-colors',
                    isActive ? 'text-[#63ff45]' : 'text-[#63ff45]',
                  ].join(' ')}
                >
                  {feature.title}
                </span>
                <span
                  className={[
                    'mt-1.5 block text-[14px] leading-[1.12] transition-colors',
                    isActive ? 'text-white' : 'text-white',
                  ].join(' ')}
                >
                  {feature.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
