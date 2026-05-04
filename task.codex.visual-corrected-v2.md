# task.md — Codex implementation task

## Goal

Implement the WebGL video slider section from the Figma design.

Figma reference:

https://www.figma.com/design/wvU80E5h11zr2RbfUkk8yc/design?node-id=506-802&m=dev

Live motion reference:

https://sss.matchboxstudio.com/

Reference section on the live site:

```text
More Spaces. Bigger Stories.
```

The target interaction is:

```text
curved video slider
→ user clicks selected slide
→ selected video plane unbends
→ selected video plane scales to fullscreen
→ the same video becomes fullscreen background
→ DOM overlay content appears above the video
```

The active video must not restart or be replaced during the transition.

---

## Project stack

- Next 16
- App Router
- TypeScript
- React
- Tailwind
- GSAP
- vanilla Three.js
- THREE.ShaderMaterial
- THREE.VideoTexture
- DOM overlay above WebGL canvas

Do not use React Three Fiber unless explicitly requested.

---

## Required architecture

Use two layers:

```text
1. WebGL canvas layer
   - curved slider
   - video planes
   - shader bend/unbend
   - fullscreen morph
   - active video background

2. DOM overlay layer
   - text
   - navigation
   - tags
   - buttons
   - case content
   - close/back controls
```

Only media, bending, and fullscreen morph belong in WebGL.

All text and UI must stay in DOM.

---

## Figma scope clarification

Use the Figma reference only for the cinematic projects slider section.

Do not implement any other Figma sections.

Do not implement:
- global header
- site navigation
- hero section
- footer
- unrelated content blocks
- other Figma frames/sections
- page-level layout outside the cinematic slider
- extra decorative sections that are not part of this slider task

The site header/navigation is already implemented elsewhere.

For this task, focus only on:
- the cinematic projects slider section
- section title/heading if it belongs to the slider section
- WebGL curved slider
- 3-slide visible composition
- slide labels/titles
- opened case overlay
- tags/buttons/cards that are part of the opened slider case
- close/back control for the slider case

Do not create a new global header.
Do not modify the existing header.
Do not duplicate navigation.
Do not touch layout/header/footer files unless absolutely required for integration.

---

## Current visual checkpoint based on screenshot + video

The latest screenshot shows that the closed-state composition is generally in the right direction and should be kept as the visual base.

What is already acceptable and should not be redesigned:
- dark cinematic background with green glow;
- section heading above the slider;
- one dominant center slide;
- left and right neighbor slides visible;
- active slide title/label rendered over the media;
- overall WebGL/cinematic direction.

Do not restart the task from scratch. Do not redesign the section. Continue from this implementation and fix motion/state behavior.

Important correction from the latest video:
- the transition from the selected slide into fullscreen/opened case is mostly acceptable;
- the main problem is the closed-state slider movement between slides;
- slide-to-slide switching currently feels snappy/mechanical and not smooth enough;
- active slide changes should feel like one continuous carousel motion, not like instant index replacement;
- side slides must remain visually stable during switching and must not pop, disappear abruptly, or jump in opacity/position.

Immediate priority for the next pass:
1. fix slide-to-slide smoothness in the closed slider state;
2. stabilize the 3-visible-slide composition during and after every index change;
3. keep the current fullscreen opening direction, only polish it if required;
4. preserve the same WebGL `VideoTexture` into fullscreen;
5. avoid unrelated layout/Figma/header/hero/footer work.

Closed state target:
- exactly 3 slides should be clearly readable in the viewport;
- center slide is dominant and occupies most of the section width;
- left neighbor is visible roughly 40–55% of its width;
- right neighbor is visible roughly 40–55% of its width;
- side slides should show real media/poster visuals, not placeholders;
- far slides can be hidden or very low opacity;
- active slide should not fully cover the side slides;
- side slides should be slightly smaller, darker, and in subtle perspective;
- keep the current general scale/spacing from the screenshot unless changing it is required to remove motion jumps.

