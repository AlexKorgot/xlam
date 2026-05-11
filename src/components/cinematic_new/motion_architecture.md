# Motion architecture

Документ фиксирует, как `cinematic_new` получает эффект непрерывной киноленты, почему поведение может меняться на разных viewport и какие гипотезы стоит проверять перед следующими правками.

## Где находится motion

Главный файл motion-логики - `SliderScene.ts`.

- `slidePosition` - единственный источник положения ленты. Это не индекс React-слайда, а непрерывная координата.
- `centeredOffset(index, slidePosition, total)` переводит каждый plane в дробный offset относительно текущего центра.
- `getLayoutForOffset(offset)` каждый кадр пересчитывает позицию, размер, opacity, bend, darkness, rotation и velocity.
- `VideoPlane.applyLayout()` переносит layout в mesh transform и shader uniforms.
- `videoPlane.ts` превращает прямоугольную plane geometry в изогнутую ленту через shader.

DOM отвечает за UI, текст и кнопки. WebGL отвечает за видео, геометрию, деформацию и fullscreen morph.

## Как получается бесконечность

Бесконечность держится не DOM-клонами, а математикой:

```ts
const offset = centeredOffset(index, this.slidePosition, this.slides.length);
```

`centeredOffset()` нормализует смещение вокруг текущей позиции. При 5 слайдах доступны смысловые роли:

- `0` - центральный кадр;
- `-1 / +1` - боковые видимые кадры;
- `-2 / +2` - offscreen-buffer;
- дальше - sleeping.

Когда пользователь нажимает next/previous, `slidePosition` анимируется на `+1` или `-1`. Mesh не переставляются вручную. На каждом `onUpdate` все planes получают новые дробные offsets, поэтому кадры плавно переходят между ролями.

## Как получается плавность

В `slideTo()` GSAP анимирует объект:

```ts
const motion = { position: from, progress: 0 };
```

Во время tween:

- `motion.position` идет от текущей позиции к следующей;
- `motion.progress` идет от `0` до `1`;
- `slidePosition = motion.position`;
- `slideProgress = motion.progress`;
- `slideVelocity = direction * (0.18 + velocityPulse(progress) * 1.18)`;
- `applySliderLayout()` пересчитывает всю ленту.

`velocityPulse(progress)` сейчас равен `sin(progress * PI)`. Это дает максимум скорости в середине перехода и мягкое снижение к концу. `uVelocity` затем используется shader для легкого UV-смещения:

```glsl
motionUv.x += (vUv.y - 0.5) * uVelocity * 0.016;
```

Именно это добавляет ощущение движения видеопленки, а не только перемещения карточек.

## Роли кадров

`getSlideRole(offset)` задает визуальную роль:

- `absOffset < 0.5` - `center`;
- `absOffset < 1.5` - `side`;
- `absOffset <= hiddenOffset` - `buffer`;
- иначе `sleeping`.

Роль влияет на:

- opacity;
- renderOrder;
- reset inactive video;
- bend/edgeCurve/darkness через `lerpByStripRole()`;
- то, насколько кадр считается частью видимой ленты или буфером.

Reset видео выполняется только когда кадр уходит в `sleeping`. Это важно: кадр, который только вышел за край, еще может понадобиться при обратном движении.

## Геометрия кадра

Размеры считаются в `getFilmStripFrameMetrics()` от viewport.

Текущий desktop config:

- `centerWidthRatio: 0.78`;
- `centerMaxWidthRatio: 0.82`;
- `centerAspect: 16 / 6.4`;
- `maxHeightRatio: 0.54`;
- tall desktop target `650px`, но не выше `64%` viewport height;
- gap: `clamp(width * 0.026, 20, 70)`;
- `sideVisibleRatio: 0.34`;
- `sideScale: 1.02`.

Текущий mobile config:

- `centerWidthRatio: 0.9`;
- `centerMaxWidthRatio: 0.94`;
- `centerAspect: 16 / 6.2`;
- `maxHeightRatio: 0.58`;
- gap: `clamp(width * 0.04, 14, 28)`;
- `sideVisibleRatio: 0.28`;
- `sideScale: 1`.

Важная особенность: `sideHeight = centerHeight`. Боковые кадры не уменьшаются по высоте, чтобы лента читалась цельной.

## Позиция кадра

В `getLayoutForOffset()` позиция считается от ширины центра, ширины бокового кадра и gap:

```ts
const sideX = centerWidth / 2 + effectiveGap + metrics.sideWidth / 2;
const bufferStep = metrics.sideWidth + effectiveGap;
const distanceFromCenter = absOffset <= 1
  ? absOffset * sideX
  : sideX + (absOffset - 1) * bufferStep;
```

