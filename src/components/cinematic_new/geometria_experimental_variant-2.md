# geometria_experimental_variant-2

Предыдущий экспериментальный вариант геометрии до правки transition geometry.

## Что фиксирует файл

Это состояние, которое было до добавления `slideProgress`, `transitionPulse`, временного `transitionGap` и ускоренного `sideProgress`.

Вариант имел хороший статичный вид:

- широкий центральный кадр;
- видимые боковые кадры;
- единая высота кадров;
- явный gap между center и side;
- offscreen-buffer через роли `buffer` / `sleeping`.

Но в середине `next/previous` оставался риск overlap/motion-проблемы: промежуточные offsets могли одновременно держать кадры крупными и близкими.

## Базовые desktop constants

Такие же, как в текущем варианте:

```ts
const DESKTOP_FILM_STRIP_LAYOUT: FilmStripLayoutConfig = {
  centerWidthRatio: 0.71,
  centerMaxWidthRatio: 0.74,
  centerAspect: 16 / 4.15,
  maxHeightRatio: 0.38,
  tallDesktopMinHeight: {
    minViewportHeight: 960,
    height: 550,
    maxHeightRatio: 0.52,
  },
  gap: {
    min: 20,
    max: 70,
    ratio: 0.026,
  },
  sideVisibleRatio: 0.46,
  sideScale: 0.96,
  sideRotationY: 0.1,
  bend: {
    center: 46,
    side: 58,
    buffer: 64,
  },
  edgeCurve: {
    center: 10,
    side: 24,
    buffer: 28,
  },
  hiddenOffset: 2.5,
};
```

## Базовые mobile constants

Такие же, как в текущем варианте:

```ts
const MOBILE_FILM_STRIP_LAYOUT: FilmStripLayoutConfig = {
  centerWidthRatio: 0.82,
  centerMaxWidthRatio: 0.88,
  centerAspect: 16 / 4,
  maxHeightRatio: 0.42,
  gap: {
    min: 14,
    max: 28,
    ratio: 0.04,
  },
  sideVisibleRatio: 0.34,
  sideScale: 0.94,
  sideRotationY: 0.07,
  bend: {
    center: 34,
    side: 50,
    buffer: 54,
  },
  edgeCurve: {
    center: 8,
    side: 18,
    buffer: 20,
  },
  hiddenOffset: 2.5,
};
```

## Предыдущая формула geometry

```ts
const sideX = centerWidth / 2 + metrics.gap + metrics.sideWidth / 2;
const bufferStep = metrics.sideWidth + metrics.gap;
const distanceFromCenter = absOffset <= 1 ? absOffset * sideX : sideX + (absOffset - 1) * bufferStep;
const sideProgress = smoothstep01(absOffset);
const stripX = direction * distanceFromCenter;
```

## Поведение

- Gap всегда равен `metrics.gap`, без временной compensation.
- `sideProgress` зависит только от `absOffset`.
- Статичный вид хороший и предсказуемый.
- В середине transition кадры могли оставаться слишком крупными относительно расстояния между ними.
- `renderOrder` сам по себе не решал проблему, потому что причина overlap была в transition geometry.

## Когда возвращаться к этому варианту

Возвращаться к variant-2 стоит только если variant-1 ухудшит ощущение движения:

- кадры начнут слишком заметно расходиться в середине перехода;
- движение станет похоже на растягивание ленты;
- боковые кадры потеряют визуальную связь с центральным;
- dynamic gap будет выглядеть менее естественно, чем исходный continuous motion.

Если variant-2 возвращается, следующая попытка должна быть не renderOrder/contain, а min-distance constraint поверх этой базовой формулы.
