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
float globalX = (uStripOffset + position.x * uPlaneSize.x) / max(uCurveScale, 1.0);
float curve = globalX * globalX;
transformed.z += curve * bend;
```

Ключевой момент: bend зависит не только от локальной плоскости, а от положения кадра на общей ленте. Поэтому центральный и боковые кадры могут читаться как части одной дуги.

`uCurveScale` считается от композиции ленты, а не от полной ширины viewport:

```ts
const curveScale = Math.min(width * 0.5, centerWidth * 0.64);
```

Это сохраняет поведение на `1920`, где старая нормализация уже выглядела хорошо, и усиливает дугу на wide viewport. До этой правки `3400` выглядел слабее, потому что shader делил `globalX` на `viewport.x * 0.5`, и одинаковый pixel offset давал меньшую кривизну на широком экране.

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

Видео могло визуально менять масштаб во время движения, потому что `frameWidth` интерполируется между `centerWidth` и `sideWidth`, а shader `coverUv()` пересчитывал UV под текущий `uPlaneSize`. Это технически корректно, но перцептивно может ослаблять цельность: зритель видит не только движение ленты, но и изменение масштаба/кропа видео внутри кадра.

Эта гипотеза проверялась через отдельный sampling-размер `uSamplingPlaneSize`, но визуально ухудшила движение: видео стало ощущаться отделенным от геометрии. Проверка отклонена, код возвращен к одному `uPlaneSize` для geometry и cover sampling.

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

6. Bend нормализуется через `uCurveScale`.
   `globalX` делится на композиционный scale ленты: `Math.min(width * 0.5, centerWidth * 0.64)`. Wide viewport больше не ослабляет дугу только из-за большой ширины экрана.

7. Transition compensation зависит от gap.
   `transitionGap = metrics.gap * pulse * ratio`. Если gap зажат clamp-ом, сила компенсации меняется относительно размера кадра.

8. Cover crop зависит от aspect кадра.
   Когда frame width/height меняются, `coverUv()` меняет масштаб UV. Поэтому одно и то же видео может восприниматься иначе на разных viewport и в разные моменты перехода.

## Числовая проверка текущих metrics

Расчет ниже повторяет текущую формулу `getFilmStripFrameMetrics()` и показывает, почему разные viewport дают разное ощущение.

| viewport | mode | center | gap | side visible | side width | sideX |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| `1280x720` | desktop | `972.0x388.8` | `33.3` | `120.7` | `972.0` | `1005.3` |
| `1440x900` | desktop | `1123.2x449.3` | `37.4` | `121.0` | `1123.2` | `1160.6` |
| `1920x1080` | desktop | `1497.6x599.0` | `49.9` | `161.3` | `1497.6` | `1547.5` |
| `2560x1080` | desktop wide | `1625.0x650.0` | `66.6` | `400.9` | `1625.0` | `1691.6` |
| `3400x1080` | desktop wide | `1625.0x650.0` | `70.0` | `817.5` | `1625.0` | `1695.0` |
| `390x844` | mobile | `351.0x136.0` | `15.6` | `3.9` | `351.0` | `366.6` |
| `430x932` | mobile | `387.0x150.0` | `17.2` | `4.3` | `387.0` | `404.2` |

Выводы:

- Боковой кадр теперь всегда равен центральному по physical width/height, поэтому aspect кадра стабилен между ролями.
- Разница между viewport остается только в `side visible`: на узких экранах видна малая часть полноценного side plane, на wide видна большая часть.
- На `1920x1080` и `3400x1080` больше нет разного width morph: side равен center в обоих случаях.
- На mobile side plane тоже полноценный (`351px` при `390x844`), но видимая часть может быть всего несколько пикселей. Это ожидаемый viewport crop, а не уменьшение самого видео.

## Сравнение движения 1920 и 3400

Старая формула давала принципиально разный morph между `1920x1080` и wide viewport около `3400px`. После подтвержденной правки `sideWidth = centerWidth` эта причина снята.

На `1920x1080`:

- static center: `1497.6x599.0`, aspect `2.50`;
- static side: `1497.6x599.0`, aspect `2.50`;
- mid-transition при `absOffset = 0.5`, `transitionPulse = 1`:
  - physical frame width: `1497.6`, aspect `2.50`;
  - shader sampling aspect остается `2.50`.

На `3400x1080`:

- static center: `1625.0x650.0`, aspect `2.50`;
- static side: `1625.0x650.0`, aspect `2.50`;
- mid-transition:
  - physical frame width: `1625.0`, aspect `2.50`;
  - shader sampling aspect остается `2.50`.

На `3400x1440`:

- static center: `1625.0x650.0`, aspect `2.50`;
- static side: `1625.0x650.0`, aspect `2.50`;
- mid-transition:
  - physical frame width: `1625.0`, aspect `2.50`;
  - shader sampling aspect остается `2.50`.

Вывод:

- На `1920x1080`, `3400x1080` и `3400x1440` side frame теперь равен center frame по ширине и высоте. Aspect/crop morph между ролями снят.
- Высота продолжает влиять на абсолютный размер центра через `maxHeightRatio` и tall desktop rule, но больше не создает отдельную ширину side frame.
- Главная оставшаяся разница между viewport: сколько полноценного side plane попадает в видимую область. Это viewport crop, а не трансформация видео.

### Отклоненная проверка: ограничить side width сверху

Для проверки гипотезы wide viewport ограничивали через desktop `sideScale: 0.72` вместо `1.02`.

После этой правки:

- `1920x1080` почти не меняется: side остается `474.4x599.0`, потому что его ширину ограничивает не `sideScale`, а доступное видимое место и `sideVisibleRatio`.
- `3400x1080` меняется заметно: side становится `1170.0x650.0` вместо `1657.5x650.0`.
- `3400x1440` side становится `1399.7x777.6` вместо `1935.3x777.6`.
- На wide viewport mid-transition aspect становится ближе к `2.06`, а sampling aspect к `2.29`; раньше они были около `2.5`.

Вывод: вариант нормализовал wide viewport, но визуально ухудшил поведение. Проверка отклонена, `sideScale` возвращен в `1.02`.

### Отклоненная проверка: поднять минимальную side width на desktop

Гипотеза: проблема `1920` не в том, что wide слишком мягкий, а в том, что на `1920` side frame физически слишком узкий. При этом видимую часть бокового кадра можно оставить прежней: увеличить саму plane width, но сильнее увести ее за viewport.

Для проверки добавлялся desktop `sideMinScale: 0.58`.

После этой правки:

- `1280x720`: side становится `563.8x388.8`, side aspect `1.45`, mid aspect около `1.83`;
- `1920x1080`: side становится `868.6x599.0`, side aspect `1.45`, mid aspect около `1.83`;
- `3400x1080`: side остается `1657.5x650.0`, side aspect `2.55`;
- `3400x1440`: side остается `1935.3x777.6`, side aspect `2.49`.

Результат: проверка отклонена по запросу пользователя. На тот момент код был возвращен к формуле без `sideMinScale`: `sideWidth = Math.min(sideVisibleWidth / sideVisibleRatio, centerWidth * sideScale)`. Позже эта формула заменена подтвержденным решением `sideWidth = centerWidth`.

### Подтвержденное решение: одинаковый center/side aspect

Проверенная и зафиксированная правка:

```ts
const sideWidth = centerWidth;
const sideHeight = centerHeight;
```

Результат подтвержден на desktop и mobile. Боковой кадр теперь имеет тот же physical aspect, что и центральный. Поэтому при переходе `frameWidth = lerp(centerWidth, sideWidth, sideProgress)` больше не создает aspect morph между ролями слайда: shader `coverUv()` получает стабильное соотношение кадра, а видео не "дышит" из-за изменения ширины plane.

Боковая видимость теперь достигается не уменьшением самого бокового кадра, а его позицией относительно viewport:

```ts
const sideX = centerWidth / 2 + effectiveGap + metrics.sideWidth / 2;
```

Чем уже viewport, тем меньшая часть полноценного side plane попадает в видимую область. Это сохраняет цельность движения: кадр остается тем же по масштабу и aspect, а viewport работает как crop окна ленты.

## Гипотезы для более неразрывного движения

### 1. Развести физический размер кадра и video crop - отклонено

Проблема: сейчас изменение `uPlaneSize` меняет не только геометрию кадра, но и cover-кроп. Во время перехода зритель может видеть масштабирование видео.

Проверочная правка: добавлялся uniform `uSamplingPlaneSize`, и shader использовал его для video sampling. Результат стал хуже, потому что видео начало ощущаться отдельно от геометрии. Правка откатана.

Риск: если sampling size слишком отделить от геометрии, видео может выглядеть неестественно или терять ожидаемый cover.

### 2. Сделать width transition менее заметным - подтверждено

Проблема была в том, что `frameWidth = lerp(centerWidth, sideWidth, sideProgress)` менял размер кадра во время движения, потому что `sideWidth` отличался от `centerWidth`.

Подтвержденное решение проще: `sideWidth = centerWidth` для desktop и mobile. Тогда `lerp(centerWidth, sideWidth, sideProgress)` остается стабильным по ширине, а различие между center/side сохраняется через позицию, bend, darkness, opacity и viewport crop.

Риск: на очень узких viewport боковой plane остается полноценного размера, но видимая часть может быть минимальной. Это принято как правильное поведение, потому что видео не масштабируется и не трансформируется.

### 3. Ограничить side width сверху - отклонено

Проблема: на wide viewport боковой кадр мог становиться почти равным центральному, из-за чего движение на `3400` было намного мягче, чем на `1920`.

Проверочная правка: desktop `sideScale` уменьшался с `1.02` до `0.72`. Результат стал хуже, поэтому `sideScale` возвращен в `1.02`.

Риск: боковые на wide могут стать менее масштабными и сильнее отличаться от прежнего wide-look. На `1920` эффект почти не изменится.

### 4. Ввести min-distance constraint

Проблема: transition compensation сейчас эвристическая: небольшой dynamic gap + ускоренный sideProgress.

Гипотеза: считать позиции соседей с ограничением:

```ts
minDistance = (currentWidth + neighborWidth) / 2 + gap;
```

Так лента математически не сможет пересечься в середине перехода. Это наиболее строгий способ убрать overlap без чрезмерного renderOrder.

Риск: если constraint применять резко, движение станет похожим на растягивание ленты. Нужен soft constraint через smoothstep.

### 5. Нормализовать motion относительно композиции, а не viewport

Проблема: часть величин зависит от viewport width, часть от frame width, часть от gap. На разных экранах это меняет характер движения.

Гипотеза: ввести единый `stripUnit`, например `sideX` или `centerWidth`, и выражать transition compensation, velocity influence, fadeMargin и bufferStep как доли этого unit.

Риск: придется заново проверять все viewport, но поведение станет предсказуемее.

### 6. Уменьшить изменение crop во время движения

Проблема: `coverUv()` пересчитывается от текущего `frameWidth/frameHeight`. Чем сильнее меняется aspect кадра, тем сильнее меняется crop.

Гипотеза: подобрать `sideWidth` и `centerWidth` так, чтобы aspect center/side был ближе, либо временно стабилизировать aspect во время sliding. Сейчас `sideHeight = centerHeight`, поэтому aspect меняется только из-за width. Чем меньше разница widths, тем меньше "дыхание" видео.

Риск: центр может стать менее главным, если width contrast уменьшить слишком сильно.

### 7. Сделать bend/edgeCurve непрерывнее относительно globalX

Проблема: роль кадра меняется по `absOffset`, а shader-дуга по globalX. Если эти две системы расходятся, может появляться ощущение отдельных карточек.

Гипотеза: часть bend/edgeCurve считать не от role, а от фактического `stripX / viewport.x`, чтобы deformation была полностью привязана к положению на общей дуге.

Риск: боковые могут получить слишком сильный bend на узких viewport.

### 8. Проверять не только финальный кадр, а временные точки

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