Open/fullscreen transition target:
- current open-to-fullscreen direction is acceptable;
- do not replace it with a different interaction;
- only polish continuity if there is a visible snap;
- no sudden jump in scale;
- no sudden jump in position;
- no sudden jump in crop/aspect ratio;
- no abrupt opacity snap;
- DOM overlay should appear after the media transition starts/settles;
- closing should return smoothly to the same 3-slide composition.

Do not treat this as a full redesign. Improve the current implementation with targeted motion and state changes.

---

## Slide-to-slide transition target — highest priority

When changing the active slide in the closed slider state, the movement must be smooth and continuous.

Current issue seen in the video:
- the active slide/index changes too abruptly;
- slides appear to snap into their new slots instead of interpolating through space;
- side slides do not feel locked into a stable carousel track;
- labels update too abruptly relative to the slide movement.

Required behavior:
- no instant snapping between active slides;
- center slide should smoothly move out to the side;
- next/previous slide should smoothly move into the center;
- side slides should stay visible while the movement happens;
- scale, x position, z depth, rotation, opacity, bend, and darkness should interpolate smoothly;
- label/title should either crossfade or update only after the active slide is visually near center;
- do not recreate meshes, materials, VideoTextures, or the Three.js scene during slide changes;
- do not use React state updates inside RAF for continuous animation;
- do not hard-set final transforms at the start of the transition;
- do not instantly reorder visible slides in a way that causes popping;
- use GSAP or the existing animation controller to tween numeric slide state values;
- keep only one video actively playing;
- inactive slides should use poster or paused preview visuals.

Implementation direction:
- keep persistent slide objects/meshes;
- maintain a numeric animated `sliderOffset` or equivalent progress value;
- derive each slide transform from its relative distance to the active index;
- tween the offset/progress value with GSAP on next/prev;
- when the tween completes, normalize/wrap the index if needed;
- update active video only at a controlled point in the transition, not in a way that causes visible media/label popping;
- prevent multiple slide-change tweens from stacking; either queue, debounce, or kill/overwrite the previous tween cleanly.

Acceptance:
- switching slides feels cinematic and continuous;
- no stutter, teleport, or hard snap when changing active index;
- side slides remain visible during the transition;
- final state always returns to the screenshot composition: large center slide and two partially visible neighbors;
- clicking the active slide still opens into fullscreen with the current acceptable transition.


## Visual correction based on latest Figma screenshot + live-site reference

Additional correction after reviewing the latest Figma screenshot and re-checking the live reference section (`More Spaces. Bigger Stories.`):

The current implementation is acceptable as a rough structural prototype, but the **closed-state visual styling is still not close enough to the intended reference**.

Important clarification:
- keep the current implementation as the engineering base;
- keep the currently acceptable fullscreen/open transition direction;
- however, **the visual appearance of the slider in closed state must be corrected to better match the Figma section and the live-site reference feel**.

What is visually wrong in the current implementation:
- the slider currently feels too much like three separate flat cards placed next to each other;
- side slides are too exposed / too readable as full cards instead of feeling like peripheral parts of a curved cinematic strip;
- the overall arc/curvature is not yet convincing enough;
- slide proportions/composition do not yet feel close enough to the premium Matchbox reference;
- the visual hierarchy between center and side slides still needs refinement.

Required visual direction for the next pass:
- the slider should feel like a **premium curved media band**, not a basic card carousel;
- the center slide should remain dominant, but the left and right slides should feel more peripheral and more integrated into the arc;
- side slides should be more clipped by the viewport and should read as edge neighbors, not equal competing cards;
- the global shape should read as one shallow cinematic curve across the slider, not a set of isolated rectangles;
- perspective and depth on side slides should be subtle and elegant, not exaggerated;
- the center slide should visually anchor the section and feel cleaner/more premium;
- dimming on inactive slides should be stronger and more controlled;
- spacing/proportions should follow the Figma composition more closely.