Для `offset` между `0` и `1` кадр движется от центра к боковой позиции. Для offsets дальше `1` он уходит в buffer/sleeping через отдельный шаг.

Во время sliding добавляется transition compensation:

```ts
const transitionPulse = this.mode === 'sliding' ? velocityPulse(this.slideProgress) : 0;
const transitionGap = metrics.gap * transitionPulse * (isMobile ? 0.18 : 0.32);
const effectiveGap = metrics.gap + transitionGap;
const sideProgress = smoothstep01(absOffset * (1 + transitionPulse * (isMobile ? 0.12 : 0.18)));
```

Смысл:

- в середине перехода gap немного расширяется;
- уходящий центр чуть быстрее движется к side-size;
- уменьшается риск, что два крупных кадра окажутся слишком близко.

## Как работает изгиб

В vertex shader используется глобальная X-координата:

```glsl
float globalX = (uStripOffset + position.x * uPlaneSize.x) / max(uViewportSize.x * 0.5, 1.0);
float curve = globalX * globalX;
transformed.z += curve * bend;
```

Ключевой момент: bend зависит не только от локальной плоскости, а от положения кадра на общей ленте. Поэтому центральный и боковые кадры могут читаться как части одной дуги.

`uEdgeCurve` дополнительно выгибает верхнюю и нижнюю кромку:

```glsl
transformed.y += sign(position.y) * curve * uEdgeCurve * edgeMask * unbend;
```

При fullscreen active plane распрямляется через:

```glsl
float unbend = 1.0 - (uTransitionProgress * uActive);
```

## Видео и кадрирование

Сейчас shader работает в чистом `cover`:

```glsl
float containMix = 0.0;
```

Это сознательный компромисс:

- `cover` сохраняет заполненную широкую ленту;
- `contain` показывает видео полностью, но дает поля и ломает ощущение большой цельной киноленты;
- `videoObjectPosition` позволяет смещать crop без изменения layout.

Видео может визуально менять масштаб во время движения, потому что `frameWidth` интерполируется между `centerWidth` и `sideWidth`, а shader `coverUv()` каждый раз пересчитывает UV под новый `uPlaneSize`. Это технически корректно, но перцептивно может ослаблять цельность: зритель видит не только движение ленты, но и изменение масштаба/кропа видео внутри кадра.

## Почему на разных viewport лента может вести себя по-разному

Причины заложены в формулах:

1. Ширина и высота центра ограничивают друг друга.
   `centerWidth` сначала считается от width, но если высота упирается в `maxHeightRatio`, ширина пересчитывается назад от `centerHeight * centerAspect`. На низких экранах лента может становиться уже, чем ожидается по width-ratio.

2. Gap имеет clamp.
   На маленьких viewport gap упирается в min, на широких - в max. Поэтому относительная доля gap в композиции меняется.

3. Side width зависит от оставшегося места.
   `sideVisibleWidth = width / 2 - centerWidth / 2 - gap`. Если центр широкий или viewport узкий, боковая видимость резко уменьшается.

4. Mobile и desktop используют разные config.
   Порог `viewport.x < 760` резко меняет ratios, gap, bend, side visibility и max height.

5. Camera Z зависит от height.
   `camera.position.z = getCameraZ(height)`. На разной высоте меняется перспектива и визуальная сила Z-изгиба.

6. Bend нормализуется через `uViewportSize.x`.
   В shader `globalX` делится на `viewport.x * 0.5`. Одинаковый pixel offset на разных ширинах дает разную кривизну.

7. Transition compensation зависит от gap.
   `transitionGap = metrics.gap * pulse * ratio`. Если gap зажат clamp-ом, сила компенсации меняется относительно размера кадра.

8. Cover crop зависит от aspect кадра.
   Когда frame width/height меняются, `coverUv()` меняет масштаб UV. Поэтому одно и то же видео может восприниматься иначе на разных viewport и в разные моменты перехода.

## Числовая проверка текущих metrics

Расчет ниже повторяет текущую формулу `getFilmStripFrameMetrics()` и показывает, почему разные viewport дают разное ощущение.

| viewport | mode | center | gap | side visible | side width | sideX |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| `1280x720` | desktop | `972.0x388.8` | `33.3` | `120.7` | `355.1` | `696.8` |
| `1440x900` | desktop | `1123.2x449.3` | `37.4` | `121.0` | `355.8` | `776.9` |
| `1920x1080` | desktop | `1497.6x599.0` | `49.9` | `161.3` | `474.4` | `1035.9` |
| `2560x1080` | desktop wide | `1625.0x650.0` | `66.6` | `400.9` | `1179.2` | `1468.7` |
| `390x844` | mobile | `351.0x136.0` | `15.6` | `3.9` | `13.9` | `198.1` |

