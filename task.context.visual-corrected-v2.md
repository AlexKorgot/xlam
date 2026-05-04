# task.context.md — WebGL video slider context handoff

## Current task summary

We are implementing a premium WebGL video slider section in a Next 16 project.

Design reference:

https://www.figma.com/design/wvU80E5h11zr2RbfUkk8yc/design?node-id=506-802&m=dev

Motion reference:

https://sss.matchboxstudio.com/

Relevant section on the motion reference site:

```text
More Spaces. Bigger Stories.
```

The intended effect:

```text
curved video slider
→ click selected video slide
→ slide unbends
→ slide scales to fullscreen
→ the same video becomes fullscreen background
→ DOM content appears over it
```

Important: the video from the slider becomes the fullscreen background. It should remain the same WebGL `VideoTexture`, not be replaced with a separate DOM `<video>` during the transition.

---

## Final technology decision

Use:

- Next 16
- App Router
- TypeScript
- React
- Tailwind
- GSAP
- vanilla Three.js
- `THREE.ShaderMaterial`
- `THREE.VideoTexture`
- DOM overlay

Do not use R3F / React Three Fiber unless explicitly requested.

Do not build the main effect as CSS-only.

---

## Architecture decision

The section should have two layers:

```text
WebGL canvas layer:
- curved slider
- video planes
- shader bend/unbend
- fullscreen morph
- active video background

DOM overlay layer:
- nav
- titles
- descriptions
- tags
- buttons
- cards
- close/back controls
```

Only the media/transition belongs in WebGL.

All UI and text must stay in DOM for maintainability and accessibility.

---

## Video decision

Chosen approach:

```text
Variant 1: keep one video in WebGL
```

Meaning:

- selected slider video is already a `THREE.VideoTexture`
- on click, the same video texture remains active
- plane geometry/uniforms/position change
- video does not restart
- no DOM video replacement during transition
- canvas remains fullscreen video background in opened state

Reason:

- best visual continuity
- no currentTime sync problem
- no frame jump
- simplest premium transition prototype

---

## Interaction states

Use these states:

```text
idle
dragging
settling
opening
opened
closing
```

Overlay states:

```text
slider
opening
opened
closing
```

Opening:

```text
selected plane foreground
inactive slides fade/move out
bend decreases
plane scales to fullscreen
same VideoTexture keeps playing
DOM overlay appears above canvas
```

Closing:

```text
DOM overlay hides
fullscreen plane returns to slider position
bend returns
inactive slides come back
slider becomes interactive
```

---


## Additional visual correction after latest screenshot review

After reviewing the latest Figma screenshot and re-checking the live reference section (`More Spaces. Bigger Stories.`), the task needs one more clarification:

The current build is acceptable as a structural prototype, but the **visual styling of the closed slider still does not match the intended reference closely enough**.

Important distinction:
- the fullscreen/open transition direction is mostly acceptable and should not be redesigned;
- the biggest interaction issue is still slide-to-slide smoothness;
- **in addition, the closed-state visual look must be corrected** so it feels closer to the Figma composition and the live-site premium curved-slider aesthetic.

Observed visual mismatch in the current build:
- it looks too much like three separate media cards;
- side slides are too exposed and compete too much with the center slide;
- the curvature reads too weakly or inconsistently;
- the composition still lacks the premium continuous-band feeling from the live reference;
- the hierarchy between center and side slides is not refined enough.

Required visual direction:
- the slider should read as one shallow curved cinematic strip;
- the center slide remains dominant;
- left/right neighbors should stay visible, but should feel peripheral and partially clipped by the viewport;
- side slides should be darker, slightly smaller, and more edge-bound;
- the overall look should be restrained, premium, and cinematic;
- the Figma screenshot should drive spacing, proportions, title placement, and hierarchy;
- the live site should guide motion language and the premium slider feel.

Specific visual corrections:
- make side neighbors less card-like and more peripheral;
- refine widths/heights and spacing so the center slide dominates more clearly;
- improve the continuous arc feel across all visible slides;
- refine label/title placement and scale to match the reference more closely;
- keep the background dark and atmospheric, but do not let glow overpower the media;
- avoid exaggerated perspective or loud decorative effects.

Updated priority order:
1. correct the closed-state visual styling toward the Figma + live-site reference;
2. fix slide-to-slide smoothness in the closed state;
3. stabilize the 3-slide composition;
4. keep the current acceptable fullscreen transition direction;
5. preserve the same active WebGL video into fullscreen.


## Three.js implementation notes

Use vanilla Three.js.

Recommended modular structure:

```text
WebGLVideoSlider.client.tsx
CanvasStage.ts
SliderScene.ts
VideoPlane.ts
shaders/videoPlane.vertex.glsl
shaders/videoPlane.fragment.glsl
data.ts
types.ts
```

Client-only rules:

- WebGL must run only in client components.
- Browser APIs must not run during SSR.
- Use `"use client"` only where required.
- Dynamic import with SSR disabled is allowed for WebGL-heavy component.

Renderer:

```text
alpha: true
antialias: false
powerPreference: "high-performance"
preserveDrawingBuffer: false
```

Do not use:

```text
gl.finish()
preserveDrawingBuffer: true by default
Editframe
EFTimegroup
addFrameTask
renderToVideo
render clones
```

---

## ShaderMaterial notes

Use `ShaderMaterial` for video planes.

Core uniforms:

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

Shader responsibilities:

```text
vertex shader:
- curved slider shape
- unbend transition
- fullscreen morph
- subtle velocity distortion

fragment shader:
- video sampling
- object-fit cover crop
- dimming
- opacity
- optional light vignette/grain
```

