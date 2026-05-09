# cinematic_new

Референс из Figma, изучать его нужно если непосредственно пользователь указал в промте
@https://www.figma.com/design/wvU80E5h11zr2RbfUkk8yc/design?node-id=506-802&m=dev

Документ фиксирует текущую работу компонента `CinematicVideoSlider` и связанных классов на момент изучения.

## Где подключен

Компонент экспортируется из `src/components/cinematic_new/index.ts` и используется в `src/components/ui/MainScene.tsx`.
Сейчас он отображается первым экраном на маршрутах `/` и `/main`, потому что обе страницы рендерят `MainScene`.

## Основные файлы

- `CinematicVideoSlider.client.tsx` - React client component, UI-оверлей, кнопки, keyboard handling, создание и уничтожение WebGL-сцены.
- `SliderScene.ts` - основная Three.js/GSAP логика слайдера, видео lifecycle, переходов и fullscreen-открытия.
- `VideoPlane.ts` - обертка над `THREE.Mesh` с shader material и uniform-состоянием одной видео-плоскости.
- `shaders/videoPlane.ts` - vertex/fragment shader для изгиба, скругления, cover-кадрирования, затемнения, opacity и поддержки texture mix.
- `data.ts` - массив слайдов. Сейчас все слайды используют один файл `/video/timessquarenightwide.mp4` через `publicAssetPath`.
- `types.ts` - типы слайдов, состояния оверлея и callback-ов сцены.

## Верхний React-слой

`CinematicVideoSlider` является client component, потому что создает DOM video/canvas, использует `window`, keyboard events и GSAP.

React хранит только состояние, нужное для HTML-оверлея:

- `activeIndex` - активный слайд для заголовков и деталей.
- `overlayState` - текущее состояние сцены: `slider`, `sliding`, `opening`, `opened`, `closing`.
- `autoplayBlocked` - показывает кнопку повторного запуска видео, если браузер заблокировал autoplay.
- `reducedMotion` - синхронизируется с `prefers-reduced-motion`.

При маунте компонент создает `new SliderScene(host, options)`, кладет инстанс в `sceneRef`, получает canvas через `getCanvasElement()` и подписывает canvas на `pointerdown`.
При размонтировании снимает listener, вызывает `scene.dispose()` и очищает ref.

## UI и состояния

Секция занимает `100svh`, минимум `620px`, фон `#458294`. Canvas находится absolute на весь экран.

HTML-оверлей состоит из двух слоев:

- Chrome layer: заголовок "НАШИ ПРОЕКТЫ", текущие eyebrow/title, кнопки previous/open/next.
- Details layer: крупный title, описание, теги, метаданные, кнопка закрытия и кнопка запуска видео при blocked autoplay.

Chrome видим только в состояниях `slider` и `sliding`.
Details активен и получает pointer events только в состояниях `opening` и `opened`.

GSAP в React используется через `useGSAP()`:

- анимирует CSS variable `--cinematic-chrome-opacity`;
- показывает/прячет элементы деталей;
- переанимирует label при смене `activeIndex`.

## Управление пользователем

Доступные действия:

- Кнопка previous вызывает `scene.previous()`.
- Кнопка next вызывает `scene.next()`.
- Кнопка "Смотреть" вызывает `scene.open()`.
- Кнопка "Закрыть" вызывает `scene.close()`.
- `Escape` закрывает opened-состояние.
- `ArrowLeft` и `ArrowRight` переключают слайды.
- Pointer по активному центральному кадру открывает слайд.
- Pointer слева/справа от активного кадра переключает назад/вперед.

`SliderScene` игнорирует переключение и открытие, если текущий `mode` не позволяет действие.

## WebGL-сцена

`SliderScene` создает:

- `THREE.Scene`;
- `THREE.PerspectiveCamera`;
- transparent `THREE.WebGLRenderer`;
- набор `VideoPlane` по количеству слайдов;
- `HTMLVideoElement` и `THREE.VideoTexture` для каждого слайда.

Poster canvas/texture больше не используются.
Каждая плоскость всегда держит собственную video texture. Активное видео проигрывается, неактивные видео стоят на паузе и показывают последний доступный кадр.
Для неактивных видео выполняется легкий seek к первому кадру, чтобы paused video texture имела реальное изображение без poster fallback.
Когда неактивная плоскость полностью уходит за viewport, ее видео сбрасывается на начало.

## Геометрия слайдера

Позиции и визуальные параметры считаются в `getLayoutForOffset(offset)`.
Слайдер выглядит как горизонтальная кинематографичная лента:

- центральный кадр самый крупный;
- боковые кадры смещены по X;
- дальние кадры уходят по Z и теряют opacity только после полного выхода за viewport;
- shader изгибает плоскости через `uBend` и `uEdgeCurve`;
- `uStripOffset` помогает считать глобальную кривизну;
- `uVelocity` добавляет небольшой motion skew в fragment shader.

Для desktop ширины и шаги слайдов масштабируются от текущей ширины viewport без верхнего лимита, чтобы сохранять пропорции сцены на разных разрешениях.
Слайды намеренно используют одинаковый video source и читаются как сегменты одной изогнутой киноленты, поэтому видимость боковых частей решается геометрией ленты, а не разным визуальным контентом.
Для мобильной ширины `< 760px` используются более мягкие размеры, меньший DPR и другие параметры изгиба.

## Переключение слайдов

`next()` и `previous()` вызывают `slideTo(direction)`.

Поток переключения:

1. Проверяется, что сцена в режиме `slider`.
2. Вычисляется target index с wrap-around.
3. Видео текущего активного слайда ставится на паузу сразу при начале движения.
4. GSAP timeline анимирует `slidePosition` и `slideVelocity`.
5. На каждом update вызывается `applySliderLayout()`.
6. Когда target становится ближайшим к центру, target становится active, React получает `onActiveSlideChange`, и target video запускается.
7. Неактивные видео остаются paused.
8. Когда неактивная плоскость полностью уходит за viewport, ее video currentTime сбрасывается на `0`.
9. Mode возвращается в `slider`.

## Открытие слайда

`open()` работает только из режима `slider`.

Поток открытия:

1. Mode становится `opening`.
2. Активный слайд подтверждается как единственное проигрываемое видео.
3. Неактивные видео остаются на паузе.
4. Активная плоскость получает высокий `renderOrder`.
5. GSAP timeline растягивает активную плоскость до размеров viewport.
6. У активной плоскости убираются bend, edge curve и corner radius.
7. Остальные плоскости уходят в opacity `0` и немного в глубину.
8. По завершении mode становится `opened`.

HTML details появляются с задержкой, пока WebGL-плоскость раскрывается.

## Закрытие слайда

`close()` работает только из режима `opened`.

Поток закрытия:

1. Mode становится `closing`.
2. Для каждой плоскости заново считается slider layout.
3. GSAP возвращает позиции, rotation, размеры, bend, radius, opacity и darkness.
4. По завершении mode становится `slider`.
5. `slideVelocity` сбрасывается, вызывается `applySliderLayout()`.

## Видео и ресурсы

Видео создаются программно:

- `muted = true`;
- `loop = true`;
- `playsInline = true`;
- `preload = 'auto'`;
- `crossOrigin = 'anonymous'`.

Autoplay запускается через `video.play()`. Ошибка play не пробрасывается, а вызывает `onAutoplayBlocked`.

При dispose сцена:

- убивает GSAP timeline;
- отменяет RAF;
- отключает `ResizeObserver` и `IntersectionObserver`;
- снимает `visibilitychange`;
- удаляет meshes из scene;
- освобождает video textures, geometry/material;
- останавливает и очищает video elements;
- dispose renderer и вызывает `forceContextLoss()`;
- удаляет canvas из container.

## Visibility и resize

`ResizeObserver` вызывает `resize()`.
На resize пересчитываются viewport, camera aspect/Z, renderer pixel ratio и размеры canvas.

`IntersectionObserver` и `document.visibilitychange` ставят видео и RAF на паузу, когда секция не видна или документ скрыт.
Когда секция снова видима, видео и render loop запускаются повторно.

## Shader behavior

Vertex shader:

- масштабирует плоскость по `uPlaneSize`;
- добавляет Z-изгиб на основе глобального X;
- добавляет edge curve по верхней/нижней кромке;
- убирает изгиб при fullscreen progress активного слайда.

Fragment shader:

- делает cover mapping видео под размер плоскости;
- смешивает `uTexture` и `uNextTexture` через `uTextureMix`;
- добавляет vignette/frame edge;
- применяет darkness;
- применяет rounded mask;
- умножает alpha на `uOpacity`.

## Текущее рантайм-состояние

Dev server обнаруживается на `http://localhost:3000`.
На момент проверки:

- маршрут `/` рендерит секцию;
- canvas создается и занимает viewport;
- кнопка next меняет active label;
- кнопка "Смотреть" переводит details layer в открытое состояние;
- Next.js runtime errors не обнаружены;
- browser console errors не обнаружены.
