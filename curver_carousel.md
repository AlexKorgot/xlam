# Curved Cinematic Carousel Context

## Purpose

This document describes the target visual direction for the cinematic projects carousel section.

The goal is to take the current implementation and make it visually much closer to the Figma/reference screenshot.

This is not a normal flat slider. It should look like a curved cinematic film-strip carousel: a dark cinematic WebGL video scene made of video frames arranged along a soft 3D arc.

The final impression should be:

> A dark cinematic stage with several video screens arranged along a soft cylindrical curve.  
> The center video is the active project and is visually dominant.  
> The neighboring videos are partially visible, darker, and recede into depth.  
> The project title sits over the lower part of the active video.  
> The whole thing feels like a premium WebGL video showcase, not a normal web carousel.

---

Important terminology correction:

This section should not be treated as a classic slider.

It is better to think of it as a cinematic film-strip carousel:
- not flat cards;
- not a standard horizontal slider;
- not a Swiper-like component;
- not a row of equal slides.

It should look like a WebGL cinematic video film-strip arranged along a curved 3D arc.

The active video is the central frame of the film-strip.
The side videos are neighboring frames on the same curved strip.
The far videos should fade into depth and darkness.

So when tuning layout, bend, spacing, dimming, and transitions, prioritize the feeling of a curved film-strip scene, not the behavior or look of a classic slider.

## Current Implementation Context

The current implementation is already close structurally. Do not rewrite it from scratch.

Known existing implementation details:

- `src/components/cinematic_new/SliderScene.ts` already uses cinematic aspect `16 / 6.6`.
- There is already continuous `slidePosition` and `centeredOffset`.
- There is already WebGL-based rendering.
- There is already `VideoTexture`.
- There is already `ShaderMaterial`.
- There is already bend/deformation logic.
- There is already rounded masking.
- There is already closed/open transition.
- There is already fullscreen morph behavior.
- After the previous fix, the side slide already receives video when selected through `prepareIncomingVideo`.

This means the task is mostly visual tuning and composition correction.

Do not replace the system with a different architecture.

---

## Strict Technical Constraints

Do not:

- Do not use React Three Fiber.
- Do not replace the main WebGL effect with CSS-only transforms.
- Do not add a DOM video as a replacement for the active WebGL video.
- Do not render all videos as normal DOM videos.
- Do not rewrite the whole scene.
- Do not modify unrelated sections.
- Do not touch header, hero, footer, routing, or global layout.
- Do not break the existing open/close transition.
- Do not break continuous WebGL `VideoTexture` usage.
- Do not remove the current WebGL shader-based approach.

Keep:

- Vanilla Three.js.
- WebGL `VideoTexture`.
- `ShaderMaterial`.
- The existing active video continuity into fullscreen.
- The existing carousel behavior.
- The existing section scope.

---

## Main Visual Target

The carousel should look like the reference screenshot.

It should not look like a wide flat repeated web strip.

The closed state should visually show:

- one dominant center active video;
- partially visible left neighbor video;
- partially visible right neighbor video;
- maybe slight hints of far slides at the edges;
- dark cinematic background;
- subtle teal glow behind the carousel;
- project label/title over the lower part of the active video;
- visible curved-screen deformation;
- strong visual hierarchy between active and side slides.

The active center slide should be the main focus.

The side slides should only support the composition. They should not compete with the active center slide.

---

## Important Correction About The Center Slide

Do not make the active center slide perfectly flat.

In the reference, the center video is also curved.

The active center slide should have:

- a visible soft arc on the top edge;
- a visible soft arc on the bottom edge;
- a subtle cylindrical-screen feel;
- a center area that feels closer to the viewer;
- left/right edges that subtly recede;
- readable faces and content;
- stable controlled deformation.

The correct target is:

> softly curved, cinematic, stable, readable.

The wrong targets are:

> perfectly flat DOM-like rectangle;  
> rubber-sheet distortion;  
> exaggerated sine-wave;  
> unstable wavy image;  
> overbent panoramic strip.

So the center slide should remain curved, but the deformation should be controlled and premium.

---

## Current Problems To Fix

### 1. Background is wrong

Current issue:

- `src/components/cinematic_new/CinematicVideoSlider.client.tsx` still uses a flat blue background like `bg-[#458294]`.
- This makes the section look like a web banner or technical preview.

Target:

- almost black / very dark teal base;
- soft radial teal glow behind the carousel;
- subtle depth;
- no bright cyan/blue flat section fill;
- premium dark cinematic stage.

The background should support the videos, not compete with them.

---

### 2. The carousel currently feels like a wide flat repeated panorama

Current issue:

- too many side repetitions are visible;
- side slides are too readable;
- the full composition feels like a long horizontal strip;
- the center slide does not feel special enough;
- the scene looks more like a tiled web carousel than a controlled WebGL film-strip.

Target:

- center slide is dominant;
- nearest left/right slides are partially visible;
- far slides are dimmed, pushed out, or barely visible;
- no equally bright repeated copies across the width;
- no “infinite background strip” feeling.

---

### 3. Project label/title is positioned too low

Current issue:

- the label/title appears below the carousel or on the border between video and background;
- it feels detached from the active slide.

Target:

- label/title should sit visually inside the active center video;
- position should be around lower 18–25% of the active video height;
- centered horizontally relative to the active video;
- small white label above;
- larger bright green project title below;
- should feel attached to the active project frame.

It can remain DOM overlay, but visually it must be locked to the active center slide.

---

### 4. Bend/deformation needs art direction

Current issue:

- the current geometry can feel too wave-like or too panoramic;
- top/bottom edges may look like a large sine-wave;
- the whole strip can feel like one rubber surface.