Avoid generic shader demos, heavy noise, particles, Fresnel, dissolve, postprocessing, or PBR material patterns unless explicitly requested.

---

## Texture/video notes

Only one active playing video.

Slide media strategy:

```text
active slide: playing VideoTexture
neighbor slides: poster or paused preview
far slides: poster only
opened case: same active VideoTexture fullscreen
```

Video requirements:

```text
muted
loop
playsInline
poster required
optimized desktop/mobile assets
fallback for autoplay failure
```

Do not use 4K video as default.

---

## GSAP role

GSAP is used for orchestration:

- shader uniforms
- slide transforms/state
- opening timeline
- closing timeline
- DOM overlay timing

Existing project GSAP rules apply:

- client components only
- scoped refs
- no global selectors
- cleanup timelines
- animate opacity/transforms where possible

---

## Skills state

The `threejs-compositions` skill has been rewritten for this project.

It now targets:

```text
Next 16 interactive WebGL
vanilla Three.js
shader video planes
VideoTexture lifecycle
DOM overlay
render loop control
cleanup
```

It explicitly rejects:

```text
Editframe
EFTimegroup
addFrameTask
renderToVideo
render clones
gl.finish()
required preserveDrawingBuffer
no requestAnimationFrame rule
```

The `threejs-shaders` skill should be project-specific and should focus only on:

```text
ShaderMaterial
video texture sampling
curved plane
unbend
fullscreen morph
cover/crop
inactive dimming
velocity distortion
```

Do not copy external skills as-is.

Use external skills only after filtering them down into short project-specific instructions.

---

## AGENTS.override.md decision

The override file should include these ideas:

- minimal edits
- do not refactor unrelated code
- use task.md as source of truth
- do not copy external skills as-is
- Next 16 client/server boundaries
- vanilla Three.js, not R3F
- active WebGL video must not be replaced by a second DOM video
- only one video plays at a time
- DOM owns text/UI
- WebGL owns media transition
- no Editframe/render-to-video patterns
- no postprocessing unless explicitly requested
- cleanup required

---

## Reference behavior notes

Reference site:

https://sss.matchboxstudio.com/

Section:

```text
More Spaces. Bigger Stories.
```

Useful visual ideas:

- horizontal curved slider
- active slide dominance
- perspective/depth on side slides
- cinematic transition feel
- lower navigation labels
- premium motion pacing

Do not copy unrelated structure or assets.

---

## Key constraints

Do not do:

- CSS-only implementation for main effect
- React Three Fiber unless asked
- DOM video replacement during transition
- all videos playing at once
- text/UI in WebGL
- heavy postprocessing
- unrelated refactors
- server-side browser API usage

---

## Definition of done

The implementation is acceptable when:

- Figma section is implemented
- curved video slider exists
- selected slide opens to fullscreen
- same video continues playing
- canvas becomes fullscreen video background
- DOM overlay appears above video
- close/back returns to slider
- one video plays at a time
- mobile/reduced-motion fallback exists
- no obvious memory leaks on unmount/route change

---

## Latest visual checkpoint based on screenshot + video

Latest screenshot shows the desired general closed-state direction:

```text
large centered slide
left neighbor partially visible
right neighbor partially visible
dark cinematic background with green glow
section heading above
active slide label over media
```

Keep this as the base composition.

Do not spend the next pass on complex rounded/curved corners.
Do not redesign the section from scratch.
Do not implement unrelated Figma sections.

What is acceptable now:
- the overall closed composition is close enough;
- center/side slide layout direction is usable;
- the dark cinematic mood is acceptable;
- the transition from the selected slide into fullscreen/opened case is mostly acceptable.

What is not acceptable yet:
- the closed-state slider movement between slides is not smooth enough;
- slide switching feels snappy/mechanical;
- active index changes should not look like an instant replacement;
- side slides should not pop, disappear abruptly, or jump in transform/opacity;
- label/title changes should not visually jump ahead of the actual slide movement.

Immediate priority:
1. fix smooth slide-to-slide transitions in the closed slider state;
2. stabilize the 3-slide composition during animation;
3. keep left and right neighbor slides visible throughout switching;
4. preserve the current fullscreen opening behavior unless a small polish is needed;
5. keep the selected WebGL video continuous into fullscreen;
6. avoid unrelated layout/header/footer/Figma-section work.

Figma scope reminder:
Use the Figma only for the cinematic projects slider section.
Do not implement the Figma header/navigation, hero, footer, or other page sections.
The site header already exists elsewhere.

Closed state target:
- center slide dominant;
- left neighbor visible about 40–55%;
- right neighbor visible about 40–55%;
- side slides use media/poster visuals;
- side slides slightly darker/smaller;
- far slides hidden or very low opacity;
- keep the current screenshot composition as the baseline.

Slide switching target:
- no snap between slides;
- no instant position/scale/opacity replacement;
- animate x position, scale, z depth, rotation, bend, opacity, and darkness;
- use a persistent animated slider offset/progress value;
- derive transforms from relative slide distance to the active index;
- do not recreate WebGL scene, meshes, materials, or textures during slide changes;
- do not run React state changes every frame;
- prevent stacked/overlapping slide-change animations;
- label/title update should be synced with the visual transition.

Open/fullscreen transition target:
- current opening direction is acceptable;
- preserve same WebGL `VideoTexture`;
- no DOM video replacement;
- no scale/position/crop snap;
- DOM overlay appears after media transition starts/settles;
- close returns smoothly to the same 3-slide state.
