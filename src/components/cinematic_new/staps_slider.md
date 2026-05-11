# staps_slider.md

Рабочая сводка по `src/components/cinematic_new`.

Figma reference:
https://www.figma.com/design/wvU80E5h11zr2RbfUkk8yc/design?node-id=506-802&m=dev

## Цель

Слайдер должен выглядеть как единая бесконечная изогнутая лента/кинолента:

- видны 3 смысловых кадра: центральный и два боковых;
- центральный кадр широкий и главный;
- боковые частично обрезаны краями viewport;
- между центральным и боковыми есть gap примерно 20-70px;
- слайды не наслаиваются друг на друга;
- высота всех видимых слайдов одинаковая, чтобы читалась цельная лента;
- движение должно ощущаться как прокрутка киноленты, а не как карточная карусель;
- переходы бесконечные и плавные;
- боковые слайды не должны моргать;
- DOM отвечает за текст/UI, WebGL отвечает за видео и геометрию.

## Важные файлы

- `CinematicVideoSlider.client.tsx` - React client component, DOM overlay, кнопки, keyboard/pointer handling.
- `SliderScene.ts` - Three.js scene, layout, video lifecycle, resize, visibility, GSAP transitions.
- `VideoPlane.ts` - shader mesh wrapper.
- `shaders/videoPlane.ts` - vertex/fragment shader, cover crop, bend, opacity, velocity.
- `data.ts` - слайды и video sources.
- `summary_slider.md` - план и промежуточные итоги.
- `staps_slider.md` - текущая рабочая сводка для продолжения после сжатия контекста.

## Что уже выполнено

### 1. Layout contract - выполнено

В `SliderScene.ts` добавлены:

- `FilmStripSlideRole = 'center' | 'side' | 'buffer' | 'sleeping'`;
- `FilmStripLayoutConfig`;
- `FilmStripFrameMetrics`;
- `DESKTOP_FILM_STRIP_LAYOUT`;
- `MOBILE_FILM_STRIP_LAYOUT`;
- `getFilmStripLayoutConfig()`;
- `getSlideRole(offset)`.

Цель: перейти от разрозненных чисел к явному контракту киноленты.

### 2. Расчет размеров - выполнено

Добавлен `getFilmStripFrameMetrics()`.

Размеры теперь считаются от viewport:

- desktop center width ratio: `0.71`;
- desktop max width ratio: `0.74`;
- desktop aspect сейчас `16 / 4.15`;
- desktop max height ratio `0.38`;
- tall desktop rule:
  - включается от viewport height `960`;
  - стремится к `550px`;
  - но не выше `52%` viewport height;
  - и не выше aspect-limit.

Ширину после запроса пользователя не трогать без отдельного согласования.

### 3. Позиции слайдов - выполнено

Старая формула `frameStep = centerWidth * 0.68` заменена на:

```ts
const sideX = centerWidth / 2 + metrics.gap + metrics.sideWidth / 2;
```

Цель: убрать overlap между центральным и боковыми через явный gap.

### 4. Offscreen-buffer - выполнено

Добавлены роли buffer/sleeping в layout.

Offsets:

- `0` = center;
- `-1/+1` = side;
- `-2/+2` = buffer;
- дальше = sleeping.

Buffer не создается DOM-клонами. Используются существующие `VideoPlane[]` и loop math.

### 5. Убрать моргание - частично выполнено

Сделано:

- добавлен `lastRole` в `SlideVideo`;
- reset video больше не привязан к выходу за viewport;
- `resetInactiveVideo()` вызывается при переходе в `sleeping`;
- добавлены:
  - `getRoleOpacity()`;
  - `getViewportFadeOpacity()`.

Важный дополнительный фикс:

- В `VideoPlane.ts` добавлено:
  ```ts
  this.mesh.frustumCulled = false;
  ```
- Причина: mesh geometry физически `1x1`, а реальный размер задается shader uniform `uPlaneSize`. Three.js frustum culling мог выкидывать боковой mesh, хотя shader-expanded plane был частично виден. Это вызывало исчезновение боковых и моргание.

После этого боковые стали видны в статике.

Осталось:

- пользователь все еще видел моргание/overlap при движении в некоторых состояниях;
- нужно исправлять motion layout, не только opacity.

### 6. Motion - выполнено, но требует донастройки