Target:

- cinematic cylindrical film-strip feel;
- active center slide is curved, not flat;
- top/bottom edges of active slide form a controlled soft arc;
- side slides rotate/recede more strongly;
- far slides fade into darkness/depth;
- deformation should be visible but refined.

Tune numbers first:

- `bend`
- `edgeCurve`
- `rotationY`
- `z`
- `scaleX`
- `scaleY`
- `darkness`
- opacity / alpha if present
- velocity-related values if needed

Avoid radical shader rewrites unless the reference shape cannot be achieved with numeric tuning.

---

## Desired Closed-State Composition

On desktop, the closed state should roughly feel like this:

- active center slide width: around 60–70vw;
- active center slide height: cinematic landscape proportion, already close through `16 / 6.6`;
- left/right neighbors visible: around 40–55% of their width;
- far slides: barely visible, dark, or outside viewport;
- heading close above carousel;
- title overlay inside active video;
- dark empty space around composition;
- no bright flat background.

The center video should look large and important, but not stretched across the entire viewport.

The left/right slides should appear as neighboring screens on the same curve.

The edges of the carousel may extend beyond the viewport.

---

## Naming / Keywords

Use these terms to describe this component:

- curved cinematic film-strip carousel
- cinematic WebGL film-strip carousel
- curved video film-strip carousel
- cinematic curved video carousel

The component may behave like a carousel, but visually it should not look like a classic slider.

Avoid thinking of it as:

- classic slider
- Swiper-like slider
- flat card carousel
- equal-width slide row
- repeated panoramic strip

The best mental model is:

> a cinematic WebGL film-strip made of video frames arranged along a curved 3D arc.

---

## Secondary Technical Research Context

There may be an additional file named `curved_info.md`.

Use `curved_info.md` only as secondary technical research context.

It may contain useful implementation references and practical WebGL / Three.js patterns, such as:

- continuous offset-based layout;
- vertex shader bend patterns;
- texture cover logic;
- DOM captions over WebGL media;
- numeric tuning of `x`, `z`, `rotationY`, `bend`, `edgeCurve`, `darkness`;
- avoiding all videos playing at once.

However, `curved_info.md` is not the visual source of truth.

Do not copy any referenced implementation directly.

Do not change architecture based on `curved_info.md`.

Do not migrate to OGL, React Three Fiber, or a generic gallery architecture.

If `curved_info.md` conflicts with this document, the Figma/reference screenshot, or `curver_carousel.md`, prioritize this document and the visual reference.

The purpose of `curved_info.md` is only to support the existing direction:

> keep the current WebGL architecture and tune it toward the cinematic curved film-strip carousel look.

---

## Final Priority

The visual priority is:

1. Match the Figma/reference screenshot.
2. Follow this `curver_carousel.md` context.
3. Use `curved_info.md` only as secondary technical support.

Do not optimize toward a generic carousel or gallery if that makes the result less similar to the reference.
___

## Background Direction

Use a layered cinematic background.

Visual direction:

- base: very dark teal / almost black;
- center glow: soft radial teal/cyan glow behind the carousel;
- edges: darker, almost black;
- no flat blue fill;
- no bright turquoise background block.

The glow should be subtle. It should not turn the entire section blue.

The background should create depth behind the WebGL carousel.

---

## Heading Direction

The heading “НАШИ ПРОЕКТЫ” should stay centered above the carousel.

Visual target:

- large bold heading;
- white “НАШИ”;
- bright green “ПРОЕКТЫ”;
- close enough to carousel;
- no huge empty area between heading and video;
- integrated into the dark scene.

Do not make the heading look like it sits on a separate colored banner.

---

## Label / Title Direction

The project label/title overlay should look like part of the active video.

Target:

- small white uppercase label;
- bright green bold project title;
- centered over the active slide;
- positioned inside the lower central area of the video;
- not below the video;
- not on the background;
- not floating independently.

The text should remain readable but not cover too much of the video.

---

## Side Slide Direction

Side slides should:

- be visible only partially;
- be darker than the center;
- have stronger perspective/depth;
- feel like they recede backward on the same cylindrical arc;
- not be as bright or as important as the center;
- not appear as repeated equal tiles.

Nearest side slides may be visible around 40–55%.

Far slides should be much less visible.

---

## Dimming / Depth Direction

Visual hierarchy should be clear:

### Active center slide

- bright;
- readable;
- primary focus;
- curved but stable;
- strongest visual presence.

### Nearest side slides

- moderately darker;
- partially visible;
- secondary;
- slightly receding.

### Far slides

- heavily darkened;
- low opacity or nearly hidden;
- pushed toward viewport edges or outside them;
- should not read as full project cards.

This is important to remove the “repeated bright strip” look.

---

## Open / Fullscreen Behavior

Do not refactor the open/close logic.

The active video should continue from the WebGL carousel into fullscreen.

Do not swap to a DOM video during fullscreen.

Do not break continuous `VideoTexture`.

Only adjust open/close transition values if the new closed-state layout needs slightly different landing positions.

---

## Files Most Likely To Touch

Likely files:

- `src/components/cinematic_new/CinematicVideoSlider.client.tsx`
- `src/components/cinematic_new/SliderScene.ts`

Possible areas:

- section background classes/styles;
- radial glow layers;
- heading/spacing composition;
- `labelRef` position;
- `getLayoutForOffset()`;
- slide layout numbers;
- bend/depth/dimming values.

Avoid unrelated files unless absolutely necessary.

---

## Verification Checklist

After changes, run:

```bash
npm run lint
npm run build

---

