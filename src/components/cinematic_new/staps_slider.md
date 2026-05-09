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

## Этапы еще не выполнены

### 8. Проверить fullscreen open/close - не выполнено

Нужно проверить:

- `open()` из центрального кадра;
- `close()`;
- возврат к slider layout;
- отсутствие второго DOM-video;
- нет runtime errors.

### 9. Подогнать UI под Figma - не выполнено

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
- `containMix` сейчас выключен намеренно.
- Текущий главный нерешенный вопрос: overlap/ощущение движения в середине transition.
- Хороший статичный вид уже есть: центр широкий, боковые видны, высота единая.
- Дальше надо чинить именно transition geometry.