Сделано:

- добавлен `velocityPulse(progress)`;
- `slideTo()` теперь анимирует `{ position, progress }`;
- `slideVelocity` считается через pulse:
  ```ts
  direction * (0.18 + velocityPulse(motion.progress) * 1.18)
  ```
- `duration` изменен на `1.28`;
- `ease` изменен на `power2.inOut`;
- усилено влияние velocity:
  ```ts
  isMobile ? 0.26 : 0.36
  ```

Что важно:

- На этапе 3 движение ленты пользователю нравилось больше.
- После этапов 4-6 движение стало более архитектурно правильным, но часть ощущения "настоящей прокрутки ленты" ослабла.
- Нужно брать из этапа 3: непрерывное движение по общей координате.
- Нельзя брать из этапа 3: overlap и потерю боковой видимости.

### 7. Визуальный изгиб - выполнено, но требует проверки/донастройки

Сделано:

- добавлен `lerpByStripRole(center, side, buffer, absOffset)`;
- `bend`, `edgeCurve`, `rotationY`, `darkness` интерполируются от center к side/buffer;
- `scaleY = 1`, чтобы все видимые кадры были одной высоты;
- `renderOrder` переведен на роли:
  - center `30`;
  - side `18`;
  - buffer `8`;
  - sleeping `1`.

Потом добавлялась попытка dynamic render order во время sliding:

```ts
if (this.mode === 'sliding' && role === 'center' && direction !== 0 && velocityDirection !== 0) {
  return direction === velocityDirection ? 32 : 16;
}
```

Но анализ показал, что она почти не влияет, потому что overlap возникает не только из render order, а из transition geometry: промежуточные offsets могут делать два кадра крупными и близкими одновременно. Кроме того, после `absOffset >= 0.5` роль уже `side`, и эта логика перестает работать.

## Важные правки размера

Пользователь попросил увеличить высоту, не трогая ширину.

Сделано:

- desktop aspect изменен на `16 / 4.15`;
- desktop `maxHeightRatio` стал `0.38`;
- mobile aspect стал `16 / 4`;
- mobile `maxHeightRatio` стал `0.42`;
- tall desktop rule добавлен для `550px` только на высоких desktop.

Потом пользователь заметил, что боковые стали меньше по высоте.

Исправлено:

```ts
const sideHeight = centerHeight;
```

Это важно. Цельность киноленты важнее перспективного уменьшения боковых.

## Object-fit / object-position анализ

В shader уже был `coverUv()` - это аналог `object-fit: cover`.

Добавлено:

- `uObjectPosition` в `VideoPlane.ts`;
- default `new THREE.Vector2(0.5, 0.5)`;
- `coverUv()` теперь принимает object position.

Пробовали сделать active central slide contain-style:

- добавлялись `containUv()` и `containMask()`;
- временно было `containMix = uActive`.

Результат:

- видео действительно помещалось целиком;
- но центральный видеоконтент стал намного меньше внутри большого слайда;
- появились пустые области;
- текущий хороший вид ломался.

Поэтому contain был выключен:

```glsl
float containMix = 0.0;
```

Текущий вывод:

- если нужно "полностью видео без обрезки", нужен `contain`, но будут поля;
- если нужен крупный заполненный слайд, нужен `cover`;
- невозможно одновременно: видео целиком без обрезки + без полей + произвольный aspect слайда.

Object-position инфраструктуру оставить. Она полезна для тонкой настройки кадрирования без изменения layout.

## Текущая нерешенная проблема

Пользователь сказал: "ничего не поменялось" после правки contain/renderOrder.

Анализ:

1. `containMix = 0.0`, поэтому contain неактивен. Это сделано намеренно после плохого визуального теста.
2. `renderOrder` сам по себе не решает overlap при движении.
3. Реальная причина overlap в движении:
   - во время transition кадры имеют промежуточные offsets;
   - ширина интерполируется от centerWidth к sideWidth;
   - два кадра могут быть одновременно крупными и близкими;
   - надо менять transition geometry, а не только render order.

## Что нужно делать дальше

Не переходить слепо к этапу 8, пока не исправлен overlap/motion.

Следующий технический шаг:

### A. Исправить transition geometry

Идея:

- сохранить статичный layout текущим, потому что он сейчас визуально хороший;
- во время sliding добавить dynamic separation или width compensation;
- кадры в промежуточной зоне не должны заходить друг на друга.

Возможные решения:

1. Dynamic gap during transition:
   - когда `mode === 'sliding'`, увеличивать gap/sideX на основе `velocityPulse`;
   - плюс: просто;
   - минус: может выглядеть как растягивание ленты.

2. Faster width role transition:
   - ширина кадра должна быстрее переходить от centerWidth к sideWidth при уходе из центра;
   - сейчас `sideProgress = smoothstep01(absOffset)`;
   - можно использовать более агрессивную кривую, например:
     ```ts
     const sideProgress = smoothstep01(absOffset * 1.25);
     ```
   - плюс: уходящий центральный быстрее сужается, меньше overlap;
   - минус: может уменьшить ощущение большой ленты.

3. Continuous stage-3-like position + no-overlap correction:
   - взять ощущение этапа 3: непрерывное движение;
   - но добавить min-distance constraint:
     ```ts
     minDistance = (currentWidth + neighborWidth) / 2 + gap
     ```
   - сложнее, но правильнее.

Рекомендация:

- сначала пробовать вариант 2 + небольшой dynamic gap;
- если не хватит, перейти к варианту 3.

### B. Проверить mid-transition screenshot

Нужно проверять не только статичный скрин, а скрин в середине перехода:

```js
document.querySelector('button[aria-label="Next project"]')?.click();
await new Promise((resolve) => setTimeout(resolve, 650));
```

И смотреть overlap.

### C. Не включать contain без согласования

Contain ломает крупность центрального кадра.
Если пользователь снова попросит "помещалось полностью", нужно объяснить tradeoff и предложить:

- либо `cover + object-position`;
- либо `contain + letterbox/pillarbox`;
- либо менять aspect слайда ближе к aspect видео.

## Лог текущей правки transition geometry

Перед переходом к этапу 8 начата правка overlap/motion в середине transition.

Сделано:

- В `SliderScene.ts` добавлен `slideProgress`, чтобы layout знал нормализованный прогресс текущего GSAP-перехода.
- В `slideTo()` `slideProgress` обновляется на каждом `onUpdate` и сбрасывается в `0` на завершении.
- В `getLayoutForOffset()` добавлен `transitionPulse = velocityPulse(slideProgress)` только для режима `sliding`.
- Во время `sliding` gap временно увеличивается через `transitionGap`, чтобы кадры в промежуточных offset не заходили друг на друга.
- Во время `sliding` `sideProgress` считается быстрее, чтобы уходящий центральный кадр раньше сужался к side-size, а входящий кадр не конфликтовал с ним по ширине.

Важно:

- Статичный layout не должен измениться: при `mode !== 'sliding'` `transitionPulse = 0`.
- Ширина базового central frame не изменялась.
- `sideHeight = centerHeight` не трогался.
- На момент этой правки `containMix` еще был выключен; после требования full central video он включен через `uActive`.
- Это первый слой исправления. После проверки mid-transition screenshot нужно решить, достаточно ли варианта "faster width role transition + dynamic gap" или нужен min-distance constraint.

Следующая проверка:

```js
document.querySelector('button[aria-label="Next project"]')?.click();
await new Promise((resolve) => setTimeout(resolve, 650));
```

Смотреть именно середину перехода: нет ли overlap, не пропадает ли боковой кадр, сохранилось ли ощущение прокрутки ленты.

Проверка после правки:

- `npm run lint` - прошел без errors, остались старые warnings в `src/app/layout.tsx` и `src/components/ui/MainScene.tsx`.
- `npm run build` - прошел после типовой правки `VideoPlane.ts` для `frustumCulled`.
- Next MCP `get_errors` - `configErrors: []`, `sessionErrors: []`.
- Browser console после свежей проверки - без errors/warnings, кроме dev info/HMR.
- Playwright screenshot после перехода next показывает центральный и боковые кадры без очевидного overlap в зафиксированном состоянии.

Дополнительная правка:

- В `VideoPlane.ts` `frustumCulled = false` оставлен, но присвоение приведено к явному типу, потому что `next build` падал на TypeScript-проверке свойства.

Геометрии сохранены отдельно:

- `geometria_experimental_variant-1.md` - текущий вариант после правки transition geometry.
- `geometria_experimental_variant-2.md` - предыдущий вариант до dynamic transition compensation.

## Лог правки перед этапом 8: full central video + larger composition

Перед этапом 8 добавлено требование: центральный слайд должен показывать видео полностью, а ширина слайдов и общей композиции должна стать больше.

Сделано:

- В `SliderScene.ts` desktop center увеличен с `0.71/0.74` до `0.78/0.82` viewport width.
- Desktop aspect изменен с `16 / 4.15` на `16 / 5.2`, чтобы полный contain-video не становился слишком мелким в сверхузкой полосе.
- Desktop `maxHeightRatio` увеличен с `0.38` до `0.46`, tall desktop target с `550` до `600`.
- Desktop side frames увеличены через `sideVisibleRatio: 0.34` и `sideScale: 1.02`.
- Mobile center увеличен до `0.9/0.94`, aspect до `16 / 5`, `maxHeightRatio` до `0.5`.
- В shader `containMix` включен через `uActive`, то есть contain применяется к активному центральному кадру.
- Чтобы центральный слайд не стал прозрачным по краям, contain-видео композится поверх затемненного cover-background внутри того же plane.

Важно:

- Боковые кадры остаются cover-style, чтобы сохранить ощущение киноленты.
- Это сознательный компромисс: полное видео в центральном кадре требует contain-поведения, поэтому внутри кадра появляется затемненная cover-подложка за полным видео.
- После визуальной проверки нужно решить, достаточно ли увеличения ширины или нужно еще расширять centerWidthRatio / менять фон.

Проверка после правки:

- `npm run lint` - прошел без errors, остались старые warnings в `src/app/layout.tsx` и `src/components/ui/MainScene.tsx`.
- `npm run build` - прошел.
- Next MCP `get_errors` - `configErrors: []`, `sessionErrors: []`.
- Browser console - без errors/warnings, кроме dev info/HMR.
- Playwright screenshot на `1280x720`: центральное видео видно полностью, композиция шире, боковые кадры остаются видимыми по краям.
- Mid-transition screenshot после `Next` на `650ms`: центральный кадр остается contain-style, боковые кадры видимы, явного runtime сбоя нет.

Наблюдение:

- DOM label теперь находится ближе к нижней части центрального видео и визуально может казаться наложенным на кадр. Это относится уже к UI-подгонке этапа 9, не к геометрии WebGL.

Откат contain-подложки:

- Пользователь заметил эффект opacity по бокам центрального слайда.
- Причина была в `containMix = uActive` и затемненной cover-подложке `currentCoverColor * 0.36`.
- Принято решение вернуть чистый вариант: ничто не должно влиять на целостность сцены.
- В `shaders/videoPlane.ts` `containMix` снова `0.0`, затемненная подложка удалена, sampling вернулся к единому cover-пути.
- Требование "видео полностью" остается нерешенным в текущей форме: без contain или изменения aspect/source невозможно одновременно показать весь ролик и сохранить заполненный широкий кадр без дополнительных визуальных слоев.

## Лог правки причины раннего morph и crop

Проблема:

- Центральный кадр слишком рано превращался в боковой при переходе.
- Центральное видео обрезалось, потому что shader работает в чистом `cover` (`containMix = 0.0`).

Причина:

- `sideProgress` был слишком агрессивным: `transitionPulse * 0.65` на desktop давал почти side-size уже в середине transition.
- `transitionGap` был слишком сильным: `transitionPulse * 0.75` на desktop растягивал ленту в середине движения.
- Aspect центрального кадра был слишком узким относительно 16:9-видео, поэтому `cover` сильно обрезал изображение.

Сделано:

- Desktop `centerAspect` изменен с `16 / 5.2` на `16 / 6.4`.
- Desktop `maxHeightRatio` увеличен с `0.46` до `0.54`, tall target с `600` до `650`, tall max ratio с `0.58` до `0.64`.
- Mobile `centerAspect` изменен с `16 / 5` на `16 / 6.2`, `maxHeightRatio` с `0.5` до `0.58`.
- `transitionGap` ослаблен: desktop `0.75 -> 0.32`, mobile `0.35 -> 0.18`.
- `sideProgress` ослаблен: desktop `0.65 -> 0.18`, mobile `0.45 -> 0.12`.

