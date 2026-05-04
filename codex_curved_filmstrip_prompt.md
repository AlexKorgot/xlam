# Codex Prompt — Curved Film-Strip Slider Refinement

Refine ONLY `SliderScene.ts` for the projects WebGL slider.

## Do NOT change

- Page background
- Section background
- Gradients/colors
- Title
- Buttons
- DOM layout outside the WebGL slider
- Header / hero / footer
- Unrelated UI

## Work only on

- Slide geometry
- Slide positions
- Side-slide transformation
- Slide motion
- Active switching logic

## Reference comparison

The target reference has:

- A wide central cinematic slide
- Side slides closer to the center
- Side slides partially cropped by the viewport edges
- Side slides are NOT tiny isolated panels
- Side slides are NOT aggressively twisted like wings
- The whole row feels like a curved film-strip / cinematic ribbon
- Center slide is wider, but side slides are almost the same height
- Smooth motion with no snapping

## Current result problems

1. Side slides are too far away from the center.
2. Side slides are too aggressively transformed / bent / rotated.
3. Side slides look like separate curved panels, not frames connected to one film-strip.
4. Center slide is too small compared to the reference.
5. There is too much empty space between center and side slides.
6. Transition logic is still likely too discrete if it switches active state before the motion settles.
7. `SLIDER_ASPECT = 16 / 9` makes the slide too tall / not cinematic enough.

---

# Required changes

## 1. Change aspect ratio

In `SliderScene.ts`, change:

```ts
const SLIDER_ASPECT = 16 / 9;
```

to:

```ts
const SLIDER_ASPECT = 16 / 6.6;
```

The target slide should be a wider cinematic frame.

---

## 2. Add continuous slide position

Add class field:

```ts
private slidePosition = 0;
```

The slider must animate `slidePosition`, not instantly switch `activeIndex`.

---

## 3. Add continuous offset helper

Replace or supplement `shortestOffset` with:

```ts
function centeredOffset(index: number, position: number, total: number) {
  let offset = index - position;
  const half = total / 2;

  while (offset > half) offset -= total;
  while (offset < -half) offset += total;

  return offset;
}
```

---

## 4. Refactor `setActiveIndex()`

Current issue: `setActiveIndex()` immediately updates activeIndex, assigns active texture, changes label, and then animates layout. This causes popping and non-filmstrip behavior.

Do not do that.

Replace `setActiveIndex()` with continuous animation logic:

```ts
setActiveIndex(index: number) {
  if (this.mode !== 'slider') {
    return;
  }

  const currentPosition = this.slidePosition;
  const currentIndex = wrapIndex(Math.round(currentPosition), this.slides.length);
  const targetIndex = wrapIndex(index, this.slides.length);

  let delta = targetIndex - currentIndex;
  const half = this.slides.length / 2;

  if (delta > half) delta -= this.slides.length;
  if (delta < -half) delta += this.slides.length;

  const targetPosition = currentPosition + delta;
  const motion = { value: currentPosition };
  const duration = this.reducedMotion ? 0.01 : 1.35;

  this.timeline?.kill();

  this.timeline = gsap.timeline({
    defaults: {
      ease: 'power4.inOut',
      overwrite: 'auto',
    },
    onComplete: () => {
      this.slidePosition = targetPosition;
      this.activeIndex = targetIndex;

      this.assignActiveTexture();
      this.callbacks.onActiveSlideChange?.(this.activeIndex);
      this.applySliderLayout();
    },
  });

  this.timeline.to(
    motion,
    {
      value: targetPosition,
      duration,
      onUpdate: () => {
        this.slidePosition = motion.value;
        this.applySliderLayout();
      },
    },
    0,
  );
}
```

Important:

- Do NOT call `assignActiveTexture()` before the animation.
- Do NOT call `onActiveSlideChange()` before the animation.
- Do NOT switch active shader state at the start of the animation.
- Finalize active state only after motion settles.

---

## 5. Update `applySliderLayout()`

Replace integer active-index layout:

```ts
const offset = shortestOffset(index, this.activeIndex, this.slides.length);
```

with continuous position layout:

```ts
const offset = centeredOffset(index, this.slidePosition, this.slides.length);
```

Add stable render order:

```ts
private getRenderOrder(offset: number) {
  const abs = Math.abs(offset);

  if (abs < 0.45) return 30;
  if (abs < 1.25) return 20;

  return Math.max(1, 12 - Math.round(abs * 3));
}
```

Then update `applySliderLayout()` to:

```ts
private applySliderLayout() {
  this.planes.forEach((plane, index) => {
    const offset = centeredOffset(index, this.slidePosition, this.slides.length);
    const layout = this.getLayoutForOffset(offset);

    plane.applyLayout(layout);
    plane.mesh.renderOrder = this.getRenderOrder(offset);
  });
}
```

---

## 6. Replace `getLayoutForOffset()` with a softer reference-like film-strip layout

The current side slides are too far and too aggressively transformed. They look like big curved wings. The reference side slides are closer, flatter, and more like neighboring frames.

Use this:

```ts
private getLayoutForOffset(offset: number): VideoPlaneLayout {
  const width = this.viewport.x;
  const isMobile = width < 760;

  const absOffset = Math.abs(offset);
  const direction = Math.sign(offset) || 1;

  const activeWidth = isMobile
    ? width * 0.84
    : Math.min(width * 0.68, 1000);

  const frameHeight = activeWidth / SLIDER_ASPECT;

  // Center is wider, but side slides are almost the same height.
  // Do NOT calculate side height from side width.
  const sideWidth = activeWidth * (isMobile ? 0.60 : 0.54);
  const sideHeight = frameHeight;

  // Keep the strip close to the title / same vertical band.
  const bandY = isMobile ? -8 : -14;

  // Side slides should be closer to center than the current result.
  // They should partially go toward/behind viewport edges, but not become isolated.
  const sideX = isMobile
    ? activeWidth * 0.56
    : activeWidth * 0.5 + sideWidth * 0.28;

  const hiddenX = isMobile
    ? width * 0.64
    : width * 0.54;

  // Softer depth than current result.
  const sideZ = isMobile ? -50 : -70;
  const farZ = isMobile ? -130 : -190;

  if (absOffset <= 1) {
    const t = 1 - Math.pow(1 - absOffset, 3);

    return {
      x: direction * lerp(0, sideX, t),
      y: bandY,
      z: lerp(0, sideZ, t),

      width: lerp(activeWidth, sideWidth, t),
      height: sideHeight,

      // Softer rotation. Current side slides are too twisted.
      rotationY: -direction * lerp(0, isMobile ? 0.14 : 0.18, t),

      // Softer bend. Current side slides look over-deformed.
      bend: lerp(isMobile ? 5 : 6, isMobile ? 6 : 8, t),

      opacity: lerp(1, isMobile ? 0.64 : 0.72, t),
      darkness: lerp(0.02, isMobile ? 0.30 : 0.34, t),

      velocity: 0,
    };
  }

  const t = Math.min(absOffset - 1, 1);

  return {
    x: direction * lerp(sideX, hiddenX, t),
    y: bandY,
    z: lerp(sideZ, farZ, t),

    width: lerp(sideWidth, sideWidth * 0.9, t),
    height: sideHeight,

    rotationY: -direction * lerp(
      isMobile ? 0.14 : 0.18,
      isMobile ? 0.24 : 0.30,
      t,
    ),

    bend: lerp(isMobile ? 6 : 8, isMobile ? 3 : 4, t),

    opacity: lerp(isMobile ? 0.24 : 0.30, 0.02, t),
    darkness: lerp(isMobile ? 0.48 : 0.54, 0.80, t),

    velocity: 0,
  };
}
```

If `VideoPlaneLayout` requires extra fields like `edgeCurve`, `blur`, `cornerRadius`, `scaleX`, or `scaleY`, preserve them and interpolate gently. Do not remove required fields.

Suggested extra values if needed.

For `absOffset <= 1`:

```ts
edgeCurve: lerp(isMobile ? 3 : 4, isMobile ? 4 : 6, t),
cornerRadius: lerp(isMobile ? 8 : 10, isMobile ? 7 : 9, t),
blur: lerp(0, 0.025, t),
scaleX: 1,
scaleY: 1,
```

For far slides:

```ts
edgeCurve: lerp(isMobile ? 4 : 6, 0, t),
cornerRadius: lerp(isMobile ? 7 : 9, isMobile ? 5 : 6, t),
blur: lerp(0.04, 0.10, t),
scaleX: 1,
scaleY: 1,
```

---

## 7. Update `animateSliderLayout()` or remove its discrete role

After adding `slidePosition`, `animateSliderLayout()` should not be the primary switching mechanism anymore.

Either:

- Remove its use for slide switching, or
- Keep it only for close/resize corrections

Do not use it to animate from integer `activeIndex` states after already changing `activeIndex`.

---

## 8. Update `close()`

Where `close()` computes offsets using:

```ts
const offset = shortestOffset(index, this.activeIndex, this.slides.length);
```

change to:

```ts
const offset = centeredOffset(index, this.slidePosition, this.slides.length);
```

Or ensure `this.slidePosition` is synced with `this.activeIndex` before applying slider layout.

---

# Side-slide transformation correction

Very important: the current side slide transformation is too strong.

In the reference:

- Side slides are angled, but not like folded wings.
- Side slides are closer to the center.
- Side slides keep a rectangular cinematic frame.
- Side slides are less distorted.
- Side slides are not extremely dark, but clearly secondary.

So reduce:

- `rotationY`
- `bend`
- `z` depth
- Distance from center

Increase:

- `activeWidth` slightly
- `sideWidth` slightly
- Side opacity slightly

---

# Final expected result

The slider should look closer to the reference:

- Center slide wider and cinematic
- Side slides closer to center
- Side slides partially visible and partly cropped by viewport edges
- Side slides are almost same height as center
- Side slides are narrower, not shorter
- Side slides are softly rotated inward
- Side slides are not over-bent
- All slides feel like one curved film-strip
- Transition moves the whole strip smoothly along the curve
- No jerky animation, no popping, no instant active switch before movement
- No background/title/button changes