Visual target to follow:
- use the **Figma screenshot for layout/proportion/composition**;
- use the **live site reference for the motion language and premium cinematic feel**;
- if there is a conflict, prefer the Figma composition for layout and use the site as motion/style guidance.

Specific visual corrections to make:
- reduce the impression that the side slides are full standalone cards;
- keep only a partial peripheral view of left/right neighbors;
- refine slide widths/heights so the center panel dominates more clearly;
- refine curvature so the slider reads as a continuous arc;
- ensure the active label/title placement and scale feel closer to the reference composition;
- avoid an over-bright or overly game-like look; keep it premium, restrained, and cinematic;
- keep the background dark and atmospheric, but do not let background glow overpower the media.

Updated priority order:
1. correct the closed-state visual styling to better match Figma + live-site reference;
2. fix slide-to-slide smoothness in the closed slider state;
3. stabilize the 3-slide composition during transitions;
4. keep the current acceptable fullscreen opening direction;
5. preserve the same WebGL `VideoTexture` into fullscreen;
6. avoid unrelated layout/Figma/header/hero/footer work.


## Main implementation requirements

### 1. Figma implementation

Implement the section visually according to the Figma node:

```text
node-id=506-802
```

Use the design for:

- layout
- spacing
- typography
- content placement
- overlay composition
- responsive behavior
- visual hierarchy

Do not invent a new layout if Figma already defines it.

### 2. Reference behavior

Use the Matchbox Studio section only as a motion/interaction reference.

Reference section:

```text
More Spaces. Bigger Stories.
```

Expected visual ideas:

- curved horizontal media slider
- central slide is dominant
- side slides sit in perspective
- soft dimming/depth on inactive slides
- premium cinematic movement
- selected slide transitions into a larger/focused state

Do not copy unrelated site structure or assets.

### 3. WebGL slider

Create a client-only WebGL slider component.

Requirements:

- initialize Three.js only on client
- render a canvas layer
- create shader video planes for slides
- use plane geometry with enough subdivisions for bending
- use ShaderMaterial
- use VideoTexture only for active video slide
- inactive slides should use posters or paused previews
- only one video should actively play at a time

### 4. Opening transition

On selecting a slide:

- selected plane becomes foreground
- inactive slides fade/move/dim out
- selected plane unbends from curved to flat
- selected plane scales to fullscreen
- selected VideoTexture continues playing
- do not create a second DOM video for the opened state
- DOM overlay appears after the media transition starts/settles

### 5. Opened state

After opening:

- WebGL canvas remains as fullscreen video background
- same active video remains visible
- DOM overlay is visible above canvas
- overlay follows Figma design
- user can close/back to slider state

### 6. Closing transition

On close/back:

- DOM overlay hides
- fullscreen video plane returns to slider position
- bend is restored
- inactive slides return
- slider becomes interactive again

---

## Next 16 rules

- WebGL code must be inside client components.
- Use `"use client"` only where required.
- Do not access browser APIs in server components.
- Do not access `window`, `document`, `HTMLVideoElement`, `ResizeObserver`, `IntersectionObserver`, canvas, or WebGL APIs during SSR.
- Dynamic import with SSR disabled is allowed for the WebGL component if needed.
- Preserve App Router boundaries.

---

## Three.js rules

Recommended renderer setup:

```text
alpha: true
antialias: false
powerPreference: "high-performance"
preserveDrawingBuffer: false
```

Rules:

- do not call `gl.finish()`
- do not use `preserveDrawingBuffer: true` unless explicitly needed for screenshots/export
- cap DPR
- pause/reduce rendering when offscreen
- dispose resources on unmount
- avoid heavy postprocessing
- avoid lights/shadows/PBR materials unless explicitly required

Cleanup must include:

- geometries
- materials
- textures
- VideoTextures
- renderer
- events
- observers
- requestAnimationFrame loop
- GSAP timelines

---

## Shader requirements

Use `ShaderMaterial` for video planes.

Recommended uniforms:

```text
uTexture
uTime
uBend
uTransitionProgress
uActive
uOpacity
uDarkness
uVelocity
uViewportSize
uMediaSize
uPlaneSize
```

