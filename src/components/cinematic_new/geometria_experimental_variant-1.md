# geometria_experimental_variant-1

Текущий экспериментальный вариант геометрии после правки transition geometry и увеличения композиции.

## Цель варианта

Сохранить хороший статичный вид киноленты, уменьшить overlap в середине перехода `next/previous`, увеличить общую ширину композиции и показать видео в центральном кадре полностью.

Главная идея: статичный layout не менять, а во время `mode === 'sliding'` временно добавить separation-компенсацию:

- кадры чуть сильнее расходятся через dynamic gap;
- уходящий центральный кадр быстрее сужается к side-size;
- входящий кадр меньше конфликтует с уходящим по ширине;
- после завершения transition все временные множители возвращаются к `0`.

## Базовые desktop constants

```ts
const DESKTOP_FILM_STRIP_LAYOUT: FilmStripLayoutConfig = {
  centerWidthRatio: 0.78,
  centerMaxWidthRatio: 0.82,
  centerAspect: 16 / 6.4,
  maxHeightRatio: 0.54,
  tallDesktopMinHeight: {
    minViewportHeight: 960,
    height: 650,
    maxHeightRatio: 0.64,
  },
  gap: {
    min: 20,
    max: 70,
    ratio: 0.026,
  },
  sideVisibleRatio: 0.34,
  sideScale: 1.02,
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

```ts
const MOBILE_FILM_STRIP_LAYOUT: FilmStripLayoutConfig = {
  centerWidthRatio: 0.9,
  centerMaxWidthRatio: 0.94,
  centerAspect: 16 / 6.2,
  maxHeightRatio: 0.58,
  gap: {
    min: 14,
    max: 28,
    ratio: 0.04,
  },
  sideVisibleRatio: 0.28,
  sideScale: 1,
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

## Motion state

Добавлен `slideProgress`.

```ts
private slideProgress = 0;
```

В `slideTo()`:

```ts
this.slideProgress = motion.progress;
this.slideVelocity = direction * (0.18 + velocityPulse(motion.progress) * 1.18);
```

На завершении:

```ts
this.slideProgress = 0;
this.slideVelocity = 0;
```

## Текущая формула transition geometry

```ts
const transitionPulse = this.mode === 'sliding' ? velocityPulse(this.slideProgress) : 0;
const transitionGap = metrics.gap * transitionPulse * (isMobile ? 0.18 : 0.32);
const effectiveGap = metrics.gap + transitionGap;
const sideX = centerWidth / 2 + effectiveGap + metrics.sideWidth / 2;
const bufferStep = metrics.sideWidth + effectiveGap;
const distanceFromCenter = absOffset <= 1 ? absOffset * sideX : sideX + (absOffset - 1) * bufferStep;
const sideProgress = smoothstep01(absOffset * (1 + transitionPulse * (isMobile ? 0.12 : 0.18)));
const stripX = direction * distanceFromCenter;
```

## Поведение

- В статике `transitionPulse = 0`, поэтому layout равен базовой геометрии.
- В середине transition `velocityPulse()` близок к `1`, поэтому gap временно шире.
- Desktop получает мягкую compensation: `gap * 0.32`, mobile мягче: `gap * 0.18`.
- `sideProgress` ускоряется умеренно: на desktop до множителя `1.18`, на mobile до `1.12`.
- Высота видимых кадров не меняется: `sideHeight = centerHeight`.
- `containMix` возвращен в `0.0`, чтобы сохранить чистую целостную сцену без затемненных боковых зон.

## Central video contain status

Contain для активного центрального кадра был проверен:

```glsl
float containMix = uActive;
```

Но вариант дал видимый эффект opacity/затемнения по бокам центрального слайда. Поэтому текущий чистый вариант возвращен к:

```glsl
float containMix = 0.0;
```

Вывод: для полного видео без нарушения целостности сцены нужен другой подход, скорее через изменение aspect/исходника/кадрирования, а не через затемненную contain-подложку.

Дополнительно проверен чистый contain без подложки. Он показывает видео полностью, но центральный кадр визуально теряет заполненность и выглядит как уменьшенный прямоугольник внутри широкой ленты. Это подтверждает конфликт между 100% full video и цельной широкой кинолентой при несовпадающих aspect видео и кадра.

## Проверка

Проверять нужно mid-transition:

```js
document.querySelector('button[aria-label="Next project"]')?.click();
await new Promise((resolve) => setTimeout(resolve, 650));
```

Критерии:

- нет очевидного overlap между центральным и боковыми кадрами;
- боковые кадры не моргают;
- центр остается крупным в статике;
- движение сохраняет ощущение прокрутки ленты;
- после завершения перехода layout возвращается к обычной статичной геометрии.
