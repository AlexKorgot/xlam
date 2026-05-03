---
name: threejs-compositions
description: Build modular Three.js scenes for an interactive Next 16 WebGL video slider with shader video planes, lifecycle cleanup, resize handling, and DOM overlay integration.
---

# Three.js Compositions for Next 16 Interactive WebGL

Use this skill for modular Three.js architecture in a Next 16 App Router project.

This project uses Three.js for an interactive WebGL video slider:

curved video slider → selected video plane unbends → fullscreen video background → DOM overlay appears.

## Apply

- Vanilla Three.js scene/controller architecture
- Client-only WebGL initialization
- Shader video planes
- VideoTexture lifecycle management
- Resize handling
- Render loop control
- DPR capping
- IntersectionObserver pause/resume
- Dispose/cleanup on unmount
- DOM overlay above canvas
- GSAP timeline orchestration
- Prefer vanilla Three.js over R3F for this slider.

## Do not apply

- Do not use Editframe
- Do not use EFTimegroup
- Do not use addFrameTask
- Do not use renderToVideo patterns
- Do not use render clones
- Do not use ef-timegroup
- Do not force pure function of time architecture
- Do not disable requestAnimationFrame for the interactive slider
- Do not call gl.finish()
- Do not use preserveDrawingBuffer unless explicitly required for screenshots/export
- Do not render text/UI inside WebGL
- Do not replace the active WebGL video with a second DOM video during transition
- Do not use React Three Fiber unless explicitly requested.

## Next 16 rules

- WebGL code must run only in client components.
- Use "use client" for the WebGL component.
- Do not access window, document, HTMLVideoElement, ResizeObserver, IntersectionObserver or WebGL APIs in server components.
- Dynamic import with SSR disabled is allowed when needed.
- Keep the implementation compatible with App Router.

## Renderer rules

Recommended renderer defaults:

- alpha: true
- antialias: false
- powerPreference: "high-performance"
- preserveDrawingBuffer: false

Cap pixel ratio:

- desktop: max 1.5–2
- mobile: max 1–1.5
- low-power mode: 1

Pause or reduce rendering when:

- section is offscreen
- tab is hidden
- no video/transition is active
- user prefers reduced motion

## Render loop rules

requestAnimationFrame is allowed and expected.

Use render loop for:

- active video playback
- slider motion
- opening transition
- closing transition
- fullscreen video background

Pause render loop when possible.

## VideoTexture rules

- Only one video should actively play at a time.
- Active slide uses THREE.VideoTexture.
- Inactive slides should use poster images or paused previews.
- Videos must be muted, looped and playsInline.
- Do not create a second DOM video for opened state.
- The same HTMLVideoElement/VideoTexture should continue from slider state into fullscreen background state.
- Handle autoplay failure gracefully.

## Shader plane rules

Each slide should be a plane mesh using ShaderMaterial.

The plane geometry must have enough subdivisions for visible bending.

Shader uniforms should support:

- uTexture
- uTime
- uBend
- uTransitionProgress
- uActive
- uOpacity
- uDarkness
- uVelocity
- uViewportSize
- uMediaSize
- uPlaneSize

Shader should handle:

- curved slider bend
- unbend transition
- fullscreen morph
- video cover/crop
- inactive slide dimming
- optional velocity distortion

Avoid heavy postprocessing in the first implementation.

## DOM overlay rules

Canvas is for media and transition only.

DOM is responsible for:

- navigation
- headings
- descriptions
- tags
- buttons
- cards
- accessibility
- close/back controls

DOM overlay states:

- slider
- opening
- opened
- closing

## Cleanup rules

On unmount, dispose:

- geometries
- materials
- textures
- VideoTextures
- renderer
- event listeners
- ResizeObserver
- IntersectionObserver
- requestAnimationFrame loop
- GSAP timelines

## Performance rules

- Do not play all videos at once.
- Do not use 4K video as default.
- Use posters for inactive slides.
- Lazy-load heavy media.
- Avoid shadows, lights, physical materials and environment maps unless explicitly required.
- Prefer ShaderMaterial for video planes.
- Support reduced-motion fallback.
- Support simplified mobile mode.