Выводы:

- На `1280x720` и `1440x900` боковая видимая ширина почти одинаковая, хотя центр растет. Поэтому композиция может ощущаться плотнее/уже на одном viewport и просторнее на другом.
- На `1920x1080` боковая видимость увеличивается, потому что остается больше места вокруг центра.
- На `2560x1080` tall height limit делает центр `1625x650`, а боковая ширина резко растет до `1179px`. Wide desktop поэтому может ощущаться иначе: больше бокового материала, больше дуги, другой crop.
- На `390x844` почти не остается места для бокового кадра (`3.9px` visible по формуле). Mobile фактически требует отдельной композиционной логики, иначе боковые могут стать почти символическими.

## Гипотезы для более неразрывного движения

### 1. Развести физический размер кадра и video crop

Проблема: сейчас изменение `uPlaneSize` меняет не только геометрию кадра, но и cover-кроп. Во время перехода зритель может видеть масштабирование видео.

Гипотеза: добавить отдельный uniform для video sampling size, например `uSamplingPlaneSize`, и сглаживать его медленнее или держать ближе к center size во время transition. Геометрия может становиться side-size, но video crop не будет так заметно "дышать".

Риск: если sampling size слишком отделить от геометрии, видео может выглядеть неестественно или терять ожидаемый cover.

### 2. Сделать width transition менее заметным

Проблема: `frameWidth = lerp(centerWidth, sideWidth, sideProgress)`. Даже при плавном движении кадр меняет размер.

Гипотеза: оставить ширину видимых кадров ближе друг к другу во время sliding, а различие center/side сильнее проявлять в статике. Например, во время transition использовать отдельный `motionSideProgress`, который меньше влияет на width, но сохраняет позицию и bend.

Риск: может вернуться overlap, если не добавить min-distance constraint.

### 3. Ввести min-distance constraint

Проблема: transition compensation сейчас эвристическая: небольшой dynamic gap + ускоренный sideProgress.

Гипотеза: считать позиции соседей с ограничением:

```ts
minDistance = (currentWidth + neighborWidth) / 2 + gap;
```

Так лента математически не сможет пересечься в середине перехода. Это наиболее строгий способ убрать overlap без чрезмерного renderOrder.

Риск: если constraint применять резко, движение станет похожим на растягивание ленты. Нужен soft constraint через smoothstep.

### 4. Нормализовать motion относительно композиции, а не viewport

Проблема: часть величин зависит от viewport width, часть от frame width, часть от gap. На разных экранах это меняет характер движения.

Гипотеза: ввести единый `stripUnit`, например `sideX` или `centerWidth`, и выражать transition compensation, velocity influence, fadeMargin и bufferStep как доли этого unit.

Риск: придется заново проверять все viewport, но поведение станет предсказуемее.

### 5. Уменьшить изменение crop во время движения

Проблема: `coverUv()` пересчитывается от текущего `frameWidth/frameHeight`. Чем сильнее меняется aspect кадра, тем сильнее меняется crop.

Гипотеза: подобрать `sideWidth` и `centerWidth` так, чтобы aspect center/side был ближе, либо временно стабилизировать aspect во время sliding. Сейчас `sideHeight = centerHeight`, поэтому aspect меняется только из-за width. Чем меньше разница widths, тем меньше "дыхание" видео.

Риск: центр может стать менее главным, если width contrast уменьшить слишком сильно.

### 6. Сделать bend/edgeCurve непрерывнее относительно globalX

Проблема: роль кадра меняется по `absOffset`, а shader-дуга по globalX. Если эти две системы расходятся, может появляться ощущение отдельных карточек.

Гипотеза: часть bend/edgeCurve считать не от role, а от фактического `stripX / viewport.x`, чтобы deformation была полностью привязана к положению на общей дуге.

Риск: боковые могут получить слишком сильный bend на узких viewport.

### 7. Проверять не только финальный кадр, а временные точки

Для оценки движения нужны минимум четыре состояния:

- static initial;
- `next` на `320ms`;
- `next` на `650ms`;
- after transition;
- opened/closed.

Их нужно проверять на `1280x720`, `1440x900`, `1920x1080`, wide desktop и mobile. Главный дефект может быть виден только в середине transition.

## Рекомендуемый следующий порядок

1. Зафиксировать screenshots по viewport и mid-transition.
2. Если проблема только в разных viewport - нормализовать metrics/transition constants.
3. Если проблема в overlap - добавить soft min-distance constraint.
4. Если проблема в "дыхании" видео - отделить sampling size от plane size или уменьшить width/aspect изменение во время transition.
5. Если проблема в ощущении отдельных карточек - привязать bend/edgeCurve сильнее к globalX и общей дуге.