Цель:

- Центр дольше остается центральным во время движения.
- Лента меньше растягивается в середине transition.
- Чистый `cover` сохраняется, но кадр стал ближе к видео aspect, поэтому crop должен быть меньше.

Проверка после правки:

- `npm run lint` - прошел без errors, остались старые warnings.
- `npm run build` - прошел.
- Next MCP `get_errors` - без ошибок.
- Browser console - без errors/warnings, кроме dev info/HMR.
- Playwright screenshot `1280x720`: центр стал выше, crop меньше, сцена остается цельной без contain-подложек.
- Mid-transition screenshot `650ms`: центр визуально дольше сохраняет крупный ленточный масштаб; раннее схлопывание стало заметно слабее.

## Этапы еще не выполнены

## Гипотеза: чистый contain для центрального кадра

По просьбе пользователя включена временная проверка:

```glsl
float containMix = uActive;
```

Без затемненной cover-подложки и без дополнительных смешиваний.

Результат:

- `npm run lint` - прошел без errors, остались старые warnings.
- `npm run build` - прошел.
- Next MCP `get_errors` - без ошибок.
- Browser console - без errors/warnings, кроме dev info/HMR.
- Playwright screenshot подтвердил риск: видео действительно помещается полностью, но центральный кадр визуально теряет заполненность и выглядит как уменьшенный прямоугольник внутри широкой ленты.

Вывод:

- Чистый contain решает "показать видео полностью", но ломает ощущение цельной широкой киноленты.
- Если сохранять contain, нужно менять композицию/контейнер под aspect видео или принимать пустые зоны.
- Если сохранять цельную киноленту, текущий `cover` с подобранным aspect выглядит лучше, но видео не будет видно полностью на 100%.

## Гипотеза: cover + object-position как временная архитектура до wide-asset

После выбора оптимального архитектурного решения проверяется компромисс:

- shader остается в чистом `cover`;
- `containMix = 0.0`;
- кинолента остается цельной;
- добавляется управляемый `videoObjectPosition` в data, чтобы кадрировать текущий 16:9-ролик без изменения layout.

Сделано:

- В `types.ts` добавлено `videoObjectPosition?: [number, number]`.
- В `VideoPlane.ts` добавлен `setObjectPosition()`.
- В `SliderScene.ts` plane получает `slide.videoObjectPosition ?? [0.5, 0.58]`.
- В `data.ts` для текущих слайдов задано `[0.5, 0.58]`.
- В shader `containMix` возвращен в `0.0`.

Цель проверки:

- Сохранить широкую цельную ленту.
- Не использовать contain, подложки или opacity-зоны.
- Сместить cover-crop к более полезной части текущего видео.

Проверка:

- `npm run lint` - прошел без errors, остались старые warnings.
- `npm run build` - прошел.
- Next MCP `get_errors` - без ошибок.
- Browser console - без errors/warnings, кроме dev info/HMR.
- Playwright screenshot `1280x720`: сцена остается цельной, центральный слайд широкий, без contain-полей и opacity-подложек; кадрирование смещено через `objectPosition`.

### 8. Проверить fullscreen open/close - выполнено

Пользователь вручную проверил этап 8: базовый `open()` / `close()` работает.

Дополнительная правка этапа 8:

- При `open()` боковые слайды исчезали слишком быстро.
- Причина: opacity боковых plane анимировалась за `duration * 0.48` с offset `0.08`.
- Для проверки гипотезы fade-out боковых при opening увеличен до `duration * 0.82`.
- Цель: боковые слайды должны уходить дольше и ближе по ощущению к нормальной скорости появления при `close()`, не меняя fullscreen morph активного plane.

Проверка:

- `npm run lint` - прошел без errors, остались старые warnings.
- `npm run build` - прошел.
- Next MCP `get_errors` - без ошибок.
- Browser console - без errors/warnings, кроме dev info/HMR.
- Playwright mid-opening screenshot на ~620ms после `open`: fullscreen morph работает, боковые fade-out не ломает opening state.

Финальная проверка этапа 8:

- `open()` из центрального кадра - выполнено.
- `opened` state - выполнено.
- `close()` - выполнено.
- Возврат к slider layout - выполнено.
- Второй DOM-video не создается: `document.querySelectorAll('video').length === 0`, видео остается внутренним `HTMLVideoElement` для `VideoTexture`.
- Canvas остается один: `document.querySelectorAll('canvas').length === 1`.
- Next MCP `get_errors` - `configErrors: []`, `sessionErrors: []`.
- Browser console - без errors/warnings, кроме dev info/HMR.
- Playwright screenshots сделаны для initial, opened и closed states.

### 9. Подогнать UI под Figma - в работе

Первый UI-pass:

- `CinematicVideoSlider.client.tsx` переведен с плоского `bg-[#458294]` на темный фон `#050706`.
- Возвращены DOM overlay layers: темный vertical base, мягкое зеленое свечение за лентой, боковое затемнение и top/bottom затемнение.
- Заголовок поднят с `top-[16.5svh]` до `top-[9.5svh] / md:top-[10.5svh]`, чтобы меньше конфликтовать с верхом центрального кадра.
- Active label перенесен с `top-[calc(50%+16svh)]` на `bottom-[12svh] / md:bottom-[13svh]`, чтобы не лежать поверх нижней части видео.
- WebGL geometry, shader и motion не трогались.

Проверка:

- `npm run lint` - прошел без errors, остались старые warnings.
- `npm run build` - прошел.
- Next MCP `get_errors` - без ошибок.
- Browser console - без errors/warnings, кроме dev info/HMR.
- Playwright screenshot `1280x720`: фон стал темным, заголовок поднят над лентой, active label находится ниже кадра и не перекрывает нижнюю часть видео.

Второй UI-pass:

- Controls больше не скрываются полностью: базовая opacity стала `0.34`, hover `0.82`, focus `1`.
- Кнопки получили темную полупрозрачную подложку вместо светлой, чтобы лучше сидеть на темном фоне.
- Details/opened UI получил drop-shadow для крупного текста и легкие `bg-black/20` подложки у тегов/мета-блоков.
- WebGL geometry, shader и motion не трогались.

Финальная правка второго UI-pass:

- Базовая opacity controls поднята с `0.34` до `0.48`, hover с `0.82` до `0.9`, потому что на скриншоте controls были слишком тусклыми.
- Opened/details screenshot проверен: крупный текст, теги, мета-блоки и close button читаются на видео.

Проверка второго UI-pass:

- `npm run lint` - прошел без errors, остались старые warnings.
- `npm run build` - прошел.
- Next MCP `get_errors` - без ошибок.
- Browser console - без errors/warnings, кроме dev info/HMR/Fast Refresh.

Нужно:

- темный фон вместо текущего teal `#458294`, если нужна строгая близость к Figma;
- мягкое свечение за лентой;
- позиция heading;
- позиция active label;
- проверить, что текст не конфликтует с видео.

### 10. Проверить адаптив - не выполнено

Нужно проверить:

- `1280x720`;
- `1440x900`;
- `1920x1080`;
- wide desktop;
- mobile.

Особенно проверить tall desktop rule для 550px.

### 11. Runtime-проверка - частично выполнялась, но финально не выполнена

Периодически проверялось:

- `npm run lint` - проходил без errors;
- Next MCP `get_errors` - ошибок не было;
- browser console errors - не было;
- screenshots делались.

Но финальную проверку после всех исправлений еще нужно делать.

### 12. Финальная валидация - не выполнено

Нужно:

- `npm run lint`;
- `npm run build`;
- Playwright screenshots;
- проверить критерии готовности;
- записать changed files.

## Текущие known warnings

`npm run lint` проходит без errors, но есть старые warnings не по этой задаче:

- `src/app/layout.tsx`: `HeaderProvider` unused;
- `src/components/ui/MainScene.tsx`: много unused imports/refs из-за закомментированного старого fullpage layout.

Эти warnings не были внесены текущими изменениями и не трогались.

## Что нельзя забыть

- Не трогать ширину без согласования.
- Не уменьшать боковые по высоте: `sideHeight = centerHeight`.
- `frustumCulled = false` обязателен для shader-expanded planes.
- `containMix` больше не выключен: после требования full central video он включен через `uActive` для активного центрального кадра.
- Текущий главный нерешенный вопрос: overlap/ощущение движения в середине transition.
- Хороший статичный вид уже есть: центр широкий, боковые видны, высота единая.
- Дальше надо чинить именно transition geometry.