Shader should handle:

- curved slider bend
- unbend transition
- fullscreen morph
- video cover/crop
- inactive slide dimming
- opacity
- optional subtle velocity distortion

Do not add generic shader effects unrelated to this slider.

---

## Video requirements

- active slide uses `THREE.VideoTexture`
- only one video plays at a time
- inactive slides use posters or paused previews
- video must be muted, looped, and `playsInline`
- support autoplay failure gracefully
- do not use 4K video as default
- use optimized desktop/mobile assets where available
- do not replace the active video with a separate DOM video during transition

---

## GSAP role

GSAP should orchestrate:

- opening transition
- closing transition
- slide state changes
- shader uniform transitions
- DOM overlay timing
- opacity/transform transitions

Follow existing project GSAP rules.

Use scoped refs and cleanup.

Do not use global selectors.

---

## DOM overlay requirements

Overlay follows Figma.

DOM overlay should include only the UI/content layer:

- title
- description
- tags/categories
- CTA/buttons
- cards/previews if included
- close/back control
- accessible labels

Overlay states:

```text
slider
opening
opened
closing
```

---

## Accessibility

- Keep text in DOM.
- Keep buttons in DOM.
- Add accessible button labels.
- Support Escape to close opened case where practical.
- Preserve focus behavior where practical.
- Support `prefers-reduced-motion`.

Reduced motion fallback:

```text
no complex bend/morph
use simpler fade/scale transition
keep content accessible
```

---

## Performance requirements

- target smooth desktop motion
- mobile may use simplified visuals
- cap DPR
- lazy-load heavy video assets
- use posters for inactive slides
- avoid all videos playing simultaneously
- pause WebGL when section is offscreen
- avoid heavy fragment shader work
- avoid postprocessing in first implementation

---

## Skills to use

Use project skills only as filtered project-specific guidance:

- `.agents/skills/threejs-compositions`
- `.agents/skills/threejs-shaders`
- `.agents/skills/threejs-textures`
- `.agents/skills/threejs-interaction` only if raycasting is required

Do not copy external skills as-is.

Do not import Editframe/render-to-video patterns.

Do not use:

- EFTimegroup
- addFrameTask
- renderToVideo
- render clones
- ef-timegroup
- forced pure-function-of-time architecture
- gl.finish()
- required preserveDrawingBuffer: true

---

## Do not do

- Do not build the main effect as CSS-only.
- Do not render UI/text inside WebGL.
- Do not use React Three Fiber unless explicitly requested.
- Do not play all videos at once.
- Do not create a second DOM video for the opened background.
- Do not add unrelated shader demos.
- Do not add heavy postprocessing.
- Do not refactor unrelated code.
- Do not break existing layout.
- Do not rewrite unrelated components.
- Do not implement other Figma sections.
- Do not build the full page from Figma.
- Do not implement or copy the Figma header/navigation.
- Do not touch hero/footer/layout sections.
- Do not create unrelated content blocks.

---

## Deliverables

- WebGL video slider section implemented from Figma.
- Data-driven slides/cases structure.
- Three.js canvas layer.
- Shader video planes.
- Active VideoTexture lifecycle.
- Opening transition.
- Closing transition.
- DOM overlay matching Figma.
- Mobile/reduced-motion fallback.
- Cleanup and performance safeguards.

---

## Acceptance criteria

- Figma section is visually represented.
- Curved video slider is visible.
- Clicking a slide opens fullscreen case view.
- Selected video continues playing during the transition.
- Selected video becomes fullscreen background.
- DOM overlay appears above the video.
- Closing returns to the slider.
- Only one video plays at a time.
- No obvious memory leaks after route changes/unmount.
- Works in Next 16 App Router.
- Closed state shows one dominant center slide and two partially visible side slides.
- Opening and closing transitions are smooth with no obvious scale/position/crop snap.
- No new header/navigation or unrelated Figma sections are implemented.